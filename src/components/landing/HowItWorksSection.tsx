import React from "react";

const steps = [
  {
    title: "Ordina il Tuo Pacchetto",
    description: "Scegli il pacchetto più adatto alle tue esigenze e procedi con l'acquisto.",
    icon: "🛒",
  },
  {
    title: "Inviaci il Tuo Contenuto",
    description: "Fornisci l'articolo o le informazioni necessarie per creare il contenuto.",
    icon: "📄",
  },
  {
    title: "Traduzione in 50 Lingue",
    description: "I nostri traduttori professionisti lavorano per offrirti traduzioni di alta qualità.",
    icon: "🌍",
  },
  {
    title: "Ricevi e Pubblica",
    description: "Ricevi le traduzioni pronte all'uso e pubblicale per raggiungere nuovi mercati.",
    icon: "🚀",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-16 bg-white">
      <h2 className="text-3xl font-bold text-center mb-12">Come Funziona</h2>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <div key={index} className="text-center p-6 bg-gray-100 rounded-lg shadow-md">
            <div className="text-5xl mb-4">{step.icon}</div>
            <h3 className="text-xl font-bold mb-2">{step.title}</h3>
            <p className="text-gray-600">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSection;