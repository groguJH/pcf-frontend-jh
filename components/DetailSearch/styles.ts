import styled from "styled-components";
import { Table } from "antd";

export const DetailSearchWrapper = styled.section`
  width: 100%;
  background: #ffffff;
  border-radius: 1.6rem;
  padding: 3.2rem;
  margin-top: 2rem;
  box-shadow: 0 0.4rem 2rem rgba(0, 0, 0, 0.05);
`;

export const SearchHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2.4rem;
`;

export const TitleGroup = styled.div`
  h2 {
    font-size: 2rem;
    font-weight: 700;
    color: #1d2129;
    margin-bottom: 0.8rem;
  }
  p {
    font-size: 1.4rem;
    color: #868e96;
  }
`;

export const ActionGroup = styled.div`
  display: flex;
  gap: 1.2rem;
`;

export const FilterBar = styled.div`
  background: #f8f9fa;
  padding: 1.6rem;
  border-radius: 0.8rem;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 3.2rem;
`;

export const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    background: #f8f9fa;
    font-size: 1.4rem;
    font-weight: 600;
    color: #495057;
    border-bottom: 1px solid #dee2e6;
  }

  .ant-table-tbody > tr > td {
    font-size: 1.4rem;
    color: #212529;
    padding: 1.6rem;
  }
`;

export const ScopeTag = styled.span<{ $type: string }>`
  padding: 0.4rem 1.2rem;
  border-radius: 2rem;
  font-size: 1.2rem;
  font-weight: 700;
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
