require("dotenv").config();
import * as express from "express";
import * as cors from "cors";
import { createBaseServer } from "../../utils/backend/base_backend/create";
import * as aws from "aws-sdk"

async function main() {
  aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });

  const s3 = new aws.S3();
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

  router.post("/generate-music", async (req, res) => {
    const text = req.body.text;
    const params = {
      Bucket: 'anran-audio-bucket',
      Key: "example.mp3",
      Expires: 60 * 5,
    };
    // S3 getSignedUrl with callbacks is not supported in AWS SDK for JavaScript (v3).
    // Please convert to 'client.getSignedUrl(apiName, options)', and re-run aws-sdk-js-codemod.
    s3.getSignedUrl('getObject', params, (err, url) => {
      if (err) {
        res.status(500).json({ error: "Error -> " + err });
      } else {
        res.json({ url: url });
      }
    });
    // https://huggingface.co/facebook/musicgen-small
  })

  const server = createBaseServer(router);
  server.start(process.env.CANVA_BACKEND_PORT);
}

main();
