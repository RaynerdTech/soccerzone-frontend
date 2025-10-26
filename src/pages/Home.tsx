// src/pages/Home.tsx
import React from "react";
import Hero from "../components/Hero";
import Availableslots from "../components/AvailableSlots";

const Home: React.FC = () => {
  return (
    <div>
      <Hero />
      <Availableslots />
    </div>
  );
};

export default Home;
