export const truncate = (text: string, max = 80) =>
  text.length > max ? text.slice(0, max) + "…" : text;

export const getFirstChar = (name: string) => name.trim().slice(0, 1) || "?";
