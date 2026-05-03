"use client";
import React from "react";
import * as S from "@/components/Dashboard/styles";

export default function ChartCardSection() {
  return (
    <>
      <S.ChartCardWrapper>
        <S.ChartCard>
          <S.CardTitle>총 탄소 배출량</S.CardTitle>
          <S.CardValueWrapper>
            <S.CardValue>2,150.00</S.CardValue>
            <S.CardUnit>톤</S.CardUnit>
          </S.CardValueWrapper>
        </S.ChartCard>
        <S.ChartCard>
          <S.CardTitle>직접 배출</S.CardTitle>
          <S.CardValueWrapper>
            <S.CardValue>2,150.00</S.CardValue>
            <S.CardUnit>톤</S.CardUnit>
          </S.CardValueWrapper>
        </S.ChartCard>
        <S.ChartCard>
          <S.CardTitle>간접 배출</S.CardTitle>
          <S.CardValueWrapper>
            <S.CardValue>2,150.00</S.CardValue>
            <S.CardUnit>톤</S.CardUnit>
          </S.CardValueWrapper>
        </S.ChartCard>
        <S.ChartCard>
          <S.CardTitle>가치 사슬</S.CardTitle>
          <S.CardValueWrapper>
            <S.CardValue>2,150.00</S.CardValue>
            <S.CardUnit>톤</S.CardUnit>
          </S.CardValueWrapper>
        </S.ChartCard>
      </S.ChartCardWrapper>
    </>
  );
}
