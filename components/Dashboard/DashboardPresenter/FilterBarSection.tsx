import React from "react";
import * as S from "@/components/Dashboard/styles";
import { Button, RangePicker } from "@/components/common/styles";
import dayjs from "dayjs";
import type { CarbonBaseFilters } from "@/app/lib/carbon-api";
import type { CarbonScope } from "@/app/lib/carbon-data";

type FilterBarSectionProps = {
  filters: CarbonBaseFilters;
  onChange: (filters: CarbonBaseFilters) => void;
};

const dateFormat = "YYYY-MM-DD";

const scopeOptions: { scope: CarbonScope; label: string }[] = [
  { scope: "scope1", label: "직접배출" },
  { scope: "scope2", label: "간접배출" },
  { scope: "scope3", label: "가치사슬" },
];

const scopeButtonColors: Record<CarbonScope, "scope1" | "scope2" | "scope3"> = {
  scope1: "scope1",
  scope2: "scope2",
  scope3: "scope3",
};

export default function FilterBarSection({
  filters,
  onChange,
}: FilterBarSectionProps) {
  const handleScopeToggle = (scope: CarbonScope) => {
    onChange({
      ...filters,
      scopes: {
        ...filters.scopes,
        [scope]: !filters.scopes[scope],
      },
    });
  };

  return (
    <>
      <S.FilterBarWrapper>
        <S.FilterGroup>
          <S.FilterWrapper>
            <S.FilterLabel>조회기간</S.FilterLabel>
            <RangePicker
              value={[
                dayjs(filters.startDate, dateFormat),
                dayjs(filters.endDate, dateFormat),
              ]}
              onChange={(dates) => {
                if (!dates?.[0] || !dates?.[1]) {
                  return;
                }

                onChange({
                  ...filters,
                  startDate: dates[0].format(dateFormat),
                  endDate: dates[1].format(dateFormat),
                });
              }}
            />
          </S.FilterWrapper>
          <S.ToggleButtonGroup>
            {scopeOptions.map((option) => (
              <Button
                key={option.scope}
                customColor={
                  filters.scopes[option.scope]
                    ? scopeButtonColors[option.scope]
                    : "subGray"
                }
                onClick={() => handleScopeToggle(option.scope)}
              >
                {option.label}
              </Button>
            ))}
          </S.ToggleButtonGroup>
        </S.FilterGroup>
      </S.FilterBarWrapper>
    </>
  );
}
