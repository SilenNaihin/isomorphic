/* eslint-disable */
import { type NextApiRequest, type NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";

const pinecone = new PineconeClient();
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { apiKey, environment, indexName, vectors, texts } = req.body;

  if (req.method === "POST") {
    try {
      if (!vectors || !apiKey || !environment || !indexName) {
        return res.status(400).json({ error: "Required parameters missing." });
      }

      await pinecone.init({
        environment: environment,
        apiKey: apiKey,
      });

      const pineconeVectors = vectors.map((values: number[], i: number) => {
        const vector = {
          id: uuidv4(), // This generates a unique ID
          type: req.body.type,
          values,
        };

        return texts ? { ...vector, metadata: { text: texts[i] } } : vector;
      });

      const index = pinecone.Index(indexName);

      const upsertResponse = await index.upsert({
        upsertRequest: {
          vectors: pineconeVectors,
        },
      });

      return res.status(200).json({
        upsertedCount: upsertResponse.upsertedCount,
        ids: pineconeVectors.map((v: any) => v.id),
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
