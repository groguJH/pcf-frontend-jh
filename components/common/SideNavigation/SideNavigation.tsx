"use client";

import React, { JSX, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BugerMenuWrapper,
  CloseButton,
  HeaderContainer,
  LogoWrapper,
} from "../Header/header";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoClose } from "react-icons/io5";

import {
  NavItem,
  Overlay,
  SideNav,
  SubNavItem,
  SubNavList,
} from "../Sidebar/sidebar";

const navigationItems = [
  { label: "대시보드", href: "/" },
  {
    label: "관리자",
    href: "/admin",
    children: [
      { label: "활동 데이터 업로드", href: "/admin/carbon-activities/import" },
      { label: "배출원 카테고리 관리", href: "/admin/emission-categories" },
      { label: "배출계수 관리", href: "/admin/emission-factors" },
    ],
  },
];

export function SideNavigation(): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <HeaderContainer>
        <BugerMenuWrapper onClick={toggleMenu}>
          <GiHamburgerMenu />
        </BugerMenuWrapper>

        <Link href="/">
          <LogoWrapper>
            <Image
              src="/hanaloop-logo.png"
              alt="Company Logo"
              width={200}
              height={60}
              priority
            />
          </LogoWrapper>
        </Link>
      </HeaderContainer>

      <Overlay $isOpen={isOpen} onClick={closeMenu} />

      <SideNav $isOpen={isOpen}>
        {/* 수정된 부분: ButtonMenu 대신 CloseButton 사용 */}
        <CloseButton onClick={closeMenu}>
          <IoClose />
        </CloseButton>

        {navigationItems.map((item) => (
          <React.Fragment key={item.href}>
            <Link href={item.href} onClick={closeMenu}>
              <NavItem>{item.label}</NavItem>
            </Link>
            {item.children ? (
              <SubNavList>
                {item.children.map((child) => (
                  <Link key={child.href} href={child.href} onClick={closeMenu}>
                    <SubNavItem>{child.label}</SubNavItem>
                  </Link>
                ))}
              </SubNavList>
            ) : null}
          </React.Fragment>
        ))}
      </SideNav>
    </>
  );
}
