"use client";

import { useEffect, useState } from "react";

/**
 * Shared client-side motion helpers for the interactive demo widgets.
 *
 * These power the "world-class" feel of the widgets — cinematic step playback,
 * live-ticking counters, and typewriter answer reveals — while always honouring
 * the user's `prefers-reduced-motion` setting so the experience stays
 * accessible and never becomes distracting.
 *
 * All three hooks reset their internal state during render (the React-endorsed
 * "adjust state while rendering" pattern) rather than synchronously inside an
 * effect, which keeps renders cheap and avoids cascading updates.
 */

/** Tracks the user's reduced-motion preference reactively. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

/**
 * Reveals `text` one character at a time. When `active` is false, or the user
 * prefers reduced motion, the full text is shown immediately. Returns the
 * currently visible slice and whether typing has finished.
 */
export function useTypewriter(
  text: string,
  active: boolean,
  speedMs = 14,
): { shown: string; done: boolean } {
  const reduced = usePrefersReducedMotion();
  const animate = active && !reduced;

  const [count, setCount] = useState(() => (animate ? 0 : text.length));
  const [key, setKey] = useState(() => `${text}|${animate}`);

  // Restart the reveal whenever the text (or animate flag) changes.
  const nextKey = `${text}|${animate}`;
  if (key !== nextKey) {
    setKey(nextKey);
    setCount(animate ? 0 : text.length);
  }

  useEffect(() => {
    if (!animate || !text) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) window.clearInterval(id);
    }, speedMs);
    return () => window.clearInterval(id);
  }, [key, animate, speedMs, text]);

  return { shown: text.slice(0, count), done: count >= text.length };
}

/**
 * Smoothly eases a number toward `target` using an ease-out curve driven by
 * `requestAnimationFrame`. The tween restarts (from the current displayed
 * value, so increments look continuous) whenever `runKey` or `target` changes.
 * When `active` is false or reduced motion is preferred, the target value is
 * returned immediately.
 */
export function useCountUp(
  target: number,
  active: boolean,
  runKey: unknown,
  durationMs = 700,
): number {
  const reduced = usePrefersReducedMotion();
  const animate = active && !reduced;

  const [value, setValue] = useState(() => (animate ? 0 : target));
  // The value the next tween eases *from*, captured at reset so continuous
  // increments look smooth instead of snapping back to zero each step.
  const [from, setFrom] = useState(() => (animate ? 0 : target));

  const [key, setKey] = useState(() => `${String(runKey)}|${target}|${animate}`);
  const nextKey = `${String(runKey)}|${target}|${animate}`;
  if (key !== nextKey) {
    setKey(nextKey);
    setFrom(value);
    if (!animate) setValue(target);
  }

  useEffect(() => {
    if (!animate) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (target - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [key, animate, target, from, durationMs]);

  return value;
}
