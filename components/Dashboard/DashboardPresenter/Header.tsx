"use client";
import React from "react";
import * as S from "@/components/Dashboard/styles";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { Button, message, Upload } from "antd";

export default function DashboardHeader() {
  const props: UploadProps = {
    name: "file",
    action: "https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload",
    headers: {
      authorization: "authorization-text",
    },

    onChange(info) {
      if (info.file.status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === "done") {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  return (
    <>
      <S.DashboardHeader>
        <h1>탄소발자국(PCF) 대시보드</h1>
        <p>
          실무자 및 경영자를 위한 제품 탄소발자국 전과정 데이터 시각화 대시보드
        </p>
      </S.DashboardHeader>
      <S.ButtonSection>
        <Upload {...props}>
          <Button icon={<UploadOutlined />}>Excel 가져오기</Button>
        </Upload>
        <Button>리포트 다운로드</Button>
      </S.ButtonSection>
    </>
  );
}
