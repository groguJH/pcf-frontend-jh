import type { Metadata } from "next";
import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import StyledComponentsRegistry from "@/lib/registry";
import { SideNavigation } from "@/components/common/SideNavigation/SideNavigation";

export const metadata: Metadata = {
  title: "PCF Carbon Dashboard",
  description:
    "실무자 및 경영자를 위한 제품 탄소발자국 전과정 데이터 시각화 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <AntdRegistry>
          <StyledComponentsRegistry>
            <SideNavigation />
            {children}
          </StyledComponentsRegistry>
        </AntdRegistry>
      </body>
    </html>
  );
}
