import express from "express";
import path from "path";
import multer from "multer";
import FormData from "form-data";
import axios from "axios";
import { createServer as createViteServer } from "vite";

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON middleware
  app.use(express.json());

  // API constraints
  app.post("/api/remove-bg", upload.single("image_file"), async (req, res) => {
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
          // data is an ArrayBuffer because we set responseType: 'arraybuffer'
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
