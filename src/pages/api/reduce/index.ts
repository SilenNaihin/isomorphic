import { type NextApiRequest, type NextApiResponse } from "next";
import axios from "axios";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { queryVector } = req.body;

  if (req.method === "POST") {
    if (!queryVector) {
      return res.status(400).json({ error: "Required parameters missing." });
    }

    try {
      console.log("queryVector", queryVector);
      const reduction = process.env.REDUCTION_FUNCTION_URL as string;

      const response = await axios.post(reduction, {
        data: [queryVector],
      });

      if (response.data) {
        const reducedVectors = JSON.parse(response.data.body);
        return res.status(200).json({ reducedVectors });
      } else {
        return res
          .status(500)
          .json({ error: "Error in processing the request" });
      }
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
