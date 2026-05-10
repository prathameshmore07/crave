export const getRatingColor = (rating) => {
  if (rating >= 4.5) return "bg-[#267E3E] text-white"; // Deep green
  if (rating >= 4.0) return "bg-[#1BA672] text-white"; // Success green
  if (rating >= 3.0) return "bg-[#F5A623] text-white"; // Yellow/Orange
  return "bg-[#E23744] text-white"; // Red
};
