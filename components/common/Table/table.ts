import styled from "styled-components";
import { Table as AntdTable } from "antd";
import type { TableProps } from "antd";

export type { TableProps };

export const Table = styled(AntdTable)<TableProps<object>>`
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
