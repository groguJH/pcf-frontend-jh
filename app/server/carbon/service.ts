import {
  defaultCarbonBaseFilters,
  initialActivityFilterRule,
  type ActivityFilterField,
  type ActivityFilterOperator,
  type ActivityFilterRule,
  type CarbonActivityPage,
  type CarbonBaseFilters,
  type CarbonDashboardSummary,
  type MonthlyEmissionRow,
} from "@/app/lib/carbon-api";
import {
  calculateCarbonActivity,
  type CarbonActivity,
  type CarbonScope,
  type SourceActivityRow,
} from "@/app/lib/carbon-data";
import { getCarbonActivityRepository } from "@/app/server/carbon/repository";

type ActivityQuery = {
  baseFilters: CarbonBaseFilters;
  rules: ActivityFilterRule[];
  page: number;
  pageSize: number;
};

const filterFields: ActivityFilterField[] = [
  "activityDate",
  "scope",
  "activityType",
  "description",
  "facilityName",
  "productName",
  "supplierName",
  "emissionFactor",
  "emissionKgCo2e",
];
const filterOperators: ActivityFilterOperator[] = [
  "=",
  "!=",
  ">=",
  "<=",
  "contains",
];

function parsePositiveInteger(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseScopes(value: string | null): Record<CarbonScope, boolean> {
  if (value === null) {
    return defaultCarbonBaseFilters.scopes;
  }

  const enabledScopes = new Set(value.split(",").filter(Boolean));

  return {
    scope1: enabledScopes.has("scope1"),
    scope2: enabledScopes.has("scope2"),
    scope3: enabledScopes.has("scope3"),
  };
}

function normalizeRules(value: string | null): ActivityFilterRule[] {
  if (!value) {
    return [initialActivityFilterRule];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [initialActivityFilterRule];
    }

    return parsed
      .filter((rule): rule is Partial<ActivityFilterRule> => Boolean(rule))
      .map((rule, index) => {
        const field = filterFields.includes(rule.field as ActivityFilterField)
          ? (rule.field as ActivityFilterField)
          : "description";
        const operator = filterOperators.includes(
          rule.operator as ActivityFilterOperator,
        )
          ? (rule.operator as ActivityFilterOperator)
          : "contains";

        return {
          id: typeof rule.id === "string" ? rule.id : `rule-${index}`,
          logicOp: rule.logicOp === "OR" ? "OR" : "AND",
          field,
          operator,
          value: typeof rule.value === "string" ? rule.value : "",
        };
      });
  } catch {
    return [initialActivityFilterRule];
  }
}

export function parseActivityQuery(
  searchParams: URLSearchParams,
): ActivityQuery {
  return {
    baseFilters: {
      startDate:
        searchParams.get("startDate") ?? defaultCarbonBaseFilters.startDate,
      endDate: searchParams.get("endDate") ?? defaultCarbonBaseFilters.endDate,
      scopes: parseScopes(searchParams.get("scopes")),
    },
    rules: normalizeRules(searchParams.get("rules")),
    page: parsePositiveInteger(searchParams.get("page"), 1),
    pageSize: Math.min(
      parsePositiveInteger(searchParams.get("pageSize"), 10),
      5000,
    ),
  };
}

function filterByBase(rows: CarbonActivity[], filters: CarbonBaseFilters) {
  return rows.filter((row) => {
    if (
      row.activityDate < filters.startDate ||
      row.activityDate > filters.endDate
    ) {
      return false;
    }

    return filters.scopes[row.scope];
  });
}

function getFieldValue(row: CarbonActivity, field: ActivityFilterField) {
  if (field === "supplierName") {
    return row.supplierName ?? "";
  }

  return row[field];
}

function evaluateSingleRule(row: CarbonActivity, rule: ActivityFilterRule) {
  if (rule.value === "") {
    return true;
  }

  const rowValue = getFieldValue(row, rule.field);

  if (rule.field === "emissionFactor" || rule.field === "emissionKgCo2e") {
    const numericRowValue = Number(rowValue);
    const numericRuleValue = Number(rule.value);

    if (Number.isNaN(numericRuleValue)) {
      return true;
    }

    if (rule.operator === ">=") {
      return numericRowValue >= numericRuleValue;
    }

    if (rule.operator === "<=") {
      return numericRowValue <= numericRuleValue;
    }

    if (rule.operator === "!=") {
      return numericRowValue !== numericRuleValue;
    }

    return numericRowValue === numericRuleValue;
  }

  const normalizedRowValue = String(rowValue).toLowerCase();
  const normalizedRuleValue = rule.value.toLowerCase();

  if (rule.operator === "contains") {
    return normalizedRowValue.includes(normalizedRuleValue);
  }

  if (rule.operator === "!=") {
    return normalizedRowValue !== normalizedRuleValue;
  }

  if (rule.operator === ">=") {
    return normalizedRowValue >= normalizedRuleValue;
  }

  if (rule.operator === "<=") {
    return normalizedRowValue <= normalizedRuleValue;
  }

  return normalizedRowValue === normalizedRuleValue;
}

function applyRules(rows: CarbonActivity[], rules: ActivityFilterRule[]) {
  if (rules.length === 0) {
    return rows;
  }

  return rows.filter((row) => {
    let isMatch = evaluateSingleRule(row, rules[0]);

    for (let index = 1; index < rules.length; index += 1) {
      const rule = rules[index];
      const ruleMatch = evaluateSingleRule(row, rule);
      isMatch =
        rule.logicOp === "AND" ? isMatch && ruleMatch : isMatch || ruleMatch;
    }

    return isMatch;
  });
}

function sumByScope(rows: CarbonActivity[]) {
  return rows.reduce(
    (accumulator, row) => {
      accumulator.total += row.emissionKgCo2e;
      accumulator[row.scope] += row.emissionKgCo2e;
      return accumulator;
    },
    {
      total: 0,
      scope1: 0,
      scope2: 0,
      scope3: 0,
    },
  );
}

function buildMonthlyRows(rows: CarbonActivity[]): MonthlyEmissionRow[] {
  const months = Array.from({ length: 12 }, (_, index) => ({
    month: `${index + 1}월`,
    total: 0,
    scope1: 0,
    scope2: 0,
    scope3: 0,
  }));

  rows.forEach((row) => {
    const monthIndex = Number(row.activityDate.slice(5, 7)) - 1;

    if (monthIndex >= 0 && monthIndex < months.length) {
      months[monthIndex].total += row.emissionKgCo2e;
      months[monthIndex][row.scope] += row.emissionKgCo2e;
    }
  });

  return months.map((month) => ({
    ...month,
    total: Number(month.total.toFixed(3)),
    scope1: Number(month.scope1.toFixed(3)),
    scope2: Number(month.scope2.toFixed(3)),
    scope3: Number(month.scope3.toFixed(3)),
  }));
}

export async function getCarbonDashboardSummary(
  searchParams = new URLSearchParams(),
): Promise<CarbonDashboardSummary> {
  const { baseFilters } = parseActivityQuery(searchParams);
  const rows = await getCarbonActivityRepository().listActivities();
  const filteredRows = filterByBase(rows, baseFilters);

  return {
    kpi: sumByScope(filteredRows),
    monthly: buildMonthlyRows(filteredRows),
    rowsMatched: filteredRows.length,
  };
}

export async function listCarbonActivities(
  searchParams = new URLSearchParams(),
): Promise<CarbonActivityPage> {
  const query = parseActivityQuery(searchParams);
  const rows = await getCarbonActivityRepository().listActivities();
  const filteredRows = applyRules(
    filterByBase(rows, query.baseFilters),
    query.rules,
  );
  const totalRows = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / query.pageSize));
  const page = Math.min(query.page, totalPages);
  const startIndex = (page - 1) * query.pageSize;

  return {
    rows: filteredRows.slice(startIndex, startIndex + query.pageSize),
    totalRows,
    page,
    pageSize: query.pageSize,
    totalPages,
  };
}

function isSourceActivityRow(value: unknown): value is SourceActivityRow {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const row = value as Record<string, unknown>;

  return (
    typeof row.id === "number" &&
    typeof row.sourceSheet === "string" &&
    typeof row.sourceRowNumber === "number" &&
    typeof row.activityDate === "string" &&
    typeof row.activityType === "string" &&
    typeof row.description === "string" &&
    typeof row.quantity === "number" &&
    typeof row.unit === "string" &&
    typeof row.productName === "string"
  );
}

export function normalizeImportedRows(rows: unknown[]) {
  const accepted: CarbonActivity[] = [];
  const rejected: { index: number; reason: string }[] = [];

  rows.forEach((row, index) => {
    if (!isSourceActivityRow(row)) {
      rejected.push({
        index,
        reason: "필수 컬럼 또는 타입이 올바르지 않습니다.",
      });
      return;
    }

    try {
      accepted.push(calculateCarbonActivity(row));
    } catch (error) {
      rejected.push({
        index,
        reason: error instanceof Error ? error.message : "계산할 수 없습니다.",
      });
    }
  });

  return {
    accepted,
    rejected,
  };
}
