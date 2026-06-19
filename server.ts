import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set up robust limits to accept Base64 screenshot payloads seamlessly
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Initialize the server-side Google GenAI client with correct telemetry and secret environment key
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // endpoint 1: Multimodal analysis of Boviguard Gallery Snapshot
  app.post("/api/ai/analyze-snapshot", async (req, res) => {
    try {
      const { imageData, city, corridor, confidence, label, timestamp } = req.body;
      if (!imageData) {
        return res.status(400).json({ error: "Missing snapshot image data" });
      }

      // Remove potential header in base64 URL
      const base64Clean = imageData.replace(/^data:image\/\w+;base64,/, "");

      // Execute a server-side multimodal call using Gemni 3.5 Flash as instructed by the gemini-api skill
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              data: base64Clean,
              mimeType: "image/jpeg"
            }
          },
          {
            text: `You are Boviguard AI, an elite smart-infrastructure intelligence system for analyzing livestock-related traffic threats on highway corridors under the Tamil Nadu Smart Highways Initiative.

Analyze this captured camera snapshot and its contextual metadata:
- District: ${city} (Tamil Nadu)
- Corridor Segment: ${corridor}
- YOLOv8 Neural Confidence: ${confidence}%
- Identified Class: ${label}
- Captured ISO Timestamp: ${timestamp}

Analyze the image carefully to assess the threat profile. Identify the cattle breed features, any structural elements, lighting quality, and calculate actionable response advice.

Respond strictly in clean, well-formatted JSON conforming to this schema without any outer markdown decorators or wrapper text:
{
  "breedClassification": "Breed description and estimated morphology",
  "riskRating": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "riskExplanation": "Analytical safety reasoning detailing the specific risk factors",
  "sceneAudit": "Candid assessment of visual conditions, shadowing, glare, or camera optimization limitations",
  "recommendedAction": "Tactical highway patrolling units dispatch instructions"
}`
          }
        ],
        config: {
          responseMimeType: "application/json",
        }
      });

      const responseText = response.text || "{}";
      const cleanJsonStr = responseText.trim().replace(/^```json\s*/i, '').replace(/```$/, '').trim();
      const analysisResult = JSON.parse(cleanJsonStr);

      res.json(analysisResult);
    } catch (error: any) {
      console.error("Error in Boviguard snapshot analysis API:", error);
      res.status(500).json({ 
        error: "Failed to assemble AI threat report", 
        details: error.message || error.toString() 
      });
    }
  });

  // endpoint 2: AI Pitch Co-Pilot Strategic Objection handler
  app.post("/api/ai/pitch-advisor", async (req, res) => {
    try {
      const { customQuestion, selectedFocus, selectedState } = req.body;

      // Ask Gemini 3.5 Flash to generate a high-impact strategy using the specified framework
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are the chief Boviguard AI Pitch Advisor for the Tamil Nadu Youth IoT and Infrastructure Innovation Competition (TNYIEDP). Your mission is to generate a perfect, bulletproof argument strategy to answer challenging judge questions and secure critical pilot adoption approvals.

Analyze this Objection/Question:
"${customQuestion || "How does Boviguard maintain inference performance under zero-bar signal internet dead zones along NH45?"}"

Selected Pitch Focus: ${selectedFocus || "Edge computing YOLOv8 nodes"}
Geographic Alignment: ${selectedState || "Tamil Nadu Districts"}

Develop an outstanding tactical retort adhering strictly to the Boviguard Winning Response Framework:
1. Hook (The "Contrarian Truth"): A bold, shocking opening statement that immediately shifts the perspective.
2. Technical Dissection: Clear, concrete engineering description explaining how Boviguard overcomes this (mentioning model optimization, local flash memory log persistence, and solar-power resilience).
3. Local Impact Blueprint: Specific regional benefits corresponding to the district corridors (Coimbatore, Madurai, Tiruvannamalai) or highway safety targets in Tamil Nadu.
4. Fiscal Math: Concrete math showing return on investment (ROI), asset protection, or public expenditure savings.

Respond strictly with a JSON object conforming to the following structure. Do not use markdown wrappers:
{
  "hook": "Opening bold statement",
  "technicalDissection": "Deep engineering description",
  "localImpact": "Geographic safety impact description",
  "fiscalMath": "Defensive ROI calculation or budget explanation"
}`,
        config: {
          responseMimeType: "application/json",
        }
      });

      const responseText = response.text || "{}";
      const cleanJsonStr = responseText.trim().replace(/^```json\s*/i, '').replace(/```$/, '').trim();
      const pitchResult = JSON.parse(cleanJsonStr);

      res.json(pitchResult);
    } catch (error: any) {
      console.error("Error in Boviguard pitch-advisor API:", error);
      res.status(500).json({ 
        error: "Failed to generate advisor response", 
        details: error.message || error.toString() 
      });
    }
  });

  // Live Server Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "online", service: "Boviguard AI Full-Stack Server" });
  });

  // Integrate Vite dynamically for development mode, otherwise serve production index.html and static build
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Boviguard Server live on http://localhost:${PORT}`);
  });
}

startServer();
