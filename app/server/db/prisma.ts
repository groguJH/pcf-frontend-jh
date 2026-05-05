import { PrismaClient } from "@/app/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function getDatabaseUrl() {
  const configuredUrl = process.env.DATABASE_URL;

  if (configuredUrl && !configuredUrl.includes("${")) {
    return configuredUrl;
  }

  const user = encodeURIComponent(process.env.DB_USER ?? "postgres");
  const password = encodeURIComponent(process.env.DB_PASSWORD ?? "postgres");
  const database = encodeURIComponent(process.env.DB_NAME ?? "esg_dashboard");

  return `postgresql://${user}:${password}@localhost:5432/${database}?schema=public`;
}

export function getPrismaClient() {
  const client =
    globalForPrisma.prisma ??
    new PrismaClient({
      adapter: new PrismaPg({ connectionString: getDatabaseUrl() }),
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}
