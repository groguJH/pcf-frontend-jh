"use client";

import React from "react";
import { Button, DataTable, Input, Select, Tag } from "@/components/common/styles";
import {
  PlusOutlined,
  SearchOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import * as S from "../styles";
import type {
  ActivityFilterField,
  ActivityFilterOperator,
  ActivityFilterRule,
  CarbonActivityPage,
} from "@/app/lib/carbon-api";

const { Option } = Select;

type SearchTableProps = {
  activities: CarbonActivityPage | null;
  loading?: boolean;
  rule: ActivityFilterRule;
  onRuleChange: (rule: ActivityFilterRule) => void;
  onSearch: () => void;
  onPageChange: (page: number, pageSize: number) => void;
};

type TableRow = {
  key: string;
  date: string;
  scope: string;
  type: string;
  description: string;
  usage: string;
  factor: string;
  emission: string;
};

const fieldOptions: { label: string; value: ActivityFilterField }[] = [
  { label: "설명", value: "description" },
  { label: "활동 유형", value: "activityType" },
  { label: "Scope", value: "scope" },
  { label: "제품명", value: "productName" },
  { label: "배출량", value: "emissionKgCo2e" },
];

const operatorOptions: { label: string; value: ActivityFilterOperator }[] = [
  { label: "포함", value: "contains" },
  { label: "일치", value: "=" },
  { label: "불일치", value: "!=" },
  { label: "이상", value: ">=" },
  { label: "이하", value: "<=" },
];

function formatNumber(value: number, fractionDigits = 3) {
  return value.toLocaleString("ko-KR", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  });
}

function formatScope(scope: string) {
  return scope.replace("scope", "SCOPE ");
}

const columns = [
  { title: "일자", dataIndex: "date", key: "date" },
  {
    title: "Scope",
    dataIndex: "scope",
    key: "scope",
    render: (text: string) => <S.ScopeTag $type={text}>{text}</S.ScopeTag>,
  },
  { title: "활동 유형", dataIndex: "type", key: "type" },
  { title: "설명", dataIndex: "description", key: "description" },
  {
    title: "사용량",
    dataIndex: "usage",
    key: "usage",
    align: "right" as const,
  },
  {
    title: "적용 계수",
    dataIndex: "factor",
    key: "factor",
    align: "right" as const,
  },
  {
    title: "배출량 (kgCO₂e)",
    dataIndex: "emission",
    key: "emission",
    align: "right" as const,
    render: (text: string) => <strong>{text}</strong>,
  },
];

export default function SearchTable({
  activities,
  loading = false,
  rule,
  onRuleChange,
  onSearch,
  onPageChange,
}: SearchTableProps) {
  const currentPage = activities?.page ?? 1;
  const pageSize = activities?.pageSize ?? 10;
  const totalRows = activities?.totalRows ?? 0;
  const dataSource: TableRow[] =
    activities?.rows.map((row) => ({
      key: String(row.id),
      date: row.activityDate,
      scope: formatScope(row.scope),
      type: row.activityType,
      description: row.description,
      usage: row.amountLabel,
      factor: formatNumber(row.emissionFactor),
      emission: formatNumber(row.emissionKgCo2e),
    })) ?? [];

  return (
    <S.DetailSearchWrapper>
      <S.SearchHeader>
        <S.TitleGroup>
          <h2>상세 조건 내역</h2>
          <p>
            원하는 컬럼을 조합하여 조건을 추가한 뒤, 조회하기 버튼을 눌러주세요.
          </p>
        </S.TitleGroup>
        <S.ActionGroup>
          <Button icon={<PlusOutlined />}>조건 추가</Button>
          <Button variant="primary" icon={<SearchOutlined />} onClick={onSearch}>
            조회하기
          </Button>
          <Button icon={<DownloadOutlined />} customColor="danger-red">
            Excel 다운로드
          </Button>
        </S.ActionGroup>
      </S.SearchHeader>

      <S.FilterBar>
        <Tag
          color="blue"
          style={{ fontSize: "1.2rem", padding: "0.4rem 0.8rem" }}
        >
          WHERE
        </Tag>
        <Select
          value={rule.field}
          style={{ width: "15rem" }}
          onChange={(field) =>
            onRuleChange({
              ...rule,
              field: field as ActivityFilterField,
            })
          }
        >
          {fieldOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
        <Select
          value={rule.operator}
          style={{ width: "12rem" }}
          onChange={(operator) =>
            onRuleChange({
              ...rule,
              operator: operator as ActivityFilterOperator,
            })
          }
        >
          {operatorOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
        <Input
          value={rule.value}
          placeholder="값을 입력하세요"
          style={{ flex: 1, height: "3.2rem" }}
          onChange={(event) =>
            onRuleChange({
              ...rule,
              value: event.target.value,
            })
          }
        />
      </S.FilterBar>

      <DataTable
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize,
          total: totalRows,
          mode: "server",
          onChange: onPageChange,
        }}
      />
    </S.DetailSearchWrapper>
  );
}
