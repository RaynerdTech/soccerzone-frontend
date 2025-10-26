import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-gray-900 text-white text-center py-6 mt-20">
      <p className="text-sm">
        © {new Date().getFullYear()} SoccerZone. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
