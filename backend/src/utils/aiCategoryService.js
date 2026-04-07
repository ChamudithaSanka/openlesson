// 🤗 Hugging Face Zero-Shot Classification Service
// Model: facebook/bart-large-mnli
// Free to use - no credit card required

const HF_API_URL =
  "https://router.huggingface.co/hf-inference/models/facebook/bart-large-mnli";

const VALID_CATEGORIES = [
  "Login Issue",
  "Video/Content Issue",
  "Technical Bug",
  "Payment Issue",
  "Other",
];

// More descriptive labels help the AI classify more accurately
const DESCRIPTIVE_LABELS = [
  "Login Issue: cannot sign in, wrong password, account locked, authentication failed",
  "Video/Content Issue: video not loading, buffering, missing lecture, content unavailable",
  "Technical Bug: app crash, error message, freeze, unexpected behavior, not responding",
  "Payment Issue: payment failed, charge not confirmed, billing problem, refund",
  "Other: general question, suggestion, unrelated issue",
];

/**
 * Auto-categorize a complaint using Hugging Face Zero-Shot Classification
 * @param {string} subject - The complaint subject
 * @param {string} description - The complaint description
 * @returns {Promise<string>} - One of the valid category strings
 */
export const categorizeComplaint = async (subject, description) => {
  try {
    const inputText = `${subject}. ${description}`;

    console.log("🤖 Calling Hugging Face API...");
    console.log("📝 Input text:", inputText);
    console.log("🔑 Token present:", !!process.env.HF_API_TOKEN);

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: inputText,
        parameters: {
          // Use descriptive labels for better accuracy
          candidate_labels: DESCRIPTIVE_LABELS,
        },
      }),
    });

    console.log("📡 Hugging Face response status:", response.status);

    if (response.status === 503) {
      console.warn("⏳ Hugging Face model is still loading, please try again in 10 seconds");
      return "Other";
    }

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("❌ Hugging Face API error body:", errorBody);
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Hugging Face raw response:", JSON.stringify(data));

    // Response is an array of { label, score } objects sorted by score (highest first)
    const results = Array.isArray(data) ? data : data[0];
    const bestDescriptiveLabel = results[0].label;
    console.log("🏆 Best descriptive label from AI:", bestDescriptiveLabel);

    // Map the descriptive label back to the clean category name
    // e.g. "Technical Bug: app crash..." → "Technical Bug"
    const matched = VALID_CATEGORIES.find((cat) =>
      bestDescriptiveLabel.startsWith(cat)
    );

    console.log(`✅ Final category: "${matched || "Other"}"`);
    return matched || "Other";

  } catch (error) {
    console.error("❌ Hugging Face categorization failed:", error.message);
    return "Other";
  }
};