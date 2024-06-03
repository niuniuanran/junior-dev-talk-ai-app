import React from "react";
import { useSelection } from "../utils/use_selection_hook";
import { Button } from "@canva/app-ui-kit";
import styles from "styles/components.css";
import { addAudioTrack } from "@canva/design";
import { upload } from "@canva/asset";

export function App() {
  const currentSelection = useSelection("plaintext");

  const getMusicFromText = async () => {
    if (currentSelection.count < 1) {
      return;
    }
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
      console.error("😅", response);
      return;
    }
    const data = await response.json();
    const result = await upload({
      type: "AUDIO",
      title: "My Audio",
      url: data.url,
      mimeType: "audio/wav",
      durationMs: 86047,
    });
    await addAudioTrack({
      ref: result.ref,
    });
  };

  return (
    <div className={styles.scrollContainer}>
      <Button variant="primary" onClick={getMusicFromText} stretch>
        Add Music
      </Button>
    </div>
  );
}
