import styled from "styled-components";
import { DatePicker as AntdDatePicker } from "antd";
import type { ComponentProps } from "react";
import type { DatePickerProps } from "antd";

export type { DatePickerProps };
export type RangePickerProps = ComponentProps<typeof AntdDatePicker.RangePicker>;

export const DatePicker = styled(AntdDatePicker)<DatePickerProps>`
  border-radius: 4px;
`;

export const RangePicker = styled(AntdDatePicker.RangePicker)<RangePickerProps>`
  border-radius: 4px;
`;
