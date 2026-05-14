// High-quality, robust Unsplash food images
const images = {
  northIndian: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=60",
  southIndian: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=60",
  chinese: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=60",
  streetFood: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=60",
  biryani: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=60",
  continental: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=60",
  seafood: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=60",
  sweets: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=60",
  cafe: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=60"
};

// Deterministic simple string hash function to map IDs to image indexes
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

// Highly diversified image pools per cuisine for visual variation
const imagePools = {
  northIndian: [
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1585969613100-2306296a2941?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1621447509371-293e6df419a4?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=600&auto=format&fit=crop&q=60"
  ],
  southIndian: [
    "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1630409351241-e90e7f5e434d?w=600&auto=format&fit=crop&q=60"
  ],
  chinese: [
    "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1552611052-33e04de081de?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=60"
  ],
  streetFood: [
    "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1606491048563-eb955f4623e1?w=600&auto=format&fit=crop&q=60"
  ],
  biryani: [
    "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1645177625172-ac2498db25ca?w=600&auto=format&fit=crop&q=60"
  ],
  continental: [
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60"
  ],
  seafood: [
    "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=600&auto=format&fit=crop&q=60"
  ],
  sweets: [
    "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=60"
  ],
  cafe: [
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=600&auto=format&fit=crop&q=60"
  ]
};

// Map of menu item names to distinct high-quality Unsplash image URLs
export const menuItemImages = {
  // North Indian
  "Paneer Butter Masala": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&auto=format&fit=crop&q=60",
  "Butter Chicken Classic": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&auto=format&fit=crop&q=60",
  "Dal Makhani Signature": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&auto=format&fit=crop&q=60",
  "Garlic Naan": "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=300&auto=format&fit=crop&q=60",
  "Malai Kofta": "https://www.indianhealthyrecipes.com/wp-content/uploads/2022/06/malai-kofta-recipe.jpg",
  "Tandoori Roti": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=300&auto=format&fit=crop&q=60",
  "Kadhai Paneer": "https://www.whiskaffair.com/wp-content/uploads/2020/08/Kadai-Paneer-2-3.jpg",
  "Tandoori Chicken Half": "https://5.imimg.com/data5/SELLER/Default/2024/9/449767423/QD/DS/RG/230584086/tandoori-chicken-half.jpg",

  // South Indian
  "Classic Masala Dosa": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=300&auto=format&fit=crop&q=60",
  "Steamed Idli Sambar": "https://spicecravings.com/wp-content/uploads/2020/06/Idli-4.jpg",
  "Medu Vada Crispy": "https://madhurasrecipe.com/wp-content/uploads/2021/12/poha_vada_featured.jpg",
  "Onion Tomato Uttapam": "https://bergnerhome.in/cdn/shop/files/Onion-Tomato-Uttapam_ca08699f-fef2-4112-bf8d-90d51d616efa_800x.jpg?v=1754908086",
  "Ghee Podi Idli": "https://vaya.in/recipes/wp-content/uploads/2019/10/Idli-Podi-and-Podi-Idly.jpg",
  "Rava Onion Dosa": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUOYSUvc161zbNkuMddufrBzV8Unsc-MAiXg&s",

  // Biryani
  "Chicken Dum Biryani": "https://static.toiimg.com/thumb/54308405.cms?imgsize=510571&width=800&height=800",
  "Royal Paneer Biryani": "https://www.indianhealthyrecipes.com/wp-content/uploads/2023/02/paneer-biryani-recipe.jpg",
  "Special Mutton Biryani": "https://www.cubesnjuliennes.com/wp-content/uploads/2021/03/Best-Mutton-Biryani-Recipe.jpg",
  "Egg Dum Biryani": "https://palatesdesire.com/wp-content/uploads/2022/05/Egg-biryani-recipe@palates-desire.jpg",
  "Veg Hyderabadi Biryani": "https://www.whiskaffair.com/wp-content/uploads/2020/08/Veg-Biryani-2-3.jpg",
  "Biryani Rice Portion": "https://www.indianhealthyrecipes.com/wp-content/uploads/2018/10/chicken-dum-biryani-recipe.jpg",

  // Street Food
  "Special Mumbai Vada Pav": "https://ministryofcurry.com/wp-content/uploads/2024/06/vada-pav-3.jpg",
  "Amul Butter Pav Bhaji": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSALsKfatzbf6ODCg2YvEBUTyWtKp95ubvf6w&s",
  "Delhi Special Chole Bhature": "https://sitaramdiwanchand.com/blog/wp-content/uploads/2024/03/Image-1-2-1024x768.webp",
  "Cheese Dahi Puri": "https://www.indianveggiedelight.com/wp-content/uploads/2023/07/dahi-puri-featured-500x500.jpg",
  "Samosa Chat Classic": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8CDXypaCe7c8PqDQujpV9H5502Yq-HZT0Ag&s",
  "Sev Puri Mumbai Style": "https://shwetainthekitchen.com/wp-content/uploads/2021/10/sev-puri-500x375.jpg",

  // Chinese
  "Veg Hakka Noodles": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300&auto=format&fit=crop&q=60",
  "Schezwan Chicken": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&auto=format&fit=crop&q=60",
  "Chilli Paneer Dry": "https://rumkisgoldenspoon.com/wp-content/uploads/2021/04/Chilli-paneer-dry.jpg",
  "Manchurian Gravy Veg": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8IL1Cl3G0atDit8U3kZuvnZFDDCtb3Qph3A&s",
  "Chicken Fried Rice": "https://i.ytimg.com/vi/lRzGgs6dK6g/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLD7uE8D8z6dxMIxLHtNekIxFpbuoQ",
  "Spring Rolls Veg": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSraE38p1Vp3WFBidCq5GSrvJFOUbVmfwsNnQ&s",

  // Continental
  "Margherita Pizza": "https://cdn.uengage.io/uploads/5/image-342266-1715596630.png",
  "Alfredo Pasta Veg": "https://food.fnr.sndimg.com/content/dam/images/food/fullset/2017/1/9/6/FNK_Spring-Vegetable-Alfredo_s4x3.jpg.rend.hgtvcom.1280.1280.suffix/1484859771784.webp",
  "Garlic Bread Cheese": "https://stordfkenticomedia.blob.core.windows.net/df-us/rms/media/recipemediafiles/recipe%20images%20and%20files/retail/desktop%20(600x600)/2024.nov/2024_df_ultra-cheesy-garlic-bread_600x600.jpg?ext=.jpg",
  "Veggie Burger Combo": "https://dukaan.b-cdn.net/700x700/webp/590610/0847acd1-9aea-4e55-a4b7-12abd4f58783.png",
  "Spicy Peri Peri Fries": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7gN1S-riJZ5aBtoU7m5jx6rSFp_M_BWMd0w&s",
  "Chicken Alfredo Pasta": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5EuVYEm22v_-iy2vFQ-4niAT7Dk4uzs_CYA&s",

  // Seafood
  "Goan Fish Curry": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT317PYFBbi13mJG0Q77kgmHUKfHLf8mtBbTQ&s",
  "Prawn Masala": "https://www.pavaniskitchen.com/wp-content/uploads/2021/02/prawn-masala.jpg",
  "Bombil Fry Crispy": "https://octorika.com/cdn/shop/articles/ChatGPT_Image_Sep_11_2025_05_06_11_PM_131e849c-529e-4d5a-b5d9-3b13ef05218f.png?v=1757590725&width=1100",
  "Surmai Rava Fry": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0lq1o5aznspnls7OYWnRY6fF9XGA8qiHC6A&s",
  "Prawn Fried Rice": "https://www.kannammacooks.com/wp-content/uploads/prawn-fried-rice-recipe-1-3.jpg",
  "Fish Tikka Tandoori": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQixF8ZBihIAWagrV1Cq8cKuxCRo_jajJiArg&s",

  // Sides
  "Crispy French Fries": "https://www.recipetineats.com/tachyon/2022/09/Crispy-Fries_8.jpg",
  "Onion Ring Basket": "https://www.errenskitchen.com/wp-content/uploads/2016/06/Baked-Seasoned-Onion-Rings4-e1523880077118.jpg",
  "Masala Papad Duo": "https://i0.wp.com/cookwithdi.com/wp-content/uploads/2024/11/IMG_3730photo.jpg?resize=1170%2C840&ssl=1",
  "Extra Butter Pav": "https://dukaan.b-cdn.net/700x700/webp/15101/322c2299-5165-4f53-bcb2-8fc6ba8f4982.png",

  // Sweets & Drinks
  "Gulab Jamun": "https://www.cadburydessertscorner.com/hubfs/dc-website-2022/articles/soft-gulab-jamun-recipe-for-raksha-bandhan-from-dough-to-syrup-all-you-need-to-know/soft-gulab-jamun-recipe-for-raksha-bandhan-from-dough-to-syrup-all-you-need-to-know.webp",
  "Rasgulla Classic": "https://easysavorymeals.com/wp-content/uploads/2025/09/homemade-Rasgulla-Recipe-500x375.jpg",
  "Special Cutting Chai": "https://www.teaforturmeric.com/wp-content/uploads/2021/11/Masala-Chai-Tea-Recipe-Card.jpg",
  "Oreo Thick Shake": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&auto=format&fit=crop&q=60",
  "Mineral Water (1L)": "https://www.chennaigrocers.com/cdn/shop/files/EvianNaturalMineralWater1L_5.jpg?v=1737442301&width=1500",

  // Cafe items
  "Cold Coffee Cream": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=300&auto=format&fit=crop&q=60",
  "Hot Cappuccino Classic": "https://thumbs.dreamstime.com/b/hot-cappuccino-cup-image-beautifully-captures-its-rich-frothy-texture-artful-coffee-crema-perfect-308233991.jpg",
  "Blueberry Muffin": "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=300&auto=format&fit=crop&q=60",
  "Croissant Butter Classic": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&auto=format&fit=crop&q=60",
  "Virgin Mint Mojito": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&auto=format&fit=crop&q=60",
  "Paneer Cheese Wrap": "https://cdn.uengage.io/uploads/18085/image-646359-1717590397.jpeg"
};

// Menu Category Templates
const menuTemplates = {
  northIndian: [
    { name: "Paneer Butter Masala", description: "Soft paneer cubes in creamy, spiced tomato cashew gravy.", price: 240, isVeg: true, isBestseller: true },
    { name: "Dal Makhani Signature", description: "Lentils slow-cooked overnight with cream and rich butter.", price: 190, isVeg: true },
    { name: "Butter Chicken Classic", description: "Tender roasted chicken in rich, creamy sweet tomato sauce.", price: 280, isVeg: false, isBestseller: true },
    { name: "Malai Kofta", description: "Deep fried paneer-potato balls in sweet, smooth cashew sauce.", price: 220, isVeg: true },
    { name: "Kadhai Paneer", description: "Paneer cooked with bell peppers and freshly ground kadhai masala.", price: 230, isVeg: true },
    { name: "Tandoori Chicken Half", description: "Smoky tandoor-charred chicken marinated in spicy yogurt.", price: 260, isVeg: false }
  ],
  southIndian: [
    { name: "Classic Masala Dosa", description: "Crispy rice crepe filled with spicy mashed potato.", price: 120, isVeg: true, isBestseller: true },
    { name: "Steamed Idli Sambar", description: "Soft, fluffy steamed rice cakes with piping hot lentil stew.", price: 80, isVeg: true },
    { name: "Medu Vada Crispy", description: "Crisp golden-fried lentil donuts served with coconut chutney.", price: 90, isVeg: true },
    { name: "Onion Tomato Uttapam", description: "Thick savory rice pancake topped with chopped onion and tomato.", price: 110, isVeg: true },
    { name: "Ghee Podi Idli", description: "Bite-sized button idlis tossed in pure cow ghee and gunpowder.", price: 100, isVeg: true, isBestseller: true },
    { name: "Rava Onion Dosa", description: "Lacy, crispy semolina crepe spiced with ginger and black pepper.", price: 130, isVeg: true }
  ],
  chinese: [
    { name: "Veg Hakka Noodles", description: "Stir-fried noodles with crisp fresh julienned vegetables.", price: 160, isVeg: true, isBestseller: true },
    { name: "Schezwan Chicken", description: "Batter-fried chicken chunks tossed in spicy, tangy garlic sauce.", price: 220, isVeg: false },
    { name: "Chilli Paneer Dry", description: "Paneer cubes tossed with bell peppers in spicy soy sauce.", price: 190, isVeg: true },
    { name: "Manchurian Gravy Veg", description: "Mixed veg balls in garlic, ginger, and green chilli sauce.", price: 170, isVeg: true },
    { name: "Chicken Fried Rice", description: "Wok-tossed rice with shredded chicken and oriental sauces.", price: 190, isVeg: false, isBestseller: true },
    { name: "Spring Rolls Veg", description: "Crispy rolls stuffed with spiced seasoned cabbage and carrot.", price: 120, isVeg: true }
  ],
  streetFood: [
    { name: "Special Mumbai Vada Pav", description: "Spiced potato dumpling fried in chickpea batter inside soft bun.", price: 40, isVeg: true, isBestseller: true },
    { name: "Amul Butter Pav Bhaji", description: "Rich, mashed mixed veg curry served with butter-toasted buns.", price: 130, isVeg: true, isBestseller: true },
    { name: "Delhi Special Chole Bhature", description: "Puffy fried bread served with spicy chickpea curry and pickle.", price: 140, isVeg: true },
    { name: "Cheese Dahi Puri", description: "Crisp flour balls filled with potato, sweetened yogurt, chutney, cheese.", price: 110, isVeg: true },
    { name: "Samosa Chat Classic", description: "Crushed samosas topped with spicy peas, sweet yogurt, chutneys.", price: 90, isVeg: true },
    { name: "Sev Puri Mumbai Style", description: "Crisp flat puris topped with potatoes, onions, chutneys, sev.", price: 80, isVeg: true }
  ],
  biryani: [
    { name: "Chicken Dum Biryani", description: "Saffron rice layers with tender marinated chicken.", price: 260, isVeg: false, isBestseller: true },
    { name: "Royal Paneer Biryani", description: "Aromatic basmati rice cooked with paneer chunks and spices.", price: 220, isVeg: true },
    { name: "Special Mutton Biryani", description: "Fragrant rice slow-cooked with tender, juicy lamb meat.", price: 340, isVeg: false, isBestseller: true },
    { name: "Egg Dum Biryani", description: "Spiced basmati rice layers served with boiled fried eggs.", price: 190, isVeg: false },
    { name: "Veg Hyderabadi Biryani", description: "Fresh garden vegetables slow-cooked with long-grain basmati.", price: 180, isVeg: true },
    { name: "Biryani Rice Portion", description: "Pure, aromatic, basmati rice colored with natural saffron.", price: 110, isVeg: true }
  ],
  continental: [
    { name: "Margherita Pizza", description: "Classic tomato sauce, fresh mozzarella cheese, and basil leaves.", price: 220, isVeg: true },
    { name: "Alfredo Pasta Veg", description: "Fettuccine pasta in rich parmesan cheese and butter sauce.", price: 190, isVeg: true, isBestseller: true },
    { name: "Garlic Bread Cheese", description: "Toasted baguette slices with fresh garlic butter and mozzarella.", price: 110, isVeg: true },
    { name: "Veggie Burger Combo", description: "Crispy vegetable patty in sesame seed bun with crispy French fries.", price: 160, isVeg: true },
    { name: "Spicy Peri Peri Fries", description: "Crisp potato fries dusted in tangy African bird's eye pepper.", price: 90, isVeg: true },
    { name: "Chicken Alfredo Pasta", description: "Creamy white sauce pasta tossed with succulent sliced chicken.", price: 240, isVeg: false, isBestseller: true }
  ],
  seafood: [
    { name: "Goan Fish Curry", description: "Kingfish cooked in aromatic, mildly spiced coconut gravy.", price: 290, isVeg: false, isBestseller: true },
    { name: "Prawn Masala", description: "Juicy prawns stir-fried in rich onion-tomato and Malabar spices.", price: 320, isVeg: false },
    { name: "Bombil Fry Crispy", description: "Semolina-crusted Bombay duck fish fried till perfectly golden.", price: 190, isVeg: false },
    { name: "Surmai Rava Fry", description: "Premium surmai steak coated in crisp rava and deep fried.", price: 280, isVeg: false, isBestseller: true },
    { name: "Prawn Fried Rice", description: "Stir-fried basmati rice with baby prawns and spring onion.", price: 220, isVeg: false },
    { name: "Fish Tikka Tandoori", description: "Fish fillets marinated in spiced yogurt and grilled in tandoor.", price: 310, isVeg: false }
  ],
  cafe: [
    { name: "Cold Coffee Cream", description: "Blended creamy iced coffee with sweet vanilla notes and whipped cream.", price: 120, isVeg: true, isBestseller: true },
    { name: "Hot Cappuccino Classic", description: "Rich double shot espresso topped with warm, thick velvety milk foam.", price: 100, isVeg: true },
    { name: "Blueberry Muffin", description: "Soft, golden baked muffin bursting with sweet juicy fresh blueberries.", price: 95, isVeg: true },
    { name: "Croissant Butter Classic", description: "Light, flaky, warm French butter laminated pastry with honey glaze.", price: 110, isVeg: true, isBestseller: true },
    { name: "Virgin Mint Mojito", description: "Ice-cold refreshing blend of muddled garden mint, lime, and soda.", price: 90, isVeg: true },
    { name: "Paneer Cheese Wrap", description: "Spiced grilled cottage cheese wrap with crunchy onions and chipotle mayo.", price: 130, isVeg: true }
  ]
};

// Sides and Desserts/Drinks to fill up to exactly 16 menu items for other restaurants
const sidesPool = [
  { name: "Crispy French Fries", description: "Golden, salted potato fries.", price: 80, isVeg: true },
  { name: "Onion Ring Basket", description: "Crisp batter-coated onion rings.", price: 90, isVeg: true },
  { name: "Masala Papad Duo", description: "Crispy roasted papads topped with onions, tomatoes, coriander.", price: 50, isVeg: true },
  { name: "Extra Butter Pav", description: "Soft, warm bun toasted with fresh Amul butter.", price: 15, isVeg: true }
];

const dessertsPool = [
  { name: "Gulab Jamun", description: "Two soft cheese dumplings in warm, aromatic rose-cardamom syrup.", price: 70, isVeg: true, isBestseller: true },
  { name: "Rasgulla Classic", description: "Two spongy cottage cheese balls soaked in light sugar syrup.", price: 60, isVeg: true },
  { name: "Special Cutting Chai", description: "Hot, spiced milk tea brewed with ginger and cardamom.", price: 20, isVeg: true },
  { name: "Oreo Thick Shake", description: "Thick vanilla milkshake blended with Oreo cookies.", price: 110, isVeg: true },
  { name: "Mineral Water (1L)", description: "Chilled mineral drinking water.", price: 20, isVeg: true }
];

// Composes a robust menu with EXACTLY 16 items for ANY restaurant (or full detailed menu for ITM Canteen)
function createRestaurantMenu(cuisines, isVeg, isPureVeg, restaurantName) {
  let matchedItems = [];

  // 1. Gather all items matching the restaurant's primary cuisines
  cuisines.forEach(cuisine => {
    const key = Object.keys(menuTemplates).find(k => k.toLowerCase() === cuisine.replace(/\s+/g, '').toLowerCase());
    if (key && menuTemplates[key]) {
      matchedItems = [...matchedItems, ...menuTemplates[key]];
    }
  });

  // Fallback if no matching cuisines
  if (matchedItems.length === 0) {
    matchedItems = [...menuTemplates.northIndian, ...menuTemplates.streetFood];
  }

  // Filter out non-veg if needed
  if (isVeg || isPureVeg) {
    matchedItems = matchedItems.filter(item => item.isVeg);
  }

  // Deduplicate
  const seenNames = new Set();
  let uniqueCuisinePool = [];
  matchedItems.forEach(item => {
    if (!seenNames.has(item.name)) {
      seenNames.add(item.name);
      uniqueCuisinePool.push(item);
    }
  });

  // Pick main dishes, sides, desserts
  let chosenCuisineItems = uniqueCuisinePool.slice(0, 8);
  let fillSides = sidesPool.filter(i => !(isVeg || isPureVeg) || i.isVeg);
  let fillDesserts = dessertsPool.filter(i => !(isVeg || isPureVeg) || i.isVeg);

  let finalMenuPool = [...chosenCuisineItems, ...fillSides, ...fillDesserts];

  // Deduplicate again
  const finalSeen = new Set();
  let finalMenu = [];
  finalMenuPool.forEach(item => {
    if (!finalSeen.has(item.name)) {
      finalSeen.add(item.name);
      finalMenu.push(item);
    }
  });

  // Authentic gourmet padding pool to hit exactly 16 menu items (No more generic fakes!)
  const gourmetPaddingPool = [
    { name: "Kadhai Paneer", description: "Fresh cottage cheese cooked with bell peppers and freshly ground kadhai spices.", price: 210, isVeg: true },
    { name: "Tandoori Chicken Half", description: "Succulent clay-oven grilled chicken marinated in smoky tandoori yogurt.", price: 250, isVeg: false },
    { name: "Ghee Podi Idli", description: "Bite-sized baby idlis tossed in spicy powder and clarified butter.", price: 110, isVeg: true },
    { name: "Rava Onion Dosa", description: "Lacy, crisp semolina crepe layered with caramelized onions and green chilies.", price: 125, isVeg: true },
    { name: "Manchurian Gravy Veg", description: "Crisp mixed vegetable balls simmered in a dark, ginger-soy gravy.", price: 160, isVeg: true },
    { name: "Spring Rolls Veg", description: "Deep-fried spring wrappers loaded with spiced vegetables.", price: 115, isVeg: true },
    { name: "Sev Puri Mumbai Style", description: "Crisp flat puris topped with seasoned potatoes, tangy chutneys, and fine sev.", price: 85, isVeg: true },
    { name: "Egg Dum Biryani", description: "Fragrant saffron rice layered with hard boiled eggs and caramelized onions.", price: 180, isVeg: false },
    { name: "Veg Hyderabadi Biryani", description: "Classic spicy clay-pot cooked basmati rice with mixed vegetables.", price: 195, isVeg: true },
    { name: "Spicy Peri Peri Fries", description: "Crispy french fries dusted in hot African peri-peri spice blend.", price: 95, isVeg: true },
    { name: "Bombil Fry Crispy", description: "Rava-coated Bombay duck fish fried till crispy on the outside.", price: 175, isVeg: false },
    { name: "Prawn Fried Rice", description: "Wok-tossed long-grain basmati with baby prawns, spring onions, and white pepper.", price: 210, isVeg: false }
  ];

  // Fill up to exactly 16 items programmatically using the gourmetPaddingPool
  let padIdx = 0;
  while (finalMenu.length < 16 && padIdx < gourmetPaddingPool.length) {
    const padItem = gourmetPaddingPool[padIdx];
    const satisfiesVeg = !(isVeg || isPureVeg) || padItem.isVeg;

    if (satisfiesVeg && !finalSeen.has(padItem.name)) {
      finalSeen.add(padItem.name);
      finalMenu.push(padItem);
    }
    padIdx++;
  }

  // Double fallback in case we still need items (rare)
  let fallbackSuffix = 1;
  while (finalMenu.length < 16) {
    const fallbackName = isVeg || isPureVeg ? "Margherita Pizza" : "Chicken Fried Rice";
    finalMenu.push({
      name: `${fallbackName} Extra`,
      description: "Our special chef's custom seasoned variation.",
      price: 150 + fallbackSuffix * 10,
      isVeg: isVeg || isPureVeg ? true : false
    });
    fallbackSuffix++;
  }

  // Map to final items with deterministic beautiful images
  return finalMenu.slice(0, 16).map((item, index) => {
    // Exact mapping check
    let resolvedImage = item.imageUrl;
    const cleanName = item.name.replace(" Extra", "");

    if (menuItemImages[cleanName]) {
      resolvedImage = menuItemImages[cleanName];
    } else {
      // Allow DishImage component to resolve smart category-based fallbacks
      resolvedImage = "";
    }

    return {
      id: `item-${restaurantName.toLowerCase().replace(/\s+/g, '-')}-${index}`,
      name: item.name,
      description: item.description || "Our Chef's hand-crafted signature recipe prepared with fresh aromatic spices.",
      price: item.price,
      isVeg: item.isVeg,
      isBestseller: item.isBestseller || false,
      imageUrl: resolvedImage
    };
  });
}

// 6 Cities and 5 localities/sub-cities per city
export const cityLocalities = {
  mumbai: ["Andheri", "Bandra", "Powai", "Dadar", "Colaba"],
  navimumbai: ["Panvel", "Kharghar", "Vashi", "Nerul", "Belapur"],
  pune: ["Hinjewadi", "Wakad", "Kothrud", "Baner", "Viman Nagar"],
  bangalore: ["Koramangala", "Indiranagar", "Whitefield", "HSR Layout", "Electronic City"],
  chennai: ["T Nagar", "Velachery", "Anna Nagar", "Adyar", "OMR"],
  ahmedabad: ["Satellite", "Navrangpura", "Bopal", "SG Highway", "Maninagar"]
};

// Highly curated unique names per cuisine/type to give realistic vibe
const cuisineNames = {
  seafood: ["Mahesh Lunch Home", "Gajalee Coastal", "Ferry Wharf", "Something's Fishy", "Harbour Marine"],
  northIndian: ["Pind Balluchi", "Punjab Grill", "Dhaba Estd 1986", "Copper Chimney", "Zaffran Classic"],
  southIndian: ["Sagar Ratna", "Saravana Bhavan", "Dakshin Spice", "Auroville Cafe", "Malgudi Junction"],
  chinese: ["Mainland China", "Uncle Lou's Wok", "Hao Chi Oriental", "Red Dragon", "Dynasty Lounge"],
  streetFood: ["Elco Chaat", "Swati Snacks", "Jashan Sweets", "Chowpatty Express", "The Chaat Club"],
  biryani: ["Behrouz Biryani", "Paradise Dum Biryani", "Biryani By Kilo", "Lucky Biryani", "Karim's Royal"],
  continental: ["The Pizza Bakery", "Little Italy", "Le Cafe Bistro", "Toscano Pizza", "Olive Garden Cafe"],
  cafe: ["Blue Tokai Coffee", "The Third Wave", "Star Cafe", "Chai Point", "The Brew Room"]
};

// Programmatic generation of 150 restaurants (6 cities * 5 localities/city * 5 restaurants/locality = 150)
const compiledRestaurants = [];

const citiesList = Object.keys(cityLocalities);

citiesList.forEach(cityId => {
  const localities = cityLocalities[cityId];

  localities.forEach(locality => {
    // We need EXACTLY 5 restaurants per locality
    for (let i = 0; i < 5; i++) {
      let name = "";
      let cuisines = [];
      let isVeg = false;
      let isPureVeg = false;
      let rating = parseFloat((4.1 + ((i + hashCode(locality)) % 9) * 0.1).toFixed(1));
      let ratingCount = `${Math.floor(100 + (Math.abs(hashCode(locality) + i) % 800))} reviews`;
      let deliveryTime = 20 + ((i * 5) % 25);
      let costForTwo = 200 + ((i * 100) % 600);
      let discount = i % 3 === 0 ? "50% OFF up to ₹100" : i % 3 === 1 ? "Flat ₹50 OFF" : null;
      let isSpecialITM = false;

      // Special handling for ITM Canteen in Kharghar, Navi Mumbai
      if (cityId === "navimumbai" && locality === "Kharghar" && i === 0) {
        name = "ITM Canteen";
        cuisines = ["South Indian", "Chinese", "Fast Food", "Street Food", "Beverages"];
        isVeg = false;
        isPureVeg = false;
        rating = 4.8;
        ratingCount = "3.4K reviews";
        deliveryTime = 12;
        costForTwo = 150;
        discount = "Flat ₹30 OFF for Students";
        isSpecialITM = true;
      } else {
        // Distribute cuisines realistically
        const types = Object.keys(cuisineNames);
        const selectedType = types[Math.abs(hashCode(locality) + i) % types.length];
        const namesList = cuisineNames[selectedType];

        name = `${namesList[i % namesList.length]} ${locality}`;

        if (selectedType === "seafood") {
          cuisines = ["Seafood", "South Indian"];
        } else if (selectedType === "northIndian") {
          cuisines = ["North Indian", "Biryani"];
        } else if (selectedType === "southIndian") {
          cuisines = ["South Indian"];
          isVeg = true;
          isPureVeg = i % 2 === 0;
        } else if (selectedType === "chinese") {
          cuisines = ["Chinese", "Continental"];
        } else if (selectedType === "streetFood") {
          cuisines = ["Street Food", "Sweets"];
          isVeg = true;
          isPureVeg = true;
        } else if (selectedType === "biryani") {
          cuisines = ["Biryani", "North Indian"];
        } else if (selectedType === "continental") {
          cuisines = ["Continental", "Chinese"];
        } else if (selectedType === "cafe") {
          cuisines = ["Cafe", "Continental"];
          isVeg = i % 2 === 0;
        }
      }

      // Map correct main image based on first cuisine
      const mainCuisine = cuisines[0];
      let imageUrl = images.northIndian;
      if (mainCuisine === "South Indian") imageUrl = images.southIndian;
      else if (mainCuisine === "Chinese") imageUrl = images.chinese;
      else if (mainCuisine === "Street Food") imageUrl = images.streetFood;
      else if (mainCuisine === "Biryani") imageUrl = images.biryani;
      else if (mainCuisine === "Continental") imageUrl = images.continental;
      else if (mainCuisine === "Seafood") imageUrl = images.seafood;
      else if (mainCuisine === "Sweets") imageUrl = images.sweets;
      else if (mainCuisine === "Cafe") imageUrl = images.cafe;

      compiledRestaurants.push({
        id: `${cityId}-${locality.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`,
        name,
        city: cityId,
        locality,
        cuisines,
        rating,
        ratingCount,
        deliveryTime,
        costForTwo,
        isVeg,
        isPureVeg,
        isOpen: true,
        discount,
        freeDelivery: (i % 2 === 0),
        imageUrl,
        isSpecial: isSpecialITM
      });
    }
  });
});

// Full detailed ITM Canteen custom menu with 30 items across 6 categories
const itmCanteenMenu = [
  // 1. Dosas
  {
    category: "Dosas",
    id: "item-itm-dosa-1",
    name: "Masala Dosa",
    description: "Crispy golden crepe stuffed with a lightly spiced onion-potato mash, served with fresh coconut chutney and hot sambar.",
    price: 60,
    isVeg: true,
    isBestseller: true,
    rating: 4.8,
    prepTime: "10 mins",
    isMostOrdered: true,
    imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80"
  },
  {
    category: "Dosas",
    id: "item-itm-dosa-2",
    name: "Mysore Masala Dosa",
    description: "Spicy red garlic-lentil chutney spread inside a thin crisp dosa wrapper, filled with delicious potato bhaji.",
    price: 75,
    isVeg: true,
    isBestseller: false,
    rating: 4.7,
    prepTime: "12 mins",
    imageUrl: "https://shreedevimelange.com/wp-content/uploads/2023/11/chees-paneer-mysore-Sada-doubt-1.webp"
  },
  {
    category: "Dosas",
    id: "item-itm-dosa-3",
    name: "Cheese Dosa",
    description: "Classic golden crepe loaded with melted Amul processed cheese and mild herbs. Pure cheese pull perfection!",
    price: 80,
    isVeg: true,
    isBestseller: false,
    rating: 4.6,
    prepTime: "8 mins",
    isMostOrdered: true,
    imageUrl: "https://expressmasuchiura.alfametalindustries.com/wp-content/uploads/2024/03/7-5.webp"
  },
  {
    category: "Dosas",
    id: "item-itm-dosa-4",
    name: "Paneer Dosa",
    description: "Golden rice crepe filled with savory marinated paneer bhurji, diced onions, and green coriander.",
    price: 85,
    isVeg: true,
    isBestseller: false,
    rating: 4.7,
    prepTime: "12 mins",
    imageUrl: "https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,h_960,w_960//InstamartAssets/Paneer_Dosa.webp"
  },
  {
    category: "Dosas",
    id: "item-itm-dosa-5",
    name: "Schezwan Dosa",
    description: "Crispy street-style dosa coated with spicy, sweet, and tangy red Schezwan chili paste and shredded cabbage.",
    price: 70,
    isVeg: true,
    isBestseller: false,
    rating: 4.5,
    prepTime: "10 mins",
    imageUrl: "https://b2dplate.com/wp-content/uploads/2021/07/a09f8-watermark_2020-08-30-10-13-502898531232460537894.jpg?w=995&h=1024"
  },
  {
    category: "Dosas",
    id: "item-itm-dosa-6",
    name: "Butter Plain Dosa",
    description: "Paper-thin, light, extra crispy plain crepe made with premium rice batter and slathered in warm table butter.",
    price: 50,
    isVeg: true,
    isBestseller: false,
    rating: 4.4,
    prepTime: "7 mins",
    imageUrl: "https://www.neehees.com/wp-content/uploads/2025/12/Why-Benne-Dosa-With-Extra-Butter-Feels-Like-Pure-Comfort-Food-BN.webp"
  },

  // 2. Fried Rice
  {
    category: "Fried Rice",
    id: "item-itm-rice-1",
    name: "Veg Fried Rice",
    description: "Piping hot, stir-fried basmati rice cooked in wok with crisp spring onions, green beans, carrots, and light soy seasoning.",
    price: 80,
    isVeg: true,
    isBestseller: false,
    rating: 4.5,
    prepTime: "10 mins",
    imageUrl: "https://www.whiskaffair.com/wp-content/uploads/2018/11/Vegetable-Fried-Rice-2-3.jpg"
  },
  {
    category: "Fried Rice",
    id: "item-itm-rice-2",
    name: "Triple Schezwan Fried Rice",
    description: "The ultimate canteen classic! Fusion combination of spicy Schezwan fried rice, soft Hakka noodles, and rich crispy Manchurian gravy.",
    price: 130,
    isVeg: true,
    isBestseller: true,
    rating: 4.9,
    prepTime: "15 mins",
    isMostOrdered: true,
    imageUrl: "https://thebawakitchen.com/wp-content/uploads/2022/08/Veg-Triple-Fried-Rice-scaled.jpg"
  },
  {
    category: "Fried Rice",
    id: "item-itm-rice-3",
    name: "Chicken Fried Rice",
    description: "Gourmet wok-tossed long-grain rice with succulent scrambled eggs, tender shredded chicken strips, and spring onion.",
    price: 110,
    isVeg: false,
    isBestseller: false,
    rating: 4.7,
    prepTime: "12 mins",
    isMostOrdered: true,
    imageUrl: "https://iamhomesteader.com/wp-content/uploads/2025/05/Bang-Bang-Chicken-Fried-Rice-2.jpg"
  },
  {
    category: "Fried Rice",
    id: "item-itm-rice-4",
    name: "Paneer Fried Rice",
    description: "Fluffy seasoned rice tossed with soft, pan-seared paneer cubes, chopped peppers, and dynamic Chinese herbs.",
    price: 100,
    isVeg: true,
    isBestseller: false,
    rating: 4.6,
    prepTime: "11 mins",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWn0fvycInvtN4Y_P5IBme4QjjRlRHKGAR3g&s"
  },
  {
    category: "Fried Rice",
    id: "item-itm-rice-5",
    name: "Burnt Garlic Fried Rice",
    description: "Smoky and aromatic wok-fried rice tossed with a heavy dose of crispy golden burnt garlic and finely chopped cilantro.",
    price: 90,
    isVeg: true,
    isBestseller: false,
    rating: 4.6,
    prepTime: "10 mins",
    imageUrl: "https://www.kannammacooks.com/wp-content/uploads/burnt-garlic-vegetable-fried-rice-indo-chinese.jpg"
  },

  // 3. Chinese
  {
    category: "Chinese",
    id: "item-itm-chin-1",
    name: "Hakka Noodles",
    description: "Soft, perfect boiled noodles stir-fried in hot wok with colorful matchstick vegetables, garlic, and vinegar.",
    price: 80,
    isVeg: true,
    isBestseller: false,
    rating: 4.5,
    prepTime: "10 mins",
    imageUrl: "https://www.whiskaffair.com/wp-content/uploads/2020/10/Veg-Hakka-Noodles-2-3.jpg"
  },
  {
    category: "Chinese",
    id: "item-itm-chin-2",
    name: "Schezwan Noodles",
    description: "Fiery wok-tossed noodles coated in house-made spicy, flavorful Szechuan peppercorn chili garlic paste.",
    price: 90,
    isVeg: true,
    isBestseller: false,
    rating: 4.6,
    prepTime: "10 mins",
    imageUrl: "https://thephotowali.wordpress.com/wp-content/uploads/2021/02/img20200527130944-21318503324010551748.jpeg"
  },
  {
    category: "Chinese",
    id: "item-itm-chin-3",
    name: "Chicken Noodles",
    description: "Wok-stirred egg noodles cooked with crispy matchstick veggies and tender pieces of savory pan-fried chicken.",
    price: 110,
    isVeg: false,
    isBestseller: false,
    rating: 4.7,
    prepTime: "12 mins",
    imageUrl: "https://christieathome.com/wp-content/uploads/2021/02/hoisin-chicken-noodles-6.jpg"
  },
  {
    category: "Chinese",
    id: "item-itm-chin-4",
    name: "Manchurian",
    description: "Crispy fried deep vegetable dumplings drenched in aromatic, shiny, sweet-and-sour ginger garlic soy gravy.",
    price: 90,
    isVeg: true,
    isBestseller: false,
    rating: 4.6,
    prepTime: "12 mins",
    isMostOrdered: true,
    imageUrl: "https://myfoodstory.com/wp-content/uploads/2021/10/Veg-Manchurian-FI-1.jpg"
  },
  {
    category: "Chinese",
    id: "item-itm-chin-5",
    name: "Chilli Paneer",
    description: "Battered paneer cubes deep fried and sautéed with thick onions, bell pepper slices, soy sauce, and green chiles.",
    price: 110,
    isVeg: true,
    isBestseller: false,
    rating: 4.7,
    prepTime: "13 mins",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQh6XpyFb21XJSI4zAbTDKk1VbByIjBfvJHpg&s"
  },
  {
    category: "Chinese",
    id: "item-itm-chin-6",
    name: "Chilli Chicken",
    description: "Indo-Chinese kitchen classic. Juicy fried chicken bites coated in tangy chili-garlic soy sauce with crunchy peppers.",
    price: 130,
    isVeg: false,
    isBestseller: false,
    rating: 4.8,
    prepTime: "14 mins",
    isMostOrdered: true,
    imageUrl: "https://images.slurrp.com/prod/recipe_images/transcribe/side%20dish/Chilli_Chicken.webp?impolicy=slurrp-20210601&width=1200&height=675"
  },
  {
    category: "Chinese",
    id: "item-itm-chin-7",
    name: "Spring Rolls",
    description: "Four crisp golden-fried rolled wrappers packed with heavily seasoned shredded cabbage, onion, and carrot noodles.",
    price: 70,
    isVeg: true,
    isBestseller: false,
    rating: 4.4,
    prepTime: "8 mins",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTurQ4KuX98Uqh8WdxN66jH5XU3P5taQ_QQ3A&s"
  },

  // 4. Fast Food
  {
    category: "Fast Food",
    id: "item-itm-fast-1",
    name: "Veg Burger",
    description: "Spicy and crisp vegetable patty layered in warm toasted buns with sweet burger mayo, lettuce, and onions.",
    price: 50,
    isVeg: true,
    isBestseller: false,
    rating: 4.5,
    prepTime: "8 mins",
    imageUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80"
  },
  {
    category: "Fast Food",
    id: "item-itm-fast-2",
    name: "Chicken Burger",
    description: "Crunchy crumbed spicy chicken patty nestled in soft toasted sesame buns with creamy burger spread and pickles.",
    price: 80,
    isVeg: false,
    isBestseller: true,
    rating: 4.9,
    prepTime: "10 mins",
    isMostOrdered: true,
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80"
  },
  {
    category: "Fast Food",
    id: "item-itm-fast-3",
    name: "Fries",
    description: "Salty and golden-brown skinless shoestring french potato fries, cooked till extra crunchy. Served with ketchup.",
    price: 60,
    isVeg: true,
    isBestseller: false,
    rating: 4.6,
    prepTime: "6 mins",
    imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80"
  },
  {
    category: "Fast Food",
    id: "item-itm-fast-4",
    name: "Cheese Fries",
    description: "A huge tray of crisp french fries completely smothered in heavy warm molten liquid cheddar cheese sauce.",
    price: 85,
    isVeg: true,
    isBestseller: false,
    rating: 4.7,
    prepTime: "8 mins",
    imageUrl: "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80"
  },
  {
    category: "Fast Food",
    id: "item-itm-fast-5",
    name: "Sandwiches",
    description: "Double layered white club bread toasted with butter, stuffed with cucumber, tomato slices, mint chutney, and cheese.",
    price: 65,
    isVeg: true,
    isBestseller: false,
    rating: 4.5,
    prepTime: "7 mins",
    isMostOrdered: true,
    imageUrl: "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=600&auto=format&fit=crop&q=80"
  },
  {
    category: "Fast Food",
    id: "item-itm-fast-6",
    name: "Pizza Slice",
    description: "A huge single triangular slice of stone-baked cheese pizza loaded with rich marinara sauce and melty mozzarella.",
    price: 55,
    isVeg: true,
    isBestseller: false,
    rating: 4.6,
    prepTime: "5 mins",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80"
  },

  // 5. Beverages
  {
    category: "Beverages",
    id: "item-itm-bev-1",
    name: "Cold Coffee",
    description: "The ultimate student fuel! Rich, thick, and perfectly sweetened blended chilled milk and aromatic coffee, topped with chocolate drizzle.",
    price: 50,
    isVeg: true,
    isBestseller: true,
    rating: 4.9,
    prepTime: "5 mins",
    isMostOrdered: true,
    imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80"
  },
  {
    category: "Beverages",
    id: "item-itm-bev-2",
    name: "Oreo Shake",
    description: "Thick premium milkshake made by blending creamy vanilla ice cream with delicious crushed chocolate Oreo cookies.",
    price: 70,
    isVeg: true,
    isBestseller: false,
    rating: 4.8,
    prepTime: "6 mins",
    imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80"
  },
  {
    category: "Beverages",
    id: "item-itm-bev-3",
    name: "Mango Shake",
    description: "Sweet, pulpy milkshake blended with fresh ripe Alfonso mango pulp and chilled creamy dairy.",
    price: 65,
    isVeg: true,
    isBestseller: false,
    rating: 4.7,
    prepTime: "6 mins",
    imageUrl: "https://www.funfoodfrolic.com/wp-content/uploads/2021/05/Mango-Shake-Thumbnail.jpg"
  },
  {
    category: "Beverages",
    id: "item-itm-bev-4",
    name: "Lime Soda",
    description: "Chilled carbonated soda water with a heavy squeeze of fresh green lime juice and sweet syrup, with a pinch of black salt.",
    price: 35,
    isVeg: true,
    isBestseller: false,
    rating: 4.5,
    prepTime: "4 mins",
    imageUrl: "https://wvusstatic.com/www/uploads/2017/07/Lime-Soda-167.jpg"
  },
  {
    category: "Beverages",
    id: "item-itm-bev-5",
    name: "Mojito",
    description: "Unbelievably refreshing ice-cold mocktail made with muddled fresh mint leaves, lime wedges, lime juice, sweet syrup, and fizzy soda.",
    price: 60,
    isVeg: true,
    isBestseller: false,
    rating: 4.7,
    prepTime: "5 mins",
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80"
  },

  // 6. Combos
  {
    category: "Combos",
    id: "item-itm-comb-1",
    name: "Dosa + Cold Drink",
    description: "Value combination. A freshly-made piping hot Masala Dosa served alongside a chilled thums-up/coke bottle.",
    price: 90,
    isVeg: true,
    isBestseller: false,
    rating: 4.7,
    prepTime: "12 mins",
    imageUrl: "https://media-cdn.tripadvisor.com/media/photo-p/1c/a1/a1/19/rajni-dosa.jpg"
  },
  {
    category: "Combos",
    id: "item-itm-comb-2",
    name: "Fried Rice + Manchurian",
    description: "Wok-fried Veg Fried Rice packed together with delicious crisp dry Veg Manchurian balls. Complete filling meal.",
    price: 140,
    isVeg: true,
    isBestseller: false,
    rating: 4.8,
    prepTime: "15 mins",
    isMostOrdered: true,
    imageUrl: "https://img.clevup.in/392528/SKU-0829_0-1757578043008.jpg?width=600&format=webp"
  },
  {
    category: "Combos",
    id: "item-itm-comb-3",
    name: "Burger + Fries + Coke",
    description: "The ultimate study break feast! Choose Veg or Chicken Burger, served with hot golden French fries and a cold coke.",
    price: 150,
    isVeg: false,
    isBestseller: false,
    rating: 4.9,
    prepTime: "11 mins",
    isMostOrdered: true,
    imageUrl: "https://i.pinimg.com/736x/0a/f1/03/0af1032adfb28edf82c44a8e4077398d.jpg"
  }
];

// Final mapping to resolve image Pools and inject menus
export const restaurants = compiledRestaurants.map(rest => {
  let resolvedImageUrl = rest.imageUrl;

  if (rest.name === "ITM Canteen") {
    resolvedImageUrl = "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=60";
  } else if (rest.cuisines && rest.cuisines.length > 0) {
    const mainCuisine = rest.cuisines[0];
    const poolKey = Object.keys(imagePools).find(k => k.toLowerCase() === mainCuisine.replace(/\s+/g, '').toLowerCase())
      || 'northIndian';
    const pool = imagePools[poolKey] || imagePools.northIndian;
    const imageIndex = Math.abs(hashCode(rest.id)) % pool.length;
    resolvedImageUrl = pool[imageIndex];
  }

  // Build the menucategories structure
  let menuCategories = [];
  if (rest.name === "ITM Canteen") {
    // Group the static list into its categories
    const categoriesList = ["Dosas", "Fried Rice", "Chinese", "Fast Food", "Beverages", "Combos"];
    menuCategories = categoriesList.map(catName => ({
      name: catName,
      items: itmCanteenMenu.filter(item => item.category === catName).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        isVeg: item.isVeg,
        isBestseller: item.isBestseller,
        isMostOrdered: item.isMostOrdered || false,
        rating: item.rating,
        prepTime: item.prepTime,
        imageUrl: item.imageUrl,
        category: catName
      }))
    }));
  } else {
    // Normal restaurant categories - calling createRestaurantMenu once per restaurant
    // and copying menu items to prevent shared fallback corruption or mutations
    const fullMenu = createRestaurantMenu(rest.cuisines, rest.isVeg, rest.isPureVeg, rest.name);

    menuCategories = [
      {
        name: "Recommended Classics",
        items: fullMenu.slice(0, 4).map(item => ({ ...item, category: "Recommended Classics" }))
      },
      {
        name: "Main Course Specialties",
        items: fullMenu.slice(4, 8).map(item => ({ ...item, category: "Main Course Specialties" }))
      },
      {
        name: "Sides & Accompaniments",
        items: fullMenu.slice(8, 12).map(item => ({ ...item, category: "Sides & Accompaniments" }))
      },
      {
        name: "Sweets & Coolers",
        items: fullMenu.slice(12, 16).map(item => ({ ...item, category: "Sweets & Coolers" }))
      }
    ];
  }

  return {
    ...rest,
    imageUrl: resolvedImageUrl,
    menuCategories
  };
});
