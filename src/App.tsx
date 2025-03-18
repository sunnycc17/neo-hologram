import "./App.css";
import { useState, useEffect } from "react";
import Preloader from "./components/Preloader";
import HologramEffect from "./components/HologramEffect";

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait 300ms then remove preloader
    const timer = setTimeout(() => setLoading(false), 4000);

    return () => clearTimeout(timer); // Cleanup on unmount
  }, []);

  return (
    <div className="relative w-full h-screen">
      {loading && <Preloader />}
      <div
        className={`transition-opacity duration-500 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
      >
        <HologramEffect />
      </div>
    </div>
  );
};

export default App;
