import { getCarbonDashboardSummary } from "@/app/server/carbon/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/carbon-dashboard/summary:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: 대시보드 요약 조회
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
 *         description: 쉼표로 구분한 Scope 목록
 *     responses:
 *       200:
 *         description: Scope별 KPI와 월별 배출량
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardSummary'
 *       500:
 *         description: 요약 계산 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const summary = await getCarbonDashboardSummary(searchParams);

    return Response.json(summary);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "대시보드 요약을 계산할 수 없습니다.",
      },
      { status: 500 },
    );
  }
}
