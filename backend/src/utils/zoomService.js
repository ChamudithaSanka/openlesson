import axios from "axios";
import dotenv from "dotenv";
import querystring from "querystring";

dotenv.config();

// Zoom OAuth credentials
const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;
const ZOOM_API_BASE_URL = "https://zoom.us/oauth/token";
const ZOOM_MEETING_API_BASE = "https://api.zoom.us/v2/users/me/meetings";

let cachedAccessToken = null;
let tokenExpireTime = null;

/**
 * Get Zoom Access Token using OAuth 2.0 Account-Level
 */
const getZoomAccessToken = async () => {
  try {
    // Check if cached token is still valid
    if (cachedAccessToken && tokenExpireTime && new Date() < tokenExpireTime) {
      return cachedAccessToken;
    }

    const auth = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString("base64");

    const response = await axios.post(
      ZOOM_API_BASE_URL,
      querystring.stringify({
        grant_type: "account_credentials",
        account_id: ZOOM_ACCOUNT_ID,
      }),
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    cachedAccessToken = response.data.access_token;
    tokenExpireTime = new Date(Date.now() + 55 * 60 * 1000);

    console.log("✓ Zoom access token obtained successfully");
    return cachedAccessToken;
  } catch (error) {
    const errorDetail = error.response?.data || error.message;
    console.error("❌ Error getting Zoom access token:", errorDetail);
    console.error("Status Code:", error.response?.status);
    console.error("Credentials check - Account ID:", ZOOM_ACCOUNT_ID ? "✓ Set" : "✗ Missing");
    console.error("Credentials check - Client ID:", ZOOM_CLIENT_ID ? "✓ Set" : "✗ Missing");
    console.error("Credentials check - Client Secret:", ZOOM_CLIENT_SECRET ? "✓ Set" : "✗ Missing");
    throw new Error(`Failed to obtain Zoom API token: ${errorDetail?.error_description || error.message}`);
  }
};

/**
 * Create a Zoom meeting
 */
export const createZoomMeeting = async (meetingData) => {
  try {
    const accessToken = await getZoomAccessToken();

    const requiredFields = ["topic", "start_time", "duration"];
    const missingFields = requiredFields.filter((field) => !meetingData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    const meetingConfig = {
      topic: meetingData.topic,
      type: 2,
      start_time: meetingData.start_time,
      duration: meetingData.duration,
      timezone: "UTC",
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: true,
        waiting_room: false,
        approval_type: 2,
        audio: "both",
      },
    };

    if (meetingData.description) {
      meetingConfig.agenda = meetingData.description;
    }

    const response = await axios.post(ZOOM_MEETING_API_BASE, meetingConfig, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✓ Real Zoom meeting created successfully");
    return {
      success: true,
      data: {
        meetingId: response.data.id.toString(),
        joinUrl: response.data.join_url,
        startUrl: response.data.start_url,
        zoomMeetingId: response.data.id,
      },
    };
  } catch (error) {
    console.error(
      "❌ Error creating Zoom meeting:",
      error.response?.data || error.message
    );
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

/**
 * Delete a Zoom meeting
 */
export const deleteZoomMeeting = async (meetingId) => {
  try {
    const accessToken = await getZoomAccessToken();

    await axios.delete(`${ZOOM_MEETING_API_BASE}/${meetingId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log("✓ Zoom meeting deleted successfully");
    return { success: true, message: "Meeting deleted successfully" };
  } catch (error) {
    console.error(
      "❌ Error deleting Zoom meeting:",
      error.response?.data || error.message
    );
    if (error.response?.status === 404) {
      return { success: true, message: "Meeting no longer exists on Zoom" };
    }
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};
