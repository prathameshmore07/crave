export const getSpiceLabel = (level) => {
  switch (level) {
    case 1: return "🌶️ Mild";
    case 2: return "🌶️🌶️ Medium";
    case 3: return "🌶️🌶️🌶️ Hot & Spicy";
    default: return "";
  }
};
