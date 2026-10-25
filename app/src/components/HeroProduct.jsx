import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ContactShadows } from "@react-three/drei";

const isBrowser = typeof window !== "undefined";

/* Client-only R3F product canvas. Only mounts in the browser. */
function ProductCanvas() {
  const pointer = useRef(new THREE.Vector2(0, 0));
  const target = useRef(new THREE.Vector3(0, 0, 0));
  const current = useRef(new THREE.Vector3(0, 0, 0));
  const groupRef = useRef(null);
  const cubeRefs = useRef([]);

  const cubes = [];
  for (let i = 0; i < 14; i++) {
    const x = (Math.random() - 0.5) * 0.7;
    const y = (Math.random() - 0.5) * 0.9 - 0.3;
    const z = (Math.random() - 0.5) * 0.45;
    const s = 0.75 + Math.random() * 0.5;
    cubes.push({ x, y, z, s, phase: Math.random() * Math.PI * 2, index: i });
  }

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    target.current.x = pointer.current.y * 0.12;
    target.current.y = -pointer.current.x * 0.12;
    current.current.lerp(target.current, delta * 4);
    groupRef.current.rotation.x = current.current.x;
    groupRef.current.rotation.y = current.current.y;
    const time = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(time * 0.8) * 0.04;
    cubeRefs.current.forEach((ref, i) => {
      if (!ref.current) return;
      const { phase, index } = cubes[i];
      const t = time * (0.6 + index * 0.15) + phase;
      ref.current.position.y = cubes[i].y + Math.sin(t) * 0.03;
      ref.current.rotation.z += 0.005 * (index + 1);
      ref.current.rotation.x += 0.003 * (index + 1);
    });
  });

  const bodyGeo = new THREE.SphereGeometry(1, 32, 32);
  const pos = bodyGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const scale = 1 + 0.35 * Math.sin((y + 1) * Math.PI / 2);
    pos.setX(i, x * scale * 0.82);
    pos.setZ(i, z * scale * 0.82);
    if (y < -0.65) {
      pos.setY(i, -0.65);
      pos.setX(i, x * 0.88);
      pos.setZ(i, z * 0.88);
    }
  }
  pos.needsUpdate = true;
  pos.computeVertexNormals();

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0.08, roughness: 0.28,
    transmission: 0.82, transparent: true, opacity: 0.92,
    clearcoat: 1.0, clearcoatRoughness: 0.12, envMapIntensity: 1.0,
    side: THREE.DoubleSide,
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.set(0, -0.05, 0);
  bodyMesh.scale.set(1, 1.15, 0.85);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;

  const onPointerMove = (event) => {
    const rect = event.target.getBoundingClientRect();
    pointer.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  };

  return (
    <Canvas
      camera={{ position: [0, 0, 3.2], fov: 35 }}
      shadows
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onPointerMove={onPointerMove}
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.35} color="#ffffff" />
      <pointLight position={[2, 5, 4]} intensity={1.3} color="#05baf7" castShadow />
      <pointLight position={[-2, 2, -3]} intensity={0.9} color="#65d7ff" castShadow />
      <pointLight position={[0, -2, 5]} intensity={0.7} color="#ffffff" castShadow />

      <group ref={groupRef}>
        <primitive object={bodyMesh} />
        <mesh position={[0, 0.68, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.18, 0.32, 16]} />
          <meshPhysicalMaterial color={0xffffff} metalness={0.15} roughness={0.2}
            transmission={0.9} transparent opacity={0.94} clearcoat={1} clearcoatRoughness={0.08} />
        </mesh>
        {cubes.map(({ x, y, z, s }, i) => (
          <mesh key={i} ref={cubeRefs[i]} position={[x, y, z]}
            rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
            scale={[s, s, s]} castShadow>
            <boxGeometry args={[0.16, 0.16, 0.16]} />
            <meshPhysicalMaterial color={0xe0f7ff} metalness={0.05} roughness={0.12}
              transmission={0.96} transparent opacity={0.92} clearcoat={1} clearcoatRoughness={0.04} />
          </mesh>
        ))}
        <mesh position={[0, -0.28, 0.431]} rotation={[-0.1, 0, 0]}>
          <planeGeometry args={[0.75, 0.5, 4, 4]} />
          <meshStandardMaterial color={0x2c3e50} roughness={0.8} metalness={0.1} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <contactShadow position={[0, -0.9, 0]} scale={10} opacity={0.5} far={4} />
    </Canvas>
  );
}

export default function HeroProduct() {
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    setCanvasReady(true);
  }, []);

  // SSR fallback: pure CSS product rendering
  if (!isBrowser || !canvasReady) {
    return (
      <div className="product-fallback" role="img" aria-label="Ice cube bag product shot">
        <div className="product-bag">
          <div className="bag-neck" />
          <div className="bag-highlight" />
          <div className="bag-label">
            <div className="bag-brand">THE ICE HUB</div>
            <div className="bag-product">ICE CUBE BAG</div>
            <div className="bag-tagline">PURE · CLEAN · FRESH</div>
          </div>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="ice-cube"
              style={{ left: 20 + i * 12, top: 40 + i * 8, width: 18 + i * 3, height: 18 + i * 3 }} />
          ))}
        </div>
      </div>
    );
  }

  return <ProductCanvas />;
}
