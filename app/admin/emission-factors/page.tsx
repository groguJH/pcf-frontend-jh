"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
  Button,
  FieldLabel,
  InlineGroup,
  Input,
  PageMain,
  SectionHeader,
  SurfaceSection,
  Table,
  TitleGroup,
} from "@/components/common/styles";

type EmissionFactor = {
  id: number;
  type: string;
  description: string;
  unit: string;
  factorValue: number;
  validFrom: string;
  validTo: string | null;
};

type FactorForm = {
  type: string;
  description: string;
  unit: string;
  factorValue: string;
  validFrom: string;
  validTo: string;
};

const emptyForm: FactorForm = {
  type: "",
  description: "",
  unit: "",
  factorValue: "",
  validFrom: "2025-01-01",
  validTo: "",
};

const AdminPageMain = styled(PageMain)``;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(16rem, 1fr));
  gap: 1.2rem;
  align-items: end;
  margin-bottom: 2.4rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    align-items: stretch;
  }
`;

const FieldBox = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const MessageText = styled.p<{ $type?: "error" | "success" }>`
  min-height: 2rem;
  margin-bottom: 1.6rem;
  font-size: 1.4rem;
  color: ${({ $type }) => ($type === "error" ? "#ff4d4f" : "#52c41a")};
`;

const ActionGroup = styled(InlineGroup)`
  grid-column: 1 / -1;
  justify-content: flex-end;

  @media (max-width: 900px) {
    justify-content: flex-start;
  }
`;

function formatNumber(value: number) {
  return value.toLocaleString("ko-KR", {
    maximumFractionDigits: 8,
  });
}

export default function EmissionFactorsPage() {
  const [factors, setFactors] = useState<EmissionFactor[]>([]);
  const [form, setForm] = useState<FactorForm>(emptyForm);
  const [editingFactor, setEditingFactor] = useState<EmissionFactor | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const loadFactors = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/emission-factors");
      const body = (await response.json()) as {
        factors?: EmissionFactor[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(body.error ?? "배출계수 목록을 불러올 수 없습니다.");
      }

      setFactors(body.factors ?? []);
    } catch (error) {
      setFactors([]);
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "배출계수 목록을 불러올 수 없습니다.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadFactors();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadFactors]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingFactor(null);
  };

  const handleEdit = (factor: EmissionFactor) => {
    setEditingFactor(factor);
    setForm({
      type: factor.type,
      description: factor.description,
      unit: factor.unit,
      factorValue: String(factor.factorValue),
      validFrom: factor.validFrom,
      validTo: factor.validTo ?? "",
    });
    setMessage(null);
  };

  const handleSubmit = async () => {
    const type = form.type.trim();
    const description = form.description.trim();
    const unit = form.unit.trim();
    const factorValue = Number(form.factorValue);

    if (
      !type ||
      !description ||
      !unit ||
      Number.isNaN(factorValue) ||
      !form.validFrom
    ) {
      setMessage({
        type: "error",
        text: "배출원 유형, 상세 내역, 단위, 계수값, 유효 시작일을 확인해주세요.",
      });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/emission-factors", {
        method: editingFactor ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingFactor?.id,
          type,
          description,
          unit,
          factorValue,
          validFrom: form.validFrom,
          validTo: form.validTo || null,
        }),
      });
      const body = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(body.error ?? "배출계수를 저장할 수 없습니다.");
      }

      resetForm();
      setMessage({
        type: "success",
        text: editingFactor
          ? "배출계수가 수정되었습니다."
          : "배출계수가 생성되었습니다.",
      });
      await loadFactors();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "배출계수를 저장할 수 없습니다.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "배출원 유형",
        dataIndex: "type",
        key: "type",
      },
      {
        title: "상세 내역",
        dataIndex: "description",
        key: "description",
      },
      {
        title: "단위",
        dataIndex: "unit",
        key: "unit",
      },
      {
        title: "계수값",
        dataIndex: "factorValue",
        key: "factorValue",
        align: "right" as const,
        render: (value: number) => formatNumber(value),
      },
      {
        title: "유효 시작일",
        dataIndex: "validFrom",
        key: "validFrom",
      },
      {
        title: "유효 종료일",
        dataIndex: "validTo",
        key: "validTo",
        render: (value: string | null) => value ?? "-",
      },
      {
        title: "관리",
        key: "actions",
        align: "right" as const,
        render: (_: unknown, factor: object) => {
          const typedFactor = factor as EmissionFactor;

          return (
            <Button variant="default" onClick={() => handleEdit(typedFactor)}>
              수정
            </Button>
          );
        },
      },
    ],
    [],
  );

  return (
    <AdminPageMain>
      <SurfaceSection>
        <SectionHeader>
          <TitleGroup>
            <h2>배출계수 관리</h2>
            <p>배출원별 단위와 유효기간에 따른 배출계수를 등록하고 수정합니다.</p>
          </TitleGroup>
        </SectionHeader>

        <FormGrid>
          <FieldBox>
            <FieldLabel>배출원 유형</FieldLabel>
            <Input
              value={form.type}
              placeholder="예: 전기"
              onChange={(event) =>
                setForm((prev) => ({ ...prev, type: event.target.value }))
              }
            />
          </FieldBox>

          <FieldBox>
            <FieldLabel>상세 내역</FieldLabel>
            <Input
              value={form.description}
              placeholder="예: 한국전력"
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
            />
          </FieldBox>

          <FieldBox>
            <FieldLabel>단위</FieldLabel>
            <Input
              value={form.unit}
              placeholder="예: kWh"
              onChange={(event) =>
                setForm((prev) => ({ ...prev, unit: event.target.value }))
              }
            />
          </FieldBox>

          <FieldBox>
            <FieldLabel>계수값</FieldLabel>
            <Input
              value={form.factorValue}
              placeholder="예: 0.456"
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  factorValue: event.target.value,
                }))
              }
            />
          </FieldBox>

          <FieldBox>
            <FieldLabel>유효 시작일</FieldLabel>
            <Input
              type="date"
              value={form.validFrom}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  validFrom: event.target.value,
                }))
              }
            />
          </FieldBox>

          <FieldBox>
            <FieldLabel>유효 종료일</FieldLabel>
            <Input
              type="date"
              value={form.validTo}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, validTo: event.target.value }))
              }
            />
          </FieldBox>

          <ActionGroup>
            {editingFactor ? (
              <Button
                variant="default"
                customColor="subGray"
                onClick={resetForm}
              >
                취소
              </Button>
            ) : null}
            <Button onClick={handleSubmit} disabled={isSaving}>
              {editingFactor ? "수정" : "등록"}
            </Button>
          </ActionGroup>
        </FormGrid>

        <MessageText $type={message?.type}>{message?.text ?? ""}</MessageText>

        <Table
          rowKey={(factor) => String((factor as EmissionFactor).id)}
          dataSource={factors}
          columns={columns}
          loading={isLoading}
          pagination={false}
        />
      </SurfaceSection>
    </AdminPageMain>
  );
}
