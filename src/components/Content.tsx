import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import tw from "tailwind-styled-components";
import axios from "axios";

import { type ContentProps, type QueryVector } from "../pages/index";

import DisplayMap from "./DisplayMap";
import Chat from "./Chat";
import UploadJson from "./UploadJson";
import PineconeEmbeddings from "./PineconeEmbeddings";

import { Text } from "~/styles/css";
import { type ModifiedVector } from "~/pages/index";

export interface ChatHistoryProps {
  role: string;
  content: string;
}

enum DropdownOptions {
  EXAMPLE = "example",
  CUSTOM = "custom",
}

const Content: React.FC<ContentProps> = ({
  vectors,
  dataVectorArr,
  tempQueryVector,
}) => {
  // const [newEmbeddings, setNewEmbeddings] = useState<number[][]>([[]]);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const [oldEmbeddings, setOldEmbeddings] = useState<number[][]>(dataVectorArr);
  const [queryVector, setQueryVector] = useState<QueryVector>(tempQueryVector);
  const [fullEmbeddings, setFullEmbeddings] =
    useState<ModifiedVector[]>(vectors);

  const exampleOldEmbeddings: number[][] = dataVectorArr;
  const exampleQueryVector: QueryVector = tempQueryVector;
  const exampleFullEmbeddings: ModifiedVector[] = vectors;

  // const [metaLearned, setMetaLearned] = useState<boolean>(false);
  const [graphLoading, setGraphLoading] = useState<boolean>(true);
  const [example, setExample] = useState<boolean>(true);

  const [env, setEnv] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [indexName, setIndexName] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<DropdownOptions>(
    DropdownOptions.EXAMPLE
  );
  const [varsExist, setVarsExist] = useState<boolean>(false);
  const [tempVarsExist, setTempVarsExist] = useState<boolean>(false);

  const [chatHistory, setChatHistory] = useState<ChatHistoryProps[]>([
    { content: "How was thy day on the last morrow sir?", role: "user" },
    {
      role: "assistant",
      content:
        "Good sir, my day hath been as merry as a troupe of jesters frolicking in the summer morn.",
    },
  ]);

  const reducedEmbeddings = async (
    dataVectorArr: number[][]
  ): Promise<number[][]> => {
    const reducedVectors = await axios.post(
      process.env.NEXT_PUBLIC_REDUCE_API_URL as string,
      {
        data: dataVectorArr,
      }
    );

    console.log(reducedVectors.data);

    return reducedVectors.data;
  };

  const newQueryVector = async (
    queryVector: number[],
    text: string
  ): Promise<void> => {
    try {
      let res = null;
      if (!varsExist && !tempVarsExist) {
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
      toast.success('Querying Pinecone successful');

      // Extract the query data from the response
      const { dataVectorArr, vectorMatches } = res.data;

      const reducedData = await reducedEmbeddings([
        queryVector,
        ...dataVectorArr,
      ]);

      toast.success('Reducing dimensionality successful, graph loaded');

      // const cached = await axios.post(`/api/cache`, {
      //   vectorMatches,
      //   reducedData,
      //   queryVector,
      //   queryName: text,
      // });

      // console.log(cached);

      const firstVector = reducedData.shift() || [];

      setFullEmbeddings(vectorMatches);
      setOldEmbeddings(reducedData);
      setQueryVector({
        vector: firstVector,
        text: text,
        fullVector: queryVector,
      });
    } catch (error: any) {
      console.log(error);
      toast.error(`Error processing file: ${error.message}`);
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

      if (response.status !== 200) {
        throw new Error("Error uploading to Pinecone");
      }

      setUploadStatus("Uploaded to Pinecone successfully");
    } catch (error: any) {
      setUploadStatus(`Error processing file: ${error.message}`);
    }
  };

  useEffect(() => {
    setTempVarsExist(varsExist);
  }, [varsExist]);

  useEffect(() => {
    if (selectedOption === DropdownOptions.EXAMPLE) {
      setExample(true);
    } else {
      setTempVarsExist(false);
    }
  }, [selectedOption]);

  return (
    <ContentContainer>
      <MapContainer>
        <DisplayMap
          fullEmbeddings={example ? exampleFullEmbeddings : fullEmbeddings}
          embeddings={example ? exampleOldEmbeddings : oldEmbeddings}
          graphLoading={graphLoading}
          setGraphLoading={setGraphLoading}
          queryPoint={example ? exampleQueryVector : queryVector}
        />
        {/* {metaLearned ? (
          <DisplayMap
            fullEmbeddings={vectors}
            embeddings={newEmbeddings}
            graphLoading={graphLoading}
            setGraphLoading={setGraphLoading}
            queryPoint={queryVector}
          />
        ) : null} */}
      </MapContainer>
      <ChatContainer>
        <SelectContainer>
          <Select
            value={selectedOption}
            onChange={(e) => {
              setSelectedOption(e.target.value as DropdownOptions);
            }}
          >
            <option value={DropdownOptions.EXAMPLE}>Example Embeddings</option>
            <option value={DropdownOptions.CUSTOM}>Custom Embeddings</option>
          </Select>
          <DropdownContainer>
            {selectedOption === "example" ? (
              <Text className="text-center">
                Embeddings for 400+ poems from famous authors. Metadata are
                poem&#39;s author and poem title.
              </Text>
            ) : (
              <UploadContainer>
                <PineconeEmbeddings
                  queryVector={queryVector}
                  env={env}
                  setEnv={setEnv}
                  apiKey={apiKey}
                  setApiKey={setApiKey}
                  indexName={indexName}
                  setIndexName={setIndexName}
                  varsExist={varsExist && tempVarsExist}
                  setVarsExist={setVarsExist}
                  setChatHistory={setChatHistory}
                  setOldEmbeddings={setOldEmbeddings}
                  reducedEmbeddings={reducedEmbeddings}
                />
                {/* <UploadJson
                  oldEmbeddings={oldEmbeddings}
                  setOldEmbeddings={setOldEmbeddings}
                  uploadStatus={uploadStatus}
                  setUploadStatus={setUploadStatus}
                  embedQueries={embedQueries}
                  varsExist={varsExist}
                  pineconeUpsert={pineconeUpsert}
                  reducedEmbeddings={reducedEmbeddings}
                /> */}
              </UploadContainer>
            )}
          </DropdownContainer>
        </SelectContainer>
        <Chat
          newQueryVector={newQueryVector}
          chatHistory={chatHistory}
          setChatHistory={setChatHistory}
          setGraphLoading={setGraphLoading}
          varsExist={varsExist && tempVarsExist}
        />
      </ChatContainer>
    </ContentContainer>
  );
};

const MapContainer = tw.div`
  flex
  flex-col
  items-center
  justify-center
  md:w-[45%]
  w-full
  h-full
`;

const ContentContainer = tw.div`
  flex
  flex-col
  md:flex-row 
  items-center
  justify-center
  w-full
  h-full
`;

const ChatContainer = tw.div`
  flex
  flex-col
  justify-between
  h-full
  w-full
  mt-8

  px-4
  md:w-[55%]
  md:mt-0
`;

const UploadContainer = tw.div`
  flex
  items-center 
  justify-between
  w-full
`;

const SelectContainer = tw.div`
  flex
  items-center
  justify-between
  flex-col
  h-2/5
  w-full
`;

const DropdownContainer = tw.div`
  flex
  items-center
  justify-center
  md:h-full
  w-full
  h-64
`;

const Select = tw.select`
  block 
  w-full 
  py-1
  px-3
  border 
bg-white 
  rounded-lg shadow-sm 
  focus:outline-none 
  focus:ring-indigo-500 
  focus:border-indigo-500 
  text-sm
`;

export default Content;
