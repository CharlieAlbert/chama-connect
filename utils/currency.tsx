export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0, // Often KES is shown without decimals
    maximumFractionDigits: 0,
  }).format(amount).replace("KSh", "Ksh"); // Use 'Ksh' for local style
};
