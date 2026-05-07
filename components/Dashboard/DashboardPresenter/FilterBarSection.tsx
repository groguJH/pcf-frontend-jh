import React from "react";
import * as S from "@/components/Dashboard/styles";
import { Button, RangePicker } from "@/components/common/styles";
import { Tooltip } from "antd";
import dayjs from "dayjs";
import type { CarbonBaseFilters } from "@/app/lib/carbon-api";
import type { CarbonScope } from "@/app/lib/carbon-data";
import {
  getScopeTooltipTitle,
  scopeMetaList,
} from "@/components/Carbon/scopeMeta";

type FilterBarSectionProps = {
  filters: CarbonBaseFilters;
  onChange: (filters: CarbonBaseFilters) => void;
};

const dateFormat = "YYYY-MM-DD";

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
            {scopeMetaList.map((scope) => (
              <Tooltip
                key={scope.key}
                title={getScopeTooltipTitle(scope.key)}
                trigger={["hover", "click"]}
              >
                <Button
                  customColor={
                    filters.scopes[scope.key] ? scope.colorKey : "subGray"
                  }
                  onClick={() => handleScopeToggle(scope.key)}
                >
                  {scope.businessLabel}
                </Button>
              </Tooltip>
            ))}
          </S.ToggleButtonGroup>
        </S.FilterGroup>
      </S.FilterBarWrapper>
    </>
  );
}
