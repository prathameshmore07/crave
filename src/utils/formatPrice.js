export const formatPrice = (price) => {
  const roundedPrice = Math.round(price);
  const formatted = new Intl.NumberFormat('en-IN').format(roundedPrice);
  return `Rs ${formatted}`;
};
