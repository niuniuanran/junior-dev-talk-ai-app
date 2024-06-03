import React, { useState } from "react";
import { useSelection } from "../utils/use_selection_hook";
import { Button, Rows } from "@canva/app-ui-kit";
import styles from "styles/components.css";
import { addAudioTrack } from "@canva/design";
import { upload } from "@canva/asset";

export function App() {
  const currentSelection = useSelection("plaintext");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const isElementSelected = currentSelection.count > 0;

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
          onClick={getMusicFromText}
        >
          Add Music
        </Button>
      </Rows>
    </div>
  );
}
