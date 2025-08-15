import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// POST /chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const payload = {
      model: "gpt-4o-mini", // You can switch to gpt-5 if available
      messages: req.body.messages
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(400).json({ error: errorData.error.message });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "";
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => {
  console.log("✅ Backend running on http://localhost:5000");
});
