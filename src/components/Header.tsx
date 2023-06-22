import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import tw from "tailwind-styled-components";

const Header: React.FC = () => (
  <HeaderContainer>
    <HeaderTitle>Isomorphic</HeaderTitle>
    <Link
      href="https://github.com"
      target="_blank"
      rel="noreferrer"
      className="text-2xl"
    >
      <FaGithub />
    </Link>
  </HeaderContainer>
);

export default Header;

const HeaderContainer = tw.header`
    flex 
    items-center 
    justify-between 
    px-4 
    py-8
    text-white
`;

const HeaderTitle = tw.h1`
    text-2xl 
    font-bold
`;
