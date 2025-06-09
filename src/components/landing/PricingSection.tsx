import React from "react";

const pricingPlans = [
  { 
    name: "Starter", 
    description: "Perfetto per iniziare la tua espansione globale", 
    price: "€499",
    originalPrice: "€799",
    articles: "1",
    features: [
      "1 articolo tradotto",
      "50 lingue disponibili",
      "Traduzione professionale",
      "Formato SEO-friendly",
      "Consegna in 3-5 giorni",
      "Supporto email"
    ],
    popular: false,
    gradient: "from-blue-500 to-cyan-500",
    shadow: "shadow-blue-500/25"
  },
  { 
    name: "Business", 
    description: "La scelta migliore per aziende in crescita", 
    price: "€1.299",
    originalPrice: "€2.097",
    articles: "3",
    features: [
      "3 articoli tradotti",
      "50 lingue disponibili",
      "Traduzione professionale",
      "Ottimizzazione SEO avanzata",
      "Consegna in 2-4 giorni",
      "Supporto prioritario",
      "Revisione gratuita",
      "Consulenza strategica"
    ],
    popular: true,
    gradient: "from-purple-500 to-pink-500",
    shadow: "shadow-purple-500/25"
  },
  { 
    name: "Enterprise", 
    description: "Soluzione completa per grandi aziende", 
    price: "€1.999",
    originalPrice: "€3.995",
    articles: "5",
    features: [
      "5 articoli tradotti",
      "50 lingue disponibili",
      "Traduzione premium",
      "SEO expert optimization",
      "Consegna in 1-3 giorni",
      "Supporto 24/7",
      "Revisioni illimitate",
      "Account manager dedicato",
      "Analisi mercato inclusa"
    ],
    popular: false,
    gradient: "from-orange-500 to-red-500",
    shadow: "shadow-orange-500/25"
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="relative py-24 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-600/20 to-orange-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-pink-300 font-semibold text-sm mb-6 border border-purple-500/30">
            💎 Pricing Trasparente
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
            Scegli il Tuo{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Pacchetto Perfetto
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Piani flessibili per ogni esigenza. Inizia piccolo e scala quando vuoi.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative group ${plan.popular ? 'lg:scale-110 z-10' : ''}`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    🔥 PIÙ POPOLARE
                  </div>
                </div>
              )}

              {/* Card */}
              <div className={`relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500 group-hover:bg-white/15 ${plan.shadow} hover:shadow-2xl transform hover:-translate-y-2`}>
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  {/* Plan header */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-300 text-sm">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <span className="text-gray-400 text-xl line-through">{plan.originalPrice}</span>
                      <div className="bg-gradient-to-r from-green-400 to-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                        -38%
                      </div>
                    </div>
                    <div className="text-5xl font-black text-white mb-2">{plan.price}</div>
                    <div className="text-gray-300 text-sm">
                      Per {plan.articles} articol{plan.articles === "1" ? "o" : "i"} • 50 lingue
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center flex-shrink-0`}>
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-200 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button className={`w-full bg-gradient-to-r ${plan.gradient} text-white font-bold py-4 rounded-2xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 group-hover:from-purple-400 group-hover:to-pink-400`}>
                    {plan.popular ? "🚀 Inizia Subito" : "Scegli Piano"}
                  </button>

                  {/* Guarantee */}
                  <div className="text-center mt-6">
                    <div className="inline-flex items-center gap-2 text-gray-400 text-xs">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>Garanzia soddisfatti o rimborsati</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="text-center mt-16">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              🎯 Non sei sicuro? Parliamone!
            </h3>
            <p className="text-gray-300 mb-6">
              Hai esigenze specifiche? Contattaci per un piano personalizzato su misura per te.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-full hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105"
              >
                💬 Contattaci
              </a>
              <a
                href="#faq"
                className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-full hover:bg-white/20 transition-all duration-300"
              >
                ❓ FAQ
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </section>
  );
};

export default PricingSection;