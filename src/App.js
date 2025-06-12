import React, { useState, useRef, useEffect } from 'react';
import { Upload, Mic, Play, Pause, Trash2, Send, RotateCcw, Loader2, AlertCircle, FileAudio, Clock } from 'lucide-react';
import { format } from 'date-fns';

// Configuração da API
const API_BASE_URL = 'https://burnout-doi7.onrender.com';

// ESTILOS DEFINIDOS PRIMEIRO
const styles = {
  page: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '20px',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  headerTitle: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '600'
  },
  main: {
    flex: 1,
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 20px',
    width: '100%'
  },
  footer: {
    backgroundColor: '#f1f5f9',
    textAlign: 'center',
    padding: '20px',
    color: '#64748b',
    borderTop: '1px solid #e2e8f0'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '32px',
    marginBottom: '32px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0'
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#1e293b'
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b',
    marginBottom: '24px',
    lineHeight: '1.6'
  },
  buttonPrimary: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    width: '100%'
  },
  buttonSecondary: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    width: '100%'
  },
  center: {
    textAlign: 'center'
  },
  icon: {
    marginBottom: '16px'
  },
  recorderContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formatsList: {
    backgroundColor: '#f8fafc',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  formatsTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px'
  },
  formatsText: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0
  },
  uploadArea: {
    border: '2px dashed #d1d5db',
    borderRadius: '8px',
    padding: '32px',
    textAlign: 'center',
    backgroundColor: '#f9fafb',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  uploadAreaActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff'
  },
  hiddenInput: {
    display: 'none'
  },
  recordingControls: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px'
  },
  timer: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  fileSelected: {
    backgroundColor: '#dcfce7',
    border: '2px solid #16a34a',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#166534'
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0'
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  riskBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500'
  }
};

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
  const [appState, setAppState] = useState('welcome');
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

const AnalysisRecorder = ({ onAnalyze }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Timer para gravação
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  // Formatar tempo (00:00)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      recordedChunks.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      setSelectedFile(null);
      setAudioURL(null);
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      alert('Erro ao acessar o microfone. Verifique as permissões.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setAudioURL(null);
      setRecordingTime(0);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('audio/')) {
        setSelectedFile(file);
        setAudioURL(null);
        setRecordingTime(0);
      } else {
        alert('Por favor, selecione apenas arquivos de áudio.');
      }
    }
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      onAnalyze({ file: selectedFile });
    } else if (recordedChunks.current.length > 0) {
      const blob = new Blob(recordedChunks.current, { type: 'audio/wav' });
      onAnalyze({ audioBlob: blob });
    }
  };

  const clearRecording = () => {
    setAudioURL(null);
    setSelectedFile(null);
    setRecordingTime(0);
    recordedChunks.current = [];
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Análise de Voz para Burnout</h2>
      
      {/* Formatos Permitidos */}
      <div style={styles.formatsList}>
        <div style={styles.formatsTitle}>📁 Formatos de áudio aceitos:</div>
        <p style={styles.formatsText}>MP3, WAV, OGG, M4A, FLAC (máximo 10MB)</p>
      </div>

      <div style={styles.recorderContainer}>
        {/* Upload de Arquivo */}
        <div
          style={{
            ...styles.uploadArea,
            ...(isDragging ? styles.uploadAreaActive : {})
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={48} color="#6b7280" style={{ marginBottom: 16 }} />
          <p><strong>Clique aqui ou arraste um arquivo de áudio</strong></p>
          <p style={{ fontSize: 14, color: '#6b7280' }}>
            Ou grave sua voz usando o microfone abaixo
          </p>
          <input
            ref__={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            style={styles.hiddenInput}
          />
        </div>

        {/* Arquivo Selecionado */}
        {selectedFile && (
          <div style={styles.fileSelected}>
            <FileAudio size={24} />
            <div>
              <strong>Arquivo selecionado:</strong><br />
              {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          </div>
        )}

        {/* Timer de Gravação */}
        {isRecording && (
          <div style={styles.timer}>
            <Clock size={24} />
            {formatTime(recordingTime)}
          </div>
        )}

        {/* Controles de Gravação */}
        <div style={styles.recordingControls}>
          {!isRecording ? (
            <button onClick={startRecording} style={styles.buttonPrimary}>
              <Mic size={18} style={{ marginRight: 8 }} />
              Gravar Áudio
            </button>
          ) : (
            <button onClick={stopRecording} style={styles.buttonSecondary}>
              <Pause size={18} style={{ marginRight: 8 }} />
              Parar Gravação
            </button>
          )}
          
          {(audioURL || selectedFile) && (
            <button onClick={clearRecording} style={styles.buttonSecondary}>
              <Trash2 size={18} style={{ marginRight: 8 }} />
              Limpar
            </button>
          )}
        </div>

        {/* Reproduzir Audio Gravado */}
        {audioURL && (
          <audio controls style={{ width: '100%', marginTop: 16 }}>
            <source src={audioURL} type="audio/wav" />
          </audio>
        )}

        {/* Botão Analisar */}
        {(audioURL || selectedFile) && (
          <button onClick={handleAnalyze} style={styles.buttonPrimary}>
            <Send size={18} style={{ marginRight: 8 }} />
            Analisar Áudio
          </button>
        )}
      </div>
    </div>
  );
};

const AnalysisResult = ({ result, onAnalyzeAgain }) => {
  const config = {
    baixo: { title: 'Risco Baixo', color: '#16a34a', bgColor: '#f0fdf4', borderColor: '#bbf7d0' },
    médio: { title: 'Risco Médio', color: '#d97706', bgColor: '#fffbeb', borderColor: '#fed7aa' },
    alto: { title: 'Risco Alto', color: '#dc2626', bgColor: '#fef2f2', borderColor: '#fecaca' }
  };

  const riskConfig = config[result?.burnout_risk] || config.médio;

  return (
    <div style={{ ...styles.card, backgroundColor: riskConfig.bgColor, borderColor: riskConfig.borderColor }}>
      <div style={styles.center}>
        <div style={{ ...styles.riskBadge, backgroundColor: riskConfig.color, color: 'white', display: 'inline-block', marginBottom: 16 }}>
          {riskConfig.title}
        </div>
        <h2 style={{ ...styles.title, color: riskConfig.color }}>
          Resultado da Análise
        </h2>
        <p style={styles.subtitle}>
          <strong>Pontuação:</strong> {result?.score ? `${(result.score * 100).toFixed(1)}%` : 'N/A'}
        </p>
        
        {result?.recommendations && (
          <div style={{ textAlign: 'left', marginTop: 20 }}>
            <h3 style={{ color: riskConfig.color }}>Recomendações:</h3>
            <ul style={{ color: '#374151' }}>
              {result.recommendations.map((rec, index) => (
                <li key={index} style={{ marginBottom: 8 }}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <button onClick={onAnalyzeAgain} style={{ ...styles.buttonSecondary, marginTop: 20 }}>
        <RotateCcw size={18} style={{ marginRight: 8 }} />
        Nova Análise
      </button>
    </div>
  );
};

const AnalysisHistory = ({ analyses }) => {
  if (analyses.length === 0) return null;

  const getRiskColor = (risk) => {
    const colors = {
      baixo: '#16a34a',
      médio: '#d97706', 
      alto: '#dc2626'
    };
    return colors[risk] || '#6b7280';
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Histórico de Análises</h3>
      {analyses.map((analysis) => (
        <div key={analysis.id} style={styles.historyCard}>
          <div style={styles.historyHeader}>
            <span style={{ fontSize: 14, color: '#6b7280' }}>
              {format(new Date(analysis.created_date), 'dd/MM/yyyy HH:mm')}
            </span>
            <span style={{ 
              ...styles.riskBadge, 
              backgroundColor: getRiskColor(analysis.risk_level),
              color: 'white'
            }}>
              {analysis.risk_level}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: '#374151' }}>
            {analysis.inputType === 'upload' ? `📁 ${analysis.fileName}` : '🎤 Gravação de voz'} - 
            Pontuação: {(analysis.score * 100).toFixed(1)}%
          </p>
        </div>
      ))}
    </div>
  );
};

export default App;
