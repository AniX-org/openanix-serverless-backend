# OpenAnix Serverless Backend

Modular backend for OpenAnix

License: [MIT](./LICENSE)

## Usage

`<http|https>://<ip|domain><:port>/<module-prefix>/<ENDPOINT>[?<QUERY_PARAMS>]`

Available modules:

- [api-proxy](./src/modules/api-proxy/README.md)
- [player-parser](./src/modules/player-parser/README.md)
- [health-check](./src/modules/health/README.md)

## Deployment

### Cloud Platforms

1. Clone the repository

    ```sh
    git clone https://github.com/Radiquum/AniX.git
    ```

2. Install the dependencies

    For CloudFlare workers / Vercel functions

    ```sh
    npm install
    ```

    For Deno deploy

    ```sh
    deno install
    ```

3. If needed modify the config and hooks

4. Deploy

    CloudFlare workers

    ```sh
    npm run cf-deploy
    ```

    Vercel functions

    ```sh
    npm run vc-deploy
    ```

    Deno deploy

    ```sh
    deno run deno-deploy
    ```

### Docker

Requirements:

- [docker engine](https://docs.docker.com/engine/install/)
- Linux based system or WSL

```sh
docker run -d --restart always --name openanix-backend -p 3000:3000 radiquum/openanix-serverless-backend:latest
```

## Development

This project provides multiple development commands

Cloudflare workers:

```sh
npm run cf-dev
```

Vercel Functions:

```sh
npm run vc-dev
```

Bun

```sh
bun run bun-dev
```

Deno

```sh
deno run deno-dev
```

Node

```sh
npm run node-dev
```

## Contributing

We welcome any contributions to this project! If you have any bug fixes, improvements, or new features, please feel free to create a pull request or an issue.
