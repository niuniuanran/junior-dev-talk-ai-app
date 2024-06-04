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
  const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || "anran-audio-bucket";

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
          "content": `You are grouping and summarizing people's ideas from a whiteboard session. You will be provided a JavaScript array of string, each string is an idea. Please sort them into 3 groups and summarize them.

          Please provide a json object with only one field, "groups".
          The "groups" field will be an array of 3 objects, each has a "summary", "originalIdeas" field about the group.
          The "summary" field is a high-level description of this group. It is a string no longer than 15 words, ending with an emoji.
          The "originalNotes" field is an array of the original item I provided to you.`
        },
        {
          "role": "user",
          "content": JSON.stringify(items)
        }
      ],
      temperature: 0.8,
    });

    res.send(response.choices[0].message.content);
    // https://platform.openai.com/docs/quickstart?context=node
    // https://platform.openai.com/docs/api-reference/chat/create
    // https://platform.openai.com/docs/examples/default-emoji-chatbot?lang=node.js
  });

  router.post("/generate-music", async (req, res) => {
    const text = req.body.text;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/musicgen-small",
      {
        headers: { Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}` },
        method: "POST",
        body: JSON.stringify(text),
      }
    );

    if (!response.ok) {
      console.error("😅", response)
      res.status(500).send('Error generating music');
      return
    }

    console.log("Successfully generated music", response.status)

    const objectKey = `ai_music/${Date.now()}.wav`;
    try {
      // Upload the byte object to S3
      await s3.upload({
        Bucket: S3_BUCKET_NAME,
        Key: objectKey,
        Body: new Uint8Array(await response.arrayBuffer()),
        ContentType: 'audio/wav'
      }).promise();

      // Generate a signed URL for the uploaded object
      const signedUrl = s3.getSignedUrl('getObject', {
        Bucket: S3_BUCKET_NAME,
        Key: objectKey,
        Expires: 3600 // URL expiration time in seconds
      });

      console.log("Successfully uploaded music to S3", signedUrl)
      res.json({ url: signedUrl });
    } catch (err) {
      console.error('Error uploading to S3', err);
      res.status(500).send('Error uploading to S3');
    }
  })

  const server = createBaseServer(router);
  server.start(process.env.CANVA_BACKEND_PORT);
}

main();
