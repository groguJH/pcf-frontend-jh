"use client";
import DashboardHeader from "@/components/Dashboard/DashboardPresenter/Header";
import FilterBarSection from "@/components/Dashboard/DashboardPresenter/FilterBarSection";
import * as S from "@/components/Dashboard/styles";
import React from "react";
import ChartCardSection from "@/components/Dashboard/DashboardPresenter/ChartCardSection";
import MonthlyChartSection from "@/components/Dashboard/DashboardPresenter/MonthlyChartSection";
import SearchTable from "@/components/DetailSearch/DetailSearchPresenter/SearchTable";

export default function HomePage() {
  return (
    <S.DashboardPageMain>
      {/* 헤더 */}
      <DashboardHeader />

      {/* 필터 바 */}
      <FilterBarSection />

      {/* 차트 카드 */}
      <ChartCardSection />

      {/* recharts 막대표 */}
      <MonthlyChartSection />

      {/* 페이지네이션 및 테이블 */}
      <SearchTable />
    </S.DashboardPageMain>
  );
}
