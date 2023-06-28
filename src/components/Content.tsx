import { useState, useEffect } from "react";
import tw from "tailwind-styled-components";
import axios from "axios";

import { type ContentProps, type QueryVector } from "../pages/index";

import DisplayMap from "./DisplayMap";
import Chat from "./Chat";
import UploadJson from "./UploadJson";
import PineconeEmbeddings from "./PineconeEmbeddings";

export interface ChatHistoryProps {
  role: string;
  content: string;
}

const Content: React.FC<ContentProps> = ({
  vectors,
  dataVectorArr,
  tempQueryVector,
}) => {
  const [oldEmbeddings, setOldEmbeddings] = useState<number[][]>(dataVectorArr);
  const [newEmbeddings, setNewEmbeddings] = useState<number[][]>([[]]);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const [queryVector, setQueryVector] = useState<QueryVector>(tempQueryVector);

  const [metaLearned, setMetaLearned] = useState<boolean>(false);
  const [graphLoading, setGraphLoading] = useState<boolean>(true);

  const [env, setEnv] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [indexName, setIndexName] = useState<string>("");
  const [varsExist, setVarsExist] = useState<boolean>(false);

  const [chatHistory, setChatHistory] = useState<ChatHistoryProps[]>([
    { content: "How was your day yesterday?", role: "user" },
    {
      role: "assistant",
      content: "The sun shone bright upon the golden hair, I spent it writing",
    },
  ]);

  const reducedEmbeddings = async (
    dataVectorArr: number[][]
  ): Promise<number[][]> => {
    const reducedVectors = await axios.post("/api/reduce", {
      queryVectors: dataVectorArr,
    });

    return JSON.parse(reducedVectors.data.body);
  };

  const newQueryVector = async (queryVector: number[], text: string) => {
    try {
      let res = null;
      if (!varsExist) {
        res = await axios.post(`/api/pinecone/query`, {
          vector: queryVector,
        });
      } else {
        res = await axios.post(`/api/pinecone/query`, {
          apiKey: apiKey,
          environment: env,
          vector: queryVector,
          indexName: indexName,
        });
      }

      if (res.status !== 200) {
        throw new Error(res.statusText);
      }

      // Extract the query data from the response
      const { dataVectorArr } = res.data;

      console.log([queryVector, ...dataVectorArr]);

      const reducedData = await reducedEmbeddings([
        queryVector,
        ...dataVectorArr,
      ]);
      const firstVector = reducedData.shift() || [];

      setOldEmbeddings(reducedData);
      setQueryVector({
        vector: firstVector,
        text: text,
        fullVector: queryVector,
      });
    } catch (error: any) {
      console.log(error);
      setVarsExist(false);
    }
  };

  const embedQueries = async (texts: string[]): Promise<number[][]> => {
    try {
      // Send a post request to the /api/pinecone/upsert API route
      const response = await axios.post("/api/openai/embed", {
        texts: texts,
      });

      setUploadStatus("File successfully embedded");
      return response.data;
    } catch (error: any) {
      setUploadStatus(`Error processing file: ${error.message}`);
      return [];
    }
  };

  const pineconeUpsert = async (vectors: number[][], texts?: string[]) => {
    try {
      const response = await axios.post("/api/pinecone/upsert", {
        apiKey: apiKey,
        environment: env,
        vectors: vectors,
        texts: texts,
        indexName: indexName,
      });

      setUploadStatus("Uploaded to Pinecone successfully");
    } catch (error: any) {
      setUploadStatus(`Error processing file: ${error.message}`);
    }
  };

  return (
    <ContentContainer>
      <DisplayMap
        fullEmbeddings={vectors}
        embeddings={oldEmbeddings}
        graphLoading={graphLoading}
        setGraphLoading={setGraphLoading}
        queryPoint={queryVector}
      />
      {metaLearned ? (
        <DisplayMap
          fullEmbeddings={vectors}
          embeddings={newEmbeddings}
          graphLoading={graphLoading}
          setGraphLoading={setGraphLoading}
          queryPoint={queryVector}
        />
      ) : null}
      <UploadContainer>
        <Chat
          newQueryVector={newQueryVector}
          chatHistory={chatHistory}
          setChatHistory={setChatHistory}
          setGraphLoading={setGraphLoading}
          varsExist={varsExist}
        />
        <PineconeEmbeddings
          queryVector={queryVector}
          env={env}
          setEnv={setEnv}
          apiKey={apiKey}
          setApiKey={setApiKey}
          indexName={indexName}
          setIndexName={setIndexName}
          varsExist={varsExist}
          setVarsExist={setVarsExist}
          setChatHistory={setChatHistory}
          setOldEmbeddings={setOldEmbeddings}
          reducedEmbeddings={reducedEmbeddings}
        />
        <UploadJson
          oldEmbeddings={oldEmbeddings}
          setOldEmbeddings={setOldEmbeddings}
          uploadStatus={uploadStatus}
          setUploadStatus={setUploadStatus}
          embedQueries={embedQueries}
          varsExist={varsExist}
          pineconeUpsert={pineconeUpsert}
          reducedEmbeddings={reducedEmbeddings}
        />
      </UploadContainer>
    </ContentContainer>
  );
};

const ContentContainer = tw.div`
  flex 
  flex-col
  flex-grow 
  items-center 
  justify-center
  w-full
`;

const UploadContainer = tw.div`
  flex
  items-center 
  justify-evenly
  w-full
  mt-8
`;

export default Content;
