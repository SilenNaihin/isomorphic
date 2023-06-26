import { type NextApiRequest, type NextApiResponse } from "next";
import { PineconeClient, type ScoredVector } from "@pinecone-database/pinecone";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { apiKey, environment, vector, indexName } = req.body;

  if (req.method === "POST") {
    if (!apiKey || !environment || !vector || !indexName) {
      return res.status(400).json({ error: "Required parameters missing." });
    }

    try {
      const pinecone = new PineconeClient();
      await pinecone.init({
        environment,
        apiKey,
      });

      const index = pinecone.Index(indexName);

      const queryResponse = await index.query({
        queryRequest: { vector, topK: 10000, includeValues: true },
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
