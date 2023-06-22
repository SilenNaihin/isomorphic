/* eslint-disable */
import { type NextApiRequest, type NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";

const pinecone = new PineconeClient();
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  timeout: 1000,
  modelName: "text-embedding-ada-002",
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await pinecone.init({
    environment: process.env.PINECONE_ENV as string,
    apiKey: process.env.PINECONE_API_KEY as string,
  });

  if (req.method === "POST") {
    try {
      const texts: string[] = req.body.texts;

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 300,
        chunkOverlap: 20,
      });

      const output = await splitter.createDocuments(texts);

      console.log(output);

      const pageContents = output.map((doc) => doc.pageContent);

      const documentRes = await embeddings.embedDocuments(pageContents);

      console.log(documentRes);

      const vectors = documentRes.map((values) => ({
        id: uuidv4(), // This generates a unique ID
        values,
      }));

      const index = pinecone.Index(process.env.PINECONE_INDEX_NAME as string);

      const upsertResponse = await index.upsert({
        upsertRequest: {
          vectors,
          namespace: "transcriptions",
        },
      });

      return res.status(200).json({
        upsertedCount: upsertResponse.upsertedCount,
        ids: vectors.map((v) => v.id),
      });
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
