import styled from "styled-components";
import {
  InlineGroup,
  SectionHeader,
  SurfaceSection,
  TitleGroup as CommonTitleGroup,
} from "@/components/common/styles";

export const DetailSearchWrapper = styled(SurfaceSection)`
  padding: 2rem;
  margin-top: 0;

  .ant-table {
    table-layout: fixed;
    width: 100%;
  }

  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td {
    text-align: left !important;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const SearchHeader = styled(SectionHeader)``;

export const TitleGroup = styled(CommonTitleGroup)``;

export const ActionGroup = styled(InlineGroup)`
  gap: 1.2rem;
`;

export const FilterBar = styled(InlineGroup)`
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  padding: 1.6rem;
  border-radius: 0.8rem;
  align-items: stretch;
  gap: 0.8rem;
  margin-bottom: 2rem;
`;

export const QueryRow = styled.div`
  display: grid;
  grid-template-columns: 8rem minmax(12rem, 1fr) 12rem minmax(16rem, 2fr) auto;
  align-items: center;
  gap: 0.8rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    align-items: stretch;
  }
`;

export const QueryPrefix = styled.div`
  min-width: 0;

  .ant-select {
    width: 100%;
  }
`;
