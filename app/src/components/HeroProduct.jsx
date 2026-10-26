import React, { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { ContactShadows } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const isBrowser = typeof window !== "undefined";

/* Hero product centerpiece using React Three Fiber.
   Renders a translucent 3D ice-cube bag with visible ice cubes inside,
   pointer-driven tilt, floating motion, and contact shadow.
   Falls back to a CSS-rendered bag during SSR or if WebGL is unavailable. */
export default function HeroProduct() {
  const pointer = useRef(new THREE.Vector2(0, 0));
  const target = useRef(new THREE.Vector3(0, 0, 0));
  const current = useRef(new THREE.Vector3(0, 0, 0));
  const groupRef = useRef(null);
  const [bagModel, setBagModel] = useState(null);
  const [mounted, setMounted] = useState(false);
  const rafRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    const loader = new THREE.GLTFLoader();
    loader.load(
      "/assets/models/ice-bag.glb",
      (gltf) => {
        setBagModel(gltf.scene);
      },
      undefined,
      (error) => {
        console.error("[IceHub] Failed to load ice-bag.glb:", error);
      }
    );
  }, []);

  useEffect(() => {
    if (!isBrowser || !bagModel || !groupRef.current) return;

    const group = groupRef.current;
    let lastTime = 0;

    const animate = (time) => {
      const delta = time - lastTime;
      lastTime = time;

      // Smooth pointer-driven tilt
      target.current.x = pointer.current.y * 0.12;
      target.current.y = -pointer.current.x * 0.12;
      current.current.lerp(target.current, delta * 0.004);
      group.rotation.x = current.current.x;
      group.rotation.y = current.current.y;

      // Gentle floating motion
      group.position.y = Math.sin(time * 0.0008) * 0.04;

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [bagModel]);

  // SSR fallback: CSS-rendered bag
  if (!isBrowser || !mounted || !bagModel) {
    return (
      <div className="hero__reel-wrapper" style={{ position: "relative", width: "100%", height: "100%" }}>
        <div className="hero__left">
          <p className="hero__eyebrow">PURE ICE. REAL FRESHNESS.</p>
          <h1 className="hero__statement" id="hero-statement">THE ICE HUB</h1>
          <h2 className="hero__category">ICE CUBE BAGS</h2>
          <p className="hero__sub">
            Crystal clear. Fresh. Reliable. Our ice cube bags are designed for homes, events, businesses and every moment that needs a little more chill.
          </p>
          <div className="hero__cta-group">
            <a href="#contact" className="button">Order Now</a>
            <a href="#products" className="button button--outline">View Products</a>
          </div>
          <p className="scroll-cue">SCROLL TO EXPLORE</p>
        </div>
        <div className="product-fallback" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
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
      </div>
    );
  }

  return (
    <div className="hero__reel-wrapper" style={{ position: "relative", width: "100%", height: "100%" }}>
      <Canvas
        shadows
        camera={{ position: [0, 0, 3.2], fov: 35 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.35} color="#ffffff" />
        <pointLight position={[2, 5, 4]} intensity={1.3} color="#05baf7" castShadow />
        <pointLight position={[-2, 2, -3]} intensity={0.9} color="#65d7ff" castShadow />
        <pointLight position={[0, -2, 5]} intensity={0.7} color="#ffffff" castShadow />

        <group ref={groupRef}>
          <primitive object={bagModel} />
        </group>

        <ContactShadows position={[0, -0.9, 0]} scale={10} opacity={0.5} far={4} />
      </Canvas>
    </div>
  );
}
