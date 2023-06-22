import React from "react";
import Plot from "react-plotly.js";

interface DisplayMapProps {
  embeddings: number[][];
}

export const DisplayMap: React.FC<DisplayMapProps> = ({ embeddings }) => {
  const x = embeddings.filter((_, index) => index % 3 === 0);
  const y = embeddings.filter((_, index) => index % 3 === 1);
  const z = embeddings.filter((_, index) => index % 3 === 2);

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
    height: 480,
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
    title: "3d point clustering",
    width: 477,
  };

  return <Plot data={data as any[]} layout={layout as any} />;
};
