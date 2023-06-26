/* eslint-disable */
import { type NextApiRequest, type NextApiResponse } from "next";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  timeout: 2000,
  modelName: "text-embedding-ada-002",
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    try {
      const texts: string[] = req.body.texts;

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 300,
        chunkOverlap: 20,
      });

      const output = await splitter.createDocuments(texts);

      const pageContents = output.map((doc) => doc.pageContent);

      const documentRes = await embeddings.embedDocuments(pageContents);

      return res.status(200).json({ vectors: documentRes });
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
