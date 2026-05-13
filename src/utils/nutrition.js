/**
 * Deterministically generates highly realistic nutritional values (Calories, Protein, Carbs)
 * based on the ingredients in the dish name.
 * 
 * @param {object} dish - The dish item object
 * @returns {object} - { calories: number, protein: string, carbs: string }
 */
export function getNutritionData(dish) {
  if (!dish) return null;
  
  // If already explicitly specified on the dish object
  if (dish.calories) {
    return {
      calories: dish.calories,
      protein: dish.protein || "6g",
      carbs: dish.carbs || "45g"
    };
  }

  const name = (dish.name || "").toLowerCase();
  
  // Salad, Soup, Healthy
  if (name.includes("salad") || name.includes("soup") || name.includes("healthy") || name.includes("sprout") || name.includes("fruit")) {
    const hash = name.length % 5;
    return {
      calories: 140 + hash * 20,
      protein: `${6 + (hash % 3)}g`,
      carbs: `${14 + hash * 2}g`
    };
  }

  // Biryani, Rice, Pulao
  if (name.includes("biryani") || name.includes("rice") || name.includes("pulao") || name.includes("khichdi")) {
    const hash = name.length % 5;
    return {
      calories: 520 + hash * 35,
      protein: `${16 + (hash % 4) * 3}g`,
      carbs: `${65 + hash * 4}g`
    };
  }

  // Chicken, Kebab, Fish, Meat, Eggs
  if (name.includes("chicken") || name.includes("kebab") || name.includes("fish") || name.includes("mutton") || name.includes("egg") || name.includes("meat")) {
    const hash = name.length % 5;
    return {
      calories: 420 + hash * 40,
      protein: `${28 + (hash % 3) * 4}g`,
      carbs: `${10 + hash * 2}g`
    };
  }

  // Paneer, Tofu, Cheese
  if (name.includes("paneer") || name.includes("tofu") || name.includes("cheese")) {
    const hash = name.length % 5;
    return {
      calories: 360 + hash * 30,
      protein: `${14 + (hash % 3) * 2}g`,
      carbs: `${18 + hash * 3}g`
    };
  }

  // Dosa, Idli, Uttapam, Paratha, Roti, Naan
  if (name.includes("dosa") || name.includes("idli") || name.includes("uttapam") || name.includes("paratha") || name.includes("roti") || name.includes("naan") || name.includes("kulcha")) {
    const hash = name.length % 5;
    return {
      calories: 260 + hash * 25,
      protein: `${5 + (hash % 2) * 2}g`,
      carbs: `${48 + hash * 3}g`
    };
  }

  // Pizza, Burger, Pasta, Sandwich
  if (name.includes("pizza") || name.includes("burger") || name.includes("pasta") || name.includes("sandwich") || name.includes("garlic bread")) {
    const hash = name.length % 5;
    return {
      calories: 540 + hash * 50,
      protein: `${20 + (hash % 3) * 3}g`,
      carbs: `${58 + hash * 5}g`
    };
  }

  // Desserts, Brownie, Shake, Waffle, Ice Cream, Cake, Jamun, Shrikhand
  if (
    name.includes("brownie") || 
    name.includes("shake") || 
    name.includes("waffle") || 
    name.includes("ice cream") || 
    name.includes("cake") || 
    name.includes("sweet") || 
    name.includes("dessert") || 
    name.includes("jamun") || 
    name.includes("mousse") || 
    name.includes("shrikhand") || 
    name.includes("lassi")
  ) {
    const hash = name.length % 5;
    return {
      calories: 320 + hash * 35,
      protein: `${4 + (hash % 2) * 1}g`,
      carbs: `${52 + hash * 4}g`
    };
  }

  // Noodles, Manchurian, Chinese
  if (name.includes("noodle") || name.includes("manchurian") || name.includes("chow") || name.includes("fried rice") || name.includes("chilli") || name.includes("momos")) {
    const hash = name.length % 5;
    return {
      calories: 450 + hash * 30,
      protein: `${11 + (hash % 3) * 2}g`,
      carbs: `${60 + hash * 3}g`
    };
  }

  // Fallback deterministic nutrition based on character codes
  let hashValue = 0;
  for (let i = 0; i < name.length; i++) {
    hashValue += name.charCodeAt(i);
  }
  const factor = hashValue % 6;
  return {
    calories: 280 + factor * 45,
    protein: `${8 + (factor % 3) * 2}g`,
    carbs: `${36 + factor * 5}g`
  };
}
