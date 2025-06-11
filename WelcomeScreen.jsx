import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function WelcomeScreen({ onStart }) {
  return (
    <div className="text-center bg-white rounded-xl shadow-lg p-10 md:p-16 border border-slate-200">
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
        Sua voz é um reflexo do seu bem-estar.
      </h1>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
        Nossa ferramenta utiliza inteligência artificial para analisar padrões na sua voz e identificar sinais precoces de burnout, ajudando você a tomar medidas proativas pela sua saúde mental.
      </p>
      <Button size="lg" onClick={onStart} className="bg-blue-600 hover:bg-blue-700 text-lg">
        Iniciar Análise
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
      <p className="text-xs text-slate-400 mt-4">
        Todo o processo é anônimo e seus dados são confidenciais.
      </p>
    </div>
  );
}
