"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import {
  AppstoreOutlined,
  CalculatorOutlined,
  CloudUploadOutlined,
  RightOutlined,
} from "@ant-design/icons";
import {
  PageMain,
  SectionHeader,
  SurfaceSection,
  TitleGroup,
} from "@/components/common/styles";

const adminLinks = [
  {
    title: "활동 데이터 업로드",
    description: "엑셀 활동 데이터를 미리 확인한 뒤 DB에 업로드합니다.",
    href: "/admin/carbon-activities/import",
    icon: <CloudUploadOutlined />,
  },
  {
    title: "배출원 카테고리 관리",
    description: "배출원 유형별 Scope 분류를 등록하고 수정합니다.",
    href: "/admin/emission-categories",
    icon: <AppstoreOutlined />,
  },
  {
    title: "배출계수 관리",
    description: "배출원별 단위와 유효기간에 따른 배출계수를 관리합니다.",
    href: "/admin/emission-factors",
    icon: <CalculatorOutlined />,
  },
];

const AdminPageMain = styled(PageMain)``;

const AdminGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.6rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const AdminCard = styled(Link)`
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 18rem;
  gap: 1.6rem;
  border: 1px solid #e9ecef;
  border-radius: 0.8rem;
  background: #ffffff;
  padding: 2rem;
  color: inherit;
  text-decoration: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;

  &:hover {
    border-color: #1890ff;
    box-shadow: 0 0.8rem 2.4rem rgba(24, 144, 255, 0.12);
    transform: translateY(-0.2rem);
  }
`;

const CardIcon = styled.span`
  display: inline-flex;
  width: 4rem;
  height: 4rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.8rem;
  background: #f0f7ff;
  color: #1890ff;
  font-size: 2rem;
`;

const CardText = styled.div`
  min-width: 0;

  h3 {
    margin-bottom: 0.8rem;
    color: #1d2129;
    font-size: 1.55rem;
    font-weight: 600;
  }

  p {
    color: #6c757d;
    font-size: 1.2rem;
    line-height: 1.5;
  }
`;

const CardAction = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  color: #1890ff;
  font-size: 1.2rem;
  font-weight: 600;
`;

export default function AdminPage() {
  return (
    <AdminPageMain>
      <SurfaceSection>
        <SectionHeader>
          <TitleGroup>
            <h2>관리자</h2>
            <p>사용 가능한 관리자 기능으로 바로 이동합니다.</p>
          </TitleGroup>
        </SectionHeader>

        <AdminGrid>
          {adminLinks.map((item) => (
            <AdminCard key={item.href} href={item.href}>
              <CardIcon>{item.icon}</CardIcon>
              <CardText>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </CardText>
              <CardAction>
                바로가기
                <RightOutlined />
              </CardAction>
            </AdminCard>
          ))}
        </AdminGrid>
      </SurfaceSection>
    </AdminPageMain>
  );
}
