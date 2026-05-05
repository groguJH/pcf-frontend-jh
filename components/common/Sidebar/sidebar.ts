"use client";

import styled from "styled-components";

// 사이드바 레이아웃, 네비게이션 아이템, 오버레이 스타일 정의
export const SideNav = styled.nav<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 75vw;
  max-width: 20rem;
  height: 100vh;
  background-color: #fff;
  z-index: 2000;
  transform: ${({ $isOpen }) =>
    $isOpen ? "translateX(0)" : "translateX(-100%)"};
  transition: transform 0.3s ease-in-out;
  box-shadow: 0.5rem 0 1.5rem rgba(0, 0, 0, 0.1);
  padding: 2.9vh 5vw;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const NavItem = styled.div`
  font-size: 1.8rem;
  font-weight: 600;
  cursor: pointer;
  color: #333;

  &:hover {
    color: #0070f3;
  }
`;

export const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
  z-index: 1500;
`;
