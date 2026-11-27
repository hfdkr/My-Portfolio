import { useEffect, useRef } from "react";
import { usePrefs } from "./lib/preferences";
import { UIProvider } from "./lib/ui";
import { ScrollTrigger } from "./lib/gsap";
import { listenKonami, greetDevelopers } from "./lib/easter";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Resume from "./components/Resume";
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
import MusicPlayer from "./components/MusicPlayer";
import { MusicProvider } from "./audio/MusicProvider";

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

  // Shared links like /#work or /#contact: the browser looks for the anchor before React has
  // rendered it, so jump there once the page exists (and again once web fonts settle the layout).
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id || !/^[\w-]+$/.test(id)) return;
    const jump = () => document.getElementById(id)?.scrollIntoView({ block: "start" });
    const timer = window.setTimeout(jump, 60);
    document.fonts?.ready.then(() => window.setTimeout(jump, 60));
    return () => window.clearTimeout(timer);
  }, []);

  // Web fonts change line lengths too.
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    greetDevelopers();
    return listenKonami(() => tRef.current("egg.mercury"));
  }, []);

  return (
    <UIProvider>
      <MusicProvider>
      <LiquidBackground />
      <Header />
      <main id="main" ref={mainRef} tabIndex={-1} className="relative z-[1] outline-none">
        <Hero />
        <Resume />
        <About />
        <Work />
        <Skills />
        <Journey />
        <Contact />
      </main>
      <Footer />
      <Terminal />
      <CommandPalette />
      <MusicPlayer />
      <Toast />
      <Cursor />
      <div className="grain" aria-hidden="true" />
      </MusicProvider>
    </UIProvider>
  );
}
