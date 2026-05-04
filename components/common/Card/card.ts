"use client";

import styled from "styled-components";

export const CardGrid = styled.section`
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

export const SurfaceCard = styled.article`
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
    flex: 1 1 100%;
  }
`;

export const MetricCard = styled(SurfaceCard)``;

export const CardTitle = styled.span`
  color: #666666;
  font-weight: 500;
`;

export const MetricValueWrapper = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
`;

export const MetricValue = styled.strong<{ $color?: string }>`
  font-size: 2rem;
  font-weight: 700;
  color: ${(props) => props.$color || "#333333"};
`;

export const MetricUnit = styled.span`
  font-size: 1.5rem;
  color: #888888;
`;

export const ChartPanel = styled.div`
  width: 100%;
  height: 30rem;
  padding: 2rem;
  background: #fff;
  border-radius: 1.6rem;
`;

export const ChartSectionLayout = styled.section`
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

export const SectionTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #1d2129;
`;
