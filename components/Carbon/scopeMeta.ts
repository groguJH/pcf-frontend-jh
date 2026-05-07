import type { CarbonScope } from "@/app/lib/carbon-data";

export type ScopeColorKey = "scope1" | "scope2" | "scope3";

export type ScopeMeta = {
  key: CarbonScope;
  name: string;
  businessLabel: string;
  color: string;
  colorKey: ScopeColorKey;
};

export const scopeMetaList: ScopeMeta[] = [
  {
    key: "scope1",
    name: "Scope 1",
    businessLabel: "직접배출",
    color: "#ff7a00",
    colorKey: "scope1",
  },
  {
    key: "scope2",
    name: "Scope 2",
    businessLabel: "간접배출",
    color: "#1890ff",
    colorKey: "scope2",
  },
  {
    key: "scope3",
    name: "Scope 3",
    businessLabel: "가치사슬",
    color: "#52c41a",
    colorKey: "scope3",
  },
];

export const scopeMetaMap = scopeMetaList.reduce(
  (accumulator, scope) => ({
    ...accumulator,
    [scope.key]: scope,
  }),
  {} as Record<CarbonScope, ScopeMeta>,
);

export function getScopeTooltipTitle(scope: CarbonScope) {
  const meta = scopeMetaMap[scope];

  return `${meta.name} 으로 표기됩니다.`;
}
