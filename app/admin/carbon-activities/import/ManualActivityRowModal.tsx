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

export type ManualActivityForm = {
  activityDate: string;
  type: string;
  description: string;
  amount: string;
  unit: string;
};

export const emptyManualActivityForm: ManualActivityForm = {
  activityDate: "",
  type: "",
  description: "",
  amount: "",
  unit: "",
};

type ManualActivityRowModalProps = {
  open: boolean;
  mode: "create" | "edit";
  form: ManualActivityForm;
  confirmLoading?: boolean;
  errorMessage?: string | null;
  onChange: (form: ManualActivityForm) => void;
  onCancel: () => void;
  onSubmit: (form: ManualActivityForm) => void;
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

export default function ManualActivityRowModal({
  open,
  mode,
  form,
  confirmLoading = false,
  errorMessage = null,
  onChange,
  onCancel,
  onSubmit,
}: ManualActivityRowModalProps) {
  const handleSubmit = () => {
    onSubmit({
      ...form,
      type: form.type.trim(),
      description: form.description.trim(),
      amount: form.amount.trim(),
      unit: form.unit.trim(),
    });
  };

  return (
    <PopupModal
      open={open}
      title={mode === "edit" ? "미리보기 행 수정" : "미리보기 행 추가"}
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
          <FieldLabel>일자(원본)</FieldLabel>
          <Input
            type="date"
            value={form.activityDate}
            onChange={(event) =>
              onChange({
                ...form,
                activityDate: event.target.value,
              })
            }
          />
        </FieldBox>

        <FieldBox>
          <FieldLabel>활동 유형</FieldLabel>
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

        <FullWidthFieldBox>
          <FieldLabel>설명(상세 내역)</FieldLabel>
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
          <FieldLabel>량</FieldLabel>
          <Input
            type="number"
            value={form.amount}
            placeholder="예: 100"
            onChange={(event) =>
              onChange({
                ...form,
                amount: event.target.value,
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

        {errorMessage ? <ErrorText>{errorMessage}</ErrorText> : null}
      </FormBody>
    </PopupModal>
  );
}
