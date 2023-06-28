import React, {
  useCallback,
  type SetStateAction,
  type Dispatch,
  useState,
} from "react";
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
  embedQueries: (texts: string[]) => Promise<number[][]>;
  varsExist: boolean;
  pineconeUpsert: (data: number[][], texts: string[]) => void;
  reducedEmbeddings: (dataVectorArr: number[][]) => Promise<number[][]>;
}

const UploadJson: React.FC<UploadJsonProps> = ({
  oldEmbeddings,
  setOldEmbeddings,
  uploadStatus,
  setUploadStatus,
  embedQueries,
  varsExist,
  pineconeUpsert,
  reducedEmbeddings,
}) => {
  const [pineconeUpload, setPineconeUpload] = useState<boolean>(false);

  const onDrop = useCallback(async (acceptedFiles: FileWithPath[]) => {
    for (const file of acceptedFiles) {
      await new Promise<void>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async () => {
          const fileAsBinaryString: string | ArrayBuffer | null = reader.result;
          let data;

          if (typeof fileAsBinaryString === "string") {
            data = JSON.parse(fileAsBinaryString) as string;
          } else {
            setUploadStatus("Invalid file format");
            return;
          }

          if (Array.isArray(data)) {
            let embeddedQueries: number[][];
            let texts: string[] = [];
            // Check if file.data is an array of {"role": str, "content": str} pairs
            if (
              data.every(
                (item: { role: string; content: string }) =>
                  typeof item.role === "string" &&
                  typeof item.content === "string"
              )
            ) {
              const contentArr = data.map((item) => item.content);
              texts = contentArr;
              embeddedQueries = await embedQueries(texts);
            }
            // Check if file.data is an array of strings
            else if (data.every((item) => typeof item === "string")) {
              texts = data;
              embeddedQueries = await embedQueries(texts);
            }
            // check for an array of vectors, naive check to not slow down processing
            else if (data.every((item) => typeof item[0] == "number")) {
              embeddedQueries = data;
            } else {
              setUploadStatus("Invalid json format");
              return;
            }
            if (pineconeUpload) {
              pineconeUpsert(embeddedQueries, texts);
            }
            const reducedData = await reducedEmbeddings(embeddedQueries);
            setOldEmbeddings(reducedData);
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
    <UploadContainer>
      <DropZoneContainer className="cursor-pointer" {...getRootProps()}>
        <input {...getInputProps()} />
        <FlexBox>
          <Text>Drop a JSON file here, or click to select one </Text>
          <Formats
            data-tooltip-id="format info"
            data-tooltip-html={`<b>.json file must be formatted as</b> <br> 
            data: [strings] <br>
            data: [{role: '', content: ''}] <br>
            data: [vectors]`}
          >
            <FiInfo size={16} className="ml-1" />
          </Formats>
          <ReactTooltip id="format info" style={{ backgroundColor: "black" }} />
        </FlexBox>
        <Text className="mt-2 text-red-500">{uploadStatus}</Text>
      </DropZoneContainer>
      {varsExist ? (
        <CheckboxContainer onClick={() => setPineconeUpload(true)}>
          <input
            onChange={() => console.log("Metadata")}
            type="checkbox"
            checked={pineconeUpload}
          />
          <Text className="ml-1">Upload to Pinecone</Text>
        </CheckboxContainer>
      ) : null}
    </UploadContainer>
  );
};

export default UploadJson;

const UploadContainer = tw.div`
  w-1/3
  flex
  flex-col
  items-center
  justify-center
`;

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

const CheckboxContainer = tw.div`
  mt-2 flex
`;
