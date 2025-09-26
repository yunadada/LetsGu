export const truncate = (text: string, max = 80) => {
  const graphemes = Array.from(text);
  if (graphemes.length <= max) return text;
  return `${graphemes.slice(0, max).join("")}…`;
};
