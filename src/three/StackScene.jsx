import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Edges, Environment, Float, Lightformer, PerformanceMonitor, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { scene as store } from "../lib/store";

/* ----------------------------------------------------------------------------
   THE FULL-STACK CORE
   Three layers, three materials, three stages of learning:
     0 · Interface — clear iridescent glass, finished      (front-end: daily practice)
     1 · Logic     — brushed metal with live circuit lines  (back-end: taking shape)
     2 · Data      — an amber wireframe, voxels still being laid in (databases: learning)
   A cyan beam carries data packets through the layers. Scroll pulls the stack apart.
---------------------------------------------------------------------------- */

const PALETTE = {
  dark: { violet: "#8b7dff", cyan: "#52e0ff", amber: "#ffb547", metal: "#a3a8d6", glass: "#c9c2ff", bg: "#05061a", particles: ["#8b7dff", "#52e0ff", "#ffffff"] },
  light: { violet: "#5a4ce0", cyan: "#0f9cc4", amber: "#d48a00", metal: "#cfd3e6", glass: "#d9d4ff", bg: "#e9ebf1", particles: ["#5a4ce0", "#0f9cc4", "#2a2d52"] },
};

const W = 2.3; // slab width / depth
const H = 0.26; // slab height

const damp = THREE.MathUtils.damp;

/* -------------------------------- Layers --------------------------------- */

function InterfaceLayer({ c, hq, dark }) {
  // Little UI elements floating inside the glass: header bar, cards, a button.
  const bars = useMemo(
    () => [
      [0, 0.72, 1.7, 0.16],
      [-0.48, 0.1, 0.72, 0.78],
      [0.46, 0.1, 0.72, 0.78],
      [-0.48, -0.62, 0.72, 0.2],
      [0.46, -0.62, 0.72, 0.2],
    ],
    [],
  );
  return (
    <group>
      <RoundedBox args={[W, H, W]} radius={0.09} smoothness={4}>
        {hq && dark ? (
          <meshPhysicalMaterial
            color={c.glass}
            transmission={1}
            thickness={0.8}
            roughness={0.08}
            ior={1.45}
            iridescence={0.9}
            iridescenceIOR={1.25}
            
            clearcoat={1}
            attenuationColor={c.violet}
            attenuationDistance={2.5}
            envMapIntensity={1.2}
          />
        ) : (
          <meshPhysicalMaterial color={c.glass} transparent opacity={dark ? 0.5 : 0.62} roughness={0.1} metalness={0.05} clearcoat={1} iridescence={1} iridescenceIOR={1.3} envMapIntensity={1.4} />
        )}
      </RoundedBox>
      {bars.map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, 0.02, z]}>
          <boxGeometry args={[w, 0.02, d]} />
          <meshStandardMaterial color={c.violet} emissive={c.violet} emissiveIntensity={i === 0 ? 1.6 : 0.8} transparent opacity={0.85} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function LogicLayer({ c }) {
  const ring = useRef();
  useFrame((_, dt) => {
    if (ring.current) ring.current.rotation.z += dt * 0.6;
  });
  return (
    <group>
      <RoundedBox args={[W, H, W]} radius={0.06} smoothness={3}>
        <meshStandardMaterial color={c.metal} metalness={0.92} roughness={0.32} envMapIntensity={1.1} />
        <Edges threshold={20} color={c.cyan} lineWidth={1} />
      </RoundedBox>
      {/* circuit: a rotating dashed ring + four traces on the top face */}
      <group position={[0, H / 2 + 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh ref={ring}>
          <ringGeometry args={[0.42, 0.47, 48, 1, 0, Math.PI * 1.6]} />
          <meshBasicMaterial color={c.cyan} toneMapped={false} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]} position={[Math.cos((i * Math.PI) / 2) * 0.78, Math.sin((i * Math.PI) / 2) * 0.78, 0]}>
            <planeGeometry args={[0.55, 0.025]} />
            <meshBasicMaterial color={c.cyan} toneMapped={false} transparent opacity={0.8} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function DataLayer({ c, mobile, reduced }) {
  const N = mobile ? 4 : 6;
  const inst = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const cells = useMemo(() => {
    const arr = [];
    const step = (W - 0.3) / N;
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++)
        arr.push({ x: -W / 2 + 0.15 + step * (i + 0.5), z: -W / 2 + 0.15 + step * (j + 0.5), d: Math.random(), s: step * 0.82 });
    return arr;
  }, [N]);

  useFrame(({ clock }) => {
    if (!inst.current) return;
    // A build cycle: voxels drop in one after another, hold, then the cycle restarts.
    const cycle = reduced ? 0.6 : (clock.elapsedTime % 9) / 9;
    cells.forEach((cell, k) => {
      const start = cell.d * 0.55;
      const p = THREE.MathUtils.clamp((cycle - start) / 0.12, 0, 1);
      const fade = cycle > 0.92 ? 1 - (cycle - 0.92) / 0.08 : 1;
      const e = 1 - Math.pow(1 - p, 3);
      dummy.position.set(cell.x, (1 - e) * 0.9, cell.z);
      const sc = Math.max(0.0001, e * fade);
      dummy.scale.set(cell.s * sc, H * 0.8 * sc, cell.s * sc);
      dummy.updateMatrix();
      inst.current.setMatrixAt(k, dummy.matrix);
    });
    inst.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <RoundedBox args={[W, H, W]} radius={0.04} smoothness={2}>
        <meshBasicMaterial color={c.amber} transparent opacity={0.06} depthWrite={false} />
        <Edges threshold={20} color={c.amber} />
      </RoundedBox>
      <instancedMesh ref={inst} args={[undefined, undefined, cells.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={c.amber} emissive={c.amber} emissiveIntensity={0.55} metalness={0.3} roughness={0.4} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

/** Cyan beam through the layers, with packets travelling up. */
function Beam({ c, count = 5 }) {
  const packets = useRef([]);
  const beam = useRef();
  useFrame(({ clock }) => {
    const gap = 0.42 + store.stack.explode * 0.95;
    const len = gap * 2 + 1.2;
    if (beam.current) beam.current.scale.y = len;
    packets.current.forEach((m, i) => {
      if (!m) return;
      const t = (clock.elapsedTime * 0.35 + i / count) % 1;
      m.position.y = -len / 2 + t * len;
      m.scale.setScalar(0.5 + Math.sin(t * Math.PI) * 0.6);
    });
  });
  return (
    <group>
      <mesh ref={beam}>
        <cylinderGeometry args={[0.035, 0.035, 1, 12, 1, true]} />
        <meshBasicMaterial color={c.cyan} transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} ref={(el) => (packets.current[i] = el)}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshBasicMaterial color={c.cyan} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Stack({ c, hq, mobile, reduced, dark }) {
  const layers = useRef([]);
  useFrame((_, dt) => {
    const { explode, focus } = store.stack;
    const gap = 0.42 + explode * 0.95;
    layers.current.forEach((g, i) => {
      if (!g) return;
      const y = (1 - i) * gap;
      const isFocus = focus === i;
      g.position.y = damp(g.position.y, y, 6, dt);
      g.position.z = damp(g.position.z, isFocus ? 0.35 : 0, 5, dt);
      const twist = (i - 1) * (0.16 + explode * 0.32);
      g.rotation.y = damp(g.rotation.y, twist, 5, dt);
      const s = isFocus ? 1.06 : focus >= 0 ? 0.94 : 1;
      g.scale.setScalar(damp(g.scale.x, s, 6, dt));
    });
  });
  return (
    <group>
      <group ref={(el) => (layers.current[0] = el)}>
        <InterfaceLayer c={c} hq={hq} dark={dark} />
      </group>
      <group ref={(el) => (layers.current[1] = el)}>
        <LogicLayer c={c} />
      </group>
      <group ref={(el) => (layers.current[2] = el)}>
        <DataLayer c={c} mobile={mobile} reduced={reduced} />
      </group>
      <Beam c={c} count={mobile ? 3 : 5} />
    </group>
  );
}

/* ------------------------------ Environment ------------------------------ */

function Orbits({ c }) {
  const a = useRef();
  const b = useRef();
  useFrame((_, dt) => {
    if (a.current) a.current.rotation.z += dt * 0.12;
    if (b.current) b.current.rotation.z -= dt * 0.08;
  });
  return (
    <group>
      <group rotation={[Math.PI / 2.25, 0.2, 0]}>
        <group ref={a}>
          <mesh>
            <torusGeometry args={[2.35, 0.008, 8, 160]} />
            <meshStandardMaterial color={c.metal} metalness={1} roughness={0.2} />
          </mesh>
          <mesh position={[2.35, 0, 0]}>
            <octahedronGeometry args={[0.09]} />
            <meshStandardMaterial color={c.violet} emissive={c.violet} emissiveIntensity={1.5} toneMapped={false} />
          </mesh>
        </group>
      </group>
      <group rotation={[Math.PI / 1.8, -0.5, 0.3]}>
        <group ref={b}>
          <mesh>
            <torusGeometry args={[2.85, 0.005, 8, 180]} />
            <meshStandardMaterial color={c.metal} metalness={1} roughness={0.3} transparent opacity={0.7} />
          </mesh>
          <mesh position={[0, 2.85, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshBasicMaterial color={c.amber} toneMapped={false} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function Floaters({ c, count }) {
  const items = useMemo(() => {
    const geo = ["octa", "tetra", "ico", "box", "octa", "ico"];
    return Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2 + 0.6;
      return { geo: geo[i % geo.length], pos: [Math.cos(a) * 4.2, Math.sin(a * 1.7) * 1.6, Math.sin(a) * 2 - 1.5], s: 0.16 + (i % 3) * 0.07, wire: i % 2 === 1 };
    });
  }, [count]);
  return items.map((it, i) => (
    <Float key={i} speed={1.2 + (i % 3) * 0.4} rotationIntensity={1.4} floatIntensity={1.2} position={it.pos}>
      <mesh scale={it.s}>
        {it.geo === "octa" && <octahedronGeometry args={[1]} />}
        {it.geo === "tetra" && <tetrahedronGeometry args={[1]} />}
        {it.geo === "ico" && <icosahedronGeometry args={[1, 0]} />}
        {it.geo === "box" && <boxGeometry args={[1.2, 1.2, 1.2]} />}
        {it.wire ? (
          <meshBasicMaterial color={i % 4 === 1 ? c.cyan : c.violet} wireframe toneMapped={false} />
        ) : (
          <meshStandardMaterial color={c.metal} metalness={1} roughness={0.15} />
        )}
      </mesh>
    </Float>
  ));
}

function Particles({ c, count, dark }) {
  const ref = useRef();
  const { positions, colors } = useMemo(() => {
    const p = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const tmp = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 9;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      p[i * 3] = r * Math.sin(ph) * Math.cos(th);
      p[i * 3 + 1] = r * Math.cos(ph) * 0.7;
      p[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th) - 2;
      tmp.set(c.particles[i % 3]);
      col.set([tmp.r, tmp.g, tmp.b], i * 3);
    }
    return { positions: p, colors: col };
  }, [count, c]);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.02;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={dark ? 0.035 : 0.03}
        vertexColors
        transparent
        opacity={dark ? 0.9 : 0.55}
        sizeAttenuation
        depthWrite={false}
        blending={dark ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
}

/** Pointer-driven light + rig: the object leans toward the cursor, scroll sets framing. */
function Rig({ children, mobile, side }) {
  const group = useRef();
  const light = useRef();
  const { camera } = useThree();
  useFrame((_, dt) => {
    const { pointer, stack } = store;
    const g = group.current;
    if (!g) return;
    const cam = stack.camera;
    // framing: hero (centre) → about (object to one side)
    const tx = mobile ? 0 : side * cam * 1.75;
    const ty = mobile ? 1.25 - cam * 0.25 : 0.3 - cam * 0.25;
    g.position.x = damp(g.position.x, tx, 3, dt);
    g.position.y = damp(g.position.y, ty, 3, dt);
    g.rotation.y = damp(g.rotation.y, pointer.x * 0.45 + stack.spin, 3, dt);
    g.rotation.x = damp(g.rotation.x, -pointer.y * 0.18 + 0.38 - cam * 0.12, 3, dt);
    const s = mobile ? 0.72 : 0.92;
    g.scale.setScalar(s);
    camera.position.z = damp(camera.position.z, mobile ? 9.2 : 8.6 - cam * 0.6, 3, dt);
    camera.position.x = damp(camera.position.x, pointer.x * 0.3, 2, dt);
    camera.lookAt(0, 0, 0);
    if (light.current) {
      light.current.position.x = damp(light.current.position.x, pointer.x * 4, 4, dt);
      light.current.position.y = damp(light.current.position.y, pointer.y * 3, 4, dt);
    }
  });
  return (
    <>
      <pointLight ref={light} position={[0, 0, 3]} intensity={mobile ? 0 : 18} distance={9} color="#9d92ff" />
      <group ref={group}>{children}</group>
    </>
  );
}

/** With reduced motion we render on demand: re-render when scroll changes the stack. */
function DemandOnScroll() {
  const { invalidate } = useThree();
  useEffect(() => {
    const on = () => invalidate();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, [invalidate]);
  return null;
}

export default function StackScene({ theme, mobile, active, reduced, side = 1, label }) {
  const dark = theme === "dark";
  const c = PALETTE[dark ? "dark" : "light"];
  const [dpr, setDpr] = useState(mobile ? 1.3 : 1.75);
  const [hq, setHq] = useState(!mobile);

  return (
    <Canvas
      role="img"
      aria-label={label}
      frameloop={!active ? "never" : reduced ? "demand" : "always"}
      dpr={[1, dpr]}
      camera={{ position: [0, 0.2, 8.6], fov: 34, near: 0.1, far: 60 }}
      gl={{ antialias: !mobile, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = dark ? 1.05 : 1.15;
      }}
    >
      <PerformanceMonitor
        onDecline={() => {
          setDpr(1);
          setHq(false);
        }}
      />
      {reduced && <DemandOnScroll />}

      {dark ? (
        <>
          <ambientLight intensity={0.25} />
          <directionalLight position={[-3, 5, 4]} intensity={0.9} color="#cfd6ff" />
          <pointLight position={[-4, 2, -2]} intensity={40} color={c.violet} distance={12} />
          <pointLight position={[3.5, -2, 1.5]} intensity={18} color={c.amber} distance={8} />
          <pointLight position={[3, 3, 2]} intensity={16} color={c.cyan} distance={9} />
          <fog attach="fog" args={[c.bg, 10, 24]} />
        </>
      ) : (
        <>
          <ambientLight intensity={0.75} />
          <hemisphereLight args={["#ffffff", "#c9cde0", 0.8]} />
          <directionalLight position={[-3, 6, 5]} intensity={1.6} color="#ffffff" />
          <pointLight position={[-4, 2, -2]} intensity={10} color={c.violet} distance={12} />
          <fog attach="fog" args={[c.bg, 12, 26]} />
        </>
      )}

      <Environment resolution={128} frames={1}>
        {dark ? (
          <>
            <Lightformer form="rect" intensity={2} color="#8b7dff" position={[-5, 2, -2]} scale={[4, 8, 1]} />
            <Lightformer form="rect" intensity={1.4} color="#52e0ff" position={[5, 1, 0]} scale={[3, 6, 1]} />
            <Lightformer form="ring" intensity={1} color="#ffffff" position={[0, 6, 2]} scale={4} />
          </>
        ) : (
          <>
            <Lightformer form="rect" intensity={3} color="#ffffff" position={[0, 6, 2]} scale={[10, 4, 1]} />
            <Lightformer form="rect" intensity={1.6} color="#e4e0ff" position={[-5, 1, 2]} scale={[3, 6, 1]} />
            <Lightformer form="rect" intensity={1.2} color="#dff7ff" position={[5, 1, 1]} scale={[3, 6, 1]} />
          </>
        )}
      </Environment>

      <Rig mobile={mobile} side={side}>
        <Stack c={c} hq={hq} mobile={mobile} reduced={reduced} dark={dark} />
        <Orbits c={c} />
        {!mobile && <Floaters c={c} count={6} />}
      </Rig>
      <Particles c={c} count={mobile ? 320 : 1400} dark={dark} />
      {!dark && hq && <ContactShadows position={[0, -2.4, 0]} opacity={0.35} scale={10} blur={2.6} far={5} resolution={256} color="#2a2d52" />}
    </Canvas>
  );
}
