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
  const [chatHistory, setChatHistory] = useState<ChatHistoryProps[]>([
    { content: "How was your day yesterday?", role: "user" },
    {
      role: "assistant",
      content: "The sun shone bright upon the golden hair, I spent it writing",
    },
  ]);

  const respondToChat = async () => {
    try {
      const embUserMessageResponse = await axios.post("/api/openai/embed", {
        texts: [userMessage],
      });

      const embUserMessage = embUserMessageResponse.data.vectors;
      // TODO: make it so that the message gets added to the graph in a different color

      try {
        const prompts = [];

        // Pushing the general clone prompt
        prompts.push({
          role: ChatCompletionRequestMessageRoleEnum.System,
          content:
            "Act like William Shakespeare. Your responses should be in the format of a William Shakespeare poem, and embody the soul of William Shakespeare.",
        });

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

        console.log([...chatHistory, userPrompt]);

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
      } catch (err) {
        console.error(err);
      }
    } catch (error) {
      console.error("Error getting embeddings: ", error);
    }
  };

  return (
    <ChatContainer>
      <ChatWrapper>
        <Text className="bold">Fake chat with a William Shakespeare</Text>
        {chatHistory.map((msg, index) => (
          <ResponseText key={index}>
            {msg.role === "user" ? "User: " : "Response: "} {msg.content}
          </ResponseText>
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
        <ButtonsContainer>
        <SendButton onClick={respondToChat}><Text>Send</Text></SendButton>
        <ResetButton onClick={() => setChatHistory([])}>Reset</ResetButton>
        </ButtonsContainer>
      </ChatWrapper>
    </ChatContainer>
  );
};

export default User;

const ChatContainer = tw.div`
  flex 
  items-start 
  justify-center
  w-1/3
  px-4
`;

const ChatWrapper = tw.div`
  flex 
  flex-col
  items-start 
  justify-center
  overflow-hidden
`;

const UserInput = tw.input`
  text-sm
  py-1
  px-2
  my-1
  rounded-lg
  w-full
`;

const ButtonsContainer = tw.div`
  flex
  w-full
  justify-between
  mt-1
`

const SendButton = tw.button`
  rounded-lg
  py-1
  px-4
  bg-[#1B17F5]
    hover:bg-[#030080]
`;

const ResetButton = tw.button`
  rounded-lg
  py-1
  px-4
  bg-white
`;

const ResponseText = tw(Text)`
  overflow-hidden 
  overflow-ellipsis 
  w-full
`;
