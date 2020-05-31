# node-oidc-dummy

example express server with oidc auth flow

tested with keycloak

## for configurables
please have a look at [settings.ts](./src/lib/settings.ts)

[http://localhost:3000](http://localhost:3000)

copy [.env.example](./.env.example) to `.env` and fix values (you can pass other settings via envvar here)

## commands

command|description
---|---
`npm run dev`|start in dev-mode, with automatic-reloading
`npm run debug`|start in debug-mode, with automatic-reloading (--inspect)
`npm run build`|build typescript
