import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

/* ----------------------------------------------------------------------------
   SKILLS UNIVERSE
   A core (me) → five group stars → each technology.
   Practice = solid glowing node. Learning = amber ring, still open.
   Dashed links between technologies that work together; pulses travel
   from the core to each group.
---------------------------------------------------------------------------- */

const AMBER = "#ffb547";

function layout(groups, skills) {
  const centers = {};
  groups.forEach((g, k) => {
    const a = (k / groups.length) * Math.PI * 2 - Math.PI / 2;
    centers[g.id] = new THREE.Vector3(Math.cos(a) * 3.1, Math.sin(k * 2.1) * 0.9, Math.sin(a) * 3.1);
  });
  const pos = {};
  groups.forEach((g) => {
    const list = skills.filter((s) => s.group === g.id);
    const c = centers[g.id];
    list.forEach((s, i) => {
      // Fibonacci points on a small sphere around the group star.
      const n = list.length;
      const y = 1 - (i + 0.5) * (2 / n);
      const r = Math.sqrt(1 - y * y);
      const th = i * 2.399963;
      const R = 0.95 + n * 0.05;
      pos[s.id] = new THREE.Vector3(c.x + Math.cos(th) * r * R, c.y + y * R, c.z + Math.sin(th) * r * R);
    });
  });
  return { centers, pos };
}

function Node({ s, p, color, active, dim, onHover, onSelect, label }) {
  const ref = useRef();
  useFrame((_, dt) => {
    if (!ref.current) return;
    const target = active ? 1.9 : 1;
    ref.current.scale.setScalar(THREE.MathUtils.damp(ref.current.scale.x, target, 8, dt));
    if (s.status === "learning") ref.current.rotation.z += dt * 0.8;
  });
  const learning = s.status === "learning";
  return (
    <group position={p}>
      <group ref={ref}>
        {learning ? (
          <>
            <mesh>
              <torusGeometry args={[0.13, 0.022, 10, 40, Math.PI * 1.7]} />
              <meshBasicMaterial color={AMBER} transparent opacity={dim ? 0.2 : 1} toneMapped={false} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.035, 10, 10]} />
              <meshBasicMaterial color={AMBER} transparent opacity={dim ? 0.2 : 1} toneMapped={false} />
            </mesh>
          </>
        ) : (
          <mesh>
            <icosahedronGeometry args={[0.12, 1]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 2.2 : 1.1} transparent opacity={dim ? 0.2 : 1} toneMapped={false} />
          </mesh>
        )}
      </group>
      {/* invisible, larger hit target */}
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(s.id);
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(s.id);
        }}
      >
        <sphereGeometry args={[0.28, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {active && (
        <Html center distanceFactor={9} position={[0, 0.42, 0]} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <span className="mono whitespace-nowrap rounded-full border border-white/15 bg-[#0a0c22]/90 px-2.5 py-1 text-[13px] text-white shadow-lg">{label}</span>
        </Html>
      )}
    </group>
  );
}

function Pulses({ centers, color }) {
  const refs = useRef([]);
  const list = Object.values(centers);
  useFrame(({ clock }) => {
    refs.current.forEach((m, i) => {
      if (!m) return;
      const t = (clock.elapsedTime * 0.4 + i * 0.2) % 1;
      m.position.copy(list[i]).multiplyScalar(t);
      m.scale.setScalar(Math.sin(t * Math.PI) + 0.01);
    });
  });
  return list.map((_, i) => (
    <mesh key={i} ref={(el) => (refs.current[i] = el)}>
      <sphereGeometry args={[0.045, 8, 8]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  ));
}

function DashedLink({ a, b, color, active }) {
  const ref = useRef();
  useFrame((_, dt) => {
    if (ref.current?.material) ref.current.material.dashOffset -= dt * (active ? 1.2 : 0.3);
  });
  return <Line ref={ref} points={[a, b]} color={color} lineWidth={active ? 2.2 : 1} dashed dashSize={0.12} gapSize={0.08} transparent opacity={active ? 1 : 0.45} />;
}

function Universe({ groups, skills, activeId, filter, onHover, onSelect, pick, dark }) {
  const { centers, pos } = useMemo(() => layout(groups, skills), [groups, skills]);
  const groupColor = Object.fromEntries(groups.map((g) => [g.id, g.color]));
  const lineColor = dark ? "#8f95c8" : "#6a6f93";
  const activeSkill = skills.find((s) => s.id === activeId);

  // Base structure lines core → group → skill, in one cheap geometry.
  const structure = useMemo(() => {
    const pts = [];
    groups.forEach((g) => pts.push(0, 0, 0, ...centers[g.id].toArray()));
    skills.forEach((s) => pts.push(...centers[s.group].toArray(), ...pos[s.id].toArray()));
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return geo;
  }, [groups, skills, centers, pos]);

  const links = useMemo(() => {
    const out = [];
    skills.forEach((s) => (s.links || []).forEach((to) => pos[to] && out.push([s.id, to])));
    return out;
  }, [skills, pos]);

  const core = useRef();
  useFrame((_, dt) => {
    if (core.current) {
      core.current.rotation.y += dt * 0.5;
      core.current.rotation.x += dt * 0.2;
    }
  });

  return (
    <group>
      <lineSegments geometry={structure}>
        <lineBasicMaterial color={lineColor} transparent opacity={dark ? 0.28 : 0.35} />
      </lineSegments>

      {links.map(([a, b]) => {
        const involved = activeId && (a === activeId || b === activeId);
        const dimmed = filter && skills.find((s) => s.id === a)?.group !== filter && skills.find((s) => s.id === b)?.group !== filter;
        if (dimmed) return null;
        return <DashedLink key={a + b} a={pos[a]} b={pos[b]} color={involved ? "#52e0ff" : lineColor} active={involved} />;
      })}

      {/* core */}
      <mesh ref={core}>
        <icosahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial color="#8b7dff" emissive="#8b7dff" emissiveIntensity={1.2} wireframe toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshBasicMaterial color={dark ? "#ffffff" : "#4a3dd0"} toneMapped={false} />
      </mesh>
      <Pulses centers={centers} color="#52e0ff" />

      {groups.map((g) => (
        <group key={g.id} position={centers[g.id]}>
          <mesh>
            <octahedronGeometry args={[0.1]} />
            <meshBasicMaterial color={g.color} toneMapped={false} transparent opacity={filter && filter !== g.id ? 0.25 : 1} />
          </mesh>
          <Html center distanceFactor={10} position={[0, -0.32, 0]} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
            <span
              className="whitespace-nowrap text-[15px] font-bold"
              style={{ color: g.color, opacity: filter && filter !== g.id ? 0.3 : 1, textShadow: dark ? "0 0 12px rgba(0,0,0,.9)" : "0 0 10px rgba(255,255,255,.9)" }}
            >
              {pick(g.title)}
            </span>
          </Html>
        </group>
      ))}

      {skills.map((s) => (
        <Node
          key={s.id}
          s={s}
          p={pos[s.id]}
          color={groupColor[s.group]}
          active={activeId === s.id}
          dim={(filter && filter !== s.group) || (activeSkill && activeSkill.id !== s.id && !(activeSkill.links || []).includes(s.id) && !(s.links || []).includes(activeSkill.id) && activeSkill.group !== s.group)}
          onHover={onHover}
          onSelect={onSelect}
          label={pick(s.name)}
        />
      ))}
    </group>
  );
}

export default function SkillsScene({ groups, skills, activeId, filter, onHover, onSelect, pick, theme, active, reduced, label }) {
  const dark = theme === "dark";
  return (
    <Canvas
      role="img"
      aria-label={label}
      frameloop={active ? (reduced ? "demand" : "always") : "never"}
      dpr={[1, 1.6]}
      camera={{ position: [0, 2.2, 9.5], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      onPointerMissed={() => onSelect(null)}
    >
      <ambientLight intensity={dark ? 0.4 : 0.9} />
      <pointLight position={[0, 0, 0]} intensity={dark ? 12 : 6} color="#8b7dff" distance={8} />
      <Universe groups={groups} skills={skills} activeId={activeId} filter={filter} onHover={onHover} onSelect={onSelect} pick={pick} dark={dark} />
      <OrbitControls enablePan={false} enableZoom={false} enableDamping autoRotate={!reduced && !activeId} autoRotateSpeed={0.5} minPolarAngle={Math.PI / 4} maxPolarAngle={(Math.PI * 3) / 4} />
    </Canvas>
  );
}
