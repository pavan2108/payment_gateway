export const generateRandomAccountNumber = (): string => {
  // Keeps the first two number 10 as contact and changes the rest
  return Math.floor(100000000000 + Math.random() * 9000000000).toString();
};
