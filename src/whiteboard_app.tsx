import React from "react";
import { useSelection } from "../utils/use_selection_hook";
import { Button } from "@canva/app-ui-kit";
import styles from "styles/components.css";
import { addNativeElement, addPage } from "@canva/design";

export function App() {
  // https://www.canva.dev/docs/apps/reading-elements/#plain-text-2
  const currentSelection = useSelection("plaintext");

  const summarizeSelectedItems = async () => {
    if (currentSelection.count < 1) {
      return
    }
    const draft = await currentSelection.read();
    const items = draft.contents.map((content) => content.text);
  
    const summarizeItemsUrl = `${BACKEND_HOST}/summarize-items`;
    const response = await fetch(summarizeItemsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(items),
    });

    if (!response.ok) {
      console.error("😅", response)
      return;
    }
    const summary = await response.json();
    await addPage({
      background: {color:"#000000"},
      elements: [
        {
          type: "TEXT",
          children: summary,
          fontSize: 40,
          fontWeight: "bold",
          color:"#ffffff",
          top: 10,
          left: 10,
        },
      ],
    })
  };

  return (
    <div className={styles.scrollContainer}>
      <Button
        variant="primary"
        onClick={summarizeSelectedItems}
        stretch
      >
        Summarize Selected Items
      </Button>
    </div>
  );
}
