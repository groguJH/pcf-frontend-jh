import { getPrismaClient } from "@/app/server/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isValidScope(value: unknown): value is "scope1" | "scope2" | "scope3" {
  return value === "scope1" || value === "scope2" || value === "scope3";
}

/**
 * @swagger
 * /api/emission-categories:
 *   get:
 *     tags:
 *       - Master Data
 *     summary: 배출원 카테고리 목록 조회
 *     responses:
 *       200:
 *         description: 카테고리 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EmissionCategory'
 *       500:
 *         description: 카테고리 조회 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET() {
  try {
    const prisma = getPrismaClient();
    const categories = await prisma.emissionCategory.findMany({
      orderBy: [{ type: "asc" }, { scope: "asc" }],
    });

    return Response.json({ categories });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "카테고리를 조회할 수 없습니다.",
      },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/emission-categories:
 *   post:
 *     tags:
 *       - Master Data
 *     summary: 배출원 카테고리 생성
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - scope
 *             properties:
 *               type:
 *                 type: string
 *               scope:
 *                 $ref: '#/components/schemas/CarbonScope'
 *     responses:
 *       201:
 *         description: 생성된 카테고리
 *       400:
 *         description: 입력값 검증 실패
 *       500:
 *         description: 카테고리 저장 실패
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const type = typeof body.type === "string" ? body.type.trim() : "";
    const scope = body.scope;

    if (!type || !isValidScope(scope)) {
      return Response.json(
        { error: "배출원 유형과 Scope를 확인해주세요." },
        { status: 400 },
      );
    }

    const prisma = getPrismaClient();
    const category = await prisma.emissionCategory.create({
      data: {
        type,
        scope,
      },
    });

    return Response.json({ category }, { status: 201 });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "카테고리를 저장할 수 없습니다.",
      },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/emission-categories:
 *   patch:
 *     tags:
 *       - Master Data
 *     summary: 배출원 카테고리 수정
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - originalType
 *               - originalScope
 *               - type
 *               - scope
 *             properties:
 *               originalType:
 *                 type: string
 *               originalScope:
 *                 $ref: '#/components/schemas/CarbonScope'
 *               type:
 *                 type: string
 *               scope:
 *                 $ref: '#/components/schemas/CarbonScope'
 *     responses:
 *       200:
 *         description: 수정된 카테고리
 *       400:
 *         description: 입력값 검증 실패
 *       500:
 *         description: 카테고리 수정 실패
 */
export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const originalType =
      typeof body.originalType === "string" ? body.originalType.trim() : "";
    const originalScope = body.originalScope;
    const type = typeof body.type === "string" ? body.type.trim() : "";
    const scope = body.scope;

    if (
      !originalType ||
      !isValidScope(originalScope) ||
      !type ||
      !isValidScope(scope)
    ) {
      return Response.json(
        { error: "수정할 카테고리 정보를 확인해주세요." },
        { status: 400 },
      );
    }

    const prisma = getPrismaClient();
    const category = await prisma.emissionCategory.update({
      where: {
        type_scope: {
          type: originalType,
          scope: originalScope,
        },
      },
      data: {
        type,
        scope,
      },
    });

    return Response.json({ category });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "카테고리를 수정할 수 없습니다.",
      },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/emission-categories:
 *   delete:
 *     tags:
 *       - Master Data
 *     summary: 배출원 카테고리 삭제
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - scope
 *             properties:
 *               type:
 *                 type: string
 *               scope:
 *                 $ref: '#/components/schemas/CarbonScope'
 *     responses:
 *       200:
 *         description: 삭제된 카테고리
 *       400:
 *         description: 입력값 검증 실패
 *       500:
 *         description: 카테고리 삭제 실패
 */
export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const type = typeof body.type === "string" ? body.type.trim() : "";
    const scope = body.scope;

    if (!type || !isValidScope(scope)) {
      return Response.json(
        { error: "삭제할 카테고리 정보를 확인해주세요." },
        { status: 400 },
      );
    }

    const prisma = getPrismaClient();
    const category = await prisma.emissionCategory.delete({
      where: {
        type_scope: {
          type,
          scope,
        },
      },
    });

    return Response.json({ category });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "카테고리를 삭제할 수 없습니다.",
      },
      { status: 500 },
    );
  }
}
