import React, { useState } from "react";
import { useSelection } from "../utils/use_selection_hook";
import { Button, Rows } from "@canva/app-ui-kit";
import styles from "styles/components.css";
import { addAudioTrack, addNativeElement } from "@canva/design";
import { upload } from "@canva/asset";

export function App() {
  const currentSelection = useSelection("plaintext");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const isElementSelected = currentSelection.count > 0;

  const summarizeSelectedItems = async () => {
    // https://www.canva.dev/docs/apps/reading-elements/#plain-text-2
    if (!isElementSelected) {
      return;
    }
    setState("loading");
    const draft = await currentSelection.read();
    const items = draft.contents.map((content) => content.text);
    if (!items) {
      return;
    }

    const summarizeItemsUrl = `${BACKEND_HOST}/summarize-items`;
    const response = await fetch(summarizeItemsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(items),
    });

    if (!response.ok) {
      setState("error")
      return;
    }
    const summary = await response.json();
    await addNativeElement({
      type: "TEXT",
      children: summary,
    });
    setState("idle");
  };

  const getMusicFromText = async () => {
    if (!isElementSelected) {
      return;
    }
    setState("loading")
    const draft = await currentSelection.read();
    const text = draft.contents[0].text;
    const musicUrl = `${BACKEND_HOST}/generate-music`;
    const response = await fetch(musicUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: text }),
    });
    if (!response.ok) {
      setState("error")
      return;
    }
    const data = await response.json();
    const result = await upload({
      type: "AUDIO",
      title: "My Audio",
      url: data.url,
      mimeType: "audio/mp3",
      durationMs: 86047,
    });
    await addAudioTrack({
      ref: result.ref,
    });
    setState("idle")
  };

  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="1u">
        <Button
          loading={state === "loading"}
          variant="primary"
          disabled={!isElementSelected}
          onClick={summarizeSelectedItems}
        >
          Summarize Selected Items
        </Button>
        <Button
          loading={state === "loading"}
          variant="primary"
          disabled={!isElementSelected}
          onClick={getMusicFromText}
        >
          Add Music
        </Button>
      </Rows>
    </div>
  );
}
