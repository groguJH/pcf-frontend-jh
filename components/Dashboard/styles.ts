"use client";

import styled from "styled-components";

export const DashboardPageMain = styled.main`
  width: 100%;
  min-height: 100vh;
  padding: 5vh 5vw 7vh;
  background-color: blue;

  @media (max-width: 768px) {
    padding: 3vh 4vw 5vh;
  }
`;

export const DashboardHeader = styled.header`
  width: 100%;
  height: 6rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  background-color: red;

  @media (max-width: 768px) {
    height: 4rem;
  }
`;

// 필터바 프리젠터에서 사용할 컴포넌트
export const FilterBarWrapper = styled.section`
  width: 100%;
  background: #ffffff;
  border-radius: 0.5rem;
  padding: 0.3cm;
  margin-bottom: 2rem;
  box-shadow: 0 0.4rem 0.6rem rgba(0, 0, 0, 0.05);

  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap; /* 모바일에서 줄바꿈 대응 */
  gap: 3rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 2rem;
  }
`;

export const FilterGroup = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.6rem;
  /* 모바일에서 달력이 삐져나가지 않도록 설정 */
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }
`;

export const FilterWrapper = styled.div`
  display: flex;
  gap: 1.5rem;
  padding: 0.5rem;
`;

export const FilterLabel = styled.span`
  font-size: 1.6rem;
  font-weight: 700;
  color: #333;
  white-space: nowrap;
`;

export const ToggleButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-right: 1rem;
`;

//  자료import 및 리포트 다운로드 버튼 섹션
export const ButtonSection = styled.section`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: stretch;
  gap: 3rem;
  margin: 1rem 0;
  background-color: green;

  @media (max-width: 900px) {
    margin: 0.5rem 0;
  }
`;

// 차트 카드 래퍼
export const ChartCardWrapper = styled.section`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;
  gap: 2rem;
  margin: 1rem 0;
  background-color: yellow;

  @media (max-width: 900px) {
    margin: 0.5rem 0;
    flex-wrap: wrap;
    gap: 1rem;
  }
`;

export const ChartCard = styled.article`
  flex: 1 1 0%;
  min-width: 0;

  background-color: white;
  border: 0.1rem solid #ececec;
  border-radius: 1.6rem;
  padding: 1rem;
  box-shadow: 0 0.4rem 0.6rem rgba(0, 0, 0, 0.05);

  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.8rem;

  @media (max-width: 900px) {
    /* 모바일에서 카드가 너무 많으면 100%로 채워서 한 줄에 하나씩 나오게 유도 */
    /* 만약 한 줄에 두 개씩 나오게 하고 싶다면 45% 등으로 조절 가능합니다. */
    flex: 1 1 100%;
  }
`;

export const CardTitle = styled.span`
  color: #666666;
  font-weight: 500;
`;

export const CardValueWrapper = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
`;

export const CardValue = styled.strong<{ $color?: string }>`
  font-size: 2rem; /* 32px */
  font-weight: 700;
  color: ${(props) => props.$color || "#333333"};
`;

export const CardUnit = styled.span`
  font-size: 1.5rem;
  color: #888888;
`;

export const ChartSection = styled.section`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: stretch;
  gap: 2rem;
  margin-bottom: 3rem;
  background-color: green;

  @media (max-width: 900px) {
    flex-wrap: wrap;
    flex-direction: column;
  }
`;

// MonthlyChartSection에서 사용할 차트
export const ChartContainer = styled.div`
  width: 100%;
  height: 30rem;
  padding: 2rem;
  background: #fff;
  border-radius: 1.6rem;
`;

export const ChartTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #1d2129;
`;
