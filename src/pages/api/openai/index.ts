import { type NextApiRequest, type NextApiResponse } from "next";
import { openai } from "src/libs/openai";
import { type ChatCompletionRequestMessageRoleEnum } from "openai";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { prompts } = req.body as {
    prompts: { role: ChatCompletionRequestMessageRoleEnum; content: string }[];
  };

  if (req.method !== "POST") {
    return res.status(400).json({ error: "Invalid request" });
  }

  console.log(prompts);

  try {
    const response = await openai.createChatCompletion({
      messages: prompts,
      model: "gpt-3.5-turbo",
      max_tokens: 20,
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error in openai.createChatCompletion:", error);
    return res.status(500).json({
      error: "Failed to create chat completion",
      details: error,
    });
  }
};

export default handler;
