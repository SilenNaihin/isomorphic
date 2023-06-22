import { useState } from "react";
import tw from "tailwind-styled-components";
import axios from "axios";

const Content: React.FC = () => {
  const [embeddings, setEmbeddings] = useState<number[][]>([[]]);

  const getEmbeddings = () => {
    console.log("hello");

    const embeddings = axios.post("/api/pinecone/query");
  };

  return (
    <ContentContainer>
      Content
      {/* <Chat />
      <UploadEmbeddings /> */}
    </ContentContainer>
  );
};

const ContentContainer = tw.div`
  flex 
  flex-grow 
  items-center 
  justify-center
`;

export default Content;
