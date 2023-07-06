import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "100mb",
      responseLimit: "100mb",
    },
    sizeLimit: "100mb",
    responseLimit: "100mb",
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    try {
      const { vectorMatches, reducedData, queryVector, queryName } = req.body;

      // Create queryVector object
      const queryVectorObj = {
        id: queryName,
        values: queryVector,
        reduced_values: reducedData[0],
        metadata: {
          author: "example",
          title: "example",
        },
        score: 1.0,
      };

      // Stringify the queryVectorObj
      const queryVectorStr = JSON.stringify(queryVectorObj, null, 2);

      // Save queryVectorObj to a file
      fs.writeFileSync(
        path.resolve("public", "example_query_vec1.json"),
        queryVectorStr
      );

      // Remove the first element
      reducedData.shift();
      vectorMatches.shift();

      // Assemble data into desired structure
      const dataToSave = {
        embeddings: reducedData,
        embeddingInfo: vectorMatches,
      };

      // Stringify the data
      const dataString = JSON.stringify(dataToSave, null, 2);

      // Save the data to a file
      fs.writeFileSync(
        path.resolve("public", "cached_vectors1.json"),
        dataString
      );

      return res.status(200).json({ message: "Successfully saved data." });
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
