require("dotenv").config();
import * as express from "express";
import * as cors from "cors";
import { createBaseServer } from "../../utils/backend/base_backend/create";
import * as path from "path";

async function main() {
  const APP_ID = process.env.CANVA_APP_ID;

  if (!APP_ID) {
    throw new Error(
      `The CANVA_APP_ID environment variable is undefined. Set the variable in the project's .env file.`
    );
  }

  const router = express.Router();
  router.use(cors({
    origin: "https://app-aafxl9ms1s8.canva-apps.com"
  }));

  router.post("/summarize-items", async (req, res) => {
    const items = req.body;
    res.send([`You have sent me ${items.length} items`]);
  });

  router.post("/generate-music", async(req, res) => {
    const text = req.body.text;
    res.send({url: `${process.env.CANVA_BACKEND_HOST}/music/example.mp3`});
    // https://huggingface.co/facebook/musicgen-small
  })

  router.get("/music/:audio", async(req, res) => {
    const audioId = req.params.audio;
    const filePath = path.join(__dirname, audioId);
    res.sendFile(filePath);
  })

  const server = createBaseServer(router);
  server.start(process.env.CANVA_BACKEND_PORT);
}

main();
