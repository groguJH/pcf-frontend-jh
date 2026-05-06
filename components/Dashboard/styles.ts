"use client";

import styled from "styled-components";
import {
  ChartPanel,
  CompactSurfaceSection,
  FieldGroup,
  FieldLabel as CommonFieldLabel,
  InlineGroup,
  PageMain,
  ResponsiveRow,
  SectionTitle,
} from "@/components/common/styles";

export const DashboardPageMain = styled(PageMain)`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  padding-top: 10vh;

  @media (max-width: 768px) {
    padding-top: 10vh;
  }
`;

export const FilterBarWrapper = styled(CompactSurfaceSection)`
  border-radius: 1.6rem;
  padding: 2rem;
  margin: 0;
`;

export const FilterGroup = styled(ResponsiveRow)`
  align-items: center;
`;

export const FilterWrapper = styled(FieldGroup)`
  padding: 0;
  align-items: center;
`;

export const FilterLabel = styled(CommonFieldLabel)``;

export const ToggleButtonGroup = styled(InlineGroup)`
  margin-right: 0;
`;

export const ChartContainer = styled(ChartPanel)`
  padding: 2rem;
`;

export const ChartTitle = styled(SectionTitle)``;
