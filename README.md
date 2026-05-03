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

## Run
1. Make sure ASF is running
2. `node .`
The program checks available licenses every 6 hours.

Progress is stored under `ASFCLAIM_DATA_DIR` (default: current directory): `lastlength` (line index) and, after a successful claim run, `lastgame` (text of the last gist line that was processed). If `lastgame` matches a gist line, the next run continues after that line. If `lastgame` is missing or no longer in the gist but `lastlength` is greater than zero, that index is used. **With no usable saved progress** (`lastlength` is 0 and there is no matching `lastgame`), the app only considers the **latest** keys in the gist: it starts at `len − ASFCLAIM_TAIL_KEYS` (default **40**), so new installs do not try to claim the entire history at once. The same `ASFCLAIM_TAIL_KEYS` value caps each run when your saved cursor is more than that many lines behind the end of the gist.

### Docker

Persist state on the host by setting `ASFCLAIM_DATA_DIR` to a mounted path (for example `/data` in the container).

```bash
docker run --name asfclaim \
  -e ASFCLAIM_DATA_DIR=/data \
  -e ASFCLAIM_TAIL_KEYS=40 \
  -v asfclaim-state:/data \
  -e ASF_PORT=1242 -e ASF_HOST=localhost -e ASF_HTTPS=false -e ASF_PASSWORD=hunter2 -e ASF_COMMAND_PREFIX=! -e ASF_BOTS=asf \
  ghcr.io/c4illin/asfclaim:master
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
    environment: # all are optional, defaults are listed below
      - ASFCLAIM_DATA_DIR=/data
      - ASFCLAIM_TAIL_KEYS=40
      - ASF_PORT=1242
      - ASF_HOST=localhost
      - ASF_PASSWORD=
      - ASF_COMMAND_PREFIX=!
      - ASF_HTTPS=false
      - ASF_BOTS=asf # see https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Commands#bots-argument
    volumes:
      - asfclaim-state:/data
  asf:
    # ...

volumes:
  asfclaim-state:
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
