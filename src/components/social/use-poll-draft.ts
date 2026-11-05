// Client: Hook de gestión de estado para borrador de encuestas de 2 a 4 opciones
"use client";

import { useState } from "react";

export function usePollDraft() {
  const [isPollActive, setIsPollActive] = useState(false);
  const [pollOptions, setPollOptions] = useState<readonly string[]>(["", ""]);

  const setOption = (index: number, value: string) => {
    setPollOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
  };

  const addOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions((prev) => [...prev, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const resetPoll = () => {
    setIsPollActive(false);
    setPollOptions(["", ""]);
  };

  const activatePoll = () => {
    setIsPollActive(true);
  };

  const getValidOptions = (): string[] | undefined => {
    if (!isPollActive) return undefined;
    return pollOptions.map((opt) => opt.trim()).filter(Boolean);
  };

  return {
    isPollActive,
    pollOptions,
    setOption,
    addOption,
    removeOption,
    resetPoll,
    activatePoll,
    getValidOptions,
  };
}
