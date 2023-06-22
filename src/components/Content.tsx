import { useState } from "react";
import tw from "tailwind-styled-components";
import { type GetServerSideProps } from "next";
import axios from "axios";

import { DisplayMap } from "./DisplayMap";
import Chat from "./Chat";
import UploadJson from "./UploadJson";
import PineconeEmbeddings from "./PineconeEmbeddings";

export interface ChatHistoryProps {
  role: string;
  content: string;
}

interface VectorData {
  id: string;
  score: number;
  values: number[];
  sparseValues?: {
    indices?: number[];
    values?: number[];
  };
  metadata?: object;
}

interface ContentProps {
  vectors: VectorData[];
  tempQueryVector: number[];
}

const Content: React.FC<ContentProps> = ({ vectors, tempQueryVector }) => {
  const [oldEmbeddings, setOldEmbeddings] = useState<number[][]>([[]]);
  const [newEmbeddings, setNewEmbeddings] = useState<number[][]>(
    vectors.map((vector) => vector.values)
  );
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const [queryVector, setQueryVector] = useState<number[]>(tempQueryVector);

  const [metaLearned, setMetaLearned] = useState<boolean>(false);

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
      {metaLearned ? <DisplayMap embeddings={oldEmbeddings} /> : null}
      <DisplayMap embeddings={newEmbeddings} />
      <Chat />
      <UploadJson
        oldEmbeddings={oldEmbeddings}
        setOldEmbeddings={setOldEmbeddings}
        uploadStatus={uploadStatus}
        setUploadStatus={setUploadStatus}
        embedQueries={embedQueries}
      />
      <PineconeEmbeddings />
    </ContentContainer>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const randomStringToEmbed = "How was your day yesterday?";

  const embeddedString = await axios.post("/api/openai/embed", {
    texts: [randomStringToEmbed],
  });

  const vector: number[] = embeddedString.data;

  // Make your POST request
  const res = await axios.post("/api/pinecone/query", {
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENV,
    vector,
    indexName: process.env.PINECONE_INDEX_NAME,
  });

  // Check for errors
  if (res.status !== 200) {
    throw new Error(res.statusText);
  }

  // Extract the query data from the response
  const queryData = res.data;

  // Return the queryData as a prop
  return {
    props: {
      vectors: queryData,
      tempQueryVector: vector,
    },
  };
};

const ContentContainer = tw.div`
  flex 
  flex-grow 
  items-center 
  justify-center
  w-full
`;

export default Content;
