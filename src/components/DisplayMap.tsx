import { useState } from "react";
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });
import { type ScoredVector } from "@pinecone-database/pinecone";
import tw from "tailwind-styled-components";
import { Text } from "~/styles/css";
import { type QueryVector } from "../pages/index";

import Spinner from "./shared/Spinner";

interface DisplayMapProps {
  embeddings: number[][];
  fullEmbeddings: ScoredVector[];
  graphLoading: boolean;
  setGraphLoading: React.Dispatch<React.SetStateAction<boolean>>;
  queryPoint: QueryVector;
}

export const DisplayMap: React.FC<DisplayMapProps> = ({
  embeddings,
  fullEmbeddings,
  graphLoading,
  queryPoint,
  setGraphLoading,
}) => {
  const [firstLoad, setFirstLoad] = useState(true);

  const [includeMetadata, setIncludeMetadata] = useState<boolean>(false);

  const x = embeddings.map((subArray) => subArray[0]);
  const y = embeddings.map((subArray) => subArray[1]);
  const z = embeddings.map((subArray) => subArray[2]);
  const hoverText = fullEmbeddings.map((vector) => {
    let hoverStr = `id: ${vector.id}<br>score: ${vector.score}`;
    if (vector.metadata && includeMetadata) {
      const metadataStr = Object.entries(vector.metadata)
        .map(([key, value]) => `<br>${key}: ${value}`)
        .join("");
      hoverStr += `<br>metadata: ${metadataStr}`;
    }
    return hoverStr;
  });
  const data = [
    {
      x: x,
      y: y,
      z: z,
      mode: "markers",
      type: "scatter3d",
      name: "Embeddings",
      hovertemplate:
        "%{text}<br>x: %{x:.3f}, y: %{y:.3f}, z: %{z:.3f}<extra></extra>",
      text: hoverText,
      marker: {
        color: "rgb(23, 190, 207)",
        size: 2,
      },
    },
    {
      alphahull: 7,
      opacity: 0.1,
      flatshading: true,
      type: "mesh3d",
      x: x,
      y: y,
      z: z,
      hoverinfo: "skip",
    },
    {
      x: [queryPoint.vector[0]],
      y: [queryPoint.vector[1]],
      z: [queryPoint.vector[2]],
      mode: "markers",
      name: "Query",
      type: "scatter3d",
      text: [
        `text: ${
          queryPoint.text.length > 30
            ? queryPoint.text.substring(0, 30) + "..."
            : queryPoint.text
        }`,
      ],
      hovertemplate:
        "Query Point<br>%{text}<br>x: %{x:.3f}<br>y: %{y:.3f}<br>z: %{z:.3f}<extra></extra>",
      marker: {
        color: "rgb(255, 0, 0)", // Change color for the query point
        size: 2,
      },
    },
  ];

  const layout = {
    autosize: true,
    margin: {
      l: 0, // left margin
      r: 0, // right margin
      b: 0, // bottom margin
      t: 0, // top margin
      pad: 0, // padding
    },
    scene: {
      aspectratio: {
        x: 1,
        y: 1,
        z: 1,
      },
      camera: {
        center: {
          x: 0,
          y: 0,
          z: 0,
        },
        eye: {
          x: 1.25,
          y: 1.25,
          z: 1.25,
        },
        up: {
          x: 0,
          y: 0,
          z: 1,
        },
      },
      xaxis: {
        type: "linear",
        zeroline: false,
      },
      yaxis: {
        type: "linear",
        zeroline: false,
      },
      zaxis: {
        type: "linear",
        zeroline: false,
      },
    },
  };

  return (
    <GraphContainer>
      <Spinner graphLoading={graphLoading} />
      {graphLoading && !firstLoad ? null : (
        <>
          <Plot
            data={data as any[]}
            layout={layout as any}
            onAfterPlot={() => {
              setGraphLoading(false);
              setFirstLoad(false);
            }}
            style={{ width: "100%", height: "100%" }}
          />
          <CheckboxContainer
            onClick={() => setIncludeMetadata(!includeMetadata)}
            className={`${graphLoading ? "hidden" : ""}`}
          >
            <input
              onChange={() => console.log("Metadata")}
              type="checkbox"
              checked={includeMetadata}
            />
            <Text className="ml-1">Include metadata</Text>
          </CheckboxContainer>
        </>
      )}
    </GraphContainer>
  );
};

export default DisplayMap;

const GraphContainer = tw.div`
  flex w-5/6 flex-col items-center justify-center
`;

const CheckboxContainer = tw.div`
  mt-2 flex
`;
