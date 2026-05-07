"use client";

import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { ChartContainer, ChartTitle } from "../styles";
import { NoData, Statistic } from "@/components/common/styles";
import type { MonthlyEmissionRow } from "@/app/lib/carbon-api";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type MonthlyChartSectionProps = {
  rows: MonthlyEmissionRow[];
  hasData?: boolean;
};

type ScopeKey = "scope1" | "scope2" | "scope3";
type RatioKey = "scope1Ratio" | "scope2Ratio" | "scope3Ratio";

type MonthlyChartRow = MonthlyEmissionRow & {
  name: string;
  scope1Ratio: number;
  scope2Ratio: number;
  scope3Ratio: number;
};

type TooltipItem = {
  dataKey?: string | number | ((obj: unknown) => unknown);
  payload?: MonthlyChartRow;
};

const scopeItems: {
  key: ScopeKey;
  ratioKey: RatioKey;
  label: string;
  color: string;
}[] = [
  {
    key: "scope1",
    ratioKey: "scope1Ratio",
    label: "Scope 1",
    color: "#ff7a00",
  },
  {
    key: "scope2",
    ratioKey: "scope2Ratio",
    label: "Scope 2",
    color: "#1890ff",
  },
  {
    key: "scope3",
    ratioKey: "scope3Ratio",
    label: "Scope 3",
    color: "#52c41a",
  },
];

const ratioToScopeKey: Record<RatioKey, ScopeKey> = {
  scope1Ratio: "scope1",
  scope2Ratio: "scope2",
  scope3Ratio: "scope3",
};

const ChartPanel = styled(ChartContainer)`
  height: auto;
  min-height: 38rem;
`;

const HeaderRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
  margin-bottom: 1.2rem;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(8rem, 1fr));
  gap: 0.8rem;
  width: 100%;

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const SummaryCard = styled.div<{ $color?: string }>`
  border-left: 0.3rem solid ${({ $color }) => $color ?? "#1d2129"};
  border-radius: 0.6rem;
  background: #f8f9fa;
  padding: 0.8rem 1rem;
`;

const ScopedStatistic = styled(Statistic)<{ $color?: string }>`
  .ant-statistic-content {
    color: ${({ $color }) => $color ?? "#1d2129"};
  }
`;

const SummaryAmount = styled.span`
  display: block;
  margin-top: 0.5rem;
  color: #495057;
  font-size: 1.08rem;
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;
`;

const ChartFrame = styled.div`
  width: 100%;
  height: 25rem;
  min-height: 25rem;
`;

const NoDataChartState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border: 0.1rem dashed #d9dee3;
  border-radius: 0.8rem;
  background: #f8f9fa;
  padding: 2rem;
`;

function getRatio(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return (value / total) * 100;
}

function formatNumber(value: number) {
  return value.toLocaleString("ko-KR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

function formatPercentTick(value: string | number) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "";
  }

  return `${Math.round(numericValue)}%`;
}

function buildChartRows(rows: MonthlyEmissionRow[]): MonthlyChartRow[] {
  return rows.map((row) => ({
    ...row,
    name: row.month,
    scope1Ratio: getRatio(row.scope1, row.total),
    scope2Ratio: getRatio(row.scope2, row.total),
    scope3Ratio: getRatio(row.scope3, row.total),
  }));
}

function formatTooltipValue(
  value: string | number | readonly (string | number)[] | undefined,
  name: string | number | undefined,
  item: TooltipItem,
) {
  const dataKey = String(item.dataKey);
  const tooltipName = String(name);

  if (dataKey === "total") {
    return [`${formatNumber(Number(value))} kgCO₂e`, tooltipName];
  }

  const scopeKey = ratioToScopeKey[dataKey as RatioKey];
  const actualValue = scopeKey ? (item.payload?.[scopeKey] ?? 0) : 0;

  return [
    `${formatNumber(actualValue)} kgCO₂e (${formatNumber(Number(value))}%)`,
    tooltipName,
  ];
}

export default function MonthlyChartSection({
  rows,
  hasData = rows.some((row) => row.total > 0),
}: MonthlyChartSectionProps) {
  const [isMounted, setIsMounted] = useState(false);
  const data = useMemo(() => buildChartRows(rows), [rows]);
  const totals = useMemo(
    () =>
      rows.reduce(
        (accumulator, row) => ({
          total: accumulator.total + row.total,
          scope1: accumulator.scope1 + row.scope1,
          scope2: accumulator.scope2 + row.scope2,
          scope3: accumulator.scope3 + row.scope3,
        }),
        { total: 0, scope1: 0, scope2: 0, scope3: 0 },
      ),
    [rows],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsMounted(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <ChartPanel>
      <HeaderRow>
        <ChartTitle>월별 Scope 배출 비율 및 총량 추세</ChartTitle>
        <SummaryGrid>
          <SummaryCard>
            <ScopedStatistic
              title="총 배출량"
              value={totals.total}
              precision={2}
              suffix="kgCO₂e"
            />
            <SummaryAmount>전체 기간 합계</SummaryAmount>
          </SummaryCard>
          {scopeItems.map((scope) => (
            <SummaryCard key={scope.key} $color={scope.color}>
              <ScopedStatistic
                title={scope.label}
                value={getRatio(totals[scope.key], totals.total)}
                precision={1}
                suffix="%"
                $color={scope.color}
              />
              <SummaryAmount>
                {formatNumber(totals[scope.key])} kgCO₂e
              </SummaryAmount>
            </SummaryCard>
          ))}
        </SummaryGrid>
      </HeaderRow>

      <ChartFrame>
        {!hasData ? (
          <NoDataChartState>
            <NoData />
          </NoDataChartState>
        ) : isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 16, right: 18, bottom: 12, left: 12 }}
            >
              <CartesianGrid stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: "1.05rem", fill: "#666" }}
                dy={8}
              />
              <YAxis
                yAxisId="ratio"
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: "1.05rem", fill: "#666" }}
                tickFormatter={formatPercentTick}
              />
              <YAxis
                yAxisId="total"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: "1.05rem", fill: "#868e96" }}
                tickFormatter={(value) =>
                  Number(value).toLocaleString("ko-KR", {
                    maximumFractionDigits: 0,
                  })
                }
              />
              <Tooltip formatter={formatTooltipValue} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="rect"
                wrapperStyle={{ paddingBottom: "16px", fontSize: "1.05rem" }}
              />

              {scopeItems.map((scope, index) => (
                <Bar
                  key={scope.key}
                  yAxisId="ratio"
                  dataKey={scope.ratioKey}
                  name={`${scope.label} 비율`}
                  stackId="scopeRatio"
                  fill={scope.color}
                  barSize={42}
                  radius={
                    index === scopeItems.length - 1 ? [4, 4, 0, 0] : undefined
                  }
                />
              ))}

              <Line
                yAxisId="total"
                type="monotone"
                dataKey="total"
                name="총 배출량 추세선"
                stroke="#1d2129"
                strokeWidth={2}
                dot={{ r: 4, fill: "#1d2129", strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : null}
      </ChartFrame>
    </ChartPanel>
  );
}
