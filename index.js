import { AccessToken } from "livekit-server-sdk";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const createToken = async (participantName, roomName) => {
  try {
    if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
      throw new Error("LiveKit API key and secret are required");
    }

    console.log("Creating token for:", { participantName, roomName });

    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: participantName,
        name: participantName, // This will be the displayed name
        ttl: "10m", // Token expires after 10 minutes
      }
    );

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();
    console.log(token);
    
    console.log("Token generated successfully");
    return token;
  } catch (error) {
    console.error("Token generation error:", error);
    throw error;
  }
};

// GET endpoint for token generation (alternative)
app.get("/getToken", async (req, res) => {
  try {
    const { participantName, roomName } = req.query;

    // Validate input
    if (!participantName || !roomName) {
      return res.status(400).json({
        success: false,
        error: "participantName and roomName are required as query parameters",
      });
    }

    // Generate token
    const token = await createToken(participantName, roomName);
    console.log(token);

    return res.status(200).json({
      success: true,
      token:token,
      participantName:participantName,
      roomName:roomName
    });
  } catch (error) {
    console.error("Request error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate token",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
