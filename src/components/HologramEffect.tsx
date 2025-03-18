import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const HologramEffect = () => {
  const mountRef = useRef<HTMLDivElement | null>(null); // ✅ Explicit Type

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000); // Black background
    mount.appendChild(renderer.domElement); // ✅ No more TS errors

    // Hologram Material (Wireframe with glow effect)
    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ffff, // Neon blue
      wireframe: true, // Grid effect
    });
    const hologram = new THREE.Mesh(geometry, material);
    scene.add(hologram);

    // Light for subtle glow
    const light = new THREE.PointLight(0x00ffff, 2, 10);
    light.position.set(2, 2, 5);
    scene.add(light);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);
      hologram.rotation.x += 0.01;
      hologram.rotation.y += 0.01;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} />;
};

export default HologramEffect;
