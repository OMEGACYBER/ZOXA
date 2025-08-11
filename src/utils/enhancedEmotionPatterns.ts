// src/enhancedEmotionPatterns.ts
import { ProsodyFrame } from "./voiceProsodyAnalyzer";

export type EmotionSummary = {
  label: string; // e.g., "neutral", "joy", "sadness", "surprise", "bittersweet", ...
  score: number; // 0..1 confidence
  pad?: { p: number; a: number; d: number }; // optional PAD mapping
};

export function prosodyToEmotion(frames: ProsodyFrame[], transcript?: string): EmotionSummary {
  // Simple rule-based fusion; replace with trained model for better results
  if (!frames || frames.length === 0) return { label: "neutral", score: 0.5, pad: { p: 0, a: 0, d: 0 } };

  // features
  const avgRms = frames.reduce((s, f) => s + f.rms, 0) / frames.length;
  const avgPitch = frames.reduce((s, f) => s + (f.pitchHz || 0), 0) / frames.length;
  const avgZcr = frames.reduce((s, f) => s + f.zcr, 0) / frames.length;
  const pitchStd = Math.sqrt(
    frames.reduce((s, f) => s + Math.pow((f.pitchHz || 0) - avgPitch, 2), 0) / frames.length
  );

  // lexical cues
  const t = transcript ? transcript.toLowerCase() : "";
  const hasLaugh = /haha|lol|lmao|:d/.test(t);
  const hasSad = /sad|upset|sorry|lost|miss/.test(t);
  const hasSurprise = /wow|oh my|what!|no way/.test(t);
  const hasQuestion = /\?$/.test(t.trim());

  // heuristics
  if (hasLaugh || avgRms > 0.02 && avgPitch > 220) {
    return { label: "joy", score: 0.85, pad: { p: 0.7, a: 0.5, d: 0 } };
  }
  if (hasSad || avgRms < 0.01 && pitchStd < 10) {
    return { label: "sadness", score: 0.8, pad: { p: -0.6, a: -0.3, d: -0.2 } };
  }
  if (hasSurprise || (avgRms > 0.02 && pitchStd > 30)) {
    return { label: "surprise", score: 0.7, pad: { p: 0.2, a: 0.8, d: 0.1 } };
  }
  if (hasQuestion && avgPitch > 180) {
    return { label: "curious", score: 0.65, pad: { p: 0.1, a: 0.3, d: 0 } };
  }
  // bittersweet & nostalgic heuristics (lexical heavy)
  if (/nostalg|remember|back then/.test(t) && avgRms < 0.015) {
    return { label: "nostalgic", score: 0.7, pad: { p: 0.1, a: -0.1, d: -0.1 } };
  }
  if (/bittersweet|bittersweet/.test(t) || (hasSad && t.includes("but"))) {
    return { label: "bittersweet", score: 0.7, pad: { p: 0.0, a: -0.05, d: 0.0 } };
  }

  // fallback neutral
  return { label: "neutral", score: 0.5, pad: { p: 0, a: 0, d: 0 } };
}
