import { CarbonActivity, CarbonScope } from "./carbon-data";

export type CarbonBaseFilters = {
  startDate: string;
  endDate: string;
  scopes: Record<CarbonScope, boolean>;
};

export type ActivityFilterField =
  | "activityDate"
  | "scope"
  | "activityType"
  | "description"
  | "quantity"
  | "emissionFactor"
  | "emissionKgCo2e";

export type ActivityFilterOperator = "=" | "!=" | ">=" | "<=" | "contains";
export type ActivityFilterLogic = "AND" | "OR";

export type ActivityFilterRule = {
  id: string;
  logicOp: ActivityFilterLogic;
  field: ActivityFilterField;
  operator: ActivityFilterOperator;
  value: string;
};

export type MonthlyEmissionRow = {
  month: string;
  total: number;
  scope1: number;
  scope2: number;
  scope3: number;
};

export type CarbonDashboardSummary = {
  kpi: {
    total: number;
    scope1: number;
    scope2: number;
    scope3: number;
  };
  monthly: MonthlyEmissionRow[];
  rowsMatched: number;
};

export type CarbonActivityPage = {
  rows: CarbonActivity[];
  totalRows: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export const defaultCarbonBaseFilters: CarbonBaseFilters = {
  startDate: "2025-01-01",
  endDate: "2025-12-31",
  scopes: {
    scope1: true,
    scope2: true,
    scope3: true,
  },
};

export const initialActivityFilterRule: ActivityFilterRule = {
  id: "rule-initial",
  logicOp: "AND",
  field: "description",
  operator: "contains",
  value: "",
};
