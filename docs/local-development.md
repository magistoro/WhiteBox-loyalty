# Local development

Local development should use a local PostgreSQL database. Production database URLs belong only in Railway and GitHub Secrets.

## One-time setup

```bash
npm install
copy .env.example .env
npm run db:local:up
npm run db:migrate:dev
npm run db:seed
```

The Docker Compose service creates:

- `my_project_database`
- `my_project_database_shadow`

The default local URLs in `.env.example` already point to these databases.

## Run locally

Run API and web in separate terminals:

```bash
npm run api:dev
npm run dev:web
```

Or run both from one terminal:

```bash
npm run dev:local
```

Local URLs:

- Web: `http://localhost:3000`
- API health: `http://localhost:3001/api/health`
- Swagger: `http://localhost:3001/api/docs`

## Useful database commands

```bash
npm run db:local:up
npm run db:local:down
npm run db:migrate:dev
npm run db:status
npm run db:seed
```

Use `db:migrate:dev` only for local development. Production uses `db:migrate` through CI/CD.
