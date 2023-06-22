import { type NextApiRequest, type NextApiResponse } from "next";
import { PineconeClient } from "@pinecone-database/pinecone";

const pinecone = new PineconeClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await pinecone.init({
    environment: process.env.PINECONE_ENV as string,
    apiKey: process.env.PINECONE_API_KEY as string,
  });

  if (req.method === "POST") {
    try {
      console.log(req.body);
      // Vector received from client
      const queryVector: number[] = req.body.vector;

      console.log(queryVector);

      const index = pinecone.Index(process.env.PINECONE_INDEX_NAME as string);

      const queryResponse = await index.query({
        queryRequest: { vector: queryVector, topK: 3, includeValues: true },
      });

      return res.status(200).json({ queries: queryResponse });
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
