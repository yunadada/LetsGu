export const formatDate = (dateInput?: string) => {
  const date = dateInput ? new Date(dateInput) : new Date();
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1);
  const day = String(date.getDate());
  return { year, month, day };
};
