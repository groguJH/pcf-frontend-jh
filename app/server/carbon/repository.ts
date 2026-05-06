import {
  getCarbonActivities,
  type CarbonActivity,
  type CarbonScope,
} from "@/app/lib/carbon-data";
import { getPrismaClient } from "@/app/server/db/prisma";

export type CarbonActivityRepository = {
  listActivities(): Promise<CarbonActivity[]>;
};

class InMemoryCarbonActivityRepository implements CarbonActivityRepository {
  async listActivities() {
    return getCarbonActivities();
  }
}

function formatDate(value: Date | string) {
  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  return value.toISOString().slice(0, 10);
}

function mapScope(scope: string): CarbonScope {
  const normalized = scope.toLowerCase();

  if (normalized === "scope1") {
    return "scope1";
  }

  if (normalized === "scope2") {
    return "scope2";
  }

  return "scope3";
}

class PrismaCarbonActivityRepository implements CarbonActivityRepository {
  async listActivities() {
    const prisma = getPrismaClient();
    const rows = await prisma.activity.findMany({
      orderBy: [{ activityDate: "asc" }, { id: "asc" }],
    });

    return rows.map((row) => {
      const quantity = Number(row.amount);
      const unit = row.unit;

      return {
        id: row.id,
        sourceRowNumber: null,
        activityDate: formatDate(row.activityDate),
        scope: mapScope(row.scope),
        activityType: row.type,
        description: row.description,
        quantity,
        unit,
        amountLabel: `${quantity.toLocaleString("ko-KR")} ${unit}`,
        emissionFactorId: null,
        emissionFactor: Number(row.appliedFactor),
        emissionKgCo2e: Number(row.emission),
        facilityName: "미지정",
        productName: "미지정 제품",
        supplierName: null,
      };
    });
  }
}

const memoryRepository = new InMemoryCarbonActivityRepository();
const prismaRepository = new PrismaCarbonActivityRepository();

export function getCarbonActivityRepository(): CarbonActivityRepository {
  if (process.env.CARBON_REPOSITORY === "prisma") {
    return prismaRepository;
  }

  return memoryRepository;
}
