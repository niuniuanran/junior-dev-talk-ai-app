require("dotenv").config();
import * as express from "express";
import * as cors from "cors";
import { createBaseServer } from "../../utils/backend/base_backend/create";
import * as aws from "aws-sdk"
import OpenAI from "openai";

const openai = new OpenAI();

async function main() {
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

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      messages: [
        {
          "role": "system",
          "content": "You will be provided a JavaScript array of string. These strings are ideas from a whiteboard. Please summarize these ideas into groups and return a JavaScript array of string, each string is a one-sentence summarization of this group of ideas. Each sentence should be between 20 to 40 words."
        },
        {
          "role": "user",
          "content": JSON.stringify(items)
        }
      ],
      temperature: 0.8,
      max_tokens: 256,
    });
    res.send(response.choices[0].message.content);
    // https://platform.openai.com/docs/quickstart?context=node
    // https://platform.openai.com/docs/api-reference/chat/create
    // https://platform.openai.com/docs/examples/default-emoji-chatbot?lang=node.js
  });

  router.post("/generate-music", async (req, res) => {
    const text = req.body.text;
    const params = {
      Bucket: 'anran-audio-bucket',
      Key: "example.mp3",
      Expires: 60 * 5,
    };
    s3.getSignedUrl('getObject', params, (err, url) => {
      console.log("url", url)
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
