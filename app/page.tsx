"use client";
import FilterBarSection from "@/components/Dashboard/DashboardPresenter/FilterBarSection";
import * as S from "@/components/Dashboard/styles";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import MonthlyChartSection from "@/components/Dashboard/DashboardPresenter/MonthlyChartSection";
import SearchTable from "@/components/DetailSearch/DetailSearchPresenter/SearchTable";
import { message } from "@/components/common/styles";
import {
  defaultCarbonBaseFilters,
  initialActivityFilterRule,
  type ActivityFilterRule,
  type CarbonActivityPage,
  type CarbonBaseFilters,
  type CarbonDashboardSummary,
} from "@/app/lib/carbon-api";
import { fetchJson } from "@/app/lib/api-client";

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
  rules: ActivityFilterRule[],
  page: number,
  pageSize: number,
) {
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  params.set("rules", JSON.stringify(rules));

  return params;
}

function normalizeRulesForQuery(rules: ActivityFilterRule[]) {
  const normalizedRules = rules
    .filter((rule) => rule.value.trim() !== "")
    .map((rule, index) => ({
      ...rule,
      logicOp: index === 0 ? "AND" : rule.logicOp,
      value: rule.value.trim(),
    }));

  return normalizedRules.length > 0
    ? normalizedRules
    : [{ ...initialActivityFilterRule }];
}

type CarbonActivityRow = CarbonActivityPage["rows"][number];

const ACTIVITY_EXPORT_PAGE_SIZE = 5000;

function formatScope(scope: CarbonActivityRow["scope"]) {
  return scope.replace("scope", "SCOPE ");
}

function formatExportFileName() {
  const timestamp = new Date()
    .toISOString()
    .slice(0, 19)
    .replace("T", "-")
    .replaceAll(":", "");

  return `carbon-activities-${timestamp}.xlsx`;
}

function toActivityExportRows(rows: CarbonActivityRow[]) {
  return rows.map((row) => ({
    일자: row.activityDate,
    Scope: formatScope(row.scope),
    "활동 유형": row.activityType,
    설명: row.description,
    사용량: row.quantity,
    단위: row.unit,
    "적용 계수": row.emissionFactor,
    "배출량 (kgCO₂e)": row.emissionKgCo2e,
  }));
}

export default function HomePage() {
  const [filters, setFilters] = useState<CarbonBaseFilters>(
    defaultCarbonBaseFilters,
  );
  const [draftRules, setDraftRules] = useState<ActivityFilterRule[]>([
    initialActivityFilterRule,
  ]);
  const [appliedRules, setAppliedRules] = useState<ActivityFilterRule[]>([
    initialActivityFilterRule,
  ]);
  const [activities, setActivities] = useState<CarbonActivityPage | null>(null);
  const [summary, setSummary] = useState<CarbonDashboardSummary | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const baseQuery = useMemo(() => buildBaseQuery(filters), [filters]);
  const hasDashboardData = (summary?.rowsMatched ?? 0) > 0;

  useEffect(() => {
    const controller = new AbortController();

    async function loadSummary() {
      try {
        const dashboardSummary = await fetchJson<CarbonDashboardSummary>(
          `/api/carbon-dashboard/summary?${baseQuery.toString()}`,
          {
            signal: controller.signal,
          },
          {
            errorMessage: "대시보드 요약을 불러올 수 없습니다.",
          },
        );

        setSummary(dashboardSummary);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
          setSummary(null);
        }
      }
    }

    loadSummary();

    return () => controller.abort();
  }, [baseQuery]);

  useEffect(() => {
    const controller = new AbortController();
    const params = appendActivityQuery(
      new URLSearchParams(),
      appliedRules,
      page,
      pageSize,
    );

    async function loadActivities() {
      setIsActivitiesLoading(true);

      try {
        const activityPage = await fetchJson<CarbonActivityPage>(
          `/api/carbon-activities?${params}`,
          {
            signal: controller.signal,
          },
          {
            errorMessage: "활동 내역을 불러올 수 없습니다.",
          },
        );

        setActivities(activityPage);
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
  }, [appliedRules, page, pageSize]);

  const handleFilterChange = useCallback((nextFilters: CarbonBaseFilters) => {
    setFilters(nextFilters);
  }, []);

  const handleSearch = useCallback(() => {
    setAppliedRules(normalizeRulesForQuery(draftRules));
    setPage(1);
  }, [draftRules]);

  const handlePageChange = useCallback((nextPage: number, nextSize: number) => {
    setPage(nextPage);
    setPageSize(nextSize);
  }, []);

  const handleDownload = useCallback(async () => {
    setIsDownloading(true);

    try {
      const firstParams = appendActivityQuery(
        new URLSearchParams(),
        appliedRules,
        1,
        ACTIVITY_EXPORT_PAGE_SIZE,
      );
      const firstPage = await fetchJson<CarbonActivityPage>(
        `/api/carbon-activities?${firstParams}`,
        undefined,
        {
          errorMessage: "활동 내역을 다운로드할 수 없습니다.",
        },
      );
      const rows = [...firstPage.rows];

      for (
        let nextPage = 2;
        nextPage <= firstPage.totalPages;
        nextPage += 1
      ) {
        const params = appendActivityQuery(
          new URLSearchParams(),
          appliedRules,
          nextPage,
          ACTIVITY_EXPORT_PAGE_SIZE,
        );
        const activityPage = await fetchJson<CarbonActivityPage>(
          `/api/carbon-activities?${params}`,
          undefined,
          {
            errorMessage: "활동 내역을 다운로드할 수 없습니다.",
          },
        );
        rows.push(...activityPage.rows);
      }

      if (rows.length === 0) {
        message.warning("다운로드할 데이터가 없습니다.");
        return;
      }

      const XLSX = await import("xlsx");
      const worksheet = XLSX.utils.json_to_sheet(toActivityExportRows(rows));
      worksheet["!cols"] = [
        { wch: 12 },
        { wch: 10 },
        { wch: 14 },
        { wch: 28 },
        { wch: 12 },
        { wch: 10 },
        { wch: 12 },
        { wch: 18 },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "상세 조건 내역");
      XLSX.writeFile(workbook, formatExportFileName());
      message.success(`${rows.length.toLocaleString("ko-KR")}건을 다운로드했습니다.`);
    } catch (error) {
      console.error(error);
      message.error("Excel 다운로드 중 오류가 발생했습니다.");
    } finally {
      setIsDownloading(false);
    }
  }, [appliedRules]);

  return (
    <S.DashboardPageMain>
      {/* 필터 바 */}
      <FilterBarSection filters={filters} onChange={handleFilterChange} />

      {/* Scope 비율 및 총량 추세 차트 */}
      <MonthlyChartSection
        rows={summary?.monthly ?? []}
        hasData={hasDashboardData}
      />

      {/* 페이지네이션 및 테이블 */}
      <SearchTable
        activities={activities}
        loading={isActivitiesLoading}
        rules={draftRules}
        onRulesChange={setDraftRules}
        onSearch={handleSearch}
        onPageChange={handlePageChange}
        onDownload={handleDownload}
        downloadLoading={isDownloading}
      />
    </S.DashboardPageMain>
  );
}
