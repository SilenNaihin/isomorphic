/* eslint-disable */
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import tw from "tailwind-styled-components";
import { FlexBox, Text } from "~/styles/css";
import Image from "next/image";
import { ChatCompletionRequestMessageRoleEnum } from "openai";
import axios from "axios";

import { Tooltip as ReactTooltip } from "react-tooltip";
import { FiInfo, FiCheck } from "react-icons/fi";
import { splitAtSpaces } from "~/libs/utils";

import { ChatHistoryProps } from "./Content";

interface ChatProps {
  newQueryVector: (queryVector: number[], text: string) => Promise<void>;
  chatHistory: ChatHistoryProps[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatHistoryProps[]>>;
  setGraphLoading: React.Dispatch<React.SetStateAction<boolean>>;
  varsExist: boolean;
}

const Chat: React.FC<ChatProps> = ({
  newQueryVector,
  chatHistory,
  setChatHistory,
  setGraphLoading,
  varsExist,
}) => {
  const [userMessage, setUserMessage] = useState<string>("");
  const [character, setCharacter] = useState("William Shakespeare");
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(character);

  const [prompt, setPrompt] = useState<string>(
    `Act like ${character}. Your responses should be in the format of how ${character} would respond, and embody the soul of ${character}. Exaggerate what that looks like to be funny. Respond in one phrase, under 20 tokens.`
  );

  const maxChar = 55;
  const maxLength = 25;

  const [formattedPrompt, setFormattedPrompt] = useState<string>(
    splitAtSpaces(prompt, maxChar).join("<br>")
  );

  const handleEdit = () => {
    setTempName(character);
    setIsEditing(true);
  };

  const handleSubmit = () => {
    setCharacter(tempName);
    setIsEditing(false);
    const tempPrompt = `Act like ${tempName}. Your responses should be in the format of how ${tempName} would respond, and embody the soul of ${tempName}. Exaggerate what that looks like to be funny. Respond in one phrase, under 20 tokens.`;
    setPrompt(tempPrompt);
    setFormattedPrompt(splitAtSpaces(tempPrompt, maxChar).join("<br>"));
  };

  const respondToChat = async () => {
    if (userMessage === "") {
      return;
    }

    try {
      // Pushing the user prompt
      const userPrompt = {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: userMessage,
      };

      const previousResponse = chatHistory[chatHistory.length - 1];

      setChatHistory([...chatHistory, userPrompt]);
      setUserMessage("");

      setGraphLoading(true);

      const embeddingText = previousResponse
        ? "Previous response: " +
          previousResponse.content +
          "\n" +
          "User: " +
          userMessage
        : userMessage;

      console.log("Embedding text: ", embeddingText);

      const embUserMessageResponse = await axios.post("/api/openai/embed", {
        texts: [embeddingText],
      });

      try {
        const prompts = [];

        // Pushing the general clone prompt
        prompts.push({
          role: ChatCompletionRequestMessageRoleEnum.System,
          content: prompt,
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
        prompts.push(userPrompt);

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

          await newQueryVector(
            embUserMessageResponse.data.vectors[0],
            embeddingText
          );
          setGraphLoading(false);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const displayedCharacter =
    character.length > maxLength
      ? character.substring(0, maxLength) + "..."
      : character;

  return (
    <ChatContainer>
      <ChatWrapper>
        <FlexBox>
          <Text className="bold mr-2" onClick={handleEdit}>
            Fake chat with
          </Text>
          {isEditing ? (
            <CharacterInput
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={handleKeyDown}
              size={
                tempName.length > maxLength
                  ? maxLength
                  : tempName.length > 0
                  ? tempName.length
                  : 1
              }
            />
          ) : (
            <span
              className="cursor-pointer overflow-ellipsis whitespace-nowrap"
              onClick={handleEdit}
            >
              <Text className="border-b font-bold">{displayedCharacter}</Text>
            </span>
          )}
          {isEditing && (
            <FiCheck
              className="ml-2 cursor-pointer"
              size={24}
              color="white"
              onClick={handleSubmit}
            />
          )}
          <Info
            data-tooltip-id="format info"
            data-tooltip-html={`<b>Full prompt</b> <br> 
            ${formattedPrompt}`}
          >
            <FiInfo size={16} className="ml-2" />
          </Info>
          <ReactTooltip id="format info" style={{ backgroundColor: "black" }} />
        </FlexBox>
        <HistoryWrapper>
          {chatHistory.map((msg, index) => (
            <ResponseText key={index}>
              <b>{msg.role === "user" ? "User: " : "Response: "}</b>{" "}
              {msg.content}
            </ResponseText>
          ))}
        </HistoryWrapper>
        <UserInput
          type="text"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          placeholder="Enter your message here"
          onKeyDown={(e) => {
            if (e.key == "Enter") {
              respondToChat();
            }
          }}
        />
        <ButtonsContainer>
          <ResetButton onClick={() => setChatHistory([])}>Reset</ResetButton>
          <SendButton onClick={respondToChat}>
            <Text>Send</Text>
          </SendButton>
        </ButtonsContainer>
      </ChatWrapper>
    </ChatContainer>
  );
};

export default Chat;

const ChatContainer = tw.div`
  flex 
  items-center 
  justify-center
  h-3/5
  mt-4
`;

const ChatWrapper = tw.div`
  flex 
  flex-col
  w-full
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
  justify-between
  w-full
  mt-1
`;

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

const CharacterInput = tw.input`
  border-b 
  border-white 
  bg-white
  bg-opacity-20
  pl-1
  text-white 
  outline-none
`;

const ResponseText = tw(Text)`
  overflow-hidden 
  overflow-ellipsis 
  w-full
`;

const Info = tw.div`
  text-sm
  text-gray-400
`;

const HistoryWrapper = tw.div`
  max-h-48
  overflow-auto
  mb-2
`;
