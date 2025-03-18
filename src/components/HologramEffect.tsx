import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Asteroid = {
  id: string;
  name: string;
  absolute_magnitude_h: number;
  estimated_diameter: {
    kilometers: {
      estimated_diameter_max: number;
    };
  };
  close_approach_data: Array<{
    close_approach_date: string;
    miss_distance: {
      kilometers: string;
    };
  }>;
};

export default function HologramEffect() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [selectedAsteroid, setSelectedAsteroid] = useState<Asteroid | null>(
    null
  );

  useEffect(() => {
    const API_KEY = import.meta.env.VITE_NASA_API_KEY;
    const today = new Date().toISOString().split("T")[0];
    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${API_KEY}`;

    const fetchData = async () => {
      try {
        const response = await fetch(url);
        const data = await response.json();
        const neoObjects: Asteroid[] = Object.values(
          data.near_earth_objects
        ).flat() as Asteroid[];
        setAsteroids(neoObjects);
      } catch (error) {
        console.error("Error fetching NASA data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!mountRef.current || asteroids.length === 0) return;

    const mount = mountRef.current;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 50;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    mount.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Raycaster & Mouse
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Create asteroids
    const createAsteroidSphere = (asteroid: Asteroid) => {
      const geometry = new THREE.SphereGeometry(
        asteroid.estimated_diameter.kilometers.estimated_diameter_max / 2,
        32,
        32
      );
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        wireframe: true,
      });
      const sphere = new THREE.Mesh(geometry, material);

      // Random position
      sphere.position.set(
        Math.random() * 100 - 50,
        Math.random() * 100 - 50,
        Math.random() * 100 - 50
      );
      sphere.userData = { asteroid };
      return sphere;
    };

    const asteroidObjects = asteroids.map(createAsteroidSphere);
    asteroidObjects.forEach((asteroid) => scene.add(asteroid));

    // Animation loop with hover effect
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();

      // Reset scale and color
      asteroidObjects.forEach((object) => {
        if (object instanceof THREE.Mesh) {
          object.scale.set(1, 1, 1);
          (object.material as THREE.MeshBasicMaterial).color.set(0x00ffff);
        }
      });

      // Hover detection
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(asteroidObjects);
      if (intersects.length > 0) {
        const intersect = intersects[0].object;
        if (intersect instanceof THREE.Mesh) {
          intersect.scale.set(1.2, 1.2, 1.2);
          (intersect.material as THREE.MeshBasicMaterial).color.set(0x00ff00); // Neon green
          setSelectedAsteroid(intersect.userData.asteroid);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Mouse movement listener
    const onMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", onMouseMove);

    // Cleanup function
    return () => {
      mount.innerHTML = "";
      renderer.dispose();
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [asteroids]);

  return (
    <div ref={mountRef} style={{ position: "relative" }}>
      <h2>Hologram Effect</h2>
      <p>Loaded {asteroids.length} asteroids!</p>
      {selectedAsteroid && (
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "5%",
            backgroundColor: "black",
            color: "limegreen",
            padding: "10px",
            borderRadius: "8px",
            boxShadow: "0px 0px 15px rgba(0, 255, 0, 0.7)",
            fontSize: "16px",
            zIndex: 10,
          }}
        >
          <h3>{selectedAsteroid.name}</h3>
          <p>
            Distance from Earth:{" "}
            {selectedAsteroid.close_approach_data[0]?.miss_distance.kilometers}{" "}
            km
          </p>
        </div>
      )}
    </div>
  );
}
