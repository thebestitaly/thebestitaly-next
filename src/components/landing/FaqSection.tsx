'use client';

import React from "react";

const faqs = [
  {
    question: "Quanto tempo ci vuole per ricevere le traduzioni?",
    answer: "Di solito consegniamo le traduzioni entro 7 giorni lavorativi per ogni articolo.",
  },
  {
    question: "Le traduzioni sono fatte da professionisti?",
    answer: "Sì, collaboriamo con traduttori madrelingua esperti in ciascuna lingua.",
  },
  {
    question: "Posso richiedere modifiche dopo la consegna?",
    answer: "Sì, offriamo una revisione gratuita per ogni traduzione consegnata.",
  },
  {
    question: "In quali formati riceverò le traduzioni?",
    answer: "Le traduzioni saranno fornite nei formati più comuni come DOCX e PDF.",
  },
  {
    question: "Come posso utilizzare gli articoli tradotti?",
    answer: "Puoi pubblicarli sul tuo sito web, blog, newsletter o condividerli sui social media.",
  },
];

const FaqSection = () => {
  return (
    <section className="py-16 bg-gray-100">
      <h2 className="text-3xl font-bold text-center mb-12">Domande Frequenti</h2>
      <div className="container mx-auto max-w-4xl">
        {faqs.map((faq, index) => (
          <div key={index} className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-blue-600">{faq.question}</h3>
            <p className="text-gray-700">{faq.answer}</p>
            <hr className="my-4" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default FaqSection;