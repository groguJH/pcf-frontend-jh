"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  CheckCircleOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  FileExcelOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Popconfirm } from "antd";
import * as XLSX from "xlsx";
import styled from "styled-components";
import { ScopeTag } from "@/components/Carbon/ScopeTag";
import {
  Button,
  DataTable,
  FieldLabel,
  PageMain,
  SectionHeader,
  SurfaceSection,
  TitleGroup,
  Upload,
  type UploadProps,
} from "@/components/common/styles";
import ManualActivityRowModal, {
  type ManualActivityForm,
  emptyManualActivityForm,
} from "./ManualActivityRowModal";

type CarbonScope = "scope1" | "scope2" | "scope3";

type ParsedActivityRow = {
  id: string;
  sheetName: string;
  rowNumber: number;
  source: "excel" | "manual";
  activityDate: string;
  type: string;
  description: string;
  amount: number;
  unit: string;
};

type PreviewActivityRow = ParsedActivityRow & {
  scope: CarbonScope;
  appliedFactor: number;
  emissionFactorId: number;
};

type PreviewResult = {
  sheetName: string;
  headerRowNumber: number;
  rows: PreviewActivityRow[];
};

type ParsedPreviewResult = {
  sheetName: string;
  headerRowNumber: number;
  rows: ParsedActivityRow[];
};

type EmissionCategory = {
  type: string;
  scope: CarbonScope;
};

type EmissionFactor = {
  id: number;
  type: string;
  description: string;
  unit: string;
  factorValue: number;
  validFrom: string;
  validTo: string | null;
};

type ValidationMasters = {
  categories: EmissionCategory[];
  factors: EmissionFactor[];
};

type RequiredField =
  | "activityDate"
  | "type"
  | "description"
  | "amount"
  | "unit";

const requiredFields: RequiredField[] = [
  "activityDate",
  "type",
  "description",
  "amount",
  "unit",
];

const headerAliases: Record<RequiredField, string[]> = {
  activityDate: ["일자(원본)", "일자", "날짜"],
  type: ["활동 유형", "활동유형", "유형"],
  description: ["설명", "상세 내역", "상세내역"],
  amount: ["량", "수량", "사용량", "활동량"],
  unit: ["단위"],
};

const fieldLabels: Record<RequiredField, string> = {
  activityDate: "일자(원본)",
  type: "활동 유형",
  description: "설명",
  amount: "량",
  unit: "단위",
};

const AdminPageMain = styled(PageMain)``;

const UploadPanel = styled.div`
  display: grid;
  grid-template-columns: minmax(22rem, 0.7fr) minmax(28rem, 1fr);
  gap: 2rem;
  align-items: stretch;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const UploadBox = styled.div<{ $active?: boolean }>`
  display: flex;
  height: 100%;
  min-height: 18rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  border: 1px dashed ${({ $active }) => ($active ? "#1890ff" : "#cfd7e2")};
  border-radius: 0.8rem;
  background: ${({ $active }) => ($active ? "#f0f7ff" : "#f8fafc")};
  padding: 2.4rem;
  color: #1d2129;
  text-align: center;
  transition:
    border-color 0.2s ease,
    background 0.2s ease;

  .anticon {
    color: #1890ff;
    font-size: 3.2rem;
  }

  strong {
    font-size: 1.7rem;
    font-weight: 700;
  }

  span {
    font-size: 1.3rem;
    color: #6c757d;
  }
`;

const FullWidthUpload = styled(Upload)`
  display: block;
  height: 100%;
  width: 100%;

  .ant-upload {
    display: block;
    height: 100%;
    width: 100%;
  }

  .ant-upload-select {
    height: 100%;
  }
`;

const FileMeta = styled.div`
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 18rem;
  gap: 1.2rem;
  border: 1px solid #e9ecef;
  border-radius: 0.8rem;
  background: #ffffff;
  padding: 2rem;
  font-size: 1.4rem;
  color: #495057;
`;

const MetaList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.2rem;
  border-bottom: 1px solid #f1f3f5;
  padding-bottom: 1rem;

  &:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }

  span:first-child {
    flex: 0 0 5.6rem;
    color: #868e96;
  }

  span:last-child {
    flex: 1 1 auto;
    min-width: 0;
    color: #212529;
    font-weight: 600;
    overflow-wrap: anywhere;
    text-align: left;
  }
`;

const MessageText = styled.p<{ $type?: "error" | "success" }>`
  display: flex;
  min-height: 2.2rem;
  align-items: center;
  gap: 0.8rem;
  margin-top: 1.6rem;
  font-size: 1.4rem;
  color: ${({ $type }) => ($type === "error" ? "#ff4d4f" : "#52c41a")};
`;

const PreviewHeader = styled(SectionHeader)`
  gap: 1.6rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const PreviewSection = styled(SurfaceSection)`
  margin-top: 1.6rem;

  .ant-table {
    table-layout: fixed;
    width: 100%;
  }

  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ant-table-tbody > tr {
    cursor: pointer;
  }
`;

const CountBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  border-radius: 99rem;
  background: #edf7ed;
  padding: 0.8rem 1.2rem;
  color: #2b8a3e;
  font-size: 1.4rem;
  font-weight: 700;
  white-space: nowrap;
`;

function normalizeHeader(value: unknown) {
  return String(value ?? "")
    .replace(/\s+/g, "")
    .trim();
}

function getCellText(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value ?? "").trim();
}

function parseAmount(value: unknown) {
  const parsed = Number(getCellText(value).replaceAll(",", ""));

  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeTextKey(value: string) {
  return value.trim();
}

function normalizeDateText(value: string) {
  const normalized = value.trim().replaceAll(".", "-").replaceAll("/", "-");
  const compactDateMatch = normalized.match(/^(\d{4})(\d{2})(\d{2})$/);
  const dashedDateText = compactDateMatch
    ? `${compactDateMatch[1]}-${compactDateMatch[2]}-${compactDateMatch[3]}`
    : normalized;
  const dateMatch = dashedDateText.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

  if (!dateMatch) {
    return null;
  }

  const [, year, month, day] = dateMatch;
  const date = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day)),
  );

  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    return null;
  }

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function isFactorValidForDate(factor: EmissionFactor, activityDate: string) {
  return (
    factor.validFrom <= activityDate &&
    (factor.validTo === null || factor.validTo >= activityDate)
  );
}

function findHeaderIndexes(row: unknown[]) {
  const indexes: Partial<Record<RequiredField, number>> = {};

  row.forEach((cell, index) => {
    const normalizedCell = normalizeHeader(cell);

    if (!normalizedCell) {
      return;
    }

    requiredFields.forEach((field) => {
      const hasMatched = headerAliases[field].some(
        (header) => normalizeHeader(header) === normalizedCell,
      );

      if (indexes[field] === undefined && hasMatched) {
        indexes[field] = index;
      }
    });
  });

  const hasAllHeaders = requiredFields.every(
    (field) => indexes[field] !== undefined,
  );

  return hasAllHeaders
    ? (indexes as Record<RequiredField, number>)
    : null;
}

function getRequiredCell(
  row: unknown[],
  indexes: Record<RequiredField, number>,
  field: RequiredField,
) {
  return row[indexes[field]];
}

function isBlankDataRow(
  row: unknown[],
  indexes: Record<RequiredField, number>,
) {
  return requiredFields.every(
    (field) => getCellText(getRequiredCell(row, indexes, field)) === "",
  );
}

function parseWorksheet(
  worksheet: XLSX.WorkSheet,
  sheetName: string,
): ParsedPreviewResult | null {
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    raw: false,
    defval: "",
  });

  for (const [rowIndex, row] of matrix.entries()) {
    if (!Array.isArray(row)) {
      continue;
    }

    const indexes = findHeaderIndexes(row);

    if (!indexes) {
      continue;
    }

    const rows: ParsedActivityRow[] = [];

    for (
      let dataRowIndex = rowIndex + 1;
      dataRowIndex < matrix.length;
      dataRowIndex += 1
    ) {
      const dataRow = matrix[dataRowIndex];

      if (!Array.isArray(dataRow)) {
        break;
      }

      if (isBlankDataRow(dataRow, indexes)) {
        break;
      }

      const absoluteRowNumber = dataRowIndex + 1;
      const activityDate = getCellText(
        getRequiredCell(dataRow, indexes, "activityDate"),
      );
      const type = getCellText(getRequiredCell(dataRow, indexes, "type"));
      const description = getCellText(
        getRequiredCell(dataRow, indexes, "description"),
      );
      const amount = parseAmount(getRequiredCell(dataRow, indexes, "amount"));
      const unit = getCellText(getRequiredCell(dataRow, indexes, "unit"));

      if (!activityDate || !type || !description || amount === null || !unit) {
        throw new Error(
          `${sheetName} 시트 ${absoluteRowNumber}행의 필수값을 확인해주세요.`,
        );
      }

      rows.push({
        id: `${sheetName}-${absoluteRowNumber}`,
        sheetName,
        rowNumber: absoluteRowNumber,
        source: "excel",
        activityDate,
        type,
        description,
        amount,
        unit,
      });
    }

    if (rows.length === 0) {
      throw new Error(`${sheetName} 시트에서 업로드할 데이터 행이 없습니다.`);
    }

    return {
      sheetName,
      headerRowNumber: rowIndex + 1,
      rows,
    };
  }

  return null;
}

function parseWorkbook(workbook: XLSX.WorkBook) {
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      continue;
    }

    const result = parseWorksheet(worksheet, sheetName);

    if (result) {
      return result;
    }
  }

  const requiredHeaderText = requiredFields
    .map((field) => fieldLabels[field])
    .join(", ");

  throw new Error(`엑셀 파일에서 필수 컬럼을 찾을 수 없습니다: ${requiredHeaderText}`);
}

async function fetchJson<T>(url: string, fallbackErrorMessage: string) {
  const response = await fetch(url);
  const body = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(body.error ?? fallbackErrorMessage);
  }

  return body;
}

async function loadValidationMasters(): Promise<ValidationMasters> {
  const [categoryBody, factorBody] = await Promise.all([
    fetchJson<{ categories?: EmissionCategory[] }>(
      "/api/emission-categories",
      "배출원 카테고리 목록을 불러올 수 없습니다.",
    ),
    fetchJson<{ factors?: EmissionFactor[] }>(
      "/api/emission-factors",
      "배출계수 목록을 불러올 수 없습니다.",
    ),
  ]);

  return {
    categories: categoryBody.categories ?? [],
    factors: factorBody.factors ?? [],
  };
}

function findMatchingFactor(
  row: ParsedActivityRow,
  activityDate: string,
  factors: EmissionFactor[],
) {
  return factors
    .filter(
      (factor) =>
        normalizeTextKey(factor.type) === normalizeTextKey(row.type) &&
        normalizeTextKey(factor.description) ===
          normalizeTextKey(row.description) &&
        normalizeTextKey(factor.unit) === normalizeTextKey(row.unit) &&
        isFactorValidForDate(factor, activityDate),
    )
    .sort((a, b) => b.validFrom.localeCompare(a.validFrom))[0];
}

function findBindableScope(row: ParsedActivityRow, categories: EmissionCategory[]) {
  const matchedCategories = categories.filter(
    (category) =>
      normalizeTextKey(category.type) === normalizeTextKey(row.type),
  );

  if (matchedCategories.length === 0) {
    throw new Error(
      `${row.sheetName} 시트 ${row.rowNumber}행의 활동 유형 "${row.type}"에 바인딩할 Scope 카테고리가 없습니다.`,
    );
  }

  if (matchedCategories.length > 1) {
    throw new Error(
      `${row.sheetName} 시트 ${row.rowNumber}행의 활동 유형 "${row.type}"에 Scope 카테고리가 여러 개라 자동 바인딩할 수 없습니다.`,
    );
  }

  return matchedCategories[0].scope;
}

function validatePreview(
  result: ParsedPreviewResult,
  masters: ValidationMasters,
): PreviewResult {
  return {
    ...result,
    rows: result.rows.map((row) => {
      const activityDate = normalizeDateText(row.activityDate);

      if (!activityDate) {
        throw new Error(
          `${row.sheetName} 시트 ${row.rowNumber}행의 일자 형식을 확인해주세요.`,
        );
      }

      const factor = findMatchingFactor(row, activityDate, masters.factors);

      if (!factor) {
        throw new Error(
          `${row.sheetName} 시트 ${row.rowNumber}행에 대응되는 배출계수를 찾을 수 없습니다. 활동 유형, 설명(상세 내역), 단위, 일자를 확인해주세요.`,
        );
      }

      const scope = findBindableScope(row, masters.categories);

      return {
        ...row,
        scope,
        appliedFactor: factor.factorValue,
        emissionFactorId: factor.id,
      };
    }),
  };
}

function validateParsedRow(
  row: ParsedActivityRow,
  masters: ValidationMasters,
): PreviewActivityRow {
  return validatePreview(
    {
      sheetName: row.sheetName,
      headerRowNumber: 0,
      rows: [row],
    },
    masters,
  ).rows[0];
}

function formatNumber(value: number) {
  return value.toLocaleString("ko-KR", {
    maximumFractionDigits: 6,
  });
}

function getScopeLabel(scope: CarbonScope) {
  return scope.replace("scope", "Scope ");
}

function getNextPreviewRowNumber(preview: PreviewResult | null) {
  return Math.max(0, ...(preview?.rows.map((row) => row.rowNumber) ?? [])) + 1;
}

function toManualActivityForm(row: PreviewActivityRow): ManualActivityForm {
  return {
    activityDate: row.activityDate,
    type: row.type,
    description: row.description,
    amount: String(row.amount),
    unit: row.unit,
  };
}

export default function CarbonActivitiesImportPage() {
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [manualForm, setManualForm] = useState<ManualActivityForm>(
    emptyManualActivityForm,
  );
  const [editingRow, setEditingRow] = useState<PreviewActivityRow | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isManualSaving, setIsManualSaving] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const handleFile = async (file: File) => {
    setIsParsing(true);
    setPreview(null);
    setSelectedFileName("");
    setStatusMessage(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
      const parsedResult = parseWorkbook(workbook);
      const masters = await loadValidationMasters();
      const result = validatePreview(parsedResult, masters);

      setPreview(result);
      setSelectedFileName(file.name);
      setStatusMessage({
        type: "success",
        text: `${result.rows.length.toLocaleString("ko-KR")}건의 데이터 배출계수와 Scope 매핑을 검증했습니다.`,
      });
    } catch (error) {
      setSelectedFileName("");
      setStatusMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "엑셀 파일 또는 마스터 데이터 검증 중 오류가 발생했습니다.",
      });
    } finally {
      setIsParsing(false);
    }
  };

  const uploadProps: UploadProps = {
    accept: ".xlsx,.xls,.csv",
    disabled: isParsing || isUploading,
    maxCount: 1,
    showUploadList: false,
    beforeUpload: (file) => {
      void handleFile(file);
      return false;
    },
  };

  const openCreateRowModal = () => {
    setEditingRow(null);
    setManualForm(emptyManualActivityForm);
    setManualError(null);
    setIsManualModalOpen(true);
  };

  const openEditRowModal = (row: PreviewActivityRow) => {
    setEditingRow(row);
    setManualForm(toManualActivityForm(row));
    setManualError(null);
    setIsManualModalOpen(true);
  };

  const closeManualModal = () => {
    if (isManualSaving) {
      return;
    }

    setIsManualModalOpen(false);
    setEditingRow(null);
    setManualError(null);
  };

  const handleManualSubmit = async (form: ManualActivityForm) => {
    const activityDate = form.activityDate.trim();
    const type = form.type.trim();
    const description = form.description.trim();
    const amount = parseAmount(form.amount);
    const unit = form.unit.trim();

    if (!activityDate || !type || !description || amount === null || !unit) {
      setManualError("일자, 활동 유형, 설명(상세 내역), 량, 단위를 확인해주세요.");
      return;
    }

    setIsManualSaving(true);
    setManualError(null);
    setStatusMessage(null);

    try {
      const masters = await loadValidationMasters();
      const baseRow: ParsedActivityRow = {
        id: editingRow?.id ?? `manual-${Date.now()}`,
        sheetName: editingRow?.sheetName ?? "직접 입력",
        rowNumber: editingRow?.rowNumber ?? getNextPreviewRowNumber(preview),
        source: editingRow?.source ?? "manual",
        activityDate,
        type,
        description,
        amount,
        unit,
      };
      const validatedRow = validateParsedRow(baseRow, masters);

      setPreview((currentPreview) => {
        const nextPreview = currentPreview ?? {
          sheetName: "직접 입력",
          headerRowNumber: 0,
          rows: [],
        };
        const rows = editingRow
          ? nextPreview.rows.map((row) =>
              row.id === editingRow.id ? validatedRow : row,
            )
          : [...nextPreview.rows, validatedRow];

        return {
          ...nextPreview,
          rows,
        };
      });
      setIsManualModalOpen(false);
      setEditingRow(null);
      setStatusMessage({
        type: "success",
        text: editingRow
          ? "미리보기 행을 수정했습니다."
          : "미리보기 행을 추가했습니다.",
      });
    } catch (error) {
      setManualError(
        error instanceof Error
          ? error.message
          : "입력한 행의 유효성을 확인할 수 없습니다.",
      );
    } finally {
      setIsManualSaving(false);
    }
  };

  const handleDeleteRow = useCallback((row: PreviewActivityRow) => {
    setPreview((currentPreview) => {
      if (!currentPreview) {
        return currentPreview;
      }

      return {
        ...currentPreview,
        rows: currentPreview.rows.filter(
          (previewRow) => previewRow.id !== row.id,
        ),
      };
    });
    setStatusMessage({
      type: "success",
      text: "미리보기 행을 삭제했습니다.",
    });
  }, []);

  const handleUpload = async () => {
    if (!preview || preview.rows.length === 0) {
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/carbon-activities/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rows: preview.rows.map((row) => ({
            activityDate: row.activityDate,
            scope: row.scope,
            type: row.type,
            description: row.description,
            amount: row.amount,
            unit: row.unit,
            appliedFactor: row.appliedFactor,
            sourceSheet: row.sheetName,
            sourceRowNumber: row.rowNumber,
            productName: "업로드 데이터",
          })),
        }),
      });
      const body = (await response.json()) as {
        count?: number;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(body.error ?? "활동 데이터를 업로드할 수 없습니다.");
      }

      setStatusMessage({
        type: "success",
        text: `${(body.count ?? preview.rows.length).toLocaleString("ko-KR")}건을 DB에 업로드했습니다.`,
      });
    } catch (error) {
      setStatusMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "활동 데이터를 업로드할 수 없습니다.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "행",
        dataIndex: "rowNumber",
        key: "rowNumber",
        width: "7%",
        align: "left" as const,
        ellipsis: true,
      },
      {
        title: "일자(원본)",
        dataIndex: "activityDate",
        key: "activityDate",
        width: "12%",
        align: "left" as const,
        ellipsis: true,
      },
      {
        title: "활동 유형",
        dataIndex: "type",
        key: "type",
        width: "12%",
        align: "left" as const,
        ellipsis: true,
      },
      {
        title: "설명(상세 내역)",
        dataIndex: "description",
        key: "description",
        width: "22%",
        align: "left" as const,
        ellipsis: true,
      },
      {
        title: "량",
        dataIndex: "amount",
        key: "amount",
        width: "8%",
        align: "left" as const,
        ellipsis: true,
        render: (value: number) => formatNumber(value),
      },
      {
        title: "단위",
        dataIndex: "unit",
        key: "unit",
        width: "7%",
        align: "left" as const,
        ellipsis: true,
      },
      {
        title: "Scope",
        dataIndex: "scope",
        key: "scope",
        width: "10%",
        align: "left" as const,
        ellipsis: true,
        render: (scope: CarbonScope) => (
          <ScopeTag $scope={scope}>{getScopeLabel(scope)}</ScopeTag>
        ),
      },
      {
        title: "적용 계수",
        dataIndex: "appliedFactor",
        key: "appliedFactor",
        width: "12%",
        align: "left" as const,
        ellipsis: true,
        render: (value: number) => formatNumber(value),
      },
      {
        title: "삭제",
        key: "actions",
        width: "10%",
        align: "left" as const,
        render: (_: unknown, row: object) => {
          const previewRow = row as PreviewActivityRow;

          return (
            <span onClick={(event) => event.stopPropagation()}>
              <Popconfirm
                title="미리보기 행 삭제"
                description="선택한 행을 삭제할까요?"
                okText="삭제"
                cancelText="취소"
                onConfirm={() => handleDeleteRow(previewRow)}
              >
                <Button icon={<DeleteOutlined />} customColor="danger-red">
                  삭제
                </Button>
              </Popconfirm>
            </span>
          );
        },
      },
    ],
    [handleDeleteRow],
  );

  return (
    <AdminPageMain>
      <SurfaceSection>
        <SectionHeader>
          <TitleGroup>
            <h2>활동 데이터 업로드</h2>
            <p>엑셀 데이터를 검토한 뒤 활동 내역으로 저장합니다.</p>
          </TitleGroup>
        </SectionHeader>

        <UploadPanel>
          <FileMeta>
            <FieldLabel>필수 컬럼</FieldLabel>
            <MetaList>
              <MetaItem>
                <span>컬럼</span>
                <span>일자(원본), 활동 유형, 설명(상세 내역), 량, 단위</span>
              </MetaItem>
              <MetaItem>
                <span>파일</span>
                <span>{selectedFileName || "-"}</span>
              </MetaItem>
              <MetaItem>
                <span>시트</span>
                <span>{preview?.sheetName ?? "-"}</span>
              </MetaItem>
              <MetaItem>
                <span>데이터</span>
                <span>
                  {preview
                    ? `${preview.rows.length.toLocaleString("ko-KR")}건`
                    : "-"}
                </span>
              </MetaItem>
            </MetaList>
          </FileMeta>

          <FullWidthUpload {...uploadProps}>
            <UploadBox $active={Boolean(preview)}>
              <CloudUploadOutlined />
              <strong>엑셀 파일 선택</strong>
              <span>.xlsx, .xls, .csv</span>
            </UploadBox>
          </FullWidthUpload>
        </UploadPanel>

        <MessageText $type={statusMessage?.type}>
          {statusMessage?.type === "success" ? <CheckCircleOutlined /> : null}
          {statusMessage?.text ?? ""}
        </MessageText>
      </SurfaceSection>

      <PreviewSection>
        <PreviewHeader>
          <TitleGroup>
            <h2>업로드 미리보기</h2>
            <p>
              {preview
                ? `${preview.sheetName} 시트 ${preview.headerRowNumber}행의 헤더를 기준으로 표시합니다.`
                : "엑셀 파일을 선택하면 업로드 대상 데이터가 표시됩니다."}
            </p>
          </TitleGroup>

        </PreviewHeader>

        <DataTable
          rowKey={(row) => String((row as PreviewActivityRow).id)}
          dataSource={preview?.rows ?? []}
          columns={columns}
          tableLayout="fixed"
          topActions={
            <>
              {preview ? (
                <CountBadge>
                  <FileExcelOutlined />
                  {preview.rows.length.toLocaleString("ko-KR")}건
                </CountBadge>
              ) : null}
              <Button
                icon={<PlusOutlined />}
                onClick={openCreateRowModal}
                disabled={isParsing || isUploading}
              >
                행 추가
              </Button>
              <Button
                icon={<UploadOutlined />}
                onClick={handleUpload}
                disabled={!preview || preview.rows.length === 0 || isUploading}
                loading={isUploading}
              >
                DB 업로드
              </Button>
            </>
          }
          onRow={(row) => ({
            onClick: () => openEditRowModal(row as PreviewActivityRow),
          })}
          locale={{ emptyText: "미리보기 데이터가 없습니다." }}
        />

        <ManualActivityRowModal
          open={isManualModalOpen}
          mode={editingRow ? "edit" : "create"}
          form={manualForm}
          confirmLoading={isManualSaving}
          errorMessage={manualError}
          onChange={setManualForm}
          onCancel={closeManualModal}
          onSubmit={handleManualSubmit}
        />
      </PreviewSection>
    </AdminPageMain>
  );
}
