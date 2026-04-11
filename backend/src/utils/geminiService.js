import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const VALID_CATEGORIES = [
  "Login Issue",
  "Video/Content Issue",
  "Technical Bug",
  "Other",
];

/**
 * Auto-categorize a complaint using Google Gemini 1.5 Flash
 * @param {string} subject - The complaint subject
 * @param {string} description - The complaint description
 * @returns {Promise<string>} - One of the valid category strings
 */
export const categorizeComplaintWithGemini = async (subject, description) => {
  try {

    console.log("🚀 --- Gemini AI Categorization Starting ---");

    //ADD FALLBACK RULE SYSTEM

    const textData = (subject + " " + description).toLowerCase();

    if (textData.includes("password") || textData.includes("login")) {
      console.log("⚡ Rule-based match: Login Issue");
      return "Login Issue";
    }

    if (textData.includes("video") || textData.includes("zoom") || textData.includes("lecture") || textData.includes("class")) {
      console.log("⚡ Rule-based match: Video/Content Issue");
      return "Video/Content Issue";
    }

    if (textData.includes("error") || textData.includes("crash") || textData.includes("bug") || textData.includes("not working") || textData.includes("slow")) {
      console.log("⚡ Rule-based match: Technical Bug");
      return "Technical Bug";
    }

    
    console.log("📝 Input:", { subject, description });

    if (!API_KEY) {
      console.error("❌ GOOGLE_API_KEY is missing from .env");
      return "Other";
    }

    const prompt = `
      You are an AI assistant for a student volunteer tutoring platform named "OpenLesson". 
      Your task is to categorize a student's complaint into EXACTLY ONE of the following categories:
      
      1. Login Issue (Use for: cannot sign in, wrong password, forgot account, authentication failed, account locked)
      2. Video/Content Issue (Use for: Zoom links not working, cannot access lecture, video not clear, buffering, audio missing, missing PDF/content)
      3. Technical Bug (Use for: app crashing, website error messages, buttons not clicking, page not loading, site slow)
      4. Other (Use for: general questions, suggestions, feedback, or anything not covered above)

      Student's Complaint:
      Subject: "${subject}"
      Description: "${description}"

      IMPORTANT:
      - You MUST return ONLY one exact category from this list:
        Login Issue
        Video/Content Issue
        Technical Bug
        Other

      - DO NOT return sentences
      - DO NOT explain
      - DO NOT add punctuation
      - ONLY return the category name exactly
    `;

    // We try gemini-1.5-flash first
    let result;
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      result = await model.generateContent(prompt);
    } catch (e) {
      console.warn("⚠️ Gemini 1.5 Flash failed (possibly 404), trying gemini-pro...");
      try {
        const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
        result = await modelPro.generateContent(prompt);
      } catch (proError) {
        console.error("❌ Both Gemini models failed:", proError.message);
        return "Other";
      }
    }

    const response = await result.response;
    const text = response.text().trim();

    console.log(`📡 Gemini Raw Output: "${text}"`);

    // Ensure the output matches one of our valid categories
    const cleanText = text.toLowerCase().trim();

    console.log("🔍 Cleaned Text:", cleanText); 

    let matched = null;

    if (cleanText.includes("login")) {
      matched = "Login Issue";
    } else if (cleanText.includes("video") || cleanText.includes("content")) {
      matched = "Video/Content Issue";
    } else if (cleanText.includes("technical") || cleanText.includes("bug") || cleanText.includes("error")) {
      matched = "Technical Bug";
    } else {
      matched = "Other";
    }


    console.log("🎯 Matched Category:", matched);

    console.log(`✅ Final Categorization: "${matched || "Other"}"`);
    return matched || "Other";

  } catch (error) {
    console.error("❌ Gemini Categorization failed:", error.message);
    return "Other";
  }
};
