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
      return "Other";
    }

    const data = await response.json();
    console.log("✅ Hugging Face raw response:", JSON.stringify(data));

    let bestDescriptiveLabel = "";
    
    // 1. { labels: [...], scores: [...] }
    // 2. [ { labels: [...], scores: [...] } ]
    if (Array.isArray(data)) {
      bestDescriptiveLabel = data[0]?.labels?.[0] || "";
    } else if (data.labels && data.labels.length > 0) {
      bestDescriptiveLabel = data.labels[0];
    } else {
      console.warn("⚠️ Unexpected AI response format:", data);
      return "Other";
    }

    console.log("🏆 Best descriptive label from AI:", bestDescriptiveLabel);

    // Map the descriptive label back to the clean category name
    const matched = VALID_CATEGORIES.find((cat) =>
      bestDescriptiveLabel.toLowerCase().includes(cat.toLowerCase())
    );

    console.log(`✅ Final category matched: "${matched || "Other"}"`);
    return matched || "Other";

  } catch (error) {
    console.error("❌ Hugging Face categorization failed:", error.message);
    return "Other";
  }
};