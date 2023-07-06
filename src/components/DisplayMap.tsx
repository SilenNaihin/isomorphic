import { useState } from "react";
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });
import { type ScoredVector } from "@pinecone-database/pinecone";
import tw from "tailwind-styled-components";
import { Text } from "~/styles/css";
import { type QueryVector } from "../pages/index";
import { splitAtSpaces } from "~/libs/utils";

import Spinner from "./shared/Spinner";

interface ModifiedVector extends ScoredVector {
  position: number;
}

interface DisplayMapProps {
  embeddings: number[][];
  fullEmbeddings: ModifiedVector[];
  graphLoading: boolean;
  setGraphLoading: React.Dispatch<React.SetStateAction<boolean>>;
  queryPoint: QueryVector;
}

const splitEmbeddings = (embeddings: number[][] | string[], index: number) => {
  const quarterLength = Math.floor(embeddings.length / 4);

  const begin = embeddings
    .slice(0, quarterLength)
    .map((subArray) => subArray[index]);
  const middle = embeddings
    .slice(quarterLength, -quarterLength)
    .map((subArray) => subArray[index]);
  const end = embeddings
    .slice(-quarterLength)
    .map((subArray) => subArray[index]);

  return [begin, middle, end];
};

const createHoverText = (
  fullEmbeddings: ModifiedVector[],
  includeMetadata: boolean
) => {
  const hoverText = fullEmbeddings.map((vector) => {
    let hoverStr = `position:${vector.position}<br>score: ${vector.score}`;
    if (vector.metadata && includeMetadata) {
      const metadataStr = Object.entries(vector.metadata)
        .map(([key, value]) => `<br>${key}: ${value}`)
        .join("");
      hoverStr += `<br>id: ${vector.id}<br>Metadata ${metadataStr}`;
    }
    return hoverStr;
  });

  const quarterLength = Math.floor(fullEmbeddings.length / 4);

  return [
    hoverText.slice(0, quarterLength),
    hoverText.slice(quarterLength, -quarterLength),
    hoverText.slice(-quarterLength),
  ];
};

export const DisplayMap: React.FC<DisplayMapProps> = ({
  embeddings,
  fullEmbeddings,
  graphLoading,
  queryPoint,
  setGraphLoading,
}) => {
  const [firstLoad, setFirstLoad] = useState(true);

  const [includeMetadata, setIncludeMetadata] = useState<boolean>(false);
  const [includeCoords, setIncludeCoords] = useState<boolean>(false);
  const [revision, setRevision] = useState<number>(0);
  const [showStrati, setShowStrati] = useState<boolean>(true);

  const [x1, xmid, xlast] = splitEmbeddings(embeddings, 0);
  const [y1, ymid, ylast] = splitEmbeddings(embeddings, 1);
  const [z1, zmid, zlast] = splitEmbeddings(embeddings, 2);
  const [hoverText1, hoverTextmid, hoverTextlast] = createHoverText(
    fullEmbeddings,
    includeMetadata
  );

  const data = [
    {
      x: x1,
      y: y1,
      z: z1,
      mode: "markers",
      type: "scatter3d",
      name: showStrati ? "Top 25%" : "Embeddings",
      hovertemplate:
        `<br>%{text}<br>` +
        (includeCoords ? `x: %{x:.3f}<br>y: %{y:.3f}<br>z: %{z:.3f}` : "") +
        `<extra></extra>`,
      text: hoverText1,
      marker: {
        color: showStrati ? "rgb(0, 255, 0)" : "rgb(23, 190, 207)",
        size: 2.5,
      },
    },
    {
      x: xmid,
      y: ymid,
      z: zmid,
      mode: "markers",
      type: "scatter3d",
      name: "Randomly selected",
      showlegend: showStrati,
      hovertemplate:
        `<br>%{text}<br>` +
        (includeCoords ? `x: %{x:.3f}<br>y: %{y:.3f}<br>z: %{z:.3f}` : "") +
        `<extra></extra>`,
      text: hoverTextmid,
      marker: {
        color: "rgb(23, 190, 207)",
        size: 2.5,
      },
    },
    {
      x: xlast,
      y: ylast,
      z: zlast,
      mode: "markers",
      type: "scatter3d",
      name: "Bottom 25%",
      showlegend: showStrati,
      hovertemplate:
        `<br>%{text}<br>` +
        (includeCoords ? `x: %{x:.3f}<br>y: %{y:.3f}<br>z: %{z:.3f}` : "") +
        `<extra></extra>`,
      text: hoverTextlast,
      marker: {
        color: showStrati ? "rgb(255, 223, 0)" : "rgb(23, 190, 207)",
        size: 2.5,
      },
    },
    {
      x: [queryPoint.vector[0]],
      y: [queryPoint.vector[1]],
      z: [queryPoint.vector[2]],
      mode: "markers",
      name: "Query",
      type: "scatter3d",
      text: [`text: ${splitAtSpaces(queryPoint.text, 40).join("<br>")}`],
      hovertemplate:
        `Query Point<br>%{text}<br>` +
        (includeCoords ? `x: %{x:.3f}<br>y: %{y:.3f}<br>z: %{z:.3f}` : "") +
        `<extra></extra>`,
      marker: {
        color: "rgb(255, 0, 0)", // Change color for the query point
        size: 4,
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
            useResizeHandler
            revision={revision}
          />
          <div className="flex flex-col justify-start">
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
            <CheckboxContainer
              onClick={() => {
                setIncludeCoords(!includeCoords);
                setRevision(revision + 1);
              }}
              className={`${graphLoading ? "hidden" : ""}`}
            >
              <input
                onChange={() => console.log("Coords")}
                type="checkbox"
                checked={includeCoords}
              />
              <Text className="ml-1">
                Include reduced coordinates (x, y, z)
              </Text>
            </CheckboxContainer>
            <CheckboxContainer
              onClick={() => {
                setShowStrati(!showStrati);
                setRevision(revision + 1);
              }}
              className={`${graphLoading ? "hidden" : ""}`}
            >
              <input
                onChange={() => console.log("Strati")}
                type="checkbox"
                checked={showStrati}
              />
              <Text className="ml-1">Break up data into strati</Text>
            </CheckboxContainer>
          </div>
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
