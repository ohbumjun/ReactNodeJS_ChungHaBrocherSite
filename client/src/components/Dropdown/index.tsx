import React from "react";
import styled from "styled-components";
import { menuData } from "assets/data/MenuData";
import { Button } from "components/common/Button";
import { Link } from "react-router-dom";
import { FaTimes } from "react-icons/fa";

interface DropdownProps {
  isOpen: boolean;
  toggle: () => void;
}

const Dropdown = ({ isOpen, toggle }: DropdownProps) => {
  // isOpen, toggle 함수를 통해, 해당 요소 열고 닫고 조절
  return (
    <DropdownContainer isOpen={isOpen} onClick={toggle}>
      <Icon onClick={toggle}>
        <CloseIcon />
      </Icon>
      <DropdownWrapper>
        <DropdownMenu>
          {menuData.map((item, index) => (
            <DropdownLink to={item.link} key={index}>
              {item.title}
            </DropdownLink>
          ))}
        </DropdownMenu>
        <BtnWrap>
          {/* <Button primary='true' round='true' big='true' to='/contact'>
            Main Site
          </Button> */}
        </BtnWrap>
      </DropdownWrapper>
    </DropdownContainer>
  );
};

// isOpen 이라는 state 에 따라서, 열고 닫고 조절
interface DropdownContainerProps {
  isOpen: boolean;
}
const DropdownContainer = styled.div<DropdownContainerProps>`
  position: fixed;
  z-index: 999;
  width: 100%;
  height: 100%;
  background: #353866;
  display: grid;
  align-items: center;
  top: 0;
  left: 0;
  transition: 0.3s ease-in-out;
  opacity: ${({ isOpen }) => (isOpen ? "1" : "0")};
  // isOpen이 아닐때에는, 위에 있다가, 내려오는 개념
  top: ${({ isOpen }) => (isOpen ? "0" : "-100%")};
`;

const Icon = styled.div`
  position: absolute;
  top: 1.2rem;
  right: 1.5rem;
  background: transparent;
  font-size: 2rem;
  cursor: pointer;
  outline: none;
`;

const CloseIcon = styled(FaTimes)`
  color: #000d1a;
`;

const DropdownWrapper = styled.div``;

const DropdownMenu = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(4, 80px);
  text-align: center;
  margin-bottom: 4rem;

  @media screen and (max-width: 480px) {
    grid-template-rows: repeat(4, 60px);
  }
`;

// About, Homes, Rentals 등의 이동 링크 버튼들
const DropdownLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.5rem;
  text-decoration: none;
  list-style: none;
  color: #fff;
  cursor: pointer;
  transition: 0.2s ease-in-out;

  &:hover {
    color: #000d1a;
  }
`;

const BtnWrap = styled.div`
  display: flex;
  justify-content: center;
`;

export default Dropdown;
