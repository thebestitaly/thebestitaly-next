'use client';

import React from "react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 animate-gradient-x"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8 animate-fade-in-up">
          <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
          <span className="text-sm font-medium">Servizio Attivo 24/7</span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight animate-fade-in-up animation-delay-200">
          <span className="block bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
            Espandi il Tuo
          </span>
          <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
            Business Globale
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl lg:text-3xl mb-12 text-gray-200 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
          Trasforma <span className="text-yellow-300 font-bold">1 articolo</span> in{" "}
          <span className="text-pink-300 font-bold">50 lingue</span> e raggiungi{" "}
          <span className="text-blue-300 font-bold">milioni di clienti</span> in tutto il mondo
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-600">
          <a
            href="#pricing"
            className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg rounded-full hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg"
          >
            <span className="relative z-10">🚀 Inizia Subito</span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-300 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </a>
          
          <a
            href="#benefits"
            className="group inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold text-lg rounded-full hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
          >
            <span>📖 Scopri Come</span>
            <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto mt-16 animate-fade-in-up animation-delay-800">
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="text-3xl font-bold text-yellow-300 mb-2">50+</div>
            <div className="text-gray-300">Lingue Disponibili</div>
          </div>
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="text-3xl font-bold text-blue-300 mb-2">1000+</div>
            <div className="text-gray-300">Articoli Tradotti</div>
          </div>
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="text-3xl font-bold text-pink-300 mb-2">99%</div>
            <div className="text-gray-300">Clienti Soddisfatti</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-size: 400% 400%; background-position: 0% 50%; }
          50% { background-size: 400% 400%; background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-gradient-x { animation: gradient-x 15s ease infinite; }
        .animate-float { animation: float linear infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out both; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animation-delay-800 { animation-delay: 0.8s; }
      `}</style>
    </section>
  );
};

export default HeroSection;