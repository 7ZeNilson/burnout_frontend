// COPIE TUDO DAQUI PARA BAIXO
// E COLE NO SEU ARQUIVO App.js

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Mic, Play, Pause, Trash2, Send, RotateCcw, Loader2, AlertCircle, FileAudio, Clock } from 'lucide-react';
import { format } from 'date-fns';

// Configuração da API
const API_BASE_URL = 'https://burnout-doi7.onrender.com';

const callVoiceAnalysisAPI = async (audioFile) => {
  const formData = new FormData();
  formData.append('file', audioFile, audioFile.name || 'recording.wav');

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro na API: ${response.status} - ${errorText}`);
  }
  return await response.json();
};

function App() {
  const [appState, setAppState] = useState('welcome'); // welcome, recording, loading, result, error
  const [analyses, setAnalyses] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [apiError, setApiError] = useState(null);

  const handleAnalyze = async ({ audioBlob, file }) => {
    setAppState('loading');
    setApiError(null);
    
    const inputType = file ? 'upload' : 'gravacao';
    const fileName = file ? file.name : null;
    const audioFile = file || new File([audioBlob], "recording.wav", { type: "audio/wav" });

    try {
      const result = await callVoiceAnalysisAPI(audioFile);
      
      const newAnalysis = {
        id: Date.now(),
        risk_level: result.burnout_risk,
        score: result.score,
        inputType,
        fileName,
        created_date: new Date().toISOString()
      };
      
      setAnalyses(prev => [newAnalysis, ...prev]);
      setCurrentResult(result);
      setAppState('result');
    } catch (error) {
      console.error('Erro ao analisar áudio:', error);
      setApiError(error.message);
      setAppState('error');
    }
  };

  const handleStart = () => setAppState('recording');
  const handleAnalyzeAgain = () => {
    setCurrentResult(null);
    setApiError(null);
    setAppState('recording');
  };

  const renderContent = () => {
    switch (appState) {
      case 'welcome': return <WelcomeScreen onStart={handleStart} />;
      case 'recording': return <AnalysisRecorder onAnalyze={handleAnalyze} />;
      case 'loading': return <LoadingScreen />;
      case 'result': return <AnalysisResult result={currentResult} onAnalyzeAgain={handleAnalyzeAgain} />;
      case 'error': return <ErrorScreen error={apiError} onRetry={handleAnalyzeAgain} />;
      default: return <WelcomeScreen onStart={handleStart} />;
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Análise de Burnout por Voz</h1>
      </header>
      <main style={styles.main}>
        {renderContent()}
        <AnalysisHistory analyses={analyses} />
      </main>
      <footer style={styles.footer}>
        <p>&copy; {new Date().getFullYear()} - Cuidando da sua saúde mental.</p>
      </footer>
    </div>
  );
}

// --- COMPONENTES ---

const WelcomeScreen = ({ onStart }) => (
  <div style={styles.card}>
    <h2 style={styles.title}>Sua voz é um reflexo do seu bem-estar.</h2>
    <p style={styles.subtitle}>
      Nossa ferramenta utiliza IA para analisar padrões na sua voz e identificar sinais precoces de burnout.
    </p>
    <button onClick={onStart} style={styles.buttonPrimary}>
      Iniciar Análise <Send size={18} style={{ marginLeft: 8 }} />
    </button>
  </div>
);

const LoadingScreen = () => (
  <div style={{ ...styles.card, ...styles.center }}>
    <Loader2 size={64} style={{ ...styles.icon, animation: 'spin 1s linear infinite' }} />
    <h2 style={styles.title}>Analisando sua voz...</h2>
    <p style={styles.subtitle}>Aguarde, estamos processando o áudio.</p>
  </div>
);

const ErrorScreen = ({ error, onRetry }) => (
  <div style={{ ...styles.card, backgroundColor: '#fff1f2', borderColor: '#fecaca' }}>
    <div style={{ ...styles.center, color: '#dc2626' }}>
      <AlertCircle size={48} style={styles.icon} />
      <h2 style={styles.title}>Ocorreu um Erro</h2>
    </div>
    <p style={{...styles.subtitle, color: '#b91c1c', backgroundColor: '#fee2e2', padding: 12, borderRadius: 6}}>
      <strong>Detalhes:</strong> {error || 'Não foi possível conectar à API. Verifique se o backend está rodando.'}
    </p>
    <button onClick={onRetry} style={styles.buttonSecondary}>
      Tentar Novamente <RotateCcw size={18} style={{ marginLeft: 8 }} />
    </button>
  </div>
);

const AnalysisResult = ({ result, onAnalyzeAgain }) => {
  const config = {
    baixo: { title: 'Risco Baixo', color: '#16a34a', bgColor: '#f0fdf4', borderColor: '#bbf7d0', icon: <Play /> },
    médio: { title: 'Risco Médio', color: '#f59e0b', bgColor: '#fffbeb', borderColor: '#fde68a', icon: <Pause /> },
    alto: { title: 'Risco Alto', color: '#dc2626', bgColor: '#fef2f2', borderColor: '#fecaca', icon: <Mic /> }
  };
  const currentConfig = result ? config[result.risk_level] || config['baixo'] : config['baixo'];

  return (
    <div style={{ ...styles.card, backgroundColor: currentConfig.bgColor, borderColor: currentConfig.borderColor }}>
      <div style={{ ...styles.center, color: currentConfig.color }}>
        {currentConfig.icon}
        <h2 style={styles.title}>{currentConfig.title}</h2>
      </div>
      <p style={styles.subtitle}>
        Sua pontuação de risco foi de <strong>{result?.score}</strong>. 
        Este valor indica a probabilidade de sinais de estresse vocal em sua amostra.
      </p>
      <div style={{ ...styles.center, marginTop: 24, flexDirection: 'column', gap: 16 }}>
        <p style={{ ...styles.subtitle, fontStyle: 'italic', maxWidth: '80%' }}>
          Lembre-se: esta é uma análise preliminar e não substitui um diagnóstico profissional.
        </p>
        <button onClick={onAnalyzeAgain} style={styles.buttonSecondary}>
          Analisar Novamente <RotateCcw size={18} style={{ marginLeft: 8 }} />
        </button>
      </div>
    </div>
  );
};


const AnalysisRecorder = ({ onAnalyze }) => {
  const [recordingStatus, setRecordingStatus] = useState('idle'); // idle, recording, paused, finished
  const [selectedFile, setSelectedFile] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        chunksRef.current = [];
        stream.getTracks().forEach(track => track.stop()); // Stop mic access
      };
      mediaRecorderRef.current.start();
      setRecordingStatus('recording');

      // Start timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Erro ao iniciar gravação:", err);
      alert("Não foi possível acessar o microfone. Verifique as permissões do seu navegador.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecordingStatus('finished');
    clearInterval(timerRef.current);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setAudioBlob(null); // Clear any previous recording
    }
  };

  const handleAnalyzeClick = () => {
    if (audioBlob) {
      onAnalyze({ audioBlob });
    } else if (selectedFile) {
      onAnalyze({ file: selectedFile });
    }
  };

  const handleReset = () => {
    setAudioBlob(null);
    setSelectedFile(null);
    setRecordingStatus('idle');
    setRecordingTime(0);
    clearInterval(timerRef.current);
  };

  const isReadyToAnalyze = audioBlob || selectedFile;

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Como você quer analisar?</h2>
      
      {/* Opção 1: Upload de Arquivo */}
      <div style={styles.optionContainer}>
        <label htmlFor="audio-upload" style={styles.uploadButton} role="button">
          <Upload size={20} style={{ marginRight: 8 }} />
          Carregar Arquivo de Áudio
        </label>
        <input
          id="audio-upload"
          type="file"
          accept=".wav,.mp3,.ogg,.m4a"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          disabled={recordingStatus !== 'idle'}
        />
        <p style={styles.formatInfo}>Formatos permitidos: WAV, MP3, OGG, M4A</p>
      </div>

      {selectedFile && (
        <div style={styles.statusBox}>
          <FileAudio size={20} style={{ marginRight: 8, color: '#16a34a' }} />
          <span>Arquivo selecionado: <strong>{selectedFile.name}</strong></span>
        </div>
      )}

      <div style={styles.divider}>OU</div>

      {/* Opção 2: Gravação */}
      <div style={styles.optionContainer}>
        {recordingStatus === 'idle' && (
          <button onClick={startRecording} style={styles.micButton}>
            <Mic size={20} style={{ marginRight: 8 }} />
            Gravar Voz Agora
          </button>
        )}

        {recordingStatus === 'recording' && (
          <div style={{ ...styles.statusBox, ...styles.recordingActive }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Clock size={20} style={{ marginRight: 8 }} />
              <span>Gravando: <strong>{formatTime(recordingTime)}</strong></span>
            </div>
            <button onClick={stopRecording} style={styles.stopButton}>
              <Pause size={16} /> Parar
            </button>
          </div>
        )}

        {recordingStatus === 'finished' && audioBlob && (
          <div style={styles.statusBox}>
            <FileAudio size={20} style={{ marginRight: 8, color: '#16a34a' }} />
            <span>Gravação concluída ({formatTime(recordingTime)})</span>
          </div>
        )}
      </div>

      {/* Ações Finais */}
      {(recordingStatus === 'finished' || selectedFile) && (
        <div style={styles.actionsContainer}>
          <button onClick={handleReset} style={styles.resetButton}>
            <Trash2 size={18} style={{ marginRight: 8 }} />
            Descartar
          </button>
          <button 
            onClick={handleAnalyzeClick} 
            disabled={!isReadyToAnalyze} 
            style={isReadyToAnalyze ? styles.buttonPrimary : styles.buttonDisabled}
          >
            Analisar Agora <Send size={18} style={{ marginLeft: 8 }} />
          </button>
        </div>
      )}
    </div>
  );
};


const AnalysisHistory = ({ analyses }) => {
  if (analyses.length === 0) return null;

  return (
    <div style={{...styles.card, marginTop: '24px'}}>
      <h2 style={styles.title}>Histórico de Análises</h2>
      <ul style={styles.historyList}>
        {analyses.map(item => (
          <li key={item.id} style={styles.historyItem}>
            <div style={styles.historyInfo}>
              <span style={{ fontWeight: 'bold', color: '#111827' }}>
                Risco: {item.risk_level} (Score: {item.score})
              </span>
              <span style={{ fontSize: '14px', color: '#4b5563' }}>
                {item.inputType === 'upload' ? `Arquivo: ${item.fileName}` : 'Gravação de Voz'}
              </span>
            </div>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              {format(new Date(item.created_date), "dd/MM/yyyy 'às' HH:mm")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// --- ESTILOS ---

const styles = {
  page: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    backgroundColor: '#f3f4f6',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: '16px 32px',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
  },
  main: {
    flex: 1,
    width: '100%',
    maxWidth: '800px',
    margin: '32px auto',
    padding: '0 16px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    padding: '32px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  title: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '12px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#4b5563',
    lineHeight: 1.5,
    maxWidth: '90%',
    marginBottom: '24px',
  },
  buttonPrimary: {
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  },
  buttonSecondary: {
    backgroundColor: '#ffffff',
    color: '#4f46e5',
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#e5e7eb',
    color: '#9ca3af',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: '16px',
  },
  footer: {
    textAlign: 'center',
    padding: '24px',
    color: '#6b7280',
    fontSize: '14px',
  },
  historyList: {
    listStyle: 'none',
    padding: 0,
    width: '100%',
  },
  historyItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6',
  },
  historyInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  optionContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '16px',
  },
  uploadButton: {
    ...styles.buttonSecondary,
    width: '100%',
    maxWidth: '300px',
    marginBottom: '8px',
  },
  micButton: {
    ...styles.buttonSecondary,
    width: '100%',
    maxWidth: '300px',
    borderColor: '#4f46e5',
  },
  stopButton: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    padding: '4px 12px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  formatInfo: {
    fontSize: '12px',
    color: '#6b7280',
  },
  divider: {
    color: '#9ca3af',
    margin: '16px 0',
    fontWeight: 'bold',
  },
  actionsContainer: {
    display: 'flex',
    gap: '16px',
    marginTop: '24px',
    borderTop: '1px solid #e5e7eb',
    paddingTop: '24px',
    width: '100%',
    justifyContent: 'center',
  },
  resetButton: {
    ...styles.buttonSecondary,
    color: '#ef4444',
    borderColor: '#fecaca',
  },
  statusBox: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '12px',
    marginTop: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    color: '#14532d',
  },
  recordingActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#93c5fd',
    color: '#1e40af',
    justifyContent: 'space-between',
  }
};

export default App;
