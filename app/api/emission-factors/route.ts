import { getPrismaClient } from "@/app/server/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FactorChangeType = "correction" | "revision";

type SerializableFactor = {
  id: number;
  type: string;
  description: string;
  unit: string;
  factorValue: unknown;
  validFrom: Date | string;
  validTo: Date | string | null;
};

type FactorPeriod = {
  id: number;
  type: string;
  description: string;
  unit: string;
  factorValue: unknown;
  validFrom: Date;
  validTo: Date | null;
};

type FactorCorrectionInput = {
  type: string;
  description: string;
  unit: string;
  factorValue: number;
  validFrom: Date;
  validTo: Date | null;
};

class RequestError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "RequestError";
    this.status = status;
  }
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

function serializeFactor<T extends SerializableFactor>(factor: T) {
  return {
    id: factor.id,
    type: factor.type,
    description: factor.description,
    unit: factor.unit,
    factorValue: Number(factor.factorValue),
    validFrom: formatDate(factor.validFrom),
    validTo: factor.validTo ? formatDate(factor.validTo) : null,
  };
}

function normalizeDateValue(value: Date | string | null) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  return parseDate(value);
}

function toFactorPeriod<T extends SerializableFactor>(factor: T) {
  const validFrom = normalizeDateValue(factor.validFrom);
  const validTo = normalizeDateValue(factor.validTo);

  if (!validFrom) {
    throw new RequestError("배출계수 유효 시작일이 올바르지 않습니다.");
  }

  return {
    id: factor.id,
    type: factor.type,
    description: factor.description,
    unit: factor.unit,
    factorValue: factor.factorValue,
    validFrom,
    validTo,
  } satisfies FactorPeriod;
}

function addDays(value: Date, days: number) {
  const date = new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
  );

  date.setUTCDate(date.getUTCDate() + days);

  return date;
}

function roundEmission(amount: number, factor: number) {
  return Math.round(amount * factor * 100000000) / 100000000;
}

function sortFactorPeriods(factors: FactorPeriod[]) {
  return [...factors].sort(
    (a, b) => a.validFrom.getTime() - b.validFrom.getTime(),
  );
}

function findFactorForDate(factors: FactorPeriod[], date: Date) {
  return sortFactorPeriods(factors)
    .reverse()
    .find(
      (factor) =>
        factor.validFrom.getTime() <= date.getTime() &&
        (!factor.validTo || factor.validTo.getTime() >= date.getTime()),
    );
}

function hasSameFactorValue(left: unknown, right: unknown) {
  return Number(left) === Number(right);
}

function prepareCorrectedFactorSeries(
  factors: FactorPeriod[],
  selectedFactorId: number,
  correction: FactorCorrectionInput,
) {
  const sortedFactors = sortFactorPeriods(factors);
  const selectedIndex = sortedFactors.findIndex(
    (factor) => factor.id === selectedFactorId,
  );

  if (selectedIndex < 0) {
    throw new RequestError("수정할 배출계수를 찾을 수 없습니다.", 404);
  }

  const previousFactor = sortedFactors[selectedIndex - 1] ?? null;
  const selectedFactor = sortedFactors[selectedIndex];
  const nextFactor = sortedFactors[selectedIndex + 1] ?? null;
  const followingFactor = sortedFactors[selectedIndex + 2] ?? null;

  if (
    previousFactor &&
    correction.validFrom.getTime() <= previousFactor.validFrom.getTime()
  ) {
    throw new RequestError(
      "유효 시작일은 이전 버전의 시작일 이후로 입력해주세요.",
    );
  }

  if (
    nextFactor &&
    correction.validFrom.getTime() >= nextFactor.validFrom.getTime()
  ) {
    throw new RequestError(
      "유효 시작일은 다음 버전의 시작일 이전으로 입력해주세요.",
    );
  }

  if (nextFactor && !correction.validTo) {
    throw new RequestError(
      "다음 버전이 있는 계수는 유효 종료일을 비울 수 없습니다.",
    );
  }

  const nextValidFrom =
    nextFactor && correction.validTo ? addDays(correction.validTo, 1) : null;

  if (
    nextFactor &&
    nextValidFrom &&
    nextFactor.validTo &&
    nextValidFrom.getTime() > nextFactor.validTo.getTime()
  ) {
    throw new RequestError(
      "유효 종료일이 다음 버전의 전체 기간을 덮지 않도록 조정해주세요.",
    );
  }

  if (
    followingFactor &&
    nextValidFrom &&
    nextValidFrom.getTime() >= followingFactor.validFrom.getTime()
  ) {
    throw new RequestError(
      "유효 종료일이 이후 버전과 겹치지 않도록 조정해주세요.",
    );
  }

  const finalFactors = sortedFactors.map((factor, index) => {
    if (previousFactor && index === selectedIndex - 1) {
      return {
        ...factor,
        validTo: addDays(correction.validFrom, -1),
      };
    }

    if (index === selectedIndex) {
      return {
        ...selectedFactor,
        ...correction,
      };
    }

    if (nextFactor && nextValidFrom && index === selectedIndex + 1) {
      return {
        ...factor,
        validFrom: nextValidFrom,
      };
    }

    return { ...factor };
  });

  return {
    finalFactors: sortFactorPeriods(finalFactors),
    previousFactor: previousFactor
      ? finalFactors.find((factor) => factor.id === previousFactor.id) ?? null
      : null,
    targetFactor:
      finalFactors.find((factor) => factor.id === selectedFactorId) ??
      selectedFactor,
    nextFactor: nextFactor
      ? finalFactors.find((factor) => factor.id === nextFactor.id) ?? null
      : null,
  };
}

function isValidChangeType(value: unknown): value is FactorChangeType {
  return value === "correction" || value === "revision";
}

function isValidDateRange(validFrom: Date, validTo: Date | null) {
  return !validTo || validTo.getTime() >= validFrom.getTime();
}

function getErrorStatus(error: unknown) {
  return error instanceof RequestError ? error.status : 500;
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

    if (!isValidDateRange(validFrom, validTo)) {
      return Response.json(
        { error: "유효 종료일은 유효 시작일 이후로 입력해주세요." },
        { status: 400 },
      );
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
        factor: serializeFactor(factor),
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
    const changeType = body.changeType;
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

    if (!isValidChangeType(changeType)) {
      return Response.json(
        { error: "배출계수 변경 방식을 선택해주세요." },
        { status: 400 },
      );
    }

    if (changeType === "correction" && !isValidDateRange(validFrom, validTo)) {
      return Response.json(
        { error: "유효 종료일은 유효 시작일 이후로 입력해주세요." },
        { status: 400 },
      );
    }

    const prisma = getPrismaClient();

    if (changeType === "revision") {
      const result = await prisma.$transaction(async (transaction) => {
        const previousFactor = await transaction.emissionFactor.findUnique({
          where: { id },
        });

        if (!previousFactor) {
          throw new RequestError("수정할 배출계수를 찾을 수 없습니다.", 404);
        }

        if (validFrom.getTime() <= previousFactor.validFrom.getTime()) {
          throw new RequestError(
            "새 버전의 유효 시작일은 선택한 배출계수의 시작일 이후여야 합니다.",
          );
        }

        if (
          previousFactor.validTo &&
          validFrom.getTime() > previousFactor.validTo.getTime()
        ) {
          throw new RequestError(
            "새 버전의 유효 시작일은 선택한 배출계수의 유효기간 안에 있어야 합니다.",
          );
        }

        const closedPreviousFactor = await transaction.emissionFactor.update({
          where: { id },
          data: {
            validTo: addDays(validFrom, -1),
          },
        });
        const factor = await transaction.emissionFactor.create({
          data: {
            type,
            description,
            unit,
            factorValue,
            validFrom,
            validTo: previousFactor.validTo,
          },
        });

        return {
          factor,
          previousFactor: closedPreviousFactor,
        };
      });

      return Response.json({
        changeType,
        factor: serializeFactor(result.factor),
        previousFactor: serializeFactor(result.previousFactor),
        recalculatedActivities: 0,
      });
    }

    const result = await prisma.$transaction(async (transaction) => {
      const previousFactor = await transaction.emissionFactor.findUnique({
        where: { id },
      });

      if (!previousFactor) {
        throw new RequestError("수정할 배출계수를 찾을 수 없습니다.", 404);
      }

      const factorRows = await transaction.emissionFactor.findMany({
        where: {
          type: previousFactor.type,
          description: previousFactor.description,
          unit: previousFactor.unit,
        },
        orderBy: {
          validFrom: "asc",
        },
      });
      const currentFactors = factorRows.map(toFactorPeriod);
      const correctedSeries = prepareCorrectedFactorSeries(currentFactors, id, {
        type,
        description,
        unit,
        factorValue,
        validFrom,
        validTo,
      });

      if (correctedSeries.previousFactor) {
        await transaction.emissionFactor.update({
          where: { id: correctedSeries.previousFactor.id },
          data: {
            validTo: correctedSeries.previousFactor.validTo,
          },
        });
      }

      if (correctedSeries.nextFactor) {
        await transaction.emissionFactor.update({
          where: { id: correctedSeries.nextFactor.id },
          data: {
            validFrom: correctedSeries.nextFactor.validFrom,
          },
        });
      }

      const factor = await transaction.emissionFactor.update({
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
      const affectedActivities = await transaction.activity.findMany({
        where: {
          type: previousFactor.type,
          description: previousFactor.description,
          unit: previousFactor.unit,
        },
        select: {
          id: true,
          activityDate: true,
          amount: true,
          appliedFactor: true,
        },
      });
      const activityUpdates = affectedActivities
        .map((activity) => {
          const oldFactor = findFactorForDate(
            currentFactors,
            activity.activityDate,
          );
          const finalFactor = findFactorForDate(
            correctedSeries.finalFactors,
            activity.activityDate,
          );

          if (!oldFactor || !finalFactor) {
            return null;
          }

          if (!hasSameFactorValue(activity.appliedFactor, oldFactor.factorValue)) {
            return null;
          }

          if (
            hasSameFactorValue(activity.appliedFactor, finalFactor.factorValue)
          ) {
            return null;
          }

          return {
            id: activity.id,
            amount: Number(activity.amount),
            factorValue: Number(finalFactor.factorValue),
          };
        })
        .filter((activity) => activity !== null);

      for (const activity of activityUpdates) {
        await transaction.activity.update({
          where: { id: activity.id },
          data: {
            appliedFactor: activity.factorValue,
            emission: roundEmission(activity.amount, activity.factorValue),
          },
        });
      }

      return {
        factor,
        recalculatedActivities: activityUpdates.length,
      };
    });

    return Response.json({
      changeType,
      factor: serializeFactor(result.factor),
      recalculatedActivities: result.recalculatedActivities,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "배출계수를 수정할 수 없습니다.",
      },
      { status: getErrorStatus(error) },
    );
  }
}

/**
 * @swagger
 * /api/emission-factors:
 *   delete:
 *     tags:
 *       - Master Data
 *     summary: 배출계수 삭제 차단
 */
export async function DELETE() {
  return Response.json(
    {
      error:
        "배출계수는 삭제할 수 없습니다. 새 버전 등록 또는 소급 정정을 사용해주세요.",
    },
    {
      status: 405,
      headers: {
        Allow: "GET, POST, PATCH",
      },
    },
  );
}
