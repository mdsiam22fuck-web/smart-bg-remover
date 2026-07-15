import express from "express";
import multer from "multer";
import FormData from "form-data";
import axios from "axios";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware for JSON and urlencoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Background removal endpoint
app.post("/api/remove-bg", upload.single("image_file"), async (req: any, res: any) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No image file provided" });
      return;
    }

    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "Missing API Key: Please set REMOVE_BG_API_KEY in the application settings." });
      return;
    }

    const formData = new FormData();
    formData.append("size", "auto");
    formData.append("image_file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post("https://api.remove.bg/v1.0/removebg", formData, {
      headers: {
        ...formData.getHeaders(),
        "X-API-Key": apiKey,
      },
      responseType: "arraybuffer", // we want the binary image back
    });

    res.setHeader("Content-Type", "image/png");
    res.send(response.data);
  } catch (error: any) {
    let errorMsg = "Failed to remove background. Ensure your API key is valid.";
    
    if (error.response?.data) {
      try {
        // data is an ArrayBuffer/Buffer because responseType is arraybuffer
        const decodedString = Buffer.from(error.response.data).toString('utf-8');
        const errObj = JSON.parse(decodedString);
        if (errObj.errors && errObj.errors.length > 0) {
          errorMsg = errObj.errors[0].title || errorMsg;
        }
      } catch (e) {
        // ignore parsing error
      }
    }
    
    console.error("Error removing background:", errorMsg);
    res.status(error.response?.status || 500).json({ error: errorMsg });
  }
});

// Serve a standard error on other API routes
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: `API endpoint ${req.method} ${req.path} not found` });
});

export default app;
