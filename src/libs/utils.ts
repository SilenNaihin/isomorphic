export const splitAtSpaces = (text: string, maxChar: number) => {
  const parts = [];
  let currentPart = "";

  text.split(" ").forEach((word) => {
    if ((currentPart + word).length <= maxChar) {
      currentPart += " " + word;
    } else {
      parts.push(currentPart);
      currentPart = word;
    }
  });

  parts.push(currentPart); // Push the last part into the array

  return parts;
};
