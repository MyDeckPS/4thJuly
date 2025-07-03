
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const convertToRazorpayAmount = (amount: number): number => {
  // Convert rupees to paisa (multiply by 100)
  return Math.round(amount * 100);
};

export const convertFromRazorpayAmount = (amount: number): number => {
  // Convert paisa to rupees (divide by 100)
  return amount / 100;
};
