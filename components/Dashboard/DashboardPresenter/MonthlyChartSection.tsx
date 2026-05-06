"use client";
import React, { useEffect, useState } from "react";
import { ChartContainer, ChartTitle } from "../styles";
import type { MonthlyEmissionRow } from "@/app/lib/carbon-api";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type MonthlyChartSectionProps = {
  rows: MonthlyEmissionRow[];
};

export default function MonthlyChartSection({ rows }: MonthlyChartSectionProps) {
  const [isMounted, setIsMounted] = useState(false);
  const data = rows.map((row) => ({
    ...row,
    name: row.month,
  }));

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsMounted(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <ChartContainer>
      <ChartTitle>월별 누적 배출량 추이</ChartTitle>
      <div style={{ width: "100%", height: "24rem", minHeight: "24rem" }}>
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              {/* 배경 가로선 설정 */}
              <CartesianGrid stroke="#f0f0f0" vertical={false} />

              {/* 축 설정 */}
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: "1.2rem", fill: "#666" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: "1.2rem", fill: "#666" }}
              />

              {/* 마우스 오버 시 정보창 */}
              <Tooltip />

              {/* 범례 설정 - 스크린샷처럼 상단 우측 배치 */}
              <Legend
                verticalAlign="top"
                align="right"
                iconType="rect"
                wrapperStyle={{ paddingBottom: "20px", fontSize: "1.2rem" }}
              />

              {/* 막대 그래프: Scope 1 (주황색) */}
              <Bar
                dataKey="scope1"
                name="Scope 1 (직접)"
                fill="#ff7a00"
                barSize={60}
                radius={[4, 4, 0, 0]}
              />

              {/* 선 그래프: 총 배출량 추세선 (검정색 곡선) */}
              <Line
                type="monotone"
                dataKey="total"
                name="총 배출량 추세선"
                stroke="#1d2129"
                strokeWidth={2}
                dot={{ r: 5, fill: "#1d2129", strokeWidth: 2 }}
                activeDot={{ r: 7 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </ChartContainer>
  );
}
