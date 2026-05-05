"use client";

import styled from "styled-components";

export const PageMain = styled.main`
  width: 100%;
  min-height: 100vh;
  padding: 7vh 5vw 7vh;
  background-color: var(--color-bg);

  @media (max-width: 768px) {
    padding: 9vh 4vw 5vh;
  }
`;

export const PageHeader = styled.header`
  width: 100%;
  height: 6rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;

  @media (max-width: 768px) {
    height: 4rem;
  }
`;

export const SurfaceSection = styled.section`
  width: 100%;
  background-color: var(--color-content-light);
  border-radius: 1.6rem;
  padding: 3.2rem;
  margin-top: 2rem;
  box-shadow: 0 0.4rem 2rem rgba(0, 0, 0, 0.05);
`;

export const CompactSurfaceSection = styled.section`
  width: 100%;
  background: #f5f5f5;
  border-radius: 0.5rem;
  padding: 0.3cm;
  margin-bottom: 1rem;
  box-shadow: 0 0.4rem 0.6rem rgba(0, 0, 0, 0.05);

  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 3rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 2rem;
  }
`;

export const ActionBar = styled.section`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: stretch;
  gap: 3rem;
  margin: 1rem 0;

  @media (max-width: 900px) {
    margin: 0.5rem 0;
  }
`;

export const ResponsiveRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.6rem;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }
`;

export const FieldGroup = styled.div`
  display: flex;
  gap: 1.5rem;
  padding: 0.5rem;
`;

export const FieldLabel = styled.span`
  font-size: 1.6rem;
  font-weight: 700;
  color: #333;
  white-space: nowrap;
`;

export const InlineGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2.4rem;
`;

export const TitleGroup = styled.div`
  h2 {
    font-size: 2rem;
    font-weight: 700;
    color: #1d2129;
    margin-bottom: 0.8rem;
  }

  p {
    font-size: 1.4rem;
    color: #868e96;
  }
`;
