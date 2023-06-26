import React from "react";
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });
import { type ScoredVector } from "@pinecone-database/pinecone";

import { Text } from "~/styles/css";

interface DisplayMapProps {
  embeddings: number[][];
  fullEmbeddings: ScoredVector[];
  graphLoading: boolean;
}

export const DisplayMap: React.FC<DisplayMapProps> = ({
  embeddings,
  fullEmbeddings,
  graphLoading,
}) => {
  console.log(fullEmbeddings[1]);
  const x = embeddings.map((subArray) => subArray[0]);
  const y = embeddings.map((subArray) => subArray[1]);
  const z = embeddings.map((subArray) => subArray[2]);
  const hoverText = fullEmbeddings.map((vector) => {
    let hoverStr = `id: ${vector.id}<br>score: ${vector.score}`;
    if (vector.metadata) {
      hoverStr += `<br>metadata: ${JSON.stringify(vector.metadata)}`;
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
      type: "mesh3d",
      x: x,
      y: y,
      z: z,
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
    <div className="flex h-64 w-64 items-center justify-center">
      {graphLoading ? (
        <Text>Example Loading...</Text>
      ) : (
        <Plot
          data={data as any[]}
          layout={layout as any}
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
};

export default DisplayMap;
