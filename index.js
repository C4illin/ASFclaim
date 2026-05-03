import { mkdirSync, writeFileSync } from "node:fs";
import { readFile as readFileAsync } from "node:fs/promises";
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
	String(process.env.ASF_HTTPS).toLowerCase() === "true";
const asfbots = process.env.ASF_BOTS || "asf";

const POLL_MS = 6 * 60 * 60 * 1000;

/** How many gist lines to consider on fresh start (no lastgame / lastlength 0) and max batch when far behind. */
const TAIL_KEYS = (() => {
	const n = parseInt(process.env.ASFCLAIM_TAIL_KEYS ?? "40", 10);
	return Number.isFinite(n) && n > 0 ? n : 40;
})();

/** Max license entries per single ASF `addlicense` IPC command (rate limits / easier retries). */
const LICENSES_PER_CMD = (() => {
	const n = parseInt(
		process.env.ASFCLAIM_LICENSES_PER_COMMAND ?? "5",
		10,
	);
	return Number.isFinite(n) && n > 0 ? n : 5;
})();

/**
 * True when we should not advance `lastgame` / `lastlength`.
 * `Fail/AlreadyPurchased` means you already own it — treat as OK per line.
 */
function asfResultIndicatesClaimProblems(result) {
	const raw = stringFromAsfResult(result);
	if (!raw) {
		return false;
	}
	const lower = raw.toLowerCase();
	if (lower.includes("not connected")) {
		return true;
	}

	for (const line of raw.split(/\r?\n/)) {
		const l = line.toLowerCase();
		if (!l.includes("status:")) {
			continue;
		}
		if (l.includes("alreadypurchased")) {
			continue;
		}
		if (l.includes("ratelimit")) {
			return true;
		}
		if (l.includes("fail/") || /\bstatus:\s*fail\b/.test(l)) {
			return true;
		}
	}
	return false;
}

function stringFromAsfResult(result) {
	if (result == null) {
		return "";
	}
	if (typeof result === "string") {
		return result;
	}
	try {
		return JSON.stringify(result);
	} catch {
		return String(result);
	}
}

/** @type {number} */
let lastLength = 0;
/** @type {string | null} */
let lastGameLine = null;

let checkInFlight = false;

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
	const len = codes.length;

	if (lastGameLine != null && lastGameLine !== "") {
		const idx = indexAfterLastGame(codes, lastGameLine);
		if (idx >= 0) {
			return Math.min(idx + 1, len);
		}
	}

	if (lastLength > 0) {
		return Math.min(lastLength, len);
	}

	const start = Math.max(0, len - TAIL_KEYS);
	if (len > 0) {
		const n = Math.min(TAIL_KEYS, len);
		console.log(
			`No saved progress; claiming last ${n} key(s) starting at line ${start + 1} (ASFCLAIM_TAIL_KEYS=${TAIL_KEYS})`,
		);
	}
	return start;
}

async function loadState() {
	try {
		const data = await readFileAsync(lastgamePath, "utf8");
		const t = data.trimEnd();
		if (t.length > 0) {
			lastGameLine = t;
		}
	} catch (err) {
		if (err.code !== "ENOENT") {
			console.log("Error reading lastgame:", err.code);
		}
	}

	try {
		const data = await readFileAsync(lastlengthPath, "utf8");
		const n = parseInt(String(data).trim(), 10);
		lastLength = Number.isFinite(n) ? n : 0;
	} catch (err) {
		if (err.code === "ENOENT") {
			writeFileSync(lastlengthPath, "0");
			lastLength = 0;
		} else {
			console.log("Error reading lastlength:", err.code);
		}
	}
}

async function checkGame() {
	if (checkInFlight) {
		return;
	}
	checkInFlight = true;
	try {
		const gistRes = await fetch(`https://api.github.com/gists/${gistId}`, {
			headers: {
				Accept: "application/vnd.github+json",
				"User-Agent": "asfclaim",
			},
		});
		if (!gistRes.ok) {
			console.log(
				"Gist fetch HTTP error:",
				gistRes.status,
				gistRes.statusText,
			);
			return;
		}
		const gist = await gistRes.json();
		const raw = gist.files?.["Steam Codes"]?.content;
		if (typeof raw !== "string") {
			console.log("Gist missing Steam Codes file or empty");
			return;
		}
		const codes = raw.split("\n");

		let processFrom = resolveStartIndex(codes);

		//THIS IS BAD, and definitely not scalable.
		if (processFrom >= codes.length) {
			console.log(`Found: ${codes.length} and next index: ${processFrom}`);
			return;
		}

		const lastLengthBeforeRun = processFrom;
		if (processFrom + TAIL_KEYS < codes.length) {
			console.log(
				`Cursor far behind gist; only last ${TAIL_KEYS} keys this run (ASFCLAIM_TAIL_KEYS)`,
			);
			processFrom = codes.length - TAIL_KEYS;
		}

		const url = `http${asfhttps ? "s" : ""}://${asfhost}:${asfport}/Api/Command`;
		const headers = { "Content-Type": "application/json" };
		if (password.length > 0) {
			headers.Authentication = password;
		}

		const runStart = processFrom;
		let nextIndex = runStart;

		while (nextIndex < codes.length) {
			const end = Math.min(nextIndex + LICENSES_PER_CMD, codes.length);
			let part = `${commandprefix}addlicense ${asfbots} `;
			for (let i = nextIndex; i < end; i++) {
				part += `${codes[i]},`;
			}
			part = part.slice(0, -1);

			const asfRes = await fetch(url, {
				method: "POST",
				body: JSON.stringify({ Command: part }),
				headers,
			});

			let body;
			try {
				body = await asfRes.json();
			} catch {
				console.log("ASF IPC response was not JSON");
				if (nextIndex === runStart) {
					lastLength = lastLengthBeforeRun;
				}
				return;
			}

			if (!asfRes.ok) {
				console.log(
					"ASF IPC HTTP error:",
					asfRes.status,
					asfRes.statusText,
					body,
				);
				if (nextIndex === runStart) {
					lastLength = lastLengthBeforeRun;
				}
				return;
			}

			const resultRisky =
				!body.Success || asfResultIndicatesClaimProblems(body.Result);
			if (resultRisky) {
				console.log(
					nextIndex === runStart
						? "ASF addlicense did not succeed cleanly; not advancing saved progress."
						: "ASF addlicense failed on a later chunk; progress kept at last good batch.",
				);
				console.log(body);
				if (nextIndex === runStart) {
					lastLength = lastLengthBeforeRun;
				}
				return;
			}

			console.log(`Success: ${part}`);
			console.debug(body);
			nextIndex = end;
			lastLength = nextIndex;
			writeFileSync(lastlengthPath, String(nextIndex));
			writeFileSync(lastgamePath, codes[nextIndex - 1], "utf8");
			lastGameLine = codes[nextIndex - 1].trimEnd();
		}
	} catch (err) {
		console.log("checkGame error:", err);
	} finally {
		checkInFlight = false;
	}
}

loadState()
	.then(() => {
		checkGame();
		setInterval(() => {
			checkGame().catch((e) => console.log("checkGame:", e));
		}, POLL_MS);
	})
	.catch((e) => console.log("loadState:", e));
