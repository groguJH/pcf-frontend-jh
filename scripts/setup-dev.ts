import "dotenv/config";

import { spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { Client } from "pg";

const DB_WAIT_TIMEOUT_MS = 30_000;
const DB_WAIT_INTERVAL_MS = 1_000;

function getDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const user = encodeURIComponent(process.env.DB_USER ?? "postgres");
  const password = encodeURIComponent(process.env.DB_PASSWORD ?? "postgres");
  const host = process.env.DB_HOST ?? "localhost";
  const port = process.env.DB_PORT ?? "5432";
  const database = encodeURIComponent(process.env.DB_NAME ?? "postgres");

  return `postgresql://${user}:${password}@${host}:${port}/${database}?schema=public`;
}

function runStep(label: string, command: string, args: string[]) {
  console.log(`\n[setup] ${label}`);

  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    throw new Error(`${label} failed.`);
  }
}

async function waitForDatabase(connectionString: string) {
  const startedAt = Date.now();
  let lastError: unknown = null;

  while (Date.now() - startedAt < DB_WAIT_TIMEOUT_MS) {
    const client = new Client({ connectionString });

    try {
      await client.connect();
      await client.query("select 1");
      await client.end();
      return;
    } catch (error) {
      lastError = error;
      await client.end().catch(() => undefined);
      await delay(DB_WAIT_INTERVAL_MS);
    }
  }

  throw new Error(
    lastError instanceof Error
      ? `Database is not ready: ${lastError.message}`
      : "Database is not ready.",
  );
}

async function main() {
  const yarnCommand = process.platform === "win32" ? "yarn.cmd" : "yarn";
  const databaseUrl = getDatabaseUrl();

  runStep("Generate Prisma client", yarnCommand, ["prisma", "generate"]);

  console.log("\n[setup] Wait for database");
  await waitForDatabase(databaseUrl);

  runStep("Apply Prisma schema", yarnCommand, ["prisma", "db", "push"]);
  runStep("Seed carbon master data", yarnCommand, ["db:seed:carbon"]);
  runStep("Build Next.js app", yarnCommand, ["build"]);

  console.log("\n[setup] Development environment is ready.");
  console.log("[setup] Run `yarn dev` or `yarn start` to start the app.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
