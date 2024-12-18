import React from "react";

const pricingPlans = [
  { name: "Basic", description: "1 articolo tradotto in 50 lingue", price: "€499" },
  { name: "Standard", description: "3 articoli tradotti in 50 lingue", price: "€1.299" },
  { name: "Premium", description: "5 articoli tradotti in 50 lingue", price: "€1.999" },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-16 bg-white">
      <h2 className="text-3xl font-bold text-center mb-12">Scegli il Tuo Pacchetto</h2>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {pricingPlans.map((plan, index) => (
          <div key={index} className="p-6 bg-gray-100 rounded-lg shadow-lg text-center">
            <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
            <p className="text-gray-600 mb-4">{plan.description}</p>
            <p className="text-4xl font-bold text-blue-600 mb-6">{plan.price}</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-500 transition">
              Acquista Ora
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PricingSection;