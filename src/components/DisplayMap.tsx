import React from "react";
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface DisplayMapProps {
  embeddings: number[][];
}

export const DisplayMap: React.FC<DisplayMapProps> = ({ embeddings }) => {
  const x = [0.2, 0.15, 0.67];
  const y = [0.3, 0.25, 0.77];
  const z = [0.4, 0.35, 0.87];

  const data = [
    {
      x: x,
      y: y,
      z: z,
      mode: "markers",
      type: "scatter3d",
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
    <div className="h-64 w-64">
      <Plot
        data={data as any[]}
        layout={layout as any}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default DisplayMap;
