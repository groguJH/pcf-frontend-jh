"use client";

import React from "react";
import { Modal as AntdModal } from "antd";
import type { ModalProps as AntdModalProps } from "antd";
import styled from "styled-components";

export type PopupModalProps = AntdModalProps & {
  children?: React.ReactNode;
};

const StyledModal = styled(AntdModal)`
  .ant-modal-content {
    border-radius: 0.8rem;
    padding: 2.4rem;
  }

  .ant-modal-header {
    margin-bottom: 1.6rem;
  }

  .ant-modal-title {
    color: #1d2129;
    font-size: 1.55rem;
    font-weight: 600;
  }
`;

export const PopupModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  margin-top: 2rem;
`;

export function PopupModal({
  centered = true,
  children,
  ...props
}: PopupModalProps) {
  return (
    <StyledModal centered={centered} {...props}>
      {children}
    </StyledModal>
  );
}
