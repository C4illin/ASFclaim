const fetch = require("node-fetch")
const { Octokit } = require("@octokit/rest")
const octokit = new Octokit()

let lastLength = 0
checkGame()
setInterval(checkGame, 6 * 60 * 60 * 1000) //Runs every six hours
  
function checkGame() {
  octokit.gists.get({ gist_id: "e8c5cf365d816f2640242bf01d8d3675" }).then(gist => {
    let codes = gist.data.files['Steam Codes'].content.split("\n")

    //THIS IS BAD, and definitely not scalable.
    if (lastLength < codes.length) {
      if ((lastLength + 10) < codes.length) {
        console.log("Only runs on the last 10 games")
        lastLength = codes.length - 10
      }
      let asfcommand = "!addlicense asf "
      for (lastLength; lastLength < codes.length; lastLength++) {
        asfcommand += codes[lastLength]+","
      }
      asfcommand = asfcommand.slice(0, -1)

      let command = {Command: asfcommand}
      fetch("http://localhost:1242/Api/Command", {
        method: "post",
        body: JSON.stringify(command),
        headers: {"Content-Type": "application/json"}
      })
        .then(res => res.json())
        .then(body => {
          if (body.Success){
            console.log("Success: " + asfcommand)
          }
        })
    }
  })
}