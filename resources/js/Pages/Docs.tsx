import { useState } from "react";
import { Head, Link } from "@inertiajs/react";

import PublicLayout from "@/Layouts/PublicLayout";

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-muted p-3 sm:p-4 overflow-x-auto text-xs sm:text-sm leading-relaxed max-w-full">
      <code>{children}</code>
    </pre>
  );
}

const methodColors: Record<string, string> = {
  GET: "text-green-600",
  POST: "text-yellow-600",
  PUT: "text-blue-600",
  PATCH: "text-purple-600",
  DELETE: "text-red-600",
};

function Endpoint({
  method,
  path,
  description,
}: {
  method: string;
  path: string;
  description: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-muted-foreground py-1 min-w-0">
      <div className="flex items-center gap-2 min-w-0 overflow-hidden">
        <code
          className={`bg-muted px-1.5 py-0.5 text-xs font-semibold shrink-0 ${methodColors[method] ?? ""}`}
        >
          {method}
        </code>
        <code className="text-xs sm:text-sm truncate min-w-0">{path}</code>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">
        {description}
      </span>
    </div>
  );
}

function SdkSection({
  title,
  install,
  children,
}: {
  title: string;
  install: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 w-full p-4 sm:px-6 text-left hover:bg-muted/50 transition-colors cursor-pointer"
      >
        <span className="text-muted-foreground shrink-0 text-sm">
          {open ? "▼" : "▶"}
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-foreground">{">"} {title.toLowerCase()}</h2>
          <p className="text-xs text-muted-foreground truncate">
            $ {install}
          </p>
        </div>
      </button>
      {open && <div className="px-4 sm:px-6 pb-4 sm:pb-6">{children}</div>}
    </div>
  );
}

export default function Docs() {
  return (
    <>
      <Head title="Documentation" />
      <PublicLayout activePage="docs">
        <div className="py-8 px-4 md:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {">"} docs
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              # api documentation
            </p>
          </div>

          <div className="space-y-8">
            {/* Getting Started */}
            <section className="bg-card border border-border p-4 sm:p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4">
                // getting_started
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Bandeira provides two integration paths:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 ml-4 list-disc">
                <li>
                  <strong className="text-foreground">SDKs</strong> — Available
                  for Go, JavaScript/TypeScript, Python, PHP, Dart/Flutter, and
                  Elixir. Each SDK polls the server, caches flags locally, and
                  evaluates strategies in-process.
                </li>
                <li>
                  <strong className="text-foreground">Admin API</strong> — For
                  CI/CD pipelines, Terraform, scripts, and any automation that
                  manages projects, flags, environments, and tokens
                  programmatically.
                </li>
                <li>
                  <Link
                    href="/strategies"
                    className="text-primary hover:underline font-medium"
                  >
                    Strategy Documentation
                  </Link>{" "}
                  — Learn how targeting strategies and constraints work with an
                  interactive playground.
                </li>
              </ul>
            </section>

            {/* SDKs */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground px-1">
                // sdks
              </h2>

              <SdkSection title="Go" install="go get github.com/felipekafuri/bandeira-sdks/go">
                <CodeBlock>
                  {`import bandeira "github.com/felipekafuri/bandeira-sdks/go"

client, err := bandeira.New(bandeira.Config{
    URL:   "http://localhost:8080",
    Token: "your-client-token",
})
if err != nil {
    log.Fatal(err)
}
defer client.Close()

// Simple boolean check
if client.IsEnabled("new-dashboard") {
    // show new dashboard
}

// With context for strategy evaluation
if client.IsEnabled("premium-feature", bandeira.Context{
    UserID: "42",
    Properties: map[string]string{
        "plan": "enterprise",
    },
}) {
    // show premium feature
}`}
                </CodeBlock>
              </SdkSection>

              <SdkSection title="JavaScript / TypeScript" install="npm install bandeira">
                <CodeBlock>
                  {`import { BandeiraClient } from "bandeira";

const client = new BandeiraClient({
  url: "http://localhost:8080",
  token: "your-client-token",
});
await client.start();

if (client.isEnabled("premium-feature", {
  userId: "42",
  properties: { plan: "enterprise" },
})) {
  // show premium feature
}

client.close();`}
                </CodeBlock>
              </SdkSection>

              <SdkSection title="Python" install="pip install bandeira">
                <CodeBlock>
                  {`from bandeira import BandeiraClient, Config, Context

client = BandeiraClient(Config(
    url="http://localhost:8080",
    token="your-client-token",
))
client.start()

if client.is_enabled("premium-feature", Context(
    user_id="42",
    properties={"plan": "enterprise"},
)):
    # show premium feature
    pass

client.close()`}
                </CodeBlock>
              </SdkSection>

              <SdkSection title="PHP" install="See install instructions on GitHub">
                <p className="text-sm text-muted-foreground mb-3">
                  Add the repository to your <code className="bg-muted px-1.5 py-0.5 rounded text-foreground text-xs">composer.json</code>, then require the package.
                  See{" "}
                  <a
                    href="https://github.com/felipekafuri/bandeira-sdks/tree/main/php#install"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    full install instructions
                  </a>.
                </p>
                <CodeBlock>
                  {`<?php

use Bandeira\\Client;
use Bandeira\\Config;
use Bandeira\\Context;

$client = new Client(new Config(
    url: 'http://localhost:8080',
    token: 'your-client-token',
));

if ($client->isEnabled('premium-feature', new Context(
    userId: '42',
    properties: ['plan' => 'enterprise'],
))) {
    // show premium feature
}`}
                </CodeBlock>
              </SdkSection>

              <SdkSection title="Dart / Flutter" install="dart pub add bandeira">
                <CodeBlock>
                  {`import 'package:bandeira/bandeira.dart';

final client = await BandeiraClient.create(
  const BandeiraConfig(
    url: "http://localhost:8080",
    token: "your-client-token",
  ),
);

if (client.isEnabled("premium-feature",
    const BandeiraContext(userId: "42"))) {
  // show premium feature
}

client.close();`}
                </CodeBlock>
              </SdkSection>

              <SdkSection title="Elixir" install='{:bandeira, "~> 0.2.0"}'>
                <CodeBlock>
                  {`alias Bandeira.{Client, Config, Context}

{:ok, client} =
  Client.start_link(%Config{
    url: "http://localhost:8080",
    token: "your-client-token"
  })

if Client.is_enabled(client, "premium-feature",
     %Context{user_id: "42"}) do
  # show premium feature
end

Client.close(client)`}
                </CodeBlock>
              </SdkSection>

              <p className="text-sm text-muted-foreground px-1">
                All SDKs poll the server every 15 seconds (configurable) and
                cache flags locally. All SDKs (except PHP) also support
                real-time streaming via SSE. Evaluation calls are pure
                in-memory lookups with zero network latency. See the full
                documentation at{" "}
                <a
                  href="https://github.com/felipekafuri/bandeira-sdks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  github.com/felipekafuri/bandeira-sdks
                </a>
                .
              </p>
            </div>

            {/* Authentication */}
            <section className="bg-card border border-border p-4 sm:p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4">
                // authentication
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Bandeira uses Bearer tokens for API authentication. There are
                two token types:
              </p>
              <div className="space-y-3">
                <div className="bg-muted p-3 sm:p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    Client tokens
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Scoped to a specific project + environment. Used by the Go
                    SDK and the Client API to read flag state. Create these in
                    the dashboard under Project {">"} API Tokens.
                  </p>
                </div>
                <div className="bg-muted p-3 sm:p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    Admin tokens
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Scoped to a specific project. Used by the Admin API to
                    manage resources (environments, flags, tokens). Create these
                    in the dashboard under Project {">"} API Tokens with
                    type "admin".
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Pass the token in the <code className="bg-muted px-1.5 py-0.5 rounded text-foreground text-xs">Authorization</code> header:
              </p>
              <CodeBlock>Authorization: Bearer your-token-here</CodeBlock>
            </section>

            {/* Client API */}
            <section className="bg-card border border-border p-4 sm:p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4">
                // client_api
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                The Client API returns all flags for the token's environment,
                including strategies and constraints for local evaluation.
              </p>

              <h3 className="text-sm font-semibold text-foreground mb-2">
                GET /api/v1/flags
              </h3>
              <CodeBlock>
                {`curl -s http://localhost:8080/api/v1/flags \\
  -H "Authorization: Bearer <client-token>"`}
              </CodeBlock>
              <p className="text-sm text-muted-foreground mt-2 mb-2">
                Response:
              </p>
              <CodeBlock>
                {`{
  "flags": [
    {
      "name": "new-dashboard",
      "enabled": true,
      "strategies": [
        {
          "name": "default",
          "parameters": {},
          "constraints": []
        }
      ]
    },
    {
      "name": "premium-feature",
      "enabled": true,
      "strategies": [
        {
          "name": "userWithId",
          "parameters": { "userIds": "1,42,100" },
          "constraints": [
            {
              "context_name": "plan",
              "operator": "IN",
              "values": ["enterprise", "pro"],
              "inverted": false,
              "case_insensitive": false
            }
          ]
        }
      ]
    }
  ]
}`}
              </CodeBlock>
            </section>

            {/* Real-Time Streaming (SSE) */}
            <section className="bg-card border border-border p-4 sm:p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4">
                // real_time_streaming_sse
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Instead of polling every 15 seconds, you can use Server-Sent
                Events (SSE) to receive flag updates instantly when they change.
                The stream endpoint pushes the full flag state as a JSON event
                whenever a flag is toggled, created, deleted, or its strategies
                are modified.
              </p>

              <h3 className="text-sm font-semibold text-foreground mb-2">
                GET /api/v1/stream
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Requires a client token (same as <code className="bg-muted px-1.5 py-0.5 rounded text-foreground text-xs">/api/v1/flags</code>).
              </p>
              <CodeBlock>
                {`curl -N http://localhost:8080/api/v1/stream \\
  -H "Authorization: Bearer <client-token>"`}
              </CodeBlock>

              <p className="text-sm text-muted-foreground mt-4 mb-2">
                Event format:
              </p>
              <CodeBlock>
                {`event: flags
data: {"flags":[{"name":"new-dashboard","enabled":true,"strategies":[]}]}

:heartbeat`}
              </CodeBlock>

              <div className="bg-muted p-3 sm:p-4 mt-4 space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Initial state</strong> — On
                  connect, the full flag payload is sent immediately.
                </p>
                <p>
                  <strong className="text-foreground">Updates</strong> — When a
                  flag changes, a new <code className="bg-background px-1 py-0.5 rounded text-foreground text-xs">event: flags</code> is
                  sent with the complete payload.
                </p>
                <p>
                  <strong className="text-foreground">Heartbeat</strong> — A{" "}
                  <code className="bg-background px-1 py-0.5 rounded text-foreground text-xs">:heartbeat</code> comment is
                  sent every 30 seconds to keep the connection alive.
                </p>
              </div>

              <h3 className="text-sm font-semibold text-foreground mt-6 mb-2">
                SDK Streaming Support
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                All SDKs (except PHP) support streaming. Set the streaming option
                in your config:
              </p>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1 font-semibold">Go</p>
                  <CodeBlock>
                    {`client, err := bandeira.New(bandeira.Config{
    URL:       "http://localhost:8080",
    Token:     "your-client-token",
    Streaming: true,
})`}
                  </CodeBlock>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1 font-semibold">JavaScript / TypeScript</p>
                  <CodeBlock>
                    {`const client = new BandeiraClient({
  url: "http://localhost:8080",
  token: "your-client-token",
  streaming: true,
});
await client.start();`}
                  </CodeBlock>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1 font-semibold">Python</p>
                  <CodeBlock>
                    {`client = BandeiraClient(Config(
    url="http://localhost:8080",
    token="your-client-token",
    streaming=True,
))
client.start()`}
                  </CodeBlock>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1 font-semibold">Dart / Flutter</p>
                  <CodeBlock>
                    {`final client = await BandeiraClient.create(
  const BandeiraConfig(
    url: "http://localhost:8080",
    token: "your-client-token",
    streaming: true,
  ),
);`}
                  </CodeBlock>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1 font-semibold">Elixir</p>
                  <CodeBlock>
                    {`{:ok, client} = Client.start_link(
  url: "http://localhost:8080",
  token: "your-client-token",
  streaming: true
)`}
                  </CodeBlock>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-3">
                PHP is request-scoped so streaming is not applicable — it uses
                the standard polling approach which is correct for its model.
                All streaming implementations include automatic reconnection
                with exponential backoff.
              </p>
            </section>

            {/* Admin API */}
            <section className="bg-card border border-border p-4 sm:p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4">
                // admin_api
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                The Admin API lets you manage your project's resources
                programmatically. All endpoints require an admin token and are
                scoped to the token's project.
              </p>

              {/* Projects */}
              <h3 className="text-sm font-semibold text-foreground mb-3 mt-6 border-b border-border pb-2">
                Projects
              </h3>
              <div className="space-y-0.5 text-sm mb-4">
                <Endpoint method="GET" path="/api/v1/admin/projects" description="— List projects" />
                <Endpoint method="GET" path="/api/v1/admin/projects/:id" description="— Get project details" />
                <Endpoint method="PUT" path="/api/v1/admin/projects/:id" description="— Update project" />
                <Endpoint method="DELETE" path="/api/v1/admin/projects/:id" description="— Delete project" />
              </div>

              {/* Environments */}
              <h3 className="text-sm font-semibold text-foreground mb-3 mt-6 border-b border-border pb-2">
                Environments
              </h3>
              <div className="space-y-0.5 text-sm mb-4">
                <Endpoint method="GET" path="/api/v1/admin/projects/:id/environments" description="— List environments" />
                <Endpoint method="POST" path="/api/v1/admin/projects/:id/environments" description="— Create environment" />
                <Endpoint method="PUT" path="/api/v1/admin/projects/:id/environments/:envId" description="— Update environment" />
                <Endpoint method="DELETE" path="/api/v1/admin/projects/:id/environments/:envId" description="— Delete environment" />
              </div>

              {/* Flags */}
              <h3 className="text-sm font-semibold text-foreground mb-3 mt-6 border-b border-border pb-2">
                Flags
              </h3>
              <div className="space-y-0.5 text-sm mb-4">
                <Endpoint method="GET" path="/api/v1/admin/projects/:id/flags" description="— List flags" />
                <Endpoint method="POST" path="/api/v1/admin/projects/:id/flags" description="— Create flag" />
                <Endpoint method="GET" path="/api/v1/admin/projects/:id/flags/:flagId" description="— Get flag with strategies" />
                <Endpoint method="PUT" path="/api/v1/admin/projects/:id/flags/:flagId" description="— Update flag" />
                <Endpoint method="DELETE" path="/api/v1/admin/projects/:id/flags/:flagId" description="— Delete flag" />
                <Endpoint method="PATCH" path="/api/v1/admin/projects/:id/flags/:flagId/environments/:envId" description="— Toggle flag / set strategies" />
              </div>

              {/* Tokens */}
              <h3 className="text-sm font-semibold text-foreground mb-3 mt-6 border-b border-border pb-2">
                API Tokens
              </h3>
              <div className="space-y-0.5 text-sm mb-4">
                <Endpoint method="GET" path="/api/v1/admin/api-tokens" description="— List tokens" />
                <Endpoint method="POST" path="/api/v1/admin/api-tokens" description="— Create token" />
                <Endpoint method="DELETE" path="/api/v1/admin/api-tokens/:id" description="— Delete token" />
              </div>

              {/* Examples */}
              <h3 className="text-sm font-semibold text-foreground mb-3 mt-6 border-b border-border pb-2">
                Examples
              </h3>

              <p className="text-sm text-muted-foreground mb-2">
                Create a feature flag:
              </p>
              <CodeBlock>
                {`curl -X POST http://localhost:8080/api/v1/admin/projects/1/flags \\
  -H "Authorization: Bearer <admin-token>" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "new-checkout", "flag_type": "release"}'`}
              </CodeBlock>

              <p className="text-sm text-muted-foreground mt-4 mb-2">
                Enable a flag in an environment:
              </p>
              <CodeBlock>
                {`curl -X PATCH http://localhost:8080/api/v1/admin/projects/1/flags/3/environments/2 \\
  -H "Authorization: Bearer <admin-token>" \\
  -H "Content-Type: application/json" \\
  -d '{"enabled": true}'`}
              </CodeBlock>

              <p className="text-sm text-muted-foreground mt-4 mb-2">
                Create an admin token:
              </p>
              <CodeBlock>
                {`curl -X POST http://localhost:8080/api/v1/admin/api-tokens \\
  -H "Authorization: Bearer <admin-token>" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "ci-token", "token_type": "admin"}'`}
              </CodeBlock>
            </section>

            {/* CI/CD */}
            <section className="bg-card border border-border p-4 sm:p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4">
                // terraform_cicd
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Use the Admin API in your deployment pipeline to manage flags as
                code. Here's an example shell script for a CI job:
              </p>
              <CodeBlock>
                {`#!/bin/bash
# deploy.sh — enable a feature flag after deployment
set -euo pipefail

BANDEIRA_URL="https://bandeira.example.com"
ADMIN_TOKEN="\${BANDEIRA_ADMIN_TOKEN}"
PROJECT_ID="1"
FLAG_ID="3"
ENV_ID="2"  # production

# Enable the flag in production
curl -sf -X PATCH "\${BANDEIRA_URL}/api/v1/admin/projects/\${PROJECT_ID}/flags/\${FLAG_ID}/environments/\${ENV_ID}" \\
  -H "Authorization: Bearer \${ADMIN_TOKEN}" \\
  -H "Content-Type: application/json" \\
  -d '{"enabled": true}'

echo "Flag enabled in production"`}
              </CodeBlock>
              <p className="text-sm text-muted-foreground mt-4">
                You can also use the Admin API to create flags and environments
                as part of your infrastructure-as-code setup, or integrate with
                Terraform using the <code className="bg-muted px-1.5 py-0.5 rounded text-foreground text-xs">external</code> data
                source to call the API.
              </p>
            </section>
          </div>
        </div>
      </div>
      </PublicLayout>
    </>
  );
}
