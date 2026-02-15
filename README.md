# ASFclaim
[![Docker](https://github.com/C4illin/ASFclaim/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/C4illin/ASFclaim/actions/workflows/docker-publish.yml)
![GitHub repo size](https://img.shields.io/github/repo-size/C4illin/ASFclaim)
[![ghcr.io Pulls](https://img.shields.io/badge/dynamic/json?logo=github&url=https%3A%2F%2Fipitio.github.io%2Fbackage%2FC4illin%2FASFclaim%2Fasfclaim.json&query=%24.downloads&label=ghcr.io%20pulls&cacheSeconds=14400)](https://github.com/C4illin/ASFclaim/pkgs/container/ASFclaim)

Claims games posted by [/u/ASFinfo](https://www.reddit.com/user/ASFinfo) (source code: https://github.com/C4illin/ASFinfo)

All games claimed: https://gist.github.com/C4illin/e8c5cf365d816f2640242bf01d8d3675

Latest games claimed: https://gist.github.com/C4illin/77a4bcb9a9a7a95e5f291badc93ec6cd

## Install
1. enable IPC in ASF (https://github.com/JustArchiNET/ArchiSteamFarm/wiki/IPC), by default it is enabled (also add password to .env if not empty)
2. install node.js (v18 or later)
3. `git clone https://github.com/C4illin/ASFclaim.git`
4. `cd ASFclaim`
5. `npm install`
6. **(Optional but recommended)** Create a GitHub Personal Access Token to avoid rate limits:
   - Go to https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Give it a name like "ASFclaim"
   - Select the `gist` scope (required to read gists)
   - Copy the generated token
   - Create a `.env` file with your GitHub token:
     ```
     GITHUB_TOKEN=your_github_token_here
     ```
   - **Rate limits**: Without token: 60 requests/hour | With token: 5,000 requests/hour

## Run
1. Make sure ASF is running
2. `node .`
The program checks available licenses every 6 hours.

### Docker

```bash
# With GitHub token (recommended):
docker run --name asfclaim -e GITHUB_TOKEN=your_github_token_here -e ASF_PORT=1242 -e ASF_HOST=localhost -e ASF_HTTPS=false -e ASF_PASSWORD=hunter2 -e ASF_COMMAND_PREFIX=! -e ASF_BOTS=asf ghcr.io/c4illin/asfclaim:master

# Without GitHub token (may hit rate limits):
docker run --name asfclaim -e ASF_PORT=1242 -e ASF_HOST=localhost -e ASF_HTTPS=false -e ASF_PASSWORD=hunter2 -e ASF_COMMAND_PREFIX=! -e ASF_BOTS=asf ghcr.io/c4illin/asfclaim:master
```
#### Docker-compose:
```yml
# docker-compose.yml

services:
  asfclaim:
    image: ghcr.io/c4illin/asfclaim:master
    container_name: asfclaim
    restart: unless-stopped
    depends_on: asf # remove this if asf is not running in docker
    environment:
      - GITHUB_TOKEN=${GITHUB_TOKEN} # optional but recommended - prevents rate limiting
      # all below are optional, defaults are listed
      - ASF_PORT=1242
      - ASF_HOST=localhost
      - ASF_PASSWORD=
      - ASF_COMMAND_PREFIX=!
      - ASF_HTTPS=false
      - ASF_BOTS=asf # see https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Commands#bots-argument
  asf:
    # ...
```

## Contributors

<a href="https://github.com/C4illin/ASFclaim/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=C4illin/ASFclaim" />
</a>

## Forks

https://gitlab.com/docker_repos/asfclaim fork with discord notifications and docker (before it was included here)

https://github.com/GuFFy12/ASFclaim (archived) fork with discord notifications

https://github.com/specu/ASFclaim.py Python rewrite without any dependencies

https://github.com/JourneyDocker/ASFclaim fork with different gist and discord notifications

Instead of forking it, please consider sending a PR so we can make the best solution together!

## Stargazers over time
[![Stargazers over time](https://starchart.cc/C4illin/ASFclaim.svg?variant=adaptive)](https://starchart.cc/C4illin/ASFclaim)
