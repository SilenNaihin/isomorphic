import React, { useState } from "react";
import tw from "tailwind-styled-components";

import { Text } from "~/styles/css";

const PineconeEmbeddings = () => {
  const [env, setEnv] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [indexName, setIndexName] = useState<string>("");

  const handleViewMyGraph = () => {
    // Implement logic to view the user's graph here
  };

  const handleViewExample = () => {
    // Implement logic to view an example graph here
  };

  return (
    <PineconeContainer>
      <UserInput
        placeholder="Pinecone env"
        value={env}
        onChange={(e) => setEnv(e.target.value)}
      />
      <UserInput
        placeholder="Index name"
        value={indexName}
        onChange={(e) => setIndexName(e.target.value)}
      />
      <UserInput
        type="password"
        placeholder="Pinecone API Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
      <Button onClick={handleViewMyGraph}>
        <Text>View My Graph</Text>
      </Button>
    </PineconeContainer>
  );
};

export default PineconeEmbeddings;

const PineconeContainer = tw.div`
    flex
    flex-col
    w-1/3
    items-center
`;

const UserInput = tw.input`
  text-sm
  py-1
  px-2
  my-1
  rounded-lg
  w-64
`;

const Button = tw.button`
    bg-[#1B17F5]
    hover:bg-[#030080]
    rounded-lg
    mt-1
    w-64
`;
