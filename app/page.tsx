"use client";
import DashboardHeader from "@/components/Dashboard/DashboardPresenter/Header";
import FilterBarSection from "@/components/Dashboard/DashboardPresenter/FilterBarSection";
import * as S from "@/components/Dashboard/styles";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ChartCardSection from "@/components/Dashboard/DashboardPresenter/ChartCardSection";
import MonthlyChartSection from "@/components/Dashboard/DashboardPresenter/MonthlyChartSection";
import SearchTable from "@/components/DetailSearch/DetailSearchPresenter/SearchTable";
import {
  defaultCarbonBaseFilters,
  initialActivityFilterRule,
  type ActivityFilterRule,
  type CarbonActivityPage,
  type CarbonBaseFilters,
  type CarbonDashboardSummary,
} from "@/app/lib/carbon-api";

function buildBaseQuery(filters: CarbonBaseFilters) {
  const params = new URLSearchParams({
    startDate: filters.startDate,
    endDate: filters.endDate,
    scopes: Object.entries(filters.scopes)
      .filter(([, enabled]) => enabled)
      .map(([scope]) => scope)
      .join(","),
  });

  return params;
}

function appendActivityQuery(
  params: URLSearchParams,
  rule: ActivityFilterRule,
  page: number,
  pageSize: number,
) {
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  params.set("rules", JSON.stringify([rule]));

  return params;
}

export default function HomePage() {
  const [filters, setFilters] = useState<CarbonBaseFilters>(
    defaultCarbonBaseFilters,
  );
  const [draftRule, setDraftRule] = useState<ActivityFilterRule>(
    initialActivityFilterRule,
  );
  const [appliedRule, setAppliedRule] = useState<ActivityFilterRule>(
    initialActivityFilterRule,
  );
  const [activities, setActivities] = useState<CarbonActivityPage | null>(null);
  const [summary, setSummary] = useState<CarbonDashboardSummary | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  const baseQuery = useMemo(() => buildBaseQuery(filters), [filters]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSummary() {
      setIsSummaryLoading(true);

      try {
        const response = await fetch(
          `/api/carbon-dashboard/summary?${baseQuery.toString()}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("대시보드 요약을 불러올 수 없습니다.");
        }

        setSummary((await response.json()) as CarbonDashboardSummary);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
          setSummary(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSummaryLoading(false);
        }
      }
    }

    loadSummary();

    return () => controller.abort();
  }, [baseQuery]);

  useEffect(() => {
    const controller = new AbortController();
    const params = appendActivityQuery(
      new URLSearchParams(baseQuery),
      appliedRule,
      page,
      pageSize,
    );

    async function loadActivities() {
      setIsActivitiesLoading(true);

      try {
        const response = await fetch(`/api/carbon-activities?${params}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("활동 내역을 불러올 수 없습니다.");
        }

        setActivities((await response.json()) as CarbonActivityPage);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
          setActivities(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsActivitiesLoading(false);
        }
      }
    }

    loadActivities();

    return () => controller.abort();
  }, [appliedRule, baseQuery, page, pageSize]);

  const handleFilterChange = useCallback((nextFilters: CarbonBaseFilters) => {
    setFilters(nextFilters);
    setPage(1);
  }, []);

  const handleSearch = useCallback(() => {
    setAppliedRule(draftRule);
    setPage(1);
  }, [draftRule]);

  const handlePageChange = useCallback((nextPage: number, nextSize: number) => {
    setPage(nextPage);
    setPageSize(nextSize);
  }, []);

  return (
    <S.DashboardPageMain>
      {/* 헤더 */}
      <DashboardHeader />

      {/* 필터 바 */}
      <FilterBarSection filters={filters} onChange={handleFilterChange} />

      {/* 차트 카드 */}
      <ChartCardSection summary={summary} loading={isSummaryLoading} />

      {/* recharts 막대표 */}
      <MonthlyChartSection rows={summary?.monthly ?? []} />

      {/* 페이지네이션 및 테이블 */}
      <SearchTable
        activities={activities}
        loading={isActivitiesLoading}
        rule={draftRule}
        onRuleChange={setDraftRule}
        onSearch={handleSearch}
        onPageChange={handlePageChange}
      />
    </S.DashboardPageMain>
  );
}
