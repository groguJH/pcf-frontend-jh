import * as React from "react";
import styled from "styled-components";
import { Button as AntdButton } from "antd";
import type { ButtonProps } from "antd";

export type CustomColor =
  | "mainBlue"
  | "mainGreen"
  | "subGray"
  | "danger-red"
  | "scope1"
  | "scope2"
  | "scope3";
type CustomButtonVariant =
  | "primary"
  | "default"
  | "dashed"
  | "text"
  | "link"
  | "filled";

const BUTTON_COLOR_MAP: Record<CustomColor, string> = {
  mainBlue: "#1890ff",
  mainGreen: "#52c41a",
  subGray: "#8c8c8c",
  "danger-red": "#ff4d4f",
  scope1: "#ff7a00",
  scope2: "#1890ff",
  scope3: "#52c41a",
};

export interface CustomButtonProps extends Omit<
  ButtonProps,
  "type" | "variant" | "color"
> {
  variant?: CustomButtonVariant;
  customColor?: CustomColor;
  children?: React.ReactNode;
}

type StyledButtonProps = ButtonProps & {
  $customColor?: CustomColor;
};

export function Button({
  variant = "primary",
  customColor = "mainBlue",
  children,
  ...rest
}: CustomButtonProps) {
  const variantProps =
    variant === "filled"
      ? { variant }
      : { type: variant as ButtonProps["type"] };

  return React.createElement(
    CustomButton,
    { ...rest, ...variantProps, $customColor: customColor },
    children,
  );
}

export const CustomButton = styled(AntdButton)<StyledButtonProps>`
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  && {
    background-color: ${({ $customColor = "mainBlue" }) =>
      BUTTON_COLOR_MAP[$customColor]} !important;
    border-color: ${({ $customColor = "mainBlue" }) =>
      BUTTON_COLOR_MAP[$customColor]} !important;
    color: white !important;

    &:hover {
      filter: brightness(1.1);
      border-color: transparent !important;
    }
  }
`;
