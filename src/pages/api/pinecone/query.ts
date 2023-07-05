import { type NextApiRequest, type NextApiResponse } from "next";
import { PineconeClient, type ScoredVector } from "@pinecone-database/pinecone";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  let { apiKey, environment, indexName, topK } = req.body;
  const { vector } = req.body;

  if (req.method === "POST") {
    if (!vector) {
      return res.status(400).json({ error: "Required parameters missing." });
    }
    if (!apiKey || !environment || !indexName) {
      apiKey = process.env.PINECONE_API_KEY;
      environment = process.env.PINECONE_ENV;
      indexName = process.env.PINECONE_INDEX_NAME;
    }
    if (!topK) {
      topK = 125;
    }

    try {
      const pinecone = new PineconeClient();
      await pinecone.init({
        environment,
        apiKey,
      });

      const index = pinecone.Index(indexName);

      const queryResponse = await index.query({
        queryRequest: {
          vector,
          topK: topK,
          includeValues: true,
          includeMetadata: true,
        },
      });

      const vectorMatches: ScoredVector[] | undefined = queryResponse.matches;

      if (!vectorMatches) {
        return res.status(200).json({ vectorMatches: [], dataVectorArr: [] });
      }

      const dataVectorArr = vectorMatches.map((vector) => vector.values);

      return res.status(200).json({ vectorMatches, dataVectorArr });
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
