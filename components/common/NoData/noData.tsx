"use client";

import React from "react";
import { Empty as AntdEmpty } from "antd";
import type { EmptyProps } from "antd";
import styled from "styled-components";

export type NoDataProps = Omit<EmptyProps, "image"> & {
  description?: React.ReactNode;
};

const StyledEmpty = styled(AntdEmpty)`
  .ant-empty-description {
    color: #495057;
    font-size: 1.2rem;
    font-weight: 500;
  }
`;

export function NoData({
  description = "No Data",
  ...props
}: NoDataProps) {
  return (
    <StyledEmpty
      image={AntdEmpty.PRESENTED_IMAGE_SIMPLE}
      description={description}
      {...props}
    />
  );
}
