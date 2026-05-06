"use client";

import styled from "styled-components";

// 헤더 레이아웃, 햄버거메뉴, 로고스타일 정의
export const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 7vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5vw;
  background-color: #fff;
  z-index: 100;
`;

export const BugerMenuWrapper = styled.div`
  position: absolute;
  left: 5vw;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 2.5rem;
  color: #333;

  &:hover {
    color: #7b7f83;
  }
`;

export const CloseButton = styled.button`
  align-self: flex-start;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 2.5rem;
  color: #333;
  padding: 0;
  margin-bottom: 3vh;

  &:hover {
    color: #7b7f83;
  }
`;

export const LogoWrapper = styled.div`
  width: 30vw;
  max-width: 10rem;
  display: flex;
  justify-content: center;

  img {
    width: 70%;
    height: auto;
    min-height: 2rem;
    object-fit: contain;
  }
`;
