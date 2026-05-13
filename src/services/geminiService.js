// Gemini integration service for CRAVE Live Chat Experiences
// Handles Customer Support roleplay, Delivery Rider roleplay with strict Gemini API verification.

const API_MODEL = "gemini-2.5-flash";
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${API_MODEL}:generateContent`;

// Retrieve API key from import.meta.env
const getApiKey = () => {
  const key = import.meta.env.VITE_GEMINI_API_KEY || "";
  // Treat placeholder as empty
  if (key === "your_gemini_api_key_here" || !key.trim()) {
    return "";
  }
  return key;
};

/**
 * Normalizes chat history to ensure strict alternating roles, starting with 'user'.
 * This is crucial for avoiding 400 Bad Request errors in the Gemini API.
 * @param {Array} history - [{ sender: 'user'|'agent'|'rider', text: string }]
 * @returns {Array} - [{ role: 'user'|'model', parts: [{ text: string }] }]
 */
const normalizeHistory = (history) => {
  const result = [];
  let lastRole = null;

  for (const msg of (history || [])) {
    const role = msg.sender === 'user' ? 'user' : 'model';

    // Skip consecutive identical roles to enforce strict alternating
    if (role === lastRole) {
      continue;
    }

    // Gemini requires the conversation contents array to start with a 'user' role
    if (result.length === 0 && role === 'model') {
      continue;
    }

    result.push({
      role,
      parts: [{ text: msg.text || "" }]
    });
    lastRole = role;
  }

  return result;
};

/**
 * Direct fetch call to Gemini REST API.
 * @param {string} systemInstruction - The persona/roleplay guidance.
 * @param {string} userMessage - The latest user message.
 * @param {Array} chatHistory - Previous messages.
 * @returns {Promise<string>} - Model output text.
 */
export async function callGemini(systemInstruction, userMessage, chatHistory = []) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("No valid Gemini API key found in configuration.");
  }

  const contents = normalizeHistory(chatHistory);
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  const requestBody = {
    contents,
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 200,
      topP: 0.95
    }
  };

  // PART 5 — ADD DEBUGGING
  console.log("Sending Gemini request...");
  console.log("Target API Endpoint:", BASE_URL);
  console.log("System Instructions:", systemInstruction);
  console.log("Messages Payload:", contents);

  const response = await fetch(`${BASE_URL}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData?.error?.message || `HTTP error ${response.status}`;
    throw new Error(errorMessage);
  }

  const result = await response.json();
  
  // PART 5 — ADD DEBUGGING
  console.log("Gemini response:", result);

  // parse Gemini response safely
  const reply = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  
  // Log parsed text before rendering
  console.log("Gemini parsed text:", reply);

  if (!reply || reply.trim() === "") {
    throw new Error("Empty Gemini response");
  }

  return reply.trim();
}

/**
 * Formats a list of ordered items for the system instruction context.
 */
const formatOrderItems = (items) => {
  if (!items || items.length === 0) return "No items listed";
  return items.map(i => `${i.name} (${i.quantity || 1}x)`).join(", ");
};

/**
 * Main service entry point. Generates the appropriate system instruction,
 * tries calling Gemini REST API, and falls back gracefully to local intelligence.
 * Includes rate limiting/locking parameters.
 */
export async function getLiveChatResponse({ type, message, chatHistory = [], context = {} }) {
  const currentTimeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const itemsStr = formatOrderItems(context.items);
  
  // Choose persona templates
  let systemInstruction = "";

  if (type === "support") {
    // Rohan from CRAVE Support
    systemInstruction = `
You are Rohan, a premium live support executive from CRAVE Care Hub.
Your personality:
- Extremely polite, professional, calm, helpful, and concise.
- ALWAYS address the customer with supreme respect.
- Keep responses short and direct (1-2 sentences, maximum 3 sentences). Avoid paragraphs or bullet points.
- DO NOT use markdown formatting (no bolding, no bullet points, no asterisks, no hashes). Keep text clean and simple.

Context of the active order (use this to customize your replies so they feel highly realistic):
- Customer Name: ${context.customerName || "Valued Customer"}
- Restaurant Name: ${context.restaurantName || "Campus Kitchen"}
- Order Status: ${context.orderStatus || "Order Confirmed"}
- Ordered Items: ${itemsStr}
- Delivery Partner: ${context.riderName || "Rohan"}
- ETA: ${context.eta || "15"} mins
- Payment Method: ${context.paymentMethod || "UPI"}

Current local time is ${currentTimeStr}.

Helpful policies you can implement on the fly:
- If customer reports wrong item or delayed food, offer a refund or an instant CRAVE care coupon code [CRAVECARE150] of ₹150 value.
- If order is delayed, explain that rider is en route and coordinate with dispatcher.
- For membership questions, remind them that CRAVE PRO gives free delivery and platform fees.
`;
  } else if (type === "rider") {
    // Delivery Rider Persona
    systemInstruction = `
You are ${context.riderName || "the assigned rider"}, the delivery partner driving to deliver this CRAVE order.
Your personality:
- Act like a real delivery person: use a short, casual, realistic, delivery-focused tone.
- NEVER sound like an AI assistant, customer support bot, or ChatGPT.
- DO NOT use fancy formatting, bullet points, formal greetings, or markdown asterisks. Keep it plain text.
- Keep responses extremely short (e.g., "Got it, near signal", "Sure will do", "Reaching in 4 mins").
- Use simple, slightly casual English with a friendly attitude.

Context of this delivery:
- Restaurant: ${context.restaurantName || "ITM Canteen"}
- Order Status: ${context.orderStatus || "Out for Delivery"}
- ETA: ${context.eta || "10"} mins
- Delivery Location: ${context.deliveryAddress?.addressLine || "your hostel block"}

Current local time is ${currentTimeStr}.

Respond realistically to gating, bells, phone calls, location tracking, or drop-off requests.
`;
  }

  // Attempt API execution, throwing errors directly to prevent any silent faking or local simulation
  const apiResponse = await callGemini(systemInstruction, message, chatHistory);
  
  // Sanitize any accidental markdown formatting
  return apiResponse.replace(/[\*\_`#]/g, "").trim();
}

/**
 * Persistent storage utilities for chat history per order.
 */
export const loadLocalChatHistory = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Failed to load chat history:", e);
    return null;
  }
};

export const saveLocalChatHistory = (key, history) => {
  try {
    localStorage.setItem(key, JSON.stringify(history));
  } catch (e) {
    console.error("Failed to save chat history:", e);
  }
};
