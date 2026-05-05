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

import { NavItem, Overlay, SideNav } from "../Sidebar/sidebar";

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

        <Link href="/about" onClick={closeMenu}>
          <NavItem>About</NavItem>
        </Link>
        <Link href="/contact" onClick={closeMenu}>
          <NavItem>Contact</NavItem>
        </Link>
      </SideNav>
    </>
  );
}
