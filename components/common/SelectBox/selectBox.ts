import styled from "styled-components";
import { Select as AntdSelect } from "antd";
import type { SelectProps } from "antd";

export type { SelectProps };

export const Select = Object.assign(
  styled(AntdSelect)<SelectProps>`
    && {
      .ant-select-selector {
        border-radius: 4px;
      }
    }
  `,
  {
    Option: AntdSelect.Option,
    OptGroup: AntdSelect.OptGroup,
  },
);
