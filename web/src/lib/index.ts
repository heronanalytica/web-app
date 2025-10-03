export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
  }).format(date);
};

/**
 * Capitalizes the first letter of a string
 * @param str The string to capitalize
 * @returns The string with the first letter capitalized, or an empty string if input is falsy
 */
export const capitalizeFirstLetter = (str?: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Capitalizes the first letter of each word in a string
 * @param str The string to capitalize
 * @returns The string with the first letter of each word capitalized, or an empty string if input is falsy
 */
export const capitalizeWords = (str?: string): string => {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => capitalizeFirstLetter(word))
    .join(" ");
};
