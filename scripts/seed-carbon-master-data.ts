import "dotenv/config";

import { emissionFactors } from "@/app/lib/carbon-data";
import { getPrismaClient } from "@/app/server/db/prisma";

type CarbonScope = "scope1" | "scope2" | "scope3";

function parseDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function getCategorySeeds() {
  const categoryMap = new Map<string, { type: string; scope: CarbonScope }>();

  for (const factor of emissionFactors) {
    categoryMap.set(`${factor.activityType}:${factor.scope}`, {
      type: factor.activityType,
      scope: factor.scope,
    });
  }

  return [...categoryMap.values()].sort((a, b) =>
    `${a.type}-${a.scope}`.localeCompare(`${b.type}-${b.scope}`, "ko-KR"),
  );
}

async function seedCarbonMasterData() {
  const prisma = getPrismaClient();
  const categories = getCategorySeeds();

  for (const category of categories) {
    await prisma.emissionCategory.upsert({
      where: {
        type_scope: {
          type: category.type,
          scope: category.scope,
        },
      },
      update: {},
      create: category,
    });
  }

  for (const factor of emissionFactors) {
    const description = factor.descriptionMatcher ?? factor.activityType;
    const validFrom = parseDate(factor.validFrom);
    const validTo = factor.validTo ? parseDate(factor.validTo) : null;

    await prisma.emissionFactor.upsert({
      where: {
        type_description_unit_validFrom: {
          type: factor.activityType,
          description,
          unit: factor.unit,
          validFrom,
        },
      },
      update: {
        factorValue: factor.factor,
        validTo,
      },
      create: {
        type: factor.activityType,
        description,
        unit: factor.unit,
        factorValue: factor.factor,
        validFrom,
        validTo,
      },
    });
  }

  return {
    categoryCount: categories.length,
    factorCount: emissionFactors.length,
  };
}

async function main() {
  const prisma = getPrismaClient();

  try {
    const result = await seedCarbonMasterData();

    console.log(
      `Carbon master data seeded. categories=${result.categoryCount}, factors=${result.factorCount}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(
    error instanceof Error
      ? error.message
      : "Carbon master data seed failed.",
  );
  process.exit(1);
});
