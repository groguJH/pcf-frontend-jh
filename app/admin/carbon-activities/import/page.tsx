"use client";

import React, { useMemo, useState } from "react";
import {
  CheckCircleOutlined,
  CloudUploadOutlined,
  FileExcelOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import styled from "styled-components";
import {
  Button,
  DataTable,
  FieldLabel,
  InlineGroup,
  PageMain,
  SectionHeader,
  SurfaceSection,
  TitleGroup,
  Upload,
  type UploadProps,
} from "@/components/common/styles";

type PreviewActivityRow = {
  id: string;
  sheetName: string;
  rowNumber: number;
  activityDate: string;
  type: string;
  description: string;
  amount: number;
  unit: string;
};

type PreviewResult = {
  sheetName: string;
  headerRowNumber: number;
  rows: PreviewActivityRow[];
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
  grid-template-columns: minmax(28rem, 1fr) minmax(22rem, 0.7fr);
  gap: 2rem;
  align-items: stretch;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const UploadBox = styled.div<{ $active?: boolean }>`
  display: flex;
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
  width: 100%;

  .ant-upload {
    display: block;
    width: 100%;
  }
`;

const FileMeta = styled.div`
  display: grid;
  grid-template-rows: auto 1fr;
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
  justify-content: space-between;
  gap: 1.2rem;
  border-bottom: 1px solid #f1f3f5;
  padding-bottom: 1rem;

  &:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }

  span:first-child {
    flex: 0 0 auto;
    color: #868e96;
  }

  span:last-child {
    min-width: 0;
    color: #212529;
    font-weight: 600;
    overflow-wrap: anywhere;
    text-align: right;
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

const PreviewActions = styled(InlineGroup)`
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;

  @media (max-width: 768px) {
    justify-content: flex-start;
  }
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
): PreviewResult | null {
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

    const rows: PreviewActivityRow[] = [];

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

function formatNumber(value: number) {
  return value.toLocaleString("ko-KR", {
    maximumFractionDigits: 6,
  });
}

export default function CarbonActivitiesImportPage() {
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const handleFile = async (file: File) => {
    setIsParsing(true);
    setPreview(null);
    setSelectedFileName(file.name);
    setStatusMessage(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
      const result = parseWorkbook(workbook);

      setPreview(result);
      setStatusMessage({
        type: "success",
        text: `${result.rows.length.toLocaleString("ko-KR")}건의 데이터를 불러왔습니다.`,
      });
    } catch (error) {
      setStatusMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "엑셀 파일을 읽을 수 없습니다.",
      });
    } finally {
      setIsParsing(false);
    }
  };

  const uploadProps: UploadProps = {
    accept: ".xlsx,.xls,.csv",
    disabled: isParsing || isUploading,
    maxCount: 1,
    showUploadList: true,
    beforeUpload: (file) => {
      void handleFile(file);
      return false;
    },
  };

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
            type: row.type,
            description: row.description,
            amount: row.amount,
            unit: row.unit,
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
        title: "엑셀 행",
        dataIndex: "rowNumber",
        key: "rowNumber",
        width: 100,
      },
      {
        title: "일자(원본)",
        dataIndex: "activityDate",
        key: "activityDate",
      },
      {
        title: "활동 유형",
        dataIndex: "type",
        key: "type",
      },
      {
        title: "설명",
        dataIndex: "description",
        key: "description",
      },
      {
        title: "량",
        dataIndex: "amount",
        key: "amount",
        align: "right" as const,
        render: (value: number) => formatNumber(value),
      },
      {
        title: "단위",
        dataIndex: "unit",
        key: "unit",
      },
    ],
    [],
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
          <FullWidthUpload {...uploadProps}>
            <UploadBox $active={Boolean(preview)}>
              <CloudUploadOutlined />
              <strong>엑셀 파일 선택</strong>
              <span>.xlsx, .xls, .csv</span>
            </UploadBox>
          </FullWidthUpload>

          <FileMeta>
            <FieldLabel>필수 컬럼</FieldLabel>
            <MetaList>
              <MetaItem>
                <span>컬럼</span>
                <span>일자(원본), 활동 유형, 설명, 량, 단위</span>
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

          <PreviewActions>
            {preview ? (
              <CountBadge>
                <FileExcelOutlined />
                {preview.rows.length.toLocaleString("ko-KR")}건
              </CountBadge>
            ) : null}
            <Button
              icon={<UploadOutlined />}
              onClick={handleUpload}
              disabled={!preview || preview.rows.length === 0 || isUploading}
            >
              DB 업로드
            </Button>
          </PreviewActions>
        </PreviewHeader>

        <DataTable
          rowKey={(row) => String((row as PreviewActivityRow).id)}
          dataSource={preview?.rows ?? []}
          columns={columns}
          scroll={{ x: 900 }}
          locale={{ emptyText: "미리보기 데이터가 없습니다." }}
        />
      </PreviewSection>
    </AdminPageMain>
  );
}
