import { type NextApiRequest, type NextApiResponse } from "next";
import axios from "axios";

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log(req.body);
  const { queryVectors } = req.body;

  if (req.method === "POST") {
    if (!queryVectors) {
      return res.status(400).json({ error: "Required parameters missing." });
    }

    try {
      console.log("queryVector", queryVectors);
      const reduction = process.env.REDUCTION_FUNCTION_URL as string;

      const response = await axios.post(reduction, {
        data: [queryVectors],
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
