import { useEffect, useRef } from "react";
import { usePrefs } from "./lib/preferences";
import { UIProvider } from "./lib/ui";
import { ScrollTrigger } from "./lib/gsap";
import { listenKonami, greetDevelopers } from "./lib/easter";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Work from "./components/Work";
import Skills from "./components/Skills";
import Journey from "./components/Journey";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Terminal from "./components/Terminal";
import CommandPalette from "./components/CommandPalette";
import Cursor from "./components/Cursor";
import Toast from "./components/Toast";
import LiquidBackground from "./components/LiquidBackground";

export default function App() {
  const { lang, dir, t } = usePrefs();
  const mainRef = useRef(null);
  const first = useRef(true);
  const tRef = useRef(t);
  tRef.current = t;

  // Language switch: a short fade, then recompute every scroll trigger (text lengths changed).
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    mainRef.current?.animate?.([{ opacity: 0.25 }, { opacity: 1 }], { duration: 420, easing: "ease-out" });
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 80);
    return () => window.clearTimeout(id);
  }, [lang, dir]);

  // Web fonts change line lengths too.
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    greetDevelopers();
    return listenKonami(() => tRef.current("egg.mercury"));
  }, []);

  return (
    <UIProvider>
      <LiquidBackground />
      <Header />
      <main id="main" ref={mainRef} tabIndex={-1} className="relative z-[1] outline-none">
        <Hero />
        <About />
        <Work />
        <Skills />
        <Journey />
        <Contact />
      </main>
      <Footer />
      <Terminal />
      <CommandPalette />
      <Toast />
      <Cursor />
      <div className="grain" aria-hidden="true" />
    </UIProvider>
  );
}
