"use client";

import React from "react";
import styled from "styled-components";
import {
  Button,
  FieldLabel,
  Input,
  PopupModal,
  PopupModalFooter,
  Select,
} from "@/components/common/styles";

const { Option } = Select;

export type CarbonScope = "scope1" | "scope2" | "scope3";

export type EmissionCategory = {
  type: string;
  scope: CarbonScope;
};

export type CategoryForm = {
  type: string;
  scope: CarbonScope;
};

export const emptyCategoryForm: CategoryForm = {
  type: "",
  scope: "scope1",
};

export const scopeOptions: { label: string; value: CarbonScope }[] = [
  { label: "Scope 1", value: "scope1" },
  { label: "Scope 2", value: "scope2" },
  { label: "Scope 3", value: "scope3" },
];

type EmissionCategoryModalProps = {
  open: boolean;
  mode: "create" | "edit";
  form: CategoryForm;
  confirmLoading?: boolean;
  errorMessage?: string | null;
  onChange: (form: CategoryForm) => void;
  onCancel: () => void;
  onSubmit: (form: CategoryForm) => void;
};

const FormBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  padding-top: 0.4rem;
`;

const FieldBox = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const ErrorText = styled.p`
  margin: 0;
  color: #ff4d4f;
  font-size: 1.2rem;
`;

export default function EmissionCategoryModal({
  open,
  mode,
  form,
  confirmLoading = false,
  errorMessage = null,
  onChange,
  onCancel,
  onSubmit,
}: EmissionCategoryModalProps) {
  const handleSubmit = () => {
    onSubmit({
      ...form,
      type: form.type.trim(),
    });
  };

  return (
    <PopupModal
      open={open}
      title={mode === "edit" ? "배출원 카테고리 수정" : "배출원 카테고리 추가"}
      onCancel={onCancel}
      footer={
        <PopupModalFooter>
          <Button variant="default" customColor="subGray" onClick={onCancel}>
            취소
          </Button>
          <Button loading={confirmLoading} onClick={handleSubmit}>
            {mode === "edit" ? "수정" : "추가"}
          </Button>
        </PopupModalFooter>
      }
    >
      <FormBody>
        <FieldBox>
          <FieldLabel>배출원 유형</FieldLabel>
          <Input
            value={form.type}
            placeholder="예: 전기, 원소재, 운송"
            onChange={(event) =>
              onChange({
                ...form,
                type: event.target.value,
              })
            }
            onPressEnter={handleSubmit}
          />
        </FieldBox>

        <FieldBox>
          <FieldLabel>Scope</FieldLabel>
          <Select
            value={form.scope}
            onChange={(scope) =>
              onChange({
                ...form,
                scope: scope as CarbonScope,
              })
            }
          >
            {scopeOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </FieldBox>

        {errorMessage ? <ErrorText>{errorMessage}</ErrorText> : null}
      </FormBody>
    </PopupModal>
  );
}
