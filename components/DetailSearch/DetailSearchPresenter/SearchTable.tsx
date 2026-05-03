"use client";

import React from "react";
import { Button, Input, Select, Tag } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import * as S from "../styles";

const { Option } = Select;
const dataSource = [
  {
    key: "1",
    date: "2025-01-01",
    scope: "SCOPE 1",
    type: "고정연소",
    description: "공장 보일러 (LNG)",
    usage: "500 m³",
    factor: "2.100",
    emission: "1,050.00",
  },
  {
    key: "2",
    date: "2025-01-01",
    scope: "SCOPE 2",
    type: "전기",
    description: "한국전력 본사",
    usage: "110 kWh",
    factor: "0.456",
    emission: "50.16",
  },
  {
    key: "3",
    date: "2025-01-01",
    scope: "SCOPE 3",
    type: "원소재",
    description: "플라스틱 1 (A사)",
    usage: "230 kg",
    factor: "2.300",
    emission: "529.00",
  },
  // ... 추가 데이터
];

const columns = [
  { title: "일자", dataIndex: "date", key: "date" },
  {
    title: "Scope",
    dataIndex: "scope",
    key: "scope",
    render: (text: string) => <S.ScopeTag $type={text}>{text}</S.ScopeTag>,
  },
  { title: "활동 유형", dataIndex: "type", key: "type" },
  { title: "설명", dataIndex: "description", key: "description" },
  {
    title: "사용량",
    dataIndex: "usage",
    key: "usage",
    align: "right" as const,
  },
  {
    title: "적용 계수",
    dataIndex: "factor",
    key: "factor",
    align: "right" as const,
  },
  {
    title: "배출량 (kgCO₂e)",
    dataIndex: "emission",
    key: "emission",
    align: "right" as const,
    render: (text: string) => <strong>{text}</strong>,
  },
];

export default function SearchTable() {
  return (
    <S.DetailSearchWrapper>
      <S.SearchHeader>
        <S.TitleGroup>
          <h2>상세 조건 내역</h2>
          <p>
            원하는 컬럼을 조합하여 조건을 추가한 뒤, 조회하기 버튼을 눌러주세요.
          </p>
        </S.TitleGroup>
        <S.ActionGroup>
          <Button icon={<PlusOutlined />}>조건 추가</Button>
          <Button type="primary" icon={<SearchOutlined />}>
            조회하기
          </Button>
          <Button icon={<DownloadOutlined />} danger>
            Excel 다운로드
          </Button>
        </S.ActionGroup>
      </S.SearchHeader>

      <S.FilterBar>
        <Tag
          color="blue"
          style={{ fontSize: "1.2rem", padding: "0.4rem 0.8rem" }}
        >
          WHERE
        </Tag>
        <Select defaultValue="desc" style={{ width: "15rem" }}>
          <Option value="desc">설명</Option>
          <Option value="type">활동 유형</Option>
        </Select>
        <Select defaultValue="contain" style={{ width: "12rem" }}>
          <Option value="contain">포함</Option>
          <Option value="equal">일치</Option>
        </Select>
        <Input
          placeholder="값을 입력하세요"
          style={{ flex: 1, height: "3.2rem" }}
        />
      </S.FilterBar>

      <S.StyledTable
        dataSource={dataSource}
        columns={columns}
        pagination={{
          total: 14,
          showSizeChanger: true,
          itemRender: (page, type, originalElement) => {
            if (type === "prev") return <a>이전</a>;
            if (type === "next") return <a>다음</a>;
            return originalElement;
          },
        }}
      />
    </S.DetailSearchWrapper>
  );
}
