"use client";

import React from "react";
import { Segmented } from "antd";
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

export type FactorChangeType = "correction" | "revision";

export type FactorForm = {
  type: string;
  description: string;
  unit: string;
  factorValue: string;
  validFrom: string;
  validTo: string;
  originalValidTo: string;
  changeType: FactorChangeType;
};

export const emptyFactorForm: FactorForm = {
  type: "",
  description: "",
  unit: "",
  factorValue: "",
  validFrom: "2025-01-01",
  validTo: "",
  originalValidTo: "",
  changeType: "correction",
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

const ReadOnlyValueBox = styled.div`
  display: flex;
  min-height: 3.2rem;
  align-items: center;
  border: 1px solid #dee2e6;
  border-radius: 0.4rem;
  padding: 0 1.1rem;
  background: #f8f9fa;
  color: #495057;
  font-size: 1.25rem;
`;

const ReadOnlyHelpText = styled.p`
  margin: 0;
  color: #6c757d;
  font-size: 1.1rem;
  line-height: 1.5;
`;

const ChangeTypeBox = styled.div`
  display: flex;
  min-width: 0;
  grid-column: 1 / -1;
  flex-direction: column;
  gap: 0.9rem;

  .ant-segmented {
    width: 100%;
    padding: 0.4rem;
    border: 1px solid #e9ecef;
    background: #f8f9fa;
  }

  .ant-segmented-group {
    width: 100%;
    gap: 0.4rem;
  }

  .ant-segmented-item {
    flex: 1;
    border-radius: 0.6rem;
  }

  .ant-segmented-item-label {
    min-height: auto;
    padding: 1.2rem 1.4rem;
    line-height: 1.4;
  }

  .ant-segmented-item-selected {
    box-shadow: 0 0.8rem 2rem rgba(15, 23, 42, 0.08);
  }

  @media (max-width: 640px) {
    .ant-segmented-group {
      flex-direction: column;
    }
  }
`;

const ChangeTypeOption = styled.span`
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
  text-align: left;
`;

const ChangeTypeTitle = styled.span`
  color: #1d2129;
  font-size: 1.25rem;
  font-weight: 600;
`;

const ChangeTypeDescription = styled.span`
  color: #6c757d;
  font-size: 1.1rem;
  font-weight: 400;
  white-space: normal;
`;

const ChangeTypeHint = styled.p<{ $type: FactorChangeType }>`
  margin: 0;
  padding: 1rem 1.2rem;
  border-radius: 0.6rem;
  border: 1px solid
    ${({ $type }) => ($type === "correction" ? "#ffd8bf" : "#d6e4ff")};
  background: ${({ $type }) =>
    $type === "correction" ? "#fff7e6" : "#f0f5ff"};
  color: ${({ $type }) => ($type === "correction" ? "#ad4e00" : "#1d39c4")};
  font-size: 1.15rem;
  line-height: 1.5;
`;

function renderChangeTypeOption(
  title: string,
  description: string,
): React.ReactNode {
  return (
    <ChangeTypeOption>
      <ChangeTypeTitle>{title}</ChangeTypeTitle>
      <ChangeTypeDescription>{description}</ChangeTypeDescription>
    </ChangeTypeOption>
  );
}

const ErrorText = styled.p`
  grid-column: 1 / -1;
  margin: 0;
  color: #ff4d4f;
  font-size: 1.2rem;
`;

function getSubmitLabel(mode: "create" | "edit", changeType: FactorChangeType) {
  if (mode === "create") {
    return "추가";
  }

  return changeType === "revision" ? "새 버전 등록" : "소급 정정";
}

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
            {getSubmitLabel(mode, form.changeType)}
          </Button>
        </PopupModalFooter>
      }
    >
      <FormBody>
        {mode === "edit" ? (
          <ChangeTypeBox>
            <FieldLabel>변경 방식</FieldLabel>
            <Segmented
              value={form.changeType}
              options={[
                {
                  label: renderChangeTypeOption(
                    "기존 계수 소급 정정",
                    "기존 활동 내역까지 다시 계산",
                  ),
                  value: "correction",
                },
                {
                  label: renderChangeTypeOption(
                    "새 버전 등록",
                    "선택한 시작일부터 새 계수 적용",
                  ),
                  value: "revision",
                },
              ]}
              onChange={(value) =>
                onChange({
                  ...form,
                  changeType: value as FactorChangeType,
                })
              }
            />
            <ChangeTypeHint $type={form.changeType}>
              {form.changeType === "correction"
                ? "기존 활동 내역의 적용 계수와 배출량을 함께 재계산합니다."
                : "종료일은 현재 버전의 종료일을 이어받고, 직접 지정하지 않습니다."}
            </ChangeTypeHint>
          </ChangeTypeBox>
        ) : null}

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

        {mode === "edit" && form.changeType === "revision" ? (
          <FieldBox>
            <FieldLabel>유효 종료일</FieldLabel>
            <ReadOnlyValueBox>
              {form.originalValidTo || "종료일 없음"}
            </ReadOnlyValueBox>
            <ReadOnlyHelpText>
              유효 종료일은 직접 입력하지 않습니다. 다음 버전 등록 시 직전
              버전의 종료일이 새 버전 시작일의 전일로 자동 확정됩니다.
            </ReadOnlyHelpText>
          </FieldBox>
        ) : (
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
        )}

        {errorMessage ? <ErrorText>{errorMessage}</ErrorText> : null}
      </FormBody>
    </PopupModal>
  );
}
