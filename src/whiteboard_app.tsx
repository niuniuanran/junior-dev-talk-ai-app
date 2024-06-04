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
    for (let i = 0; i < summary.groups.length; i++) {
      await addPage({
        title: summary.groups[i].summary,
        background: {color:"#000000"},
        elements: [
          {
            type: "TEXT",
            children: [summary.groups[i].summary],
            fontSize: 90,
            fontWeight: "bold",
            top: 10,
            left: 10,
            color:"#ffffff",
          },
          ...summary.groups[i].originalIdeas.map((idea, i) => ({
            type: "TEXT",
            children: [idea],
            fontSize: 50,
            top: i * 60 + 150,
            left: 10,
            color:"#ffffff",
          })),
        ],
      })
    }
  };

  return (
    <div className={styles.scrollContainer}>
      <Button
        variant="primary"
        onClick={summarizeSelectedItems}
        stretch
      >
        Group Selected Items
      </Button>
    </div>
  );
}
