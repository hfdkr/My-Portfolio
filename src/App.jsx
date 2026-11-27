import { useEffect, useRef } from "react";
import { usePrefs } from "./lib/preferences";
import { UIProvider } from "./lib/ui";
import { ScrollTrigger } from "./lib/gsap";
import Header from "./components/Header";
import Universe from "./components/Universe";
import Work from "./components/Work";
import Skills from "./components/Skills";
import Journey from "./components/Journey";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Terminal from "./components/Terminal";
import CommandPalette from "./components/CommandPalette";
import Cursor from "./components/Cursor";
import Floating from "./components/Floating";

export default function App() {
  const { lang, dir } = usePrefs();
  const mainRef = useRef(null);
  const first = useRef(true);

  // Language switch: a quick blur-fade, then recompute every scroll trigger (text lengths changed).
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    mainRef.current?.animate?.([{ opacity: 0.2, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0)" }], { duration: 380, easing: "ease-out" });
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 60);
    return () => window.clearTimeout(id);
  }, [lang, dir]);

  // Fonts change line lengths too.
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  return (
    <UIProvider>
      <Header />
      <main id="main" ref={mainRef} tabIndex={-1} className="outline-none">
        <Universe />
        <Work />
        <Skills />
        <Journey />
        <Contact />
      </main>
      <Footer />
      <Floating />
      <Terminal />
      <CommandPalette />
      <Cursor />
    </UIProvider>
  );
}
