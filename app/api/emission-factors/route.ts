import { getPrismaClient } from "@/app/server/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EmissionFactor = {
  id: number;
  type: string;
  description: string;
  unit: string;
  factorValue: number;
  validFrom: string;
  validTo: string | null;
};

const memoryFactors: EmissionFactor[] = [
  {
    id: 1,
    type: "전기",
    description: "한국전력",
    unit: "kWh",
    factorValue: 0.456,
    validFrom: "2025-01-01",
    validTo: null,
  },
  {
    id: 2,
    type: "원소재",
    description: "플라스틱 1",
    unit: "kg",
    factorValue: 2.3,
    validFrom: "2025-01-01",
    validTo: null,
  },
  {
    id: 3,
    type: "원소재",
    description: "플라스틱 2",
    unit: "kg",
    factorValue: 3.2,
    validFrom: "2025-01-01",
    validTo: null,
  },
  {
    id: 4,
    type: "운송",
    description: "트럭",
    unit: "ton-km",
    factorValue: 3.5,
    validFrom: "2025-01-01",
    validTo: null,
  },
];

function shouldUseMemoryRepository() {
  return process.env.CARBON_REPOSITORY !== "prisma";
}

function sortFactors(factors: EmissionFactor[]) {
  return [...factors].sort((a, b) =>
    `${a.type}-${a.description}-${a.unit}-${a.validFrom}`.localeCompare(
      `${b.type}-${b.description}-${b.unit}-${b.validFrom}`,
      "ko-KR",
    ),
  );
}

function parseDate(value: unknown) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: Date | string) {
  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  return value.toISOString().slice(0, 10);
}

function getNextMemoryId() {
  return Math.max(0, ...memoryFactors.map((factor) => factor.id)) + 1;
}

/**
 * @swagger
 * /api/emission-factors:
 *   get:
 *     tags:
 *       - Master Data
 *     summary: 배출계수 목록 조회
 */
export async function GET() {
  try {
    if (shouldUseMemoryRepository()) {
      return Response.json({ factors: sortFactors(memoryFactors) });
    }

    const prisma = getPrismaClient();
    const rows = await prisma.emissionFactor.findMany({
      orderBy: [
        { type: "asc" },
        { description: "asc" },
        { unit: "asc" },
        { validFrom: "asc" },
      ],
    });

    const factors = rows.map((row) => ({
      id: row.id,
      type: row.type,
      description: row.description,
      unit: row.unit,
      factorValue: Number(row.factorValue),
      validFrom: formatDate(row.validFrom),
      validTo: row.validTo ? formatDate(row.validTo) : null,
    }));

    return Response.json({ factors });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "배출계수를 조회할 수 없습니다.",
      },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/emission-factors:
 *   post:
 *     tags:
 *       - Master Data
 *     summary: 배출계수 생성
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const type = typeof body.type === "string" ? body.type.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const unit = typeof body.unit === "string" ? body.unit.trim() : "";
    const factorValue = Number(body.factorValue);
    const validFrom = parseDate(body.validFrom);
    const validTo = parseDate(body.validTo);

    if (
      !type ||
      !description ||
      !unit ||
      Number.isNaN(factorValue) ||
      !validFrom
    ) {
      return Response.json(
        {
          error:
            "배출원 유형, 상세 내역, 단위, 계수값, 유효 시작일을 확인해주세요.",
        },
        { status: 400 },
      );
    }

    if (shouldUseMemoryRepository()) {
      const factor = {
        id: getNextMemoryId(),
        type,
        description,
        unit,
        factorValue,
        validFrom: formatDate(validFrom),
        validTo: validTo ? formatDate(validTo) : null,
      };

      memoryFactors.push(factor);

      return Response.json({ factor }, { status: 201 });
    }

    const prisma = getPrismaClient();
    const factor = await prisma.emissionFactor.create({
      data: {
        type,
        description,
        unit,
        factorValue,
        validFrom,
        validTo,
      },
    });

    return Response.json(
      {
        factor: {
          ...factor,
          factorValue: Number(factor.factorValue),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "배출계수를 저장할 수 없습니다.",
      },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/emission-factors:
 *   patch:
 *     tags:
 *       - Master Data
 *     summary: 배출계수 수정
 */
export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = Number(body.id);
    const type = typeof body.type === "string" ? body.type.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const unit = typeof body.unit === "string" ? body.unit.trim() : "";
    const factorValue = Number(body.factorValue);
    const validFrom = parseDate(body.validFrom);
    const validTo = parseDate(body.validTo);

    if (
      !Number.isInteger(id) ||
      !type ||
      !description ||
      !unit ||
      Number.isNaN(factorValue) ||
      !validFrom
    ) {
      return Response.json(
        { error: "수정할 배출계수 정보를 확인해주세요." },
        { status: 400 },
      );
    }

    if (shouldUseMemoryRepository()) {
      const factorIndex = memoryFactors.findIndex((factor) => factor.id === id);

      if (factorIndex < 0) {
        return Response.json(
          { error: "수정할 배출계수를 찾을 수 없습니다." },
          { status: 500 },
        );
      }

      memoryFactors[factorIndex] = {
        id,
        type,
        description,
        unit,
        factorValue,
        validFrom: formatDate(validFrom),
        validTo: validTo ? formatDate(validTo) : null,
      };

      return Response.json({ factor: memoryFactors[factorIndex] });
    }

    const prisma = getPrismaClient();
    const factor = await prisma.emissionFactor.update({
      where: { id },
      data: {
        type,
        description,
        unit,
        factorValue,
        validFrom,
        validTo,
      },
    });

    return Response.json({
      factor: {
        ...factor,
        factorValue: Number(factor.factorValue),
      },
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "배출계수를 수정할 수 없습니다.",
      },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/emission-factors:
 *   delete:
 *     tags:
 *       - Master Data
 *     summary: 배출계수 삭제
 */
export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = Number(body.id);

    if (!Number.isInteger(id)) {
      return Response.json(
        { error: "삭제할 배출계수 정보를 확인해주세요." },
        { status: 400 },
      );
    }

    if (shouldUseMemoryRepository()) {
      const factorIndex = memoryFactors.findIndex((factor) => factor.id === id);

      if (factorIndex < 0) {
        return Response.json(
          { error: "삭제할 배출계수를 찾을 수 없습니다." },
          { status: 500 },
        );
      }

      const [factor] = memoryFactors.splice(factorIndex, 1);

      return Response.json({ factor });
    }

    const prisma = getPrismaClient();
    const factor = await prisma.emissionFactor.delete({
      where: { id },
    });

    return Response.json({
      factor: {
        ...factor,
        factorValue: Number(factor.factorValue),
      },
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "배출계수를 삭제할 수 없습니다.",
      },
      { status: 500 },
    );
  }
}
