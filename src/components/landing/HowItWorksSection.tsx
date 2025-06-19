'use client';

import React from "react";

const steps = [
  {
    title: "Scegli il Tuo Piano",
    description: "Seleziona il pacchetto perfetto per le tue esigenze aziendali e procedi con l'acquisto sicuro.",
    icon: "🎯",
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50",
    delay: "0ms"
  },
  {
    title: "Condividi il Contenuto",
    description: "Fornisci l'articolo o le informazioni che vuoi tradurre. Supportiamo tutti i formati.",
    icon: "📝",
    color: "from-green-500 to-emerald-500",
    bgColor: "from-green-50 to-emerald-50",
    delay: "150ms"
  },
  {
    title: "Magia della Traduzione",
    description: "I nostri esperti madrelingua traducono il tuo contenuto in 50 lingue con precisione assoluta.",
    icon: "✨",
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-50 to-pink-50",
    delay: "300ms"
  },
  {
    title: "Conquista il Mondo",
    description: "Ricevi le traduzioni ottimizzate SEO e pubblica per raggiungere milioni di nuovi clienti.",
    icon: "🚀",
    color: "from-orange-500 to-red-500",
    bgColor: "from-orange-50 to-red-50",
    delay: "450ms"
  },
];

const HowItWorksSection = () => {
  return (
    <section className="relative py-24 bg-gradient-to-br from-white via-gray-50 to-blue-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-blue-300 to-purple-300 rounded-full mix-blend-multiply filter blur-2xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-gradient-to-br from-pink-300 to-orange-300 rounded-full mix-blend-multiply filter blur-2xl animate-float animation-delay-3000"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-blue-100 text-green-800 font-semibold text-sm mb-6">
            ⚡ Processo Semplificato
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6">
            Come Funziona la{" "}
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Nostra Magia
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            In soli 4 semplici passaggi trasformi il tuo business locale in un impero globale
          </p>
        </div>

        {/* Desktop Timeline */}
        <div className="hidden lg:block relative">
          {/* Timeline line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 via-pink-200 to-orange-200 transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-orange-500 transform -translate-y-1/2 animate-pulse" style={{width: '0%', animation: 'timeline-progress 3s ease-in-out infinite'}}></div>

          <div className="grid grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative group"
                style={{ animationDelay: step.delay }}
              >
                {/* Timeline dot */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
                  <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {index + 1}
                  </div>
                  <div className={`absolute inset-0 w-12 h-12 bg-gradient-to-br ${step.color} rounded-full opacity-30 group-hover:scale-150 group-hover:opacity-50 transition-all duration-500`}></div>
                </div>

                {/* Card */}
                <div className="relative mt-8 group-hover:-translate-y-2 transition-transform duration-300">
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.bgColor} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <div className="relative bg-white rounded-2xl p-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                    {/* Icon */}
                    <div className="text-4xl mb-4 text-center">{step.icon}</div>
                    
                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">
                      {step.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed text-center">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-6 group"
              style={{ animationDelay: step.delay }}
            >
              {/* Left side - Number and line */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className="w-0.5 h-16 bg-gradient-to-b from-gray-300 to-gray-200 mt-4"></div>
                )}
              </div>

              {/* Right side - Content */}
              <div className="flex-1 group-hover:-translate-y-1 transition-transform duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${step.bgColor} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full h-full -z-10`}></div>
                <div className="bg-white rounded-2xl p-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-3xl">{step.icon}</span>
                    <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              🌟 Sembra facile? Perché lo è davvero!
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Migliaia di aziende hanno già scelto il nostro servizio per espandere il loro business globalmente.
            </p>
            <a
              href="#pricing"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold text-lg rounded-full hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span>🎉 Iniziamo Insieme</span>
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes timeline-progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animation-delay-3000 { animation-delay: 3s; }
      `}</style>
    </section>
  );
};

export default HowItWorksSection;