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
import { ScopeTag } from "@/components/Carbon/ScopeTag";
import EmissionCategoryModal, {
  type CategoryForm,
  type CarbonScope,
  type EmissionCategory,
  emptyCategoryForm,
  scopeOptions,
} from "./EmissionCategoryModal";

const AdminPageMain = styled(PageMain)``;

const CategorySection = styled(SurfaceSection)`
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

function getCategoryKey(category: EmissionCategory) {
  return `${category.type}-${category.scope}`;
}

function getScopeLabel(scope: CarbonScope) {
  return scopeOptions.find((option) => option.value === scope)?.label ?? scope;
}

export default function EmissionCategoriesPage() {
  const [categories, setCategories] = useState<EmissionCategory[]>([]);
  const [editingCategory, setEditingCategory] =
    useState<EmissionCategory | null>(null);
  const [modalForm, setModalForm] = useState<CategoryForm>(emptyCategoryForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/emission-categories");
      const body = (await response.json()) as {
        categories?: EmissionCategory[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(body.error ?? "카테고리 목록을 불러올 수 없습니다.");
      }

      setCategories(body.categories ?? []);
    } catch (error) {
      setCategories([]);
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "카테고리 목록을 불러올 수 없습니다.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCategories();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadCategories]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setModalForm(emptyCategoryForm);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: EmissionCategory) => {
    setEditingCategory(category);
    setModalForm({
      type: category.type,
      scope: category.scope,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) {
      return;
    }

    setIsModalOpen(false);
    setEditingCategory(null);
    setModalError(null);
  };

  const handleSubmit = async (form: CategoryForm) => {
    const type = form.type.trim();

    if (!type) {
      setModalError("배출원 유형을 입력해주세요.");
      return;
    }

    setIsSaving(true);
    setModalError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/emission-categories", {
        method: editingCategory ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editingCategory
            ? {
                originalType: editingCategory.type,
                originalScope: editingCategory.scope,
                type,
                scope: form.scope,
              }
            : {
                type,
                scope: form.scope,
              },
        ),
      });
      const body = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(body.error ?? "카테고리를 저장할 수 없습니다.");
      }

      setIsModalOpen(false);
      setEditingCategory(null);
      setMessage({
        type: "success",
        text: editingCategory
          ? "카테고리가 수정되었습니다."
          : "카테고리가 추가되었습니다.",
      });
      await loadCategories();
    } catch (error) {
      setModalError(
        error instanceof Error
          ? error.message
          : "카테고리를 저장할 수 없습니다.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = useCallback(
    async (category: EmissionCategory) => {
      const categoryKey = getCategoryKey(category);

      setDeletingKey(categoryKey);
      setMessage(null);

      try {
        const response = await fetch("/api/emission-categories", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(category),
        });
        const body = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(body.error ?? "카테고리를 삭제할 수 없습니다.");
        }

        setMessage({
          type: "success",
          text: "카테고리가 삭제되었습니다.",
        });
        await loadCategories();
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "카테고리를 삭제할 수 없습니다.",
        });
      } finally {
        setDeletingKey(null);
      }
    },
    [loadCategories],
  );

  const columns = useMemo(
    () => [
      {
        title: "배출원 유형",
        dataIndex: "type",
        key: "type",
      },
      {
        title: "Scope",
        dataIndex: "scope",
        key: "scope",
        render: (scope: CarbonScope) => (
          <ScopeTag $scope={scope}>{getScopeLabel(scope)}</ScopeTag>
        ),
      },
      {
        title: "삭제",
        key: "actions",
        width: "80px",
        render: (_: unknown, category: object) => {
          const typedCategory = category as EmissionCategory;
          const categoryKey = getCategoryKey(typedCategory);

          return (
            <span onClick={(event) => event.stopPropagation()}>
              <Popconfirm
                title="배출원 카테고리 삭제"
                description="선택한 카테고리를 삭제할까요?"
                okText="삭제"
                cancelText="취소"
                onConfirm={() => handleDelete(typedCategory)}
              >
                <Button
                  icon={<DeleteOutlined />}
                  customColor="danger-red"
                  loading={deletingKey === categoryKey}
                >
                  삭제
                </Button>
              </Popconfirm>
            </span>
          );
        },
      },
    ],
    [deletingKey, handleDelete],
  );

  return (
    <AdminPageMain>
      <CategorySection>
        <SectionHeader>
          <TitleGroup>
            <h2>배출원 카테고리 관리</h2>
            <p>배출원 유형별 Scope 분류를 등록하고 수정합니다.</p>
          </TitleGroup>
        </SectionHeader>

        <MessageText $type={message?.type}>{message?.text ?? ""}</MessageText>

        <DataTable
          rowKey={(category) => getCategoryKey(category as EmissionCategory)}
          dataSource={categories}
          columns={columns}
          loading={isLoading}
          topActions={
            <Button icon={<PlusOutlined />} onClick={openCreateModal}>
              추가
            </Button>
          }
          onRow={(category) => ({
            onClick: () => openEditModal(category as EmissionCategory),
          })}
        />
      </CategorySection>

      <EmissionCategoryModal
        open={isModalOpen}
        mode={editingCategory ? "edit" : "create"}
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
