"use client";

import styled from "styled-components";
import {
  ActionBar,
  CardGrid,
  CardTitle as CommonCardTitle,
  ChartPanel,
  ChartSectionLayout,
  CompactSurfaceSection,
  FieldGroup,
  FieldLabel as CommonFieldLabel,
  InlineGroup,
  MetricCard,
  MetricUnit,
  MetricValue,
  MetricValueWrapper,
  PageHeader,
  PageMain,
  ResponsiveRow,
  SectionTitle,
} from "@/components/common/styles";

export const DashboardPageMain = styled(PageMain)``;

export const DashboardHeader = styled(PageHeader)``;

export const ButtonSection = styled(ActionBar)``;

export const FilterBarWrapper = styled(CompactSurfaceSection)``;

export const FilterGroup = styled(ResponsiveRow)``;

export const FilterWrapper = styled(FieldGroup)``;

export const FilterLabel = styled(CommonFieldLabel)``;

export const ToggleButtonGroup = styled(InlineGroup)`
  margin-right: 1rem;
`;

export const ChartCardWrapper = styled(CardGrid)``;

export const ChartCard = styled(MetricCard)``;

export const CardTitle = styled(CommonCardTitle)``;

export const CardValueWrapper = styled(MetricValueWrapper)``;

export const CardValue = styled(MetricValue)``;

export const CardUnit = styled(MetricUnit)``;

export const ChartSection = styled(ChartSectionLayout)``;

export const ChartContainer = styled(ChartPanel)``;

export const ChartTitle = styled(SectionTitle)``;
