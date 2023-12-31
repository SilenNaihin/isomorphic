import React from "react";
import tw from "tailwind-styled-components";
import axios from "axios";
import { type ChatHistoryProps } from "./Content";
import { ModifiedVector, type QueryVector } from "../pages/index";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { FiInfo } from "react-icons/fi";

import { Text, FlexBox } from "~/styles/css";

interface PineconeEmbeddingsProps {
  queryVector: QueryVector;
  env: string;
  setEnv: React.Dispatch<React.SetStateAction<string>>;
  apiKey: string;
  setApiKey: React.Dispatch<React.SetStateAction<string>>;
  indexName: string;
  setIndexName: React.Dispatch<React.SetStateAction<string>>;
  varsExist: boolean;
  setVarsExist: React.Dispatch<React.SetStateAction<boolean>>;
  setChatHistory: React.Dispatch<React.SetStateAction<ChatHistoryProps[]>>;
  setOldEmbeddings: React.Dispatch<
    React.SetStateAction<number[][] | undefined>
  >;
  reducedEmbeddings: (dataVectorArr: number[][]) => Promise<number[][]>;
  setFullEmbeddings: React.Dispatch<
    React.SetStateAction<ModifiedVector[] | undefined>
  >;
  setQueryVector: React.Dispatch<React.SetStateAction<QueryVector | undefined>>;
  setGraphLoading: React.Dispatch<React.SetStateAction<boolean>>;
  newQueryVector: (
    vector: number[],
    text: string,
    checkVars?: boolean
  ) => Promise<void>;
}

const PineconeEmbeddings: React.FC<PineconeEmbeddingsProps> = ({
  queryVector,
  env,
  setEnv,
  apiKey,
  setApiKey,
  indexName,
  setIndexName,
  varsExist,
  setVarsExist,
  setChatHistory,
  setOldEmbeddings,
  reducedEmbeddings,
  setFullEmbeddings,
  setQueryVector,
  setGraphLoading,
  newQueryVector,
}) => {
  const handleCheckEmbeddings = async () => {
    setGraphLoading(true);
    await newQueryVector(queryVector.fullVector, queryVector.text, true);

    setVarsExist(true);
    setGraphLoading(false);
  };

  return (
    <PineconeContainer>
      {!varsExist ? (
        <VarsContainer>
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
          <Button onClick={handleCheckEmbeddings}>
            <Text>Use my embeddings</Text>
          </Button>
        </VarsContainer>
      ) : (
        <div className="w-4/5 text-center">
          <Text>
            <b>Comparison query:</b> <i>{`'${queryVector.text}'`}</i>
          </Text>
          <FlexBox className="mt-4">
            <Text>How to query</Text>
            <Info
              data-tooltip-id="format info"
              data-tooltip-html={`Send a message below to query your Pinecone index <br>`}
            >
              <FiInfo size={16} className="ml-2" />
            </Info>
            <ReactTooltip
              id="format info"
              style={{ backgroundColor: "black" }}
            />
          </FlexBox>
        </div>
      )}
    </PineconeContainer>
  );
};

export default PineconeEmbeddings;

const PineconeContainer = tw.div`
    flex
    flex-col
    w-full
    items-center
`;

const VarsContainer = tw.div`
    flex
    flex-col
    items-center
    w-full
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

const Info = tw.div`
  text-sm
  text-gray-400
`;
