import React from "react";

const HeroSection = () => {
  return (
    <section className="bg-blue-600 text-white py-20 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        Espandi il Tuo Business con un Articolo in 50 Lingue!
      </h1>
      <p className="text-lg md:text-xl mb-8">
        Raggiungi clienti da tutto il mondo con un solo articolo tradotto.
      </p>
      <a
        href="#pricing"
        className="bg-yellow-400 text-blue-800 px-6 py-3 rounded-full font-bold hover:bg-yellow-300 transition"
      >
        Scopri i Pacchetti
      </a>
    </section>
  );
};

export default HeroSection;