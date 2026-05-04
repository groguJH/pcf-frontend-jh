import styled from "styled-components";
import { Input as AntdInput } from "antd";
import type { InputProps } from "antd";

export type { InputProps };

export const Input = styled(AntdInput)<InputProps>`
  border-radius: 4px;

  && {
    display: inline-flex;
    align-items: center;
  }
`;
