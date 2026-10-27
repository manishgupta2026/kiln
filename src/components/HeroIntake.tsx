"use client";

import { useState } from "react";

const HERO_CHIPS = [
  { label: "Website", value: "Website" },
  { label: "Product or app", value: "Product / App" },
  { label: "UI / UX Design", value: "UI / UX Design" },
  { label: "Not sure yet", value: "Not sure yet" },
];

export default function HeroIntake() {
  const [inputValue, setInputValue] = useState("");
  const [selectedChip, setSelectedChip] = useState<string | null>(null);

  const handleChipClick = (val: string) => {
    setSelectedChip((prev) => (prev === val ? null : val));
  };

  const handleStart = () => {
    // Dispatch prefill event to BriefForm
    window.dispatchEvent(
      new CustomEvent("digigrantha-prefill-brief", {
        detail: {
          description: inputValue,
          projectType: selectedChip,
        },
      })
    );

    const briefSection = document.getElementById("brief");
    if (briefSection) {
      briefSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    setTimeout(() => {
      const nameInput = document.getElementById("fName") as HTMLInputElement | null;
      if (nameInput) {
        nameInput.focus();
      }
    }, 600);
  };

  return (
    <div className="intake reveal">
      <div className="intake-label">What are you building?</div>
      <input
        type="text"
        id="heroInput"
        placeholder="A booking app for my clinic, a landing page for launch day, anything."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleStart();
          }
        }}
      />
      <div className="chip-row" id="heroChips">
        {HERO_CHIPS.map((chip) => (
          <button
            key={chip.value}
            type="button"
            className={`chip ${selectedChip === chip.value ? "active" : ""}`}
            data-val={chip.value}
            onClick={() => handleChipClick(chip.value)}
          >
            {chip.label}
          </button>
        ))}
      </div>
      <div className="intake-bottom">
        <div className="intake-note">Takes 20 seconds. No sales call required.</div>
        <button type="button" className="btn-primary" id="heroSubmit" onClick={handleStart}>
          Start →
        </button>
      </div>
    </div>
  );
}
