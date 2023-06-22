import tw from "tailwind-styled-components";
import { Text } from "~/styles/css";

const Footer: React.FC = () => (
  <FooterContainer>
    <Text>Built with Pinecone and Openai :)</Text>
  </FooterContainer>
);

export default Footer;

const FooterContainer = tw.footer`
    flex items-center justify-center px-4 py-8
`;
