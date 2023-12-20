# ASFclaim
Claims games posted by https://www.reddit.com/user/ASFinfo

All games claimed: https://gist.github.com/C4illin/e8c5cf365d816f2640242bf01d8d3675

Latest games claimed: https://gist.github.com/C4illin/77a4bcb9a9a7a95e5f291badc93ec6cd

## Install
1. enable IPC in ASF (https://github.com/JustArchiNET/ArchiSteamFarm/wiki/IPC) (add password to .env if not empty)
2. install node.js (v16 or later)
3. `git clone https://github.com/C4illin/ASFclaim.git`
4. `cd ASFclaim`
5. `npm install`
6. `node .`



### Using docker?

```bash
docker run --name asfclaim -e ASF_PORT=1242 -e ASF_HOST=localhost -e ASF_PASSWORD=hunter2 ghcr.io/c4illin/asfclaim:master 
```
or docker-compose:
```yml
# docker-compose.yml

services:
  asfclaim:
    image: ghcr.io/c4illin/asfclaim:master
    container_name: asfclaim
    restart: unless-stopped
    environment:
      - ASF_PORT=1242
      - ASF_HOST=localhost
      - ASF_PASSWORD=hunter2
```

### Contributors and forks:

https://gitlab.com/docker_repos/asfclaim fork with discord notifications and docker (before it was included here)

https://github.com/GuFFy12/ASFclaim (archived) fork with discord notifications

https://github.com/specu/ASFclaim.py Python rewrite without any dependencies

[HeroCC](https://github.com/HeroCC)

