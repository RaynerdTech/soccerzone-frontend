
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Target } from "lucide-react";

const images = [
  "./szteam.jpg",
    "./ps5.jpg",
  "./IMG_0070.png",
  "./szteam2.jpg",
];

const About: React.FC = () => {
  const [currentImage, setCurrentImage] = useState(0);

  // Slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-white text-gray-800">
      {/* === Hero Section === */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 grid md:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h3 className="text-sm uppercase tracking-widest text-green-500 mb-3">
            About Us
          </h3>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Play. Book. Compete — All in One Place.
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            Soccerzone is where football meets fun.
            From our modern pitch and lounge to our snooker and
            PS5 gaming setups, we bring sports and entertainment together
            — creating the ultimate spot to play, relax, and connect with others.
            With a vibrant lounge, exciting snooker tables, thrilling PS5 game stations, 
            and a top-quality football pitch, Soccerzone is designed to give you the perfect 
            blend of play, chill, and community

          </p>
          <div className="flex items-start space-x-3">
            <Trophy className="w-6 h-6 text-green-600 mt-1" />
            <p className="text-gray-600 text-sm max-w-sm">
              Experience world-class facilities designed for both players and
              fans.
            </p>
          </div>
        </motion.div>

        {/* Right Image Slider */}
        <motion.div
          key={currentImage}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-xl"
        >
          <img
            src={images[currentImage]}
            alt="Soccerzone Facility"
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
          />
        </motion.div>
      </div>

      {/* === Main About Sections === */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-24 space-y-28">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            About Soccerzone
          </h2>
          <p className="text-gray-600 mt-3">
            We’re redefining how people book, organize, and enjoy football.
            Our goal is to connect players, teams, and venues through smart
            technology and seamless experiences.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.img
            src="./abigail-keenan-8-s5QuUBtyM-unsplash.jpg"
            alt="Team at work"
            className="rounded-2xl shadow-lg w-full h-[300px] md:h-[400px] object-cover"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          />
          <motion.div
            className="bg-gray-50 rounded-2xl p-8 shadow-sm"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-green-600 text-sm font-semibold uppercase mb-2">
              Our Mission
            </p>
            <h3 className="text-2xl font-semibold mb-4">
              Empowering Football Communities
            </h3>
            <p className="text-gray-600 leading-relaxed">
              We make football more accessible, organized, and enjoyable for
              everyone. Soccerzone empowers players and pitch owners with tools
              that simplify booking, scheduling, and community building.
            </p>
            <a
              href="#"
              className="inline-block mt-5 text-green-600 font-medium hover:underline"
            >
              Read More
            </a>
          </motion.div>
        </div>

        {/* Snooker & PS5 Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            className="bg-gray-50 rounded-2xl p-8 shadow-sm order-2 md:order-1"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-green-600 text-sm font-semibold uppercase mb-2">
              More Than Football
            </p>
            <h3 className="text-2xl font-semibold mb-4">
              The Snooker Lounge & PS5 Game Center
            </h3>
            <p className="text-gray-600 leading-relaxed">
              It’s not just about the matches — it’s about the moments. Our{" "}
              <strong>Snooker Lounge</strong> and{" "}
              <strong>PS5 Game Center</strong> bring players together for
              laughter, connection, and competition off the field.
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-4 space-y-2">
              <li>
                <strong>Relax & Connect:</strong> Unwind in a cozy lounge after
                your game.
              </li>
              <li>
                <strong>Play Your Way:</strong> Challenge friends in snooker or
                PS5 games like FIFA and Mortal Kombat.
              </li>
              <li>
                <strong>Community Hub:</strong> Building a gaming culture rooted
                in fun and connection.
              </li>
            </ul>
          </motion.div>
          <motion.img
            src="./IMG_0063.png"
            alt="Snooker and PS5 Game Center"
            className="rounded-2xl shadow-lg w-full h-[300px] md:h-[400px] object-cover order-1 md:order-2"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          />
        </div>

        {/* Story Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Target className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Our Story
            </h2>
            <p className="text-gray-600 mt-3">
              Every great idea starts with a problem worth solving — ours was
              how disconnected local football could feel.
            </p>
          </motion.div>
          <motion.div
            className="text-gray-700 leading-relaxed text-lg space-y-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <p>
              We’ve all been there — waiting hours to find a pitch or struggling
              to coordinate a match. The love of the game was strong, but the
              system holding it together wasn’t.
            </p>
            <p>
              That’s when the idea clicked:{" "}
              <strong>
                what if we could bring structure, simplicity, and community to
                how people play football?
              </strong>
            </p>
            <p>
              Our mission is simple —{" "}
              <strong>
                make football accessible, organized, and enjoyable for everyone.
              </strong>
            </p>
            <p className="text-green-600 font-medium mt-4">
              This is our “why.” Football deserves better — and we’re here to
              make that happen.
            </p>
          </motion.div>
        </div>

        {/* Team Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center pt-20">
          <motion.div
            className="bg-gray-50 rounded-2xl p-8 shadow-sm order-2 md:order-1"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-green-600 text-sm font-semibold uppercase mb-2">
              The Team
            </p>
            <h3 className="text-2xl font-semibold mb-4">
              Meet the People Behind the Vision
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Every great experience starts with people. Our team is made up of
              passionate players, dreamers, and builders — all working to make
              the game more than just a match.
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>
                <strong>Visionaries:</strong> Founders who lead from the front
                and live the game.
              </li>
              <li>
                <strong>Creative Minds:</strong> Designers and engineers shaping
                the experience.
              </li>
              <li>
                <strong>Organizers:</strong> Ensuring everything runs smoothly
                from booking to broadcast.
              </li>
            </ul>
            <a
              href="#team"
              className="inline-block mt-5 text-green-600 font-medium hover:underline"
            >
              Meet the Team
            </a>
          </motion.div>

          <motion.img
            src="./team-photo.jpg"
            alt="The SoccerZone Team"
            className="rounded-2xl shadow-lg w-full h-[300px] md:h-[400px] object-cover order-1 md:order-2"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          />
        </div>
      </div>


      {/* === Call To Action Section === */}
<motion.div
  className="bg-green-600 text-white py-16 mt-20"
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true }}
>
  <div className="max-w-5xl mx-auto text-center px-6">
    <h2 className="text-3xl md:text-4xl font-bold mb-4">
      Ready to Experience Soccerzone?
    </h2>
    <p className="text-lg text-green-100 max-w-2xl mx-auto mb-8">
      Join our growing football community — book your next match, connect with players, or just come chill in our lounge.
    </p>

    <div className="flex flex-col sm:flex-row justify-center gap-4">
      <a
        href="/bookings"
        className="bg-white text-green-700 font-semibold px-8 py-3 rounded-full hover:bg-green-50 transition"
      >
        Book a Match
      </a>
      <a
        href="/contact"
        className="border border-white text-white font-semibold px-8 py-3 rounded-full hover:bg-white hover:text-green-700 transition"
      >
        Get in Touch
      </a>
    </div>
  </div>
</motion.div>

    </section>
  );
};

export default About;
