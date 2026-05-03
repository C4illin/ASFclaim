import { readFile, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import * as dotenv from "dotenv";

dotenv.config();

const gistId = "e8c5cf365d816f2640242bf01d8d3675";

const dataDir = process.env.ASFCLAIM_DATA_DIR || ".";
const lastlengthPath = join(dataDir, "lastlength");
const lastgamePath = join(dataDir, "lastgame");

mkdirSync(dataDir, { recursive: true });

const asfport = process.env.ASF_PORT || "1242";
const asfhost = process.env.ASF_HOST || "localhost";
const password = process.env.ASF_PASSWORD || "";
const commandprefix = process.env.ASF_COMMAND_PREFIX || "!";
const asfhttps =
	process.env.ASF_HTTPS &&
	(process.env.ASF_HTTPS === true || process.env.ASF_HTTPS === "true");
const asfbots = process.env.ASF_BOTS || "asf";

const POLL_MS = 6 * 60 * 60 * 1000;

/** @type {number} */
let lastLength = 0;
/** @type {string | null} */
let lastGameLine = null;

function indexAfterLastGame(codes, line) {
	const target = line.trimEnd();
	for (let i = codes.length - 1; i >= 0; i--) {
		if (codes[i].trimEnd() === target) {
			return i;
		}
	}
	return -1;
}

function resolveStartIndex(codes) {
	let cursor = lastLength;
	if (lastGameLine != null && lastGameLine !== "") {
		const idx = indexAfterLastGame(codes, lastGameLine);
		if (idx >= 0) {
			cursor = idx + 1;
		}
	}
	return cursor;
}

readFile(lastgamePath, "utf8", (err, data) => {
	if (!err && data) {
		const t = data.trimEnd();
		if (t.length > 0) {
			lastGameLine = t;
		}
	}
	readFile(lastlengthPath, "utf8", (err2, data2) => {
		if (!err2 && data2) {
			const n = parseInt(String(data2).trim(), 10);
			lastLength = Number.isFinite(n) ? n : 0;
		} else if (err2 && err2.code === "ENOENT") {
			writeFileSync(lastlengthPath, "0");
			lastLength = 0;
		} else if (err2) {
			console.log("Error with lastlength: ", err2.code);
		}
		checkGame();
		setInterval(checkGame, POLL_MS);
	});
});

function checkGame() {
	fetch(`https://api.github.com/gists/${gistId}`, {
		headers: {
			Accept: "application/vnd.github+json",
			"User-Agent": "asfclaim",
		},
	})
		.then((res) => {
			if (!res.ok) {
				console.log("Gist fetch HTTP error:", res.status, res.statusText);
				return null;
			}
			return res.json();
		})
		.then((gist) => {
			if (gist == null) {
				return;
			}
			const raw = gist.files?.["Steam Codes"]?.content;
			if (typeof raw !== "string") {
				console.log("Gist missing Steam Codes file or empty");
				return;
			}
			const codes = raw.split("\n");

			let processFrom = resolveStartIndex(codes);

			//THIS IS BAD, and definitely not scalable.
			if (processFrom < codes.length) {
				const lastLengthBeforeRun = processFrom;
				if (processFrom + 40 < codes.length) {
					console.log("Only runs on the last 40 games");
					processFrom = codes.length - 40;
				}
				lastLength = processFrom;
				let asfcommand = `${commandprefix}addlicense ${asfbots} `;
				for (lastLength; lastLength < codes.length; lastLength++) {
					asfcommand += `${codes[lastLength]},`;
				}
				asfcommand = asfcommand.slice(0, -1);

				const command = { Command: asfcommand };
				const url = `http${
					asfhttps ? "s" : ""
				}://${asfhost}:${asfport}/Api/Command`;
				const headers = { "Content-Type": "application/json" };
				if (password && password.length > 0) {
					headers.Authentication = password;
				}

				const lastLineClaimed = codes[lastLength - 1];

				fetch(url, {
					method: "post",
					body: JSON.stringify(command),
					headers: headers,
				})
					.then((res) => res.json())
					.then((body) => {
						if (body.Success) {
							console.log(`Success: ${asfcommand}`);
							console.debug(body);
							writeFileSync(lastlengthPath, lastLength.toString());
							writeFileSync(lastgamePath, lastLineClaimed, "utf8");
							lastGameLine = lastLineClaimed.trimEnd();
						} else {
							console.log("Error: ");
							console.log(body);
						}
					})
					.catch((err) => {
						console.log(`error running '${command.Command}':`);
						console.log(err);
						console.log("Trying again in six hours");
						lastLength = lastLengthBeforeRun;
					});
			} else {
				console.log(`Found: ${codes.length} and has: ${lastLength}`);
			}
		});
}
