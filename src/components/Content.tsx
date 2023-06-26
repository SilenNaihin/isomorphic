import { useState, useEffect } from "react";
import tw from "tailwind-styled-components";
import axios from "axios";

import { type ContentProps } from "../pages/index";

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

  const [queryVector, setQueryVector] = useState<number[]>(tempQueryVector);

  const [metaLearned, setMetaLearned] = useState<boolean>(false);
  const [graphLoading, setGraphLoading] = useState<boolean>(true);

  useEffect(() => {
    if (vectors) {
      setTimeout(() => {
        setGraphLoading(false);
      }, 2000);
    }
  }, [vectors]);

  const embedQueries = async (data: ChatHistoryProps | string[]) => {
    try {
      // Send a post request to the /api/pinecone/upsert API route
      const response = await axios.post("/api/pinecone/upsert", {
        texts: data,
      });

      // Update embeddings state
      setOldEmbeddings(oldEmbeddings.concat(response.data));
      setUploadStatus("File uploaded and processed successfully");
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
      />
      {metaLearned ? (
        <DisplayMap
          fullEmbeddings={vectors}
          embeddings={newEmbeddings}
          graphLoading={graphLoading}
        />
      ) : null}
      <UploadContainer>
        <Chat />
        <PineconeEmbeddings />
        <UploadJson
          oldEmbeddings={oldEmbeddings}
          setOldEmbeddings={setOldEmbeddings}
          uploadStatus={uploadStatus}
          setUploadStatus={setUploadStatus}
          embedQueries={embedQueries}
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
