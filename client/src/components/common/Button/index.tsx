import styled from "styled-components";
import { Link } from "react-router-dom";

interface ButtonProp {
  primary?: string;
  big?: boolean;
  round?: boolean;
  maxcontrol?: string;
}

export const Button = styled(Link)<ButtonProp>`
  background: ${({ primary }) => (primary ? "#000d1a" : "#CBA6C3")};
  white-space: nowrap;
  outline: none;
  border: none;
  width: fit-content;
  max-width: ${({ maxcontrol }) => (maxcontrol == "true" ? "160px" : "250px")};
  cursor: pointer;
  text-decoration: none;
  transition: 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ big }) => (big ? "16px 40px" : "14px 24px")};
  color: ${({ primary }) => (primary ? "#fff" : "#000d1a")};
  font-size: ${({ big }) => (big ? "20px" : "14px")};
  border-radius: ${({ round }) => (round ? "50px" : "0px")};

  &:hover {
    transform: translateY(-2px);
  }
`;
