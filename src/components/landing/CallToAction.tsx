import React from "react";

const CallToAction = () => {
  return (
    <section className="bg-yellow-400 py-16 text-center">
      <h2 className="text-3xl font-bold mb-4">Pronto a Conquistare il Mondo?</h2>
      <p className="text-lg mb-8">Ordina oggi stesso il tuo pacchetto di articoli tradotti in 50 lingue.</p>
      <a
        href="#pricing"
        className="bg-blue-800 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 transition"
      >
        Acquista Ora
      </a>
    </section>
  );
};

export default CallToAction;