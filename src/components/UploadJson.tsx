import React, { useCallback, type SetStateAction, type Dispatch } from "react";
import { useDropzone, type FileWithPath } from "react-dropzone";
import tw from "tailwind-styled-components";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { FiInfo } from "react-icons/fi";

import { type ChatHistoryProps } from "./Content";
import { Text } from "~/styles/css";

interface UploadJsonProps {
  oldEmbeddings: number[][];
  setOldEmbeddings: Dispatch<SetStateAction<number[][]>>;
  uploadStatus: string;
  setUploadStatus: Dispatch<SetStateAction<string>>;
  embedQueries: (data: ChatHistoryProps | string[]) => void;
}

const UploadJson: React.FC<UploadJsonProps> = ({
  oldEmbeddings,
  setOldEmbeddings,
  uploadStatus,
  setUploadStatus,
  embedQueries,
}) => {
  const onDrop = useCallback(async (acceptedFiles: FileWithPath[]) => {
    for (const file of acceptedFiles) {
      await new Promise<void>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          const fileAsBinaryString: string | ArrayBuffer | null = reader.result;
          let data;

          if (typeof fileAsBinaryString === "string") {
            data = JSON.parse(fileAsBinaryString) as string;
          } else {
            setUploadStatus("Invalid file format");
            return;
          }

          if (Array.isArray(data)) {
            // Check if file.data is an array of {"role": str, "content": str} pairs
            if (
              data.every(
                (item: { role: string; content: string }) =>
                  typeof item.role === "string" &&
                  typeof item.content === "string"
              )
            ) {
              // Handle the array
              embedQueries(data);
            }
            // Check if file.data is an array of strings
            else if (data.every((item) => typeof item === "string")) {
              // Handle the array
              embedQueries(data);
            }
            // check for an array of vectors, naive check to not slow down processing
            else if (data.every((item) => typeof item[0] == "number")) {
              embedQueries(data);
            } else {
              setUploadStatus("Invalid json format");
              return;
            }
            resolve();
          }
        };

        reader.onabort = () => {
          setUploadStatus("File reading was aborted");
          reject();
        };
        reader.onerror = () => {
          setUploadStatus("File reading has failed");
          reject();
        };
        reader.readAsText(file);
      });
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "application/json": [] },
  });

  return (
    <>
      <DropZoneContainer {...getRootProps()}>
        <input {...getInputProps()} />
        <FlexBox>
          <Text>Drop a JSON file here, or click to select one </Text>
          <Formats
            data-tooltip-content={`.json file must be formatted as 
            data: [strings] |
            data: [{role: '', content: ''}] |
            data: [vectors]`}
          >
            <FiInfo size={16} className="ml-1" />
          </Formats>
          <ReactTooltip style={{ backgroundColor: "black" }} />
        </FlexBox>
        <Text className="mt-2 text-red-500">{uploadStatus}</Text>
      </DropZoneContainer>
    </>
  );
};

export default UploadJson;

const DropZoneContainer = tw.div`
  flex
  flex-col
  items-center
  justify-center
  text-white
  bg-gray-800
  border-2
  border-dashed
  p-4
  w-64
  text-center
  rounded-lg
`;

const Formats = tw.div`
  mt-2
  text-sm
  text-gray-400
`;

const FlexBox = tw.div`
  flex
  items-center
`;
