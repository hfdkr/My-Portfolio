// A tiny mutable store shared between the DOM (GSAP, pointer) and the 3D scenes.
// The scenes read it every frame inside useFrame, so updating it never re-renders React.

export const scene = {
  pointer: { x: 0, y: 0 }, // -1..1, smoothed in the scene
  stack: {
    explode: 0, // 0 = closed stack, 1 = layers fully apart (driven by scroll)
    focus: -1, // highlighted layer: 0 interface, 1 logic, 2 data, -1 none
    spin: 0, // extra rotation from scroll
    camera: 0, // 0 hero framing → 1 about framing
  },
};

if (typeof window !== "undefined") {
  window.addEventListener(
    "pointermove",
    (e) => {
      scene.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      scene.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    },
    { passive: true },
  );
}
