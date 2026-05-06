"use client";

import styled from "styled-components";
import { Tag } from "@/components/common/styles";

function getScopeTagColor(scope: string) {
  const normalizedScope = scope.toLowerCase().replace(/\s+/g, "");

  if (normalizedScope === "scope1") {
    return "#ff7a00";
  }

  if (normalizedScope === "scope2") {
    return "#1890ff";
  }

  if (normalizedScope === "scope3") {
    return "#52c41a";
  }

  return "#868e96";
}

export const ScopeTag = styled(Tag)<{ $scope: string }>`
  display: inline-flex;
  min-width: 5.4rem;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 99rem;
  background: ${({ $scope }) => getScopeTagColor($scope)};
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 600;
  line-height: 1.2;
  padding: 0.35rem 0.8rem;
  text-transform: uppercase;
  white-space: nowrap;
`;
