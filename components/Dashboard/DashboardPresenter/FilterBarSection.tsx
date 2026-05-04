import React from "react";
import * as S from "@/components/Dashboard/styles";
import { Button, RangePicker } from "@/components/common/styles";
import dayjs from "dayjs";

export default function FilterBarSection() {
  const dateFormat = "YYYY-MM-DD";
  return (
    <>
      <S.FilterBarWrapper>
        <S.FilterGroup>
          <S.FilterWrapper>
            <S.FilterLabel>조회기간</S.FilterLabel>
            <RangePicker
              defaultValue={[
                dayjs("2025-01-01", dateFormat),
                dayjs("2025-12-31", dateFormat),
              ]}
            />
          </S.FilterWrapper>
          <S.ToggleButtonGroup>
            <Button>직접배출</Button>
            <Button>간접배출</Button>
            <Button>가치사슬</Button>
          </S.ToggleButtonGroup>
        </S.FilterGroup>
      </S.FilterBarWrapper>
    </>
  );
}
