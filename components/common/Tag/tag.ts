import styled from "styled-components";
import { Tag as AntdTag } from "antd";
import type { TagProps } from "antd";

export type { TagProps };

export const Tag = styled(AntdTag)<TagProps>`
  border-radius: 4px;
  margin-inline-end: 0;
`;
