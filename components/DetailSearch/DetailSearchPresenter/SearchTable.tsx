"use client";

import React from "react";
import {
  Button,
  DataTable,
  Input,
  Select,
  Tag,
} from "@/components/common/styles";
import { ScopeTag } from "@/components/Carbon/ScopeTag";
import {
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import * as S from "../styles";
import type {
  ActivityFilterField,
  ActivityFilterLogic,
  ActivityFilterOperator,
  ActivityFilterRule,
  CarbonActivityPage,
} from "@/app/lib/carbon-api";

const { Option } = Select;

type SearchTableProps = {
  activities: CarbonActivityPage | null;
  loading?: boolean;
  rules: ActivityFilterRule[];
  onRulesChange: (rules: ActivityFilterRule[]) => void;
  onSearch: () => void;
  onPageChange: (page: number, pageSize: number) => void;
  onDownload: () => void;
  downloadLoading?: boolean;
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

type FilterFieldKind = "date" | "scope" | "text" | "number";

const fieldOptions: {
  kind: FilterFieldKind;
  label: string;
  value: ActivityFilterField;
}[] = [
  { label: "일자", value: "activityDate", kind: "date" },
  { label: "Scope", value: "scope", kind: "scope" },
  { label: "활동 유형", value: "activityType", kind: "text" },
  { label: "설명", value: "description", kind: "text" },
  { label: "사용량", value: "quantity", kind: "number" },
  { label: "적용 계수", value: "emissionFactor", kind: "number" },
  { label: "배출량", value: "emissionKgCo2e", kind: "number" },
];

const operatorOptionsByKind: Record<
  FilterFieldKind,
  { label: string; value: ActivityFilterOperator }[]
> = {
  date: [
    { label: "일치", value: "=" },
    { label: "불일치", value: "!=" },
    { label: "이후", value: ">=" },
    { label: "이전", value: "<=" },
  ],
  number: [
    { label: "일치", value: "=" },
    { label: "불일치", value: "!=" },
    { label: "이상", value: ">=" },
    { label: "이하", value: "<=" },
  ],
  scope: [
    { label: "일치", value: "=" },
    { label: "불일치", value: "!=" },
  ],
  text: [
    { label: "포함", value: "contains" },
    { label: "일치", value: "=" },
    { label: "불일치", value: "!=" },
  ],
};

const scopeValueOptions = [
  { label: "Scope 1", value: "scope1" },
  { label: "Scope 2", value: "scope2" },
  { label: "Scope 3", value: "scope3" },
];

const logicOptions: { label: string; value: ActivityFilterLogic }[] = [
  { label: "AND", value: "AND" },
  { label: "OR", value: "OR" },
];

function createRule(index: number): ActivityFilterRule {
  return {
    id: `rule-${Date.now()}-${index}`,
    logicOp: "AND",
    field: "description",
    operator: "contains",
    value: "",
  };
}

function getFieldOption(field: ActivityFilterField) {
  return (
    fieldOptions.find((option) => option.value === field) ?? fieldOptions[3]
  );
}

function getOperatorOptions(field: ActivityFilterField) {
  return operatorOptionsByKind[getFieldOption(field).kind];
}

function getDefaultOperator(field: ActivityFilterField) {
  return getOperatorOptions(field)[0].value;
}

function isOperatorAllowed(
  field: ActivityFilterField,
  operator: ActivityFilterOperator,
) {
  return getOperatorOptions(field).some((option) => option.value === operator);
}

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
  {
    title: "일자",
    dataIndex: "date",
    key: "date",
    width: "13%",
    align: "left" as const,
    ellipsis: true,
  },
  {
    title: "Scope",
    dataIndex: "scope",
    key: "scope",
    width: "13%",
    align: "left" as const,
    ellipsis: true,
    render: (text: string) => <ScopeTag $scope={text}>{text}</ScopeTag>,
  },
  {
    title: "활동 유형",
    dataIndex: "type",
    key: "type",
    width: "13%",
    align: "left" as const,
    ellipsis: true,
  },
  {
    title: "설명",
    dataIndex: "description",
    key: "description",
    width: "13%",
    align: "left" as const,
    ellipsis: true,
  },
  {
    title: "사용량",
    dataIndex: "usage",
    key: "usage",
    width: "13%",
    align: "left" as const,
    ellipsis: true,
  },
  {
    title: "적용 계수",
    dataIndex: "factor",
    key: "factor",
    width: "13%",
    align: "left" as const,
    ellipsis: true,
  },
  {
    title: "배출량 (kgCO₂e)",
    dataIndex: "emission",
    key: "emission",
    width: "16%",
    align: "left" as const,
    ellipsis: true,
    render: (text: string) => <strong>{text}</strong>,
  },
];

export default function SearchTable({
  activities,
  loading = false,
  rules,
  onRulesChange,
  onSearch,
  onPageChange,
  onDownload,
  downloadLoading = false,
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
  const displayRules = rules.length > 0 ? rules : [createRule(0)];

  const handleAddRule = () => {
    onRulesChange([...displayRules, createRule(displayRules.length)]);
  };

  const handleRuleChange = (
    id: string,
    nextRule: Partial<ActivityFilterRule>,
  ) => {
    onRulesChange(
      displayRules.map((rule) => {
        if (rule.id !== id) {
          return rule;
        }

        if (nextRule.field && nextRule.field !== rule.field) {
          return {
            ...rule,
            ...nextRule,
            operator: getDefaultOperator(nextRule.field),
            value: "",
          };
        }

        if (
          nextRule.operator &&
          !isOperatorAllowed(rule.field, nextRule.operator)
        ) {
          return rule;
        }

        return { ...rule, ...nextRule };
      }),
    );
  };

  const handleRemoveRule = (id: string) => {
    if (displayRules.length === 1) {
      onRulesChange([{ ...displayRules[0], value: "" }]);
      return;
    }

    onRulesChange(displayRules.filter((rule) => rule.id !== id));
  };

  const renderValueControl = (rule: ActivityFilterRule) => {
    const fieldKind = getFieldOption(rule.field).kind;

    if (fieldKind === "scope") {
      return (
        <Select
          value={rule.value || undefined}
          placeholder="Scope 선택"
          onChange={(value) =>
            handleRuleChange(rule.id, {
              value: String(value),
            })
          }
        >
          {scopeValueOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      );
    }

    return (
      <Input
        type={
          fieldKind === "date"
            ? "date"
            : fieldKind === "number"
              ? "number"
              : "text"
        }
        value={rule.value}
        placeholder={
          fieldKind === "number" ? "숫자를 입력하세요" : "값을 입력하세요"
        }
        onChange={(event) =>
          handleRuleChange(rule.id, {
            value: event.target.value,
          })
        }
        onPressEnter={onSearch}
      />
    );
  };

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
          <Button icon={<PlusOutlined />} onClick={handleAddRule}>
            조건 추가
          </Button>
          <Button
            variant="primary"
            icon={<SearchOutlined />}
            onClick={onSearch}
          >
            조회하기
          </Button>
          <Button
            icon={<DownloadOutlined />}
            customColor="danger-red"
            loading={downloadLoading}
            disabled={loading || downloadLoading}
            onClick={onDownload}
          >
            Excel 다운로드
          </Button>
        </S.ActionGroup>
      </S.SearchHeader>

      <S.FilterBar>
        {displayRules.map((rule, index) => (
          <S.QueryRow key={rule.id}>
            <S.QueryPrefix>
              {index === 0 ? (
                <Tag
                  color="blue"
                  style={{ fontSize: "1.05rem", padding: "0.3rem 0.7rem" }}
                >
                  WHERE
                </Tag>
              ) : (
                <Select
                  value={rule.logicOp}
                  onChange={(logicOp) =>
                    handleRuleChange(rule.id, {
                      logicOp: logicOp as ActivityFilterLogic,
                    })
                  }
                >
                  {logicOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              )}
            </S.QueryPrefix>
            <Select
              value={rule.field}
              onChange={(field) =>
                handleRuleChange(rule.id, {
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
              onChange={(operator) =>
                handleRuleChange(rule.id, {
                  operator: operator as ActivityFilterOperator,
                })
              }
            >
              {getOperatorOptions(rule.field).map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
            {renderValueControl(rule)}
            <Button
              aria-label="조건 삭제"
              icon={<DeleteOutlined />}
              customColor="danger-red"
              onClick={() => handleRemoveRule(rule.id)}
            />
          </S.QueryRow>
        ))}
      </S.FilterBar>

      <DataTable
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        tableLayout="fixed"
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
