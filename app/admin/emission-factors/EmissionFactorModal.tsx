"use client";

import React from "react";
import styled from "styled-components";
import {
  Button,
  FieldLabel,
  Input,
  PopupModal,
  PopupModalFooter,
} from "@/components/common/styles";

export type EmissionFactor = {
  id: number;
  type: string;
  description: string;
  unit: string;
  factorValue: number;
  validFrom: string;
  validTo: string | null;
};

export type FactorForm = {
  type: string;
  description: string;
  unit: string;
  factorValue: string;
  validFrom: string;
  validTo: string;
};

export const emptyFactorForm: FactorForm = {
  type: "",
  description: "",
  unit: "",
  factorValue: "",
  validFrom: "2025-01-01",
  validTo: "",
};

type EmissionFactorModalProps = {
  open: boolean;
  mode: "create" | "edit";
  form: FactorForm;
  confirmLoading?: boolean;
  errorMessage?: string | null;
  onChange: (form: FactorForm) => void;
  onCancel: () => void;
  onSubmit: (form: FactorForm) => void;
};

const FormBody = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.6rem;
  padding-top: 0.4rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FieldBox = styled.label`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.8rem;
`;

const FullWidthFieldBox = styled(FieldBox)`
  grid-column: 1 / -1;
`;

const ErrorText = styled.p`
  grid-column: 1 / -1;
  margin: 0;
  color: #ff4d4f;
  font-size: 1.2rem;
`;

export default function EmissionFactorModal({
  open,
  mode,
  form,
  confirmLoading = false,
  errorMessage = null,
  onChange,
  onCancel,
  onSubmit,
}: EmissionFactorModalProps) {
  const handleSubmit = () => {
    onSubmit({
      ...form,
      type: form.type.trim(),
      description: form.description.trim(),
      unit: form.unit.trim(),
      factorValue: form.factorValue.trim(),
    });
  };

  return (
    <PopupModal
      open={open}
      title={mode === "edit" ? "배출계수 수정" : "배출계수 추가"}
      onCancel={onCancel}
      width={720}
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
            placeholder="예: 전기"
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
          <FieldLabel>단위</FieldLabel>
          <Input
            value={form.unit}
            placeholder="예: kWh"
            onChange={(event) =>
              onChange({
                ...form,
                unit: event.target.value,
              })
            }
            onPressEnter={handleSubmit}
          />
        </FieldBox>

        <FullWidthFieldBox>
          <FieldLabel>상세 내역</FieldLabel>
          <Input
            value={form.description}
            placeholder="예: 한국전력"
            onChange={(event) =>
              onChange({
                ...form,
                description: event.target.value,
              })
            }
            onPressEnter={handleSubmit}
          />
        </FullWidthFieldBox>

        <FieldBox>
          <FieldLabel>계수값</FieldLabel>
          <Input
            type="number"
            value={form.factorValue}
            placeholder="예: 0.456"
            onChange={(event) =>
              onChange({
                ...form,
                factorValue: event.target.value,
              })
            }
            onPressEnter={handleSubmit}
          />
        </FieldBox>

        <FieldBox>
          <FieldLabel>유효 시작일</FieldLabel>
          <Input
            type="date"
            value={form.validFrom}
            onChange={(event) =>
              onChange({
                ...form,
                validFrom: event.target.value,
              })
            }
          />
        </FieldBox>

        <FieldBox>
          <FieldLabel>유효 종료일</FieldLabel>
          <Input
            type="date"
            value={form.validTo}
            onChange={(event) =>
              onChange({
                ...form,
                validTo: event.target.value,
              })
            }
          />
        </FieldBox>

        {errorMessage ? <ErrorText>{errorMessage}</ErrorText> : null}
      </FormBody>
    </PopupModal>
  );
}
