"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function BubbleCursor() {
  const cursor = useRef<HTMLDivElement>(null);
  const position = useRef<{ x: number; y: number } | null>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const updateContainer = () => {
      const dialogs = document.querySelectorAll<HTMLDialogElement>("dialog[open]");
      setContainer(dialogs.length ? dialogs[dialogs.length - 1] : document.body);
    };
    updateContainer();
    const observer = new MutationObserver(updateContainer);
    observer.observe(document.body, {
      subtree: true, childList: true, attributes: true, attributeFilter: ["open"],
    });
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("bubble-cursor-enabled");
    };
  }, []);

  useLayoutEffect(() => {
    const element = cursor.current;
    if (!element || !container) return;
    const preference = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
    );
    const hide = () => {
      position.current = null;
      element.dataset.visible = "false";
      document.documentElement.classList.remove("bubble-cursor-enabled");
    };
    const renderCursor = () => {
      const point = position.current;
      if (!preference.matches || !point) {
        element.dataset.visible = "false";
        document.documentElement.classList.remove("bubble-cursor-enabled");
        return;
      }
      const target = document.elementFromPoint(point.x, point.y);
      const nativeInput = Boolean(target?.closest("input, textarea, select, [contenteditable]"));
      element.style.left = `${point.x}px`;
      element.style.top = `${point.y}px`;
      element.dataset.visible = String(!nativeInput);
      element.dataset.active = String(Boolean(target?.closest("a, button, summary, [role='button']")));
      document.documentElement.classList.toggle("bubble-cursor-enabled", !nativeInput);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") { hide(); return; }
      position.current = { x: event.clientX, y: event.clientY };
      renderCursor();
    };
    renderCursor();
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);
    preference.addEventListener("change", renderCursor);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
      preference.removeEventListener("change", renderCursor);
    };
  }, [container]);

  if (!container) return null;
  return createPortal(<div ref={cursor} className="bubble-cursor" aria-hidden="true" />, container);
}