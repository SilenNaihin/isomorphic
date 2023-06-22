/* eslint-disable */
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import tw from "tailwind-styled-components";
import { Text } from "~/styles/css";
import Image from "next/image";
import { ChatCompletionRequestMessageRoleEnum } from "openai";
import axios from "axios";

import { ChatHistoryProps } from "./Content";

const User: React.FC = () => {
  const router = useRouter();
  const [userMessage, setUserMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatHistoryProps[]>([]);

  const respondToChat = async () => {
    try {
      const embUserMessageResponse = await axios.post("/api/openai/embed", {
        texts: [userMessage],
      });

      const embUserMessage = embUserMessageResponse.data.vectors;

      try {
        const pineResponse = await axios.post(`/api/pinecone/query`, {
          vector: embUserMessage,
        });

        if (pineResponse.data) {
          const pineQueries = pineResponse.data.queries;

          const prompts = [];

          // Pushing the general clone prompt
          prompts.push({
            role: ChatCompletionRequestMessageRoleEnum.System,
            content: ``,
          });

          // Pushing the relevant information prompt
          if (pineResponse.data.queries.length) {
            const queriesContent: string[] = pineQueries.queries
              .map((query: any, i: number) => `${i + 1}. ${query}`)
              .join("\n");
            prompts.push({
              role: ChatCompletionRequestMessageRoleEnum.System,
              content: `Please consider the following information when forming your responses: 
${queriesContent}`,
            });
          }

          // Previous messages
          if (chatHistory.length) {
            const historyContent = chatHistory
              .map(
                (entry: ChatHistoryProps, i: number) =>
                  `${i + 1}. ${
                    entry.role === "assistant" ? "Response" : "User"
                  }: ${entry.content}`
              )
              .join("\n");
            prompts.push({
              role: ChatCompletionRequestMessageRoleEnum.System,
              content: `These are the previous messages for you to respond 
${historyContent}`,
            });
          }

          // Pushing the user prompt
          const userPrompt = {
            role: ChatCompletionRequestMessageRoleEnum.User,
            content: userMessage,
          };
          prompts.push(userPrompt);

          setChatHistory([...chatHistory, userPrompt]);
          setUserMessage("");

          const aiResponse = await axios.post("/api/openai", {
            prompts: prompts,
          });
          if (aiResponse.data.choices.length) {
            const aiContent = aiResponse.data.choices[0].message.content;
            // Append the received data to the chat history
            setChatHistory([
              ...chatHistory,
              userPrompt,
              { role: "assistant", content: aiContent },
            ]);
          } else {
            // Handle the case where the response does not contain the expected data
            console.error("Unexpected response format:", aiResponse);
          }
        } else {
          console.error("Unexpected response format:", pineResponse);
        }
      } catch (err) {
        console.error(err);
      }
    } catch (error) {
      console.error("Error getting embeddings: ", error);
    }
  };

  return (
    <ChatWrapper>
      {chatHistory.map((msg, index) => (
        <Text key={index}>
          {msg.role === "user" ? "User: " : "Response: "} {msg.content}
        </Text>
      ))}
      <UserInput
        type="text"
        value={userMessage}
        onChange={(e) => setUserMessage(e.target.value)}
        placeholder="Enter your message here"
        onKeyDown={(e) => {
          if (e.key == "Enter") {
            respondToChat;
          }
        }}
      />
      <SendButton onClick={respondToChat}>Send</SendButton>
    </ChatWrapper>
  );
};

export default User;

const ChatWrapper = tw.div`
  flex 
  flex-col
  items-center 
  justify-center
`;

const UserInput = tw.input`
  text-sm
  py-1
  px-2
  my-1
  rounded-lg
  w-64
`;

const SendButton = tw.button`
  rounded-lg
  py-1
  px-4
  bg-white
  float-left
  mr-auto
`;
