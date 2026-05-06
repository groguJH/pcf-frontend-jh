"use client";
import React from "react";
import * as S from "@/components/Dashboard/styles";
import type { CarbonDashboardSummary } from "@/app/lib/carbon-api";

type ChartCardSectionProps = {
  summary: CarbonDashboardSummary | null;
  loading?: boolean;
};

function formatEmission(value: number) {
  return value.toLocaleString("ko-KR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

export default function ChartCardSection({
  summary,
  loading = false,
}: ChartCardSectionProps) {
  const kpi = summary?.kpi ?? {
    total: 0,
    scope1: 0,
    scope2: 0,
    scope3: 0,
  };
  const fallbackText = loading ? "조회 중" : "0.00";

  return (
    <>
      <S.ChartCardWrapper>
        <S.ChartCard>
          <S.CardTitle>총 탄소 배출량</S.CardTitle>
          <S.CardValueWrapper>
            <S.CardValue>
              {summary ? formatEmission(kpi.total) : fallbackText}
            </S.CardValue>
            <S.CardUnit>kgCO₂e</S.CardUnit>
          </S.CardValueWrapper>
        </S.ChartCard>
        <S.ChartCard>
          <S.CardTitle>직접 배출</S.CardTitle>
          <S.CardValueWrapper>
            <S.CardValue>
              {summary ? formatEmission(kpi.scope1) : fallbackText}
            </S.CardValue>
            <S.CardUnit>kgCO₂e</S.CardUnit>
          </S.CardValueWrapper>
        </S.ChartCard>
        <S.ChartCard>
          <S.CardTitle>간접 배출</S.CardTitle>
          <S.CardValueWrapper>
            <S.CardValue>
              {summary ? formatEmission(kpi.scope2) : fallbackText}
            </S.CardValue>
            <S.CardUnit>kgCO₂e</S.CardUnit>
          </S.CardValueWrapper>
        </S.ChartCard>
        <S.ChartCard>
          <S.CardTitle>가치 사슬</S.CardTitle>
          <S.CardValueWrapper>
            <S.CardValue>
              {summary ? formatEmission(kpi.scope3) : fallbackText}
            </S.CardValue>
            <S.CardUnit>kgCO₂e</S.CardUnit>
          </S.CardValueWrapper>
        </S.ChartCard>
      </S.ChartCardWrapper>
    </>
  );
}
