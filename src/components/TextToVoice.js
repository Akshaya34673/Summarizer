import React, { useState, useEffect } from "react";

const TextToVoice = ({ summaryText }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [femaleVoice, setFemaleVoice] = useState(null);

  useEffect(() => {
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const voices = synth.getVoices();
      const female =
        voices.find((v) => v.name.toLowerCase().includes("female")) ||
        voices.find((v) => v.name.includes("Google UK English Female")) ||
        voices.find((v) => v.name.includes("Samantha")) || // macOS
        voices.find((v) => v.name.includes("Microsoft Zira")) || // Windows
        voices[0]; // fallback
      setFemaleVoice(female);
    };

    // Some browsers fire voiceschanged after getVoices returns empty
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }

    // Try loading immediately
    loadVoices();
  }, []);

  const handleSpeak = () => {
    if (!femaleVoice || !summaryText) return;

    const utterance = new SpeechSynthesisUtterance(summaryText);
    utterance.voice = femaleVoice;
    utterance.onend = () => setIsSpeaking(false);

    window.speechSynthesis.cancel(); // cancel any ongoing speech
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="mt-4">
      <button onClick={isSpeaking ? handleStop : handleSpeak} className="btn btn-primary">
        {isSpeaking ? "Stop" : "🔊 Listen to Summary"}
      </button>
    </div>
  );
};

export default TextToVoice;
