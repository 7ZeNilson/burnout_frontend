import React, { useState, useEffect, useCallback } from 'react';
import { Analysis } from '@/entities/Analysis';
import { User } from '@/entities/User';

import WelcomeScreen from '../components/dashboard/WelcomeScreen';
import AnalysisRecorder from '../components/dashboard/AnalysisRecorder';
import AnalysisResult from '../components/dashboard/AnalysisResult';
import AnalysisHistory from '../components/dashboard/AnalysisHistory';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

// Configuração da API
const API_BASE_URL = 'https://burnout-doi7.onrender.com';

// Função para testar conexão com a API
const testAPIConnection = async () => {
  try {
    console.log('🔍 Testando conexão com API:', API_BASE_URL);
    
    // Primeiro, vamos testar se a API está respondendo
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    console.log('📡 Status da resposta:', response.status);
    console.log('📡 Headers da resposta:', [...response.headers.entries()]);
    
    if (!response.ok) {
      throw new Error(`API não está respondendo: ${response.status}`);
    }
    
    const data = await response.text();
    console.log('✅ Resposta da API:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Erro ao testar API:', error);
    return { success: false, error: error.message };
  }
};

// Função para chamar a API real com debug melhorado
const callVoiceAnalysisAPI = async (audioFile) => {
  console.log('🎤 Iniciando análise de voz...');
  console.log('📁 Arquivo de áudio:', {
    name: audioFile.name,
    size: audioFile.size,
    type: audioFile.type
  });

  const formData = new FormData();
  formData.append('file', audioFile, audioFile.name || 'recording.wav');

  console.log('📦 FormData criado, enviando para:', `${API_BASE_URL}/api/analyze`);

  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      body: formData,
      headers: {
        // Não definir Content-Type para que o browser configure automaticamente
        'Accept': 'application/json',
      },
    });

    console.log('📡 Status da resposta:', response.status);
    console.log('📡 Headers da resposta:', [...response.headers.entries()]);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da API:', errorText);
      throw new Error(`Erro na API: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Resultado da análise:', result);
    return result;
  } catch (error) {
    console.error('❌ Erro na chamada da API:', error);
    throw error;
  }
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [appState, setAppState] = useState('welcome');
  const [analyses, setAnalyses] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [apiStatus, setApiStatus] = useState(null); // para mostrar status da conexão

  const fetchUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.info("Usuário não autenticado.");
    }
  };

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    const userAnalyses = await Analysis.list('-created_date');
    setAnalyses(userAnalyses);
    setIsLoadingHistory(false);
  }, []);

  const checkAPIStatus = async () => {
    const result = await testAPIConnection();
    setApiStatus(result);
  };

  useEffect(() => {
    fetchUser();
    loadHistory();
    checkAPIStatus(); // Testa a conexão ao carregar a página
  }, [loadHistory]);

  const handleStartAnalysis = () => {
    setApiError(null);
    setAppState('recording');
  };

  const handleAnalyze = async ({ audioBlob, file }) => {
    setAppState('loading');
    setApiError(null);
    
    const inputType = file ? 'upload' : 'gravacao';
    const fileName = file ? file.name : null;
    const audioFile = file || audioBlob;

    try {
      // Chamada para a API real
      const result = await callVoiceAnalysisAPI(audioFile);

      // Verifica se o resultado tem a estrutura esperada
      if (!result || typeof result !== 'object') {
        throw new Error('Resposta da API em formato inválido');
      }

      // Salva o resultado no banco local para histórico
      const newAnalysisData = {
        risk_level: result.burnout_risk || result.risk_level || 'unknown',
        score: result.score || 0,
        inputType: inputType,
        fileName: fileName,
      };
      
      await Analysis.create(newAnalysisData);
      
      setCurrentResult(result);
      setAppState('result');
      loadHistory();
    } catch (error) {
      console.error('Erro ao analisar áudio:', error);
      setApiError(error.message);
      setAppState('error');
    }
  };
  
  const handleAnalyzeAgain = () => {
    setCurrentResult(null);
    setApiError(null);
    setAppState('recording');
  };
  
  const handleDeleteAnalysis = async (id) => {
    await Analysis.delete(id);
    loadHistory();
  };

  const handleRetryFromError = () => {
    setApiError(null);
    setAppState('recording');
  };

  const renderContent = () => {
    switch (appState) {
      case 'welcome':
        return (
          <div className="space-y-6">
            <WelcomeScreen onStart={handleStartAnalysis} />
            
            {/* Status da API */}
            {apiStatus && (
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {apiStatus.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">
                        {apiStatus.success ? 'API Conectada' : 'Problema na API'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {apiStatus.success 
                          ? `Conectado com sucesso em ${API_BASE_URL}`
                          : `Erro: ${apiStatus.error}`
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
      case 'recording':
        return <AnalysisRecorder onAnalyze={handleAnalyze} />;
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-lg p-10 md:p-20 border border-slate-200">
            <Loader2 className="h-16 w-16 text-blue-600 animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Analisando sua voz...</h2>
            <p className="text-slate-500 text-center max-w-md">
              Nossos algoritmos estão processando as nuances do áudio para identificar possíveis sinais de estresse e burnout.
            </p>
          </div>
        );
      case 'error':
        return (
          <div className="bg-white rounded-xl shadow-lg p-10 md:p-20 border border-slate-200">
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro na análise</AlertTitle>
              <AlertDescription className="whitespace-pre-wrap">
                {apiError || 'Ocorreu um erro ao processar o áudio. Verifique se a API está rodando e tente novamente.'}
              </AlertDescription>
            </Alert>
            <div className="text-center space-y-4">
              <button 
                onClick={handleRetryFromError}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors mr-4"
              >
                Tentar Novamente
              </button>
              <button 
                onClick={checkAPIStatus}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Testar Conexão da API
              </button>
            </div>
          </div>
        );
      case 'result':
        return <AnalysisResult result={currentResult} onAnalyzeAgain={handleAnalyzeAgain} />;
      default:
        return <WelcomeScreen onStart={handleStartAnalysis} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {renderContent()}
      <AnalysisHistory 
        analyses={analyses} 
        onDelete={handleDeleteAnalysis}
        isLoading={isLoadingHistory}
      />
    </div>
  );
}