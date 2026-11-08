# Sarah Adewale — Portfolio

npm workspaces monorepo:

| Path | What |
| --- | --- |
| `apps/web` | Next.js frontend (new design, JWT tool at `/tools/jwt`) |
| `apps/web/public/v1` | The original 2022–2025 portfolio, served as-is at `/v1` |
| `apps/api` | NestJS backend: `GET /projects`, `GET /projects/:slug`, `POST /contact`, `GET /health` |

The last version of the old site before the move is tagged `v1-final`.

## Development

```sh
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
npm run dev          # web on :3000, api on :4000
```

Contact-form mails are printed to the API's console by default (`MAIL_TRANSPORT=log`). Set `MAIL_TRANSPORT=smtp` or `resend` with its credentials in `apps/api/.env` to send real email.

```sh
npm test                              # all workspaces
npm run test:e2e -w @portfolio/api    # API end-to-end tests
npm run build
```

## Deploying

- **web**: Vercel (or any Next.js host) with root directory `apps/web`. Set `NEXT_PUBLIC_API_URL` to the API's URL.
- **api**: Railway, Render or Fly.io with root directory `apps/api`. Set `WEB_ORIGIN` to the site's URL, plus the mail variables.
