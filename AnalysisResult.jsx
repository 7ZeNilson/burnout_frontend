import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, AlertTriangle, ShieldAlert, RotateCcw } from 'lucide-react';

const resultConfig = {
  baixo: {
    title: 'Risco Baixo de Burnout',
    description: 'Os padrões em sua voz indicam um nível baixo de estresse. Continue priorizando seu bem-estar e práticas de autocuidado.',
    icon: ShieldCheck,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  médio: {
    title: 'Risco Médio de Burnout',
    description: 'Sua voz apresenta alguns indicadores de estresse. É um bom momento para refletir sobre sua rotina e considerar pausas e atividades relaxantes.',
    icon: AlertTriangle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  alto: {
    title: 'Risco Alto de Burnout',
    description: 'Foram identificados fortes sinais de estresse em sua voz. É altamente recomendável buscar apoio, conversar com pessoas de confiança ou um profissional de saúde.',
    icon: ShieldAlert,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
};

export default function AnalysisResult({ result, onAnalyzeAgain }) {
  const config = resultConfig[result.burnout_risk] || resultConfig.médio;

  return (
    <Card className={`w-full shadow-lg ${config.bgColor} ${config.borderColor}`}>
      <CardContent className="p-8 text-center">
        <config.icon className={`w-20 h-20 mx-auto mb-6 ${config.color}`} />
        <h2 className={`text-3xl font-bold ${config.color} mb-2`}>{config.title}</h2>
        <p className="text-slate-600 max-w-xl mx-auto mb-6">{config.description}</p>
        
        <div className="inline-block bg-white rounded-lg px-6 py-2 border shadow-sm mb-8">
            <span className="text-sm text-slate-500">Score de Risco: </span>
            <span className="font-bold text-lg text-slate-800">{result.score}</span>
        </div>

        <div>
            <Button size="lg" onClick={onAnalyzeAgain} variant="outline" className="bg-white">
                <RotateCcw className="w-5 h-5 mr-2" /> Realizar Nova Análise
            </Button>
        </div>
        <p className="text-xs text-slate-500 mt-6 max-w-md mx-auto">Lembre-se: esta é uma ferramenta de triagem e não substitui o diagnóstico de um profissional de saúde qualificado.</p>
      </CardContent>
    </Card>
  );
}
