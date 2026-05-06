import { type CarbonScope } from "@/app/lib/carbon-data";
import { getPrismaClient } from "@/app/server/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ImportActivityRow = {
  activityDate?: unknown;
  scope?: unknown;
  type?: unknown;
  description?: unknown;
  amount?: unknown;
  unit?: unknown;
  appliedFactor?: unknown;
  sourceSheet?: unknown;
  sourceRowNumber?: unknown;
  productName?: unknown;
};

type ParsedImportActivityRow = {
  activityDate: Date;
  activityDateText: string;
  scope: CarbonScope | null;
  type: string;
  description: string;
  amount: number;
  unit: string;
  appliedFactor: number | null;
  sourceRowNumber: number | null;
  productName: string;
};

function isValidScope(value: unknown): value is CarbonScope {
  return value === "scope1" || value === "scope2" || value === "scope3";
}

function parseExcelSerialDate(value: number) {
  if (!Number.isFinite(value)) {
    return null;
  }

  return new Date(Date.UTC(1899, 11, 30) + value * 24 * 60 * 60 * 1000);
}

function parseDate(value: unknown) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    return parseExcelSerialDate(value);
  }

  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const normalized = value.trim().replaceAll(".", "-").replaceAll("/", "-");
  const compactDateMatch = normalized.match(/^(\d{4})(\d{2})(\d{2})$/);
  const dateText = compactDateMatch
    ? `${compactDateMatch[1]}-${compactDateMatch[2]}-${compactDateMatch[3]}`
    : normalized;
  const date = new Date(dateText);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function parseNumber(value: unknown) {
  const parsed = Number(
    String(value ?? "")
      .replaceAll(",", "")
      .trim(),
  );

  return Number.isNaN(parsed) ? null : parsed;
}

function parseSourceRowNumber(value: unknown) {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function roundEmission(amount: number, factor: number) {
  return Math.round(amount * factor * 100000000) / 100000000;
}

function parseImportRow(row: ImportActivityRow, index: number) {
  const activityDate = parseDate(row.activityDate);
  const activityDateText = activityDate ? formatDate(activityDate) : "";
  const type = typeof row.type === "string" ? row.type.trim() : "";
  const description =
    typeof row.description === "string" ? row.description.trim() : "";
  const amount = parseNumber(row.amount);
  const unit = typeof row.unit === "string" ? row.unit.trim() : "";

  if (!activityDate || !type || !description || amount === null || !unit) {
    return {
      error: `${index + 1}번째 행의 일자, 활동 유형, 설명, 량, 단위를 확인해주세요.`,
    };
  }

  return {
    row: {
      activityDate,
      activityDateText,
      scope: isValidScope(row.scope) ? row.scope : null,
      type,
      description,
      amount,
      unit,
      appliedFactor: parseNumber(row.appliedFactor),
      sourceRowNumber: parseSourceRowNumber(row.sourceRowNumber),
      productName:
        typeof row.productName === "string" && row.productName.trim()
          ? row.productName.trim()
          : "업로드 데이터",
    } satisfies ParsedImportActivityRow,
  };
}

async function uploadActivities(rows: ParsedImportActivityRow[]) {
  const prisma = getPrismaClient();
  const data = [];

  for (const [index, row] of rows.entries()) {
    let scope = row.scope;

    if (!scope) {
      const categories = await prisma.emissionCategory.findMany({
        where: { type: row.type },
      });

      if (categories.length !== 1) {
        return {
          error: `${index + 1}번째 행의 Scope를 결정할 수 없습니다. 카테고리 또는 업로드 데이터를 확인해주세요.`,
        };
      }

      scope = categories[0].scope as CarbonScope;
    }

    const factorRow = await prisma.emissionFactor.findFirst({
      where: {
        type: row.type,
        description: row.description,
        unit: row.unit,
        validFrom: {
          lte: row.activityDate,
        },
        OR: [{ validTo: null }, { validTo: { gte: row.activityDate } }],
      },
      orderBy: {
        validFrom: "desc",
      },
    });

    if (!factorRow) {
      return {
        error: `${index + 1}번째 행에 적용할 배출계수를 찾을 수 없습니다.`,
      };
    }

    const appliedFactor = row.appliedFactor ?? Number(factorRow.factorValue);

    data.push({
      activityDate: row.activityDate,
      scope,
      type: row.type,
      description: row.description,
      amount: row.amount,
      unit: row.unit,
      appliedFactor,
      emission: roundEmission(row.amount, appliedFactor),
    });
  }

  const result = await prisma.activity.createMany({ data });

  return { count: result.count };
}

/**
 * @swagger
 * /api/carbon-activities/import:
 *   post:
 *     tags:
 *       - Activities
 *     summary: 활동 내역 저장
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { rows?: ImportActivityRow[] };
    const inputRows = Array.isArray(body.rows) ? body.rows : [];

    if (inputRows.length === 0) {
      return Response.json(
        { error: "업로드할 활동 데이터가 없습니다." },
        { status: 400 },
      );
    }

    const rows: ParsedImportActivityRow[] = [];

    for (const [index, inputRow] of inputRows.entries()) {
      const result = parseImportRow(inputRow, index);

      if ("error" in result) {
        return Response.json({ error: result.error }, { status: 400 });
      }

      rows.push(result.row);
    }

    const result = await uploadActivities(rows);

    if ("error" in result) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json({ count: result.count }, { status: 201 });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "활동 데이터를 업로드할 수 없습니다.",
      },
      { status: 500 },
    );
  }
}
