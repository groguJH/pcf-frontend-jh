"use client";

import React, { useMemo, useState } from "react";
import { Pagination } from "antd";
import styled from "styled-components";
import { Select } from "../SelectBox/selectBox";
import { Table } from "../Table/table";
import type { TableProps } from "../Table/table";

const { Option } = Select;

type DataTablePagination =
  | false
  | {
      current?: number;
      pageSize?: number;
      pageSizeOptions?: number[];
      showPageSizeSelector?: boolean;
      total?: number;
      mode?: "client" | "server";
      onChange?: (page: number, pageSize: number) => void;
    };

export type DataTableProps = Omit<TableProps<object>, "pagination"> & {
  pagination?: DataTablePagination;
};

const defaultPageSizeOptions = [10, 20, 50, 100];

const TableTopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 1.2rem;
`;

const PageSizeControl = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  color: #495057;
  font-size: 1.15rem;
  font-weight: 500;
  white-space: nowrap;
`;

const TableFooter = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1.2rem;
  margin-top: 1.6rem;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    justify-items: center;
  }
`;

const TotalCount = styled.span`
  justify-self: start;
  color: #495057;
  font-size: 1.15rem;
  font-weight: 500;

  @media (max-width: 720px) {
    justify-self: center;
  }
`;

const PaginationSlot = styled.div`
  justify-self: center;
`;

function getPageRows(
  rows: readonly object[],
  page: number,
  pageSize: number,
) {
  const startIndex = (page - 1) * pageSize;

  return rows.slice(startIndex, startIndex + pageSize);
}

export function DataTable({
  dataSource = [],
  pagination = {},
  ...tableProps
}: DataTableProps) {
  const [localPage, setLocalPage] = useState(1);
  const [localPageSize, setLocalPageSize] = useState(10);
  const paginationOptions = pagination === false ? null : pagination;
  const pageSizeOptions =
    paginationOptions?.pageSizeOptions ?? defaultPageSizeOptions;
  const pageSize = paginationOptions?.pageSize ?? localPageSize;
  const isServerPagination = paginationOptions?.mode === "server";
  const total = paginationOptions?.total ?? dataSource.length;
  const showPageSizeSelector =
    paginationOptions?.showPageSizeSelector ?? pagination !== false;
  const isCurrentControlled = paginationOptions?.current !== undefined;
  const rawCurrent = paginationOptions?.current ?? localPage;
  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  const current =
    pagination !== false && !isServerPagination && !isCurrentControlled
      ? Math.min(rawCurrent, maxPage)
      : rawCurrent;

  const tableRows = useMemo(() => {
    if (pagination === false || isServerPagination) {
      return dataSource;
    }

    return getPageRows(dataSource, current, pageSize);
  }, [current, dataSource, isServerPagination, pageSize, pagination]);

  const handlePageChange = (nextPage: number, nextPageSize = pageSize) => {
    if (paginationOptions?.onChange) {
      paginationOptions.onChange(nextPage, nextPageSize);
      return;
    }

    setLocalPage(nextPage);
    setLocalPageSize(nextPageSize);
  };

  const handlePageSizeChange = (nextPageSize: unknown) => {
    handlePageChange(1, Number(nextPageSize));
  };

  return (
    <>
      {pagination !== false && showPageSizeSelector ? (
        <TableTopBar>
          <PageSizeControl>
            <span>페이지 크기</span>
            <Select
              value={pageSize}
              style={{ width: "9rem" }}
              onChange={handlePageSizeChange}
            >
              {pageSizeOptions.map((option) => (
                <Option key={option} value={option}>
                  {option}개
                </Option>
              ))}
            </Select>
          </PageSizeControl>
        </TableTopBar>
      ) : null}

      <Table {...tableProps} dataSource={tableRows} pagination={false} />

      {pagination !== false ? (
        <TableFooter>
          <TotalCount>총 {total.toLocaleString("ko-KR")}행</TotalCount>
          <PaginationSlot>
            <Pagination
              current={current}
              pageSize={pageSize}
              total={total}
              showSizeChanger={false}
              onChange={handlePageChange}
              itemRender={(page, type, originalElement) => {
                if (type === "prev") return <a>이전</a>;
                if (type === "next") return <a>다음</a>;
                return originalElement;
              }}
            />
          </PaginationSlot>
        </TableFooter>
      ) : null}
    </>
  );
}
