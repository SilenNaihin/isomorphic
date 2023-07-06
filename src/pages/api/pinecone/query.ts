import { type NextApiRequest, type NextApiResponse } from "next";
import { PineconeClient, type ScoredVector } from "@pinecone-database/pinecone";
import _ from "lodash";

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
      topK = 10000;
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

      let vectorMatches: ScoredVector[] | undefined = queryResponse.matches;

      if (!vectorMatches) {
        return res.status(200).json({ vectorMatches: [], dataVectorArr: [] });
      }

      // Add position to each vector
      vectorMatches = vectorMatches.map((vector, i) => ({
        ...vector,
        position: i + 1, // add 1 to start positions at 1
      }));

      const vectorLimit = 125;

      // If there are less than vectorLimit vectors, return them directly
      if (vectorMatches.length <= vectorLimit) {
        const dataVectorArr = vectorMatches.map((vector) => vector.values);
        return res.status(200).json({ vectorMatches, dataVectorArr });
      }

      // Calculate limits
      const quarterLength = Math.min(
        Math.floor(vectorMatches.length / 4),
        Math.floor(vectorLimit / 4)
      );
      const middleLength = Math.min(
        vectorLimit - 2 * quarterLength,
        vectorMatches.length - 2 * quarterLength
      );

      // Get first 25% of most similar vectors
      const firstQuarter = vectorMatches.slice(0, quarterLength);

      // Get last 25% of least similar vectors
      const lastQuarter = vectorMatches.slice(
        vectorMatches.length - quarterLength
      );

      // Get a random distribution of middle 50% vectors
      const middleVectors = _.shuffle(
        vectorMatches.slice(quarterLength, vectorMatches.length - quarterLength)
      );
      const middleSelection = middleVectors.slice(0, middleLength);

      // Merge selections
      vectorMatches = [...firstQuarter, ...middleSelection, ...lastQuarter];

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
