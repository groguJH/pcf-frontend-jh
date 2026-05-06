"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Popconfirm } from "antd";
import styled from "styled-components";
import {
  Button,
  DataTable,
  PageMain,
  SectionHeader,
  SurfaceSection,
  TitleGroup,
} from "@/components/common/styles";
import EmissionFactorModal, {
  type EmissionFactor,
  type FactorForm,
  emptyFactorForm,
} from "./EmissionFactorModal";

const AdminPageMain = styled(PageMain)``;

const FactorSection = styled(SurfaceSection)`
  .ant-table-tbody > tr {
    cursor: pointer;
  }
`;

const MessageText = styled.p<{ $type?: "error" | "success" }>`
  min-height: 2rem;
  margin-bottom: 1.6rem;
  font-size: 1.4rem;
  color: ${({ $type }) => ($type === "error" ? "#ff4d4f" : "#52c41a")};
`;

function formatNumber(value: number) {
  return value.toLocaleString("ko-KR", {
    maximumFractionDigits: 8,
  });
}

function toFactorForm(factor: EmissionFactor): FactorForm {
  return {
    type: factor.type,
    description: factor.description,
    unit: factor.unit,
    factorValue: String(factor.factorValue),
    validFrom: factor.validFrom,
    validTo: factor.validTo ?? "",
  };
}

export default function EmissionFactorsPage() {
  const [factors, setFactors] = useState<EmissionFactor[]>([]);
  const [editingFactor, setEditingFactor] = useState<EmissionFactor | null>(
    null,
  );
  const [modalForm, setModalForm] = useState<FactorForm>(emptyFactorForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
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

  const openCreateModal = () => {
    setEditingFactor(null);
    setModalForm(emptyFactorForm);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (factor: EmissionFactor) => {
    setEditingFactor(factor);
    setModalForm(toFactorForm(factor));
    setModalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) {
      return;
    }

    setIsModalOpen(false);
    setEditingFactor(null);
    setModalError(null);
  };

  const handleSubmit = async (form: FactorForm) => {
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
      setModalError(
        "배출원 유형, 상세 내역, 단위, 계수값, 유효 시작일을 확인해주세요.",
      );
      return;
    }

    setIsSaving(true);
    setModalError(null);
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

      setIsModalOpen(false);
      setEditingFactor(null);
      setMessage({
        type: "success",
        text: editingFactor
          ? "배출계수가 수정되었습니다."
          : "배출계수가 추가되었습니다.",
      });
      await loadFactors();
    } catch (error) {
      setModalError(
        error instanceof Error
          ? error.message
          : "배출계수를 저장할 수 없습니다.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = useCallback(
    async (factor: EmissionFactor) => {
      setDeletingId(factor.id);
      setMessage(null);

      try {
        const response = await fetch("/api/emission-factors", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: factor.id }),
        });
        const body = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(body.error ?? "배출계수를 삭제할 수 없습니다.");
        }

        setMessage({
          type: "success",
          text: "배출계수가 삭제되었습니다.",
        });
        await loadFactors();
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "배출계수를 삭제할 수 없습니다.",
        });
      } finally {
        setDeletingId(null);
      }
    },
    [loadFactors],
  );

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
        title: "삭제",
        key: "actions",
        width: "80px",
        render: (_: unknown, factor: object) => {
          const typedFactor = factor as EmissionFactor;

          return (
            <span onClick={(event) => event.stopPropagation()}>
              <Popconfirm
                title="배출계수 삭제"
                description="선택한 배출계수를 삭제할까요?"
                okText="삭제"
                cancelText="취소"
                onConfirm={() => handleDelete(typedFactor)}
              >
                <Button
                  icon={<DeleteOutlined />}
                  customColor="danger-red"
                  loading={deletingId === typedFactor.id}
                >
                  삭제
                </Button>
              </Popconfirm>
            </span>
          );
        },
      },
    ],
    [deletingId, handleDelete],
  );

  return (
    <AdminPageMain>
      <FactorSection>
        <SectionHeader>
          <TitleGroup>
            <h2>배출계수 관리</h2>
            <p>배출원별 단위와 유효기간에 따른 배출계수를 등록하고 수정합니다.</p>
          </TitleGroup>
        </SectionHeader>

        <MessageText $type={message?.type}>{message?.text ?? ""}</MessageText>

        <DataTable
          rowKey={(factor) => String((factor as EmissionFactor).id)}
          dataSource={factors}
          columns={columns}
          loading={isLoading}
          topActions={
            <Button icon={<PlusOutlined />} onClick={openCreateModal}>
              추가
            </Button>
          }
          onRow={(factor) => ({
            onClick: () => openEditModal(factor as EmissionFactor),
          })}
        />
      </FactorSection>

      <EmissionFactorModal
        open={isModalOpen}
        mode={editingFactor ? "edit" : "create"}
        form={modalForm}
        confirmLoading={isSaving}
        errorMessage={modalError}
        onChange={setModalForm}
        onCancel={closeModal}
        onSubmit={handleSubmit}
      />
    </AdminPageMain>
  );
}
