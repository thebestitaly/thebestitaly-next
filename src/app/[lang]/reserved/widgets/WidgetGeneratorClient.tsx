"use client";

import React, { useState, useEffect } from "react";

interface WidgetGeneratorClientProps {
  lang: string;
}

export default function WidgetGeneratorClient({ lang }: WidgetGeneratorClientProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🛠️ Widget Generator
            </h1>
            <p className="text-xl text-gray-600">
              Genera widget personalizzati per TheBestItaly
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p>Widget generator in development...</p>
          </div>
        </div>
      </div>
    </div>
  );
} 