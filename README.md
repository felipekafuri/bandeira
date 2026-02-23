# Bandeira

[![Docker Image](https://img.shields.io/badge/ghcr.io-felipekafuri%2Fbandeira-blue?logo=docker)](https://github.com/felipekafuri/bandeira/pkgs/container/bandeira)
[![Go SDK](https://img.shields.io/badge/Go-SDK-00ADD8?logo=go&logoColor=white)](https://github.com/felipekafuri/bandeira-sdks/tree/main/go)
[![npm](https://img.shields.io/npm/v/bandeira?logo=npm&label=JS/TS)](https://www.npmjs.com/package/bandeira)
[![PyPI](https://img.shields.io/pypi/v/bandeira?logo=python&logoColor=white&label=Python)](https://pypi.org/project/bandeira/)
[![Hex.pm](https://img.shields.io/hexpm/v/bandeira?logo=elixir&logoColor=white&label=Elixir)](https://hex.pm/packages/bandeira)
[![Pub.dev](https://img.shields.io/pub/v/bandeira?logo=dart&logoColor=white&label=Dart)](https://pub.dev/packages/bandeira)
[![PHP](https://img.shields.io/badge/PHP-SDK-777BB4?logo=php&logoColor=white)](https://github.com/felipekafuri/bandeira-sdks/tree/main/php)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

<img width="2550" height="927" alt="Screenshot 2026-02-18 at 11 43 58" src="https://github.com/user-attachments/assets/ba553a72-1edf-4d9b-954c-058235e0c0bb" />

Self-hosted, open-source feature flag service built with Go. Ships as a single binary + SQLite.

**Bandeira** — Portuguese for "flag."

> **Documentation**: [bandeira.app/docs](https://bandeira.app/docs) — SDK guides, API reference, strategy playground, and more.

## Features

- **Real-time updates (SSE)** — flag changes push instantly to connected SDKs via Server-Sent Events, no polling delay
- **Kill switches** — disable features in production without redeploying
- **Gradual rollouts** — roll features out to a % of users or specific groups
- **Environment toggles** — enable in staging, disable in production
- **Multi-project** — one Bandeira instance serves all your projects
- **Multi-user RBAC** — admin, editor, and viewer roles with email/password auth
- **Admin dashboard** — React UI with matrix toggle view
- **Admin API** — JSON endpoints for CI/CD, Terraform, and scripts
- **Client API** — lightweight SDK endpoint for flag evaluation + SSE streaming
- **6 official SDKs** — Go, JS/TS, Python, PHP, Dart/Flutter, Elixir

## Architecture

```
+---------------------------------------------------+
|                     Bandeira                       |
|                                                    |
|  +----------+  +----------+  +---------+--------+  |
|  | Admin UI |  | Admin API|  | Client API       |  |
|  | (React/  |  | (CRUD    |  | GET /api/v1/flags|  |
|  | Inertia) |  | endpoints|  | SSE /api/v1/stream| |
|  +----+-----+  +----+-----+  +----+----+--------+  |
|       |              |             |    |           |
|       +--------------+-------------+----+           |
|                      |                              |
|              +-------v--------+                     |
|              |   Ent ORM      |                     |
|              |   (SQLite)     |                     |
|              +----------------+                     |
+---------------------------------------------------+
        |                          |
        |  polls / SSE stream      |
        v                          v
+--------+--------+--------+--------+--------+--------+
|   Go   | JS/TS  | Python |  PHP   |  Dart  | Elixir |
+--------+--------+--------+--------+--------+--------+
  SSE ✓    SSE ✓    SSE ✓    Poll     SSE ✓    SSE ✓
```

Single Go binary. No Redis, no background workers, no message queue. SQLite is the only dependency.

## Tech Stack

- **Backend**: Go, Echo, Ent ORM
- **Frontend**: React, InertiaJS, Tailwind CSS v4, shadcn/ui
- **Database**: SQLite (embedded, zero config)

## Quick Start

### Docker (recommended)

```bash
docker pull ghcr.io/felipekafuri/bandeira:latest

docker run -d \
  -p 8080:8080 \
  -v bandeira-data:/app/dbs \
  -e BANDEIRA_AUTH_ADMINEMAIL=admin@yourcompany.com \
  -e BANDEIRA_AUTH_ADMINPASSWORD=your-password \
  -e BANDEIRA_APP_ENCRYPTIONKEY=$(openssl rand -hex 16) \
  ghcr.io/felipekafuri/bandeira:latest
```

Or with Docker Compose:

```bash
docker compose up -d
```

The dashboard is available at `http://localhost:8080`. Log in with the admin email and password. Once logged in, you can create additional users with different roles from the Users page.

### Coolify

Bandeira is available in the [Coolify](https://coolify.io) service store for one-click deployment.

### From source

```bash
# Install dependencies
npm ci

# Build frontend
npm run build

# Run the server
make run
```

### Development

```bash
make watch     # Start with hot reload (requires air)
make test      # Run all tests
make ent-gen   # Regenerate Ent code after schema changes
```

## SDKs

Official client SDKs cache flags locally and evaluate strategies in-process. All SDKs (except PHP) support **real-time streaming via SSE** — flag changes are pushed instantly instead of waiting for the next poll interval.

| Language | Install | SSE Streaming | Package |
|----------|---------|:---:|---------|
| Go | `go get github.com/felipekafuri/bandeira-sdks/go` | Yes | [bandeira-sdks/go](https://github.com/felipekafuri/bandeira-sdks) |
| JS/TS | `npm install bandeira` | Yes | [npm](https://www.npmjs.com/package/bandeira) |
| Python | `pip install bandeira` | Yes | [PyPI](https://pypi.org/project/bandeira/) |
| PHP | [See install instructions](https://github.com/felipekafuri/bandeira-sdks/tree/main/php#install) | Poll | [bandeira-sdks/php](https://github.com/felipekafuri/bandeira-sdks) |
| Dart/Flutter | `dart pub add bandeira` | Yes | [pub.dev](https://pub.dev/packages/bandeira) |
| Elixir | `{:bandeira, "~> 0.2.0"}` | Yes | [hex.pm](https://hex.pm/packages/bandeira) |

```go
// Go — with real-time streaming
client, _ := bandeira.New(bandeira.Config{
    URL:       "http://localhost:8080",
    Token:     "your-token",
    Streaming: true,
})
defer client.Close()
client.IsEnabled("my-feature", bandeira.Context{UserID: "user-123"})
```

```typescript
// JavaScript / TypeScript — with real-time streaming
const client = new BandeiraClient({
  url: "http://localhost:8080",
  token: "your-token",
  streaming: true,
});
await client.start();
client.isEnabled("my-feature", { userId: "user-123" });
```

```python
# Python — with real-time streaming
client = BandeiraClient(Config(
    url="http://localhost:8080",
    token="your-token",
    streaming=True,
))
client.start()
client.is_enabled("my-feature", Context(user_id="user-123"))
```

See the [SDKs repository](https://github.com/felipekafuri/bandeira-sdks) for full documentation.

## Configuration

All settings live in `config/config.yaml` and can be overridden via environment variables with the `BANDEIRA_` prefix.

| Variable | Default | Description |
|----------|---------|-------------|
| `BANDEIRA_HTTP_PORT` | `8080` | HTTP listen port |
| `BANDEIRA_AUTH_ADMINEMAIL` | `admin@bandeira.local` | Initial admin user email |
| `BANDEIRA_AUTH_ADMINPASSWORD` | `change-me-in-production` | Initial admin user password |
| `BANDEIRA_APP_ENCRYPTIONKEY` | *(set in config)* | 32-char key for session encryption |
| `BANDEIRA_APP_ENVIRONMENT` | `local` | `local`, `test`, or `prod` |
| `BANDEIRA_DATABASE_CONNECTION` | `dbs/main.db?...` | SQLite connection string |

The admin email and password are only used to **seed the first user** on initial startup. After that, manage users from the dashboard.

## API Reference

Bandeira exposes two API surfaces, both requiring a `Bearer` token:

- **Client API** (`/api/v1/`) — read-only flag data for SDKs, plus SSE streaming
- **Admin API** (`/api/admin/`) — full CRUD for managing projects, flags, environments, and tokens

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /api/v1/flags` | Client token | Get all flags for the token's project + environment |
| `GET /api/v1/stream` | Client token | SSE stream — real-time flag updates |
| `/api/admin/projects/...` | Admin token | Manage projects |
| `/api/admin/.../environments/...` | Admin token | Manage environments |
| `/api/admin/.../flags/...` | Admin token | Manage flags and strategies |
| `/api/admin/api-tokens/...` | Admin token | Manage API tokens |

For full API documentation with request/response examples, see [bandeira.app/docs](https://bandeira.app/docs).

### Authentication

- **Client tokens**: scoped to one project + one environment. Can read flags and connect to the SSE stream.
- **Admin tokens**: scoped to one project. Full CRUD on that project's resources.
- **Dashboard auth**: session-based, email + password. Users are managed from the dashboard.

### User Roles

| Role | Dashboard | Flags/Projects/Envs | User Management |
|------|-----------|---------------------|-----------------|
| **Admin** | Full access | Create, edit, delete | Create, edit, delete users |
| **Editor** | Full access | Create, edit, delete | No access |
| **Viewer** | Read-only | View only | No access |

The first admin user is seeded on startup from `BANDEIRA_AUTH_ADMINEMAIL` and `BANDEIRA_AUTH_ADMINPASSWORD`. Additional users are created by admins from the `/users` page.

## Strategy Reference

Strategies are evaluated by the SDK, not the server. Documented here for SDK implementors.

| Strategy | Parameters | Description |
|----------|-----------|-------------|
| `default` | *(none)* | Always returns true |
| `gradualRollout` | `rollout` (0-100), `stickiness` (context field), `groupId` (optional salt) | Percentage rollout with consistent bucketing |
| `userWithId` | `userIds` (comma-separated) | Match specific user IDs |
| `remoteAddress` | `IPs` (comma-separated, supports CIDR) | Match IP addresses |

### Constraint Operators

| Operator | Category | Description |
|----------|----------|-------------|
| `IN` | Set | Value is in list |
| `NOT_IN` | Set | Value is not in list |
| `STR_CONTAINS` | String | Contains substring |
| `STR_STARTS_WITH` | String | Starts with prefix |
| `STR_ENDS_WITH` | String | Ends with suffix |
| `NUM_EQ` / `NUM_GT` / `NUM_GTE` / `NUM_LT` / `NUM_LTE` | Numeric | Numeric comparisons |
| `DATE_AFTER` / `DATE_BEFORE` | Date | ISO-8601 date comparisons |

## License

MIT
