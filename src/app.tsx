import React from "react";
import { useSelection } from "../utils/use_selection_hook";
import { Button, Rows } from "@canva/app-ui-kit";
import styles from "styles/components.css";
import { addNativeElement } from "@canva/design";

export function App() {
  // https://www.canva.dev/docs/apps/reading-elements/#plain-text-2
  const currentSelection = useSelection("plaintext");
  const isElementSelected = currentSelection.count > 0;

  const summarizeSelectedItems = async () => {
    if (!isElementSelected) {
      return;
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
    await addNativeElement({
      type: "TEXT",
      children: summary,
    });
  };

  return (
    <div className={styles.scrollContainer}>
      <Button
        variant="primary"
        disabled={!isElementSelected}
        onClick={summarizeSelectedItems}
        stretch
      >
        Summarize Selected Items
      </Button>
    </div>
  );
}
