import { useEffect, useState } from "react";
import { on } from "../lib/events";
import { Star } from "./Primitives";

/** One quiet message at a time, bottom of the screen. Triggered with toast("…") from lib/events. */
export default function Toast() {
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    let timer = 0;
    const off = on("toast", (text) => {
      window.clearTimeout(timer);
      setMsg({ text, id: Date.now() });
      timer = window.setTimeout(() => setMsg(null), 5200);
    });
    return () => {
      off();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[85] flex justify-center px-4">
      {msg && (
        <p key={msg.id} className="rise-in flex max-w-lg items-start gap-3 border border-line-strong bg-surface px-5 py-3.5 text-sm text-ink shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)]">
          <Star size={14} className="mt-0.5 shrink-0 text-accent" />
          {msg.text}
        </p>
      )}
    </div>
  );
}
