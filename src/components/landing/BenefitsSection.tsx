import React from "react";

const benefits = [
  { icon: "🌍", title: "Copertura Globale", description: "Raggiungi clienti in ogni angolo del pianeta." },
  { icon: "🔥", title: "Contenuti SEO-Friendly", description: "Ottimizzati per i motori di ricerca in tutte le lingue." },
  { icon: "💼", title: "Professionalità", description: "Traduzioni di alta qualità da esperti madrelingua." },
  { icon: "⏱️", title: "Risparmio di Tempo", description: "Un solo articolo, 50 traduzioni pronte all'uso." },
];

const BenefitsSection = () => {
  return (
    <section className="py-16 bg-gray-100">
      <h2 className="text-3xl font-bold text-center mb-12">Perché Scegliere il Nostro Servizio?</h2>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {benefits.map((benefit, index) => (
          <div key={index} className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="text-4xl mb-4">{benefit.icon}</div>
            <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
            <p className="text-gray-600">{benefit.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BenefitsSection;