# ASFclaim
[![Docker](https://github.com/C4illin/ASFclaim/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/C4illin/ASFclaim/actions/workflows/docker-publish.yml)
![GitHub repo size](https://img.shields.io/github/repo-size/C4illin/ASFclaim)

Claims games posted by [/u/ASFinfo](https://www.reddit.com/user/ASFinfo) (source code: https://github.com/C4illin/ASFinfo)

All games claimed: https://gist.github.com/C4illin/e8c5cf365d816f2640242bf01d8d3675

Latest games claimed: https://gist.github.com/C4illin/77a4bcb9a9a7a95e5f291badc93ec6cd

## Install
1. enable IPC in ASF (https://github.com/JustArchiNET/ArchiSteamFarm/wiki/IPC) (add password to .env if not empty)
2. install node.js (v18 or later)
3. `git clone https://github.com/C4illin/ASFclaim.git`
4. `cd ASFclaim`
5. `npm install`
6. `node .`



### Docker

```bash
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
    environment: # all are optional, defaults are listed below
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
                        
## Stargazers over time
[![Stargazers over time](https://starchart.cc/C4illin/ASFclaim.svg?variant=adaptive)](https://starchart.cc/C4illin/ASFclaim)
