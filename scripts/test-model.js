require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function list() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
     const models = await genAI.getGenerativeModel({ model: "gemini-pro" }); 
     // We can't actually list models easily with just the SDK without more complex code
     // Let's just try to generate a tiny string with gemini-pro or gemini-1.5-pro
     console.log("Testing with gemini-1.5-pro...");
     const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
     const result = await model.generateContent("Hi");
     console.log(result.response.text());
  } catch (e) {
    console.error(e);
  }
}
list();
