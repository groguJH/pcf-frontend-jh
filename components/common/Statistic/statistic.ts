import styled from "styled-components";
import { Statistic as AntdStatistic } from "antd";
import type { StatisticProps } from "antd";

export type { StatisticProps };

export const Statistic = styled(AntdStatistic)<StatisticProps>`
  .ant-statistic-title {
    margin-bottom: 0.4rem;
    font-size: 1.1rem;
    font-weight: 500;
    color: #868e96;
  }

  .ant-statistic-content {
    color: #1d2129;
    font-size: 1.55rem;
    font-weight: 600;
    line-height: 1.2;
  }

  .ant-statistic-content-suffix {
    margin-left: 0.4rem;
    color: #868e96;
    font-size: 1.1rem;
    font-weight: 500;
  }
`;
