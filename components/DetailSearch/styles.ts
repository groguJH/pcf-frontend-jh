import styled from "styled-components";
import {
  InlineGroup,
  SectionHeader,
  SurfaceSection,
  Table,
  TitleGroup as CommonTitleGroup,
} from "@/components/common/styles";

export const DetailSearchWrapper = styled(SurfaceSection)`
  padding: 2rem;
  margin-top: 0;
`;

export const SearchHeader = styled(SectionHeader)``;

export const TitleGroup = styled(CommonTitleGroup)``;

export const ActionGroup = styled(InlineGroup)`
  gap: 1.2rem;
`;

export const FilterBar = styled(InlineGroup)`
  background: #f8f9fa;
  padding: 1.6rem;
  border-radius: 0.8rem;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 3.2rem;
`;

export const StyledTable = Table;

export const ScopeTag = styled.span<{ $type: string }>`
  padding: 0.4rem 1.2rem;
  border-radius: 2rem;
  font-size: 1.05rem;
  font-weight: 600;
  text-transform: uppercase;

  ${({ $type }) => {
    switch ($type) {
      case "SCOPE 1":
        return `background: #fff4e6; color: #ff922b;`;
      case "SCOPE 2":
        return `background: #edf2ff; color: #4c6ef5;`;
      case "SCOPE 3":
        return `background: #f3f0ff; color: #7950f2;`;
      default:
        return `background: #f1f3f5; color: #868e96;`;
    }
  }}
`;
