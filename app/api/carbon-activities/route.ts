import {
  listCarbonActivities,
  normalizeImportedRows,
} from "@/app/server/carbon/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/carbon-activities:
 *   get:
 *     tags:
 *       - Activities
 *     summary: 활동 내역 조회
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: scopes
 *         schema:
 *           type: string
 *       - in: query
 *         name: rules
 *         schema:
 *           type: string
 *         description: 상세 조건 JSON 문자열
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: 활동 내역 페이지
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarbonActivityPage'
 *       500:
 *         description: 활동 내역 조회 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activities = await listCarbonActivities(searchParams);

    return Response.json(activities);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "활동 데이터를 조회할 수 없습니다.",
      },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/carbon-activities:
 *   post:
 *     tags:
 *       - Activities
 *     summary: 원본 행 정규화
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rows:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: 정규화 결과
 *       400:
 *         description: 정규화 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { rows?: unknown[] } | unknown[];
    const rows = Array.isArray(body) ? body : body.rows;

    if (!Array.isArray(rows)) {
      return Response.json(
        { error: "rows 배열이 필요합니다." },
        { status: 400 },
      );
    }

    return Response.json(normalizeImportedRows(rows), { status: 201 });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "활동 데이터를 정규화할 수 없습니다.",
      },
      { status: 400 },
    );
  }
}
