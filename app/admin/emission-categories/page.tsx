"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
  Button,
  DataTable,
  FieldLabel,
  InlineGroup,
  Input,
  PageMain,
  SectionHeader,
  Select,
  SurfaceSection,
  TitleGroup,
} from "@/components/common/styles";

const { Option } = Select;

type CarbonScope = "scope1" | "scope2" | "scope3";

type EmissionCategory = {
  type: string;
  scope: CarbonScope;
};

type CategoryForm = {
  type: string;
  scope: CarbonScope;
};

const emptyForm: CategoryForm = {
  type: "",
  scope: "scope1",
};

const scopeOptions: { label: string; value: CarbonScope }[] = [
  { label: "Scope 1", value: "scope1" },
  { label: "Scope 2", value: "scope2" },
  { label: "Scope 3", value: "scope3" },
];

const AdminPageMain = styled(PageMain)``;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(18rem, 1fr) 16rem auto;
  gap: 1.2rem;
  align-items: end;
  margin-bottom: 2.4rem;

  @media (max-width: 768px) {
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
  justify-content: flex-end;

  @media (max-width: 768px) {
    justify-content: flex-start;
  }
`;

function getCategoryKey(category: EmissionCategory) {
  return `${category.type}-${category.scope}`;
}

export default function EmissionCategoriesPage() {
  const [categories, setCategories] = useState<EmissionCategory[]>([]);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [editingCategory, setEditingCategory] =
    useState<EmissionCategory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  const resetForm = () => {
    setForm(emptyForm);
    setEditingCategory(null);
  };

  const handleEdit = (category: EmissionCategory) => {
    setEditingCategory(category);
    setForm({
      type: category.type,
      scope: category.scope,
    });
    setMessage(null);
  };

  const handleSubmit = async () => {
    const type = form.type.trim();

    if (!type) {
      setMessage({
        type: "error",
        text: "배출원 유형을 입력해주세요.",
      });
      return;
    }

    setIsSaving(true);
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

      resetForm();
      setMessage({
        type: "success",
        text: editingCategory
          ? "카테고리가 수정되었습니다."
          : "카테고리가 생성되었습니다.",
      });
      await loadCategories();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "카테고리를 저장할 수 없습니다.",
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
        title: "Scope",
        dataIndex: "scope",
        key: "scope",
        render: (scope: CarbonScope) =>
          scopeOptions.find((option) => option.value === scope)?.label ?? scope,
      },
      {
        title: "관리",
        key: "actions",
        align: "right" as const,
        render: (_: unknown, category: object) => {
          const typedCategory = category as EmissionCategory;

          return (
            <Button variant="default" onClick={() => handleEdit(typedCategory)}>
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
            <h2>배출원 카테고리 관리</h2>
            <p>배출원 유형별 Scope 분류를 등록하고 수정합니다.</p>
          </TitleGroup>
        </SectionHeader>

        <FormGrid>
          <FieldBox>
            <FieldLabel>배출원 유형</FieldLabel>
            <Input
              value={form.type}
              placeholder="예: 전기, 원소재, 운송"
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  type: event.target.value,
                }))
              }
            />
          </FieldBox>

          <FieldBox>
            <FieldLabel>Scope</FieldLabel>
            <Select
              value={form.scope}
              onChange={(scope) =>
                setForm((prev) => ({
                  ...prev,
                  scope: scope as CarbonScope,
                }))
              }
            >
              {scopeOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </FieldBox>

          <ActionGroup>
            {editingCategory ? (
              <Button
                variant="default"
                customColor="subGray"
                onClick={resetForm}
              >
                취소
              </Button>
            ) : null}
            <Button onClick={handleSubmit} disabled={isSaving}>
              {editingCategory ? "수정" : "등록"}
            </Button>
          </ActionGroup>
        </FormGrid>

        <MessageText $type={message?.type}>{message?.text ?? ""}</MessageText>

        <DataTable
          rowKey={(category) => getCategoryKey(category as EmissionCategory)}
          dataSource={categories}
          columns={columns}
          loading={isLoading}
        />
      </SurfaceSection>
    </AdminPageMain>
  );
}
