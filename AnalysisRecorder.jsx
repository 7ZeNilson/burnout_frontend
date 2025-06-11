import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Mic, Square, Trash2, Send, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AnalysisRecorder({ onAnalyze }) {
  const [audioSource, setAudioSource] = useState(null); // 'upload' or 'record'
  const [audioData, setAudioData] = useState(null); // File object or Blob
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState('');
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Suporte expandido para incluir .ogg (WhatsApp)
      const supportedTypes = [
        'audio/wav', 
        'audio/mpeg', 
        'audio/mp3', 
        'audio/ogg',
        'audio/ogg; codecs=opus'
      ];
      
      if (!supportedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.ogg')) {
        setError('Por favor, envie um arquivo WAV, MP3 ou OGG (WhatsApp).');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('O arquivo é muito grande. O limite é 10MB.');
        return;
      }
      setError('');
      setAudioData(file);
      setAudioSource('upload');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioData(audioBlob);
        stream.getTracks().forEach(track => track.stop()); // Stop mic access
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAudioSource('record');
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    } catch (err) {
      setError('Não foi possível acessar o microfone. Por favor, verifique as permissões.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };
  
  const resetState = () => {
      setAudioData(null);
      setAudioSource(null);
      setIsRecording(false);
      setRecordingTime(0);
      setError('');
      if (timerRef.current) clearInterval(timerRef.current);
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const canSubmit = audioData && (recordingTime >= 5 || audioSource === 'upload');

  return (
    <Card className="w-full shadow-lg border-slate-200">
      <CardHeader>
        <CardTitle className="text-2xl">Como você se sente hoje?</CardTitle>
        <p className="text-slate-500">Grave um áudio de pelo menos 30 segundos ou envie um arquivo de voz.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && <Alert variant="destructive"><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

        {!audioSource && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <Upload className="w-10 h-10 text-slate-400 mb-2"/>
                    <span className="font-semibold text-slate-700">Enviar um arquivo</span>
                    <span className="text-sm text-slate-500">WAV, MP3, OGG (WhatsApp)</span>
                    <span className="text-xs text-slate-400">máximo 10MB</span>
                    <input type="file" className="hidden" accept=".wav,.mp3,.ogg,audio/*" onChange={handleFileChange} />
                </label>
                <button onClick={startRecording} className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg hover:bg-slate-50 transition-colors">
                    <Mic className="w-10 h-10 text-slate-400 mb-2"/>
                    <span className="font-semibold text-slate-700">Gravar com microfone</span>
                    <span className="text-sm text-slate-500">Fale livremente</span>
                </button>
            </div>
        )}

        {audioSource === 'record' && (
            <div className="flex flex-col items-center justify-center p-6 bg-slate-100 rounded-lg">
                {isRecording ? (
                    <>
                        <div className="flex items-center text-red-500 font-mono text-2xl mb-4">
                            <Mic className="w-6 h-6 mr-2 animate-pulse" />
                            <span>{formatTime(recordingTime)}</span>
                        </div>
                        <Button onClick={stopRecording} variant="destructive" size="lg">
                            <Square className="w-5 h-5 mr-2" /> Parar Gravação
                        </Button>
                    </>
                ) : (
                    <>
                        <p className="font-semibold text-lg mb-4">Gravação concluída: {formatTime(recordingTime)}</p>
                        <div className="flex gap-4">
                            <Button onClick={resetState} variant="outline">
                                <RotateCcw className="w-4 h-4 mr-2" /> Gravar Novamente
                            </Button>
                        </div>
                    </>
                )}
            </div>
        )}

        {audioSource === 'upload' && audioData && (
             <div className="flex items-center justify-between p-4 bg-slate-100 rounded-lg">
                <div className="flex items-center gap-3">
                    <Upload className="w-5 h-5 text-blue-600"/>
                    <div>
                        <p className="font-medium">{audioData.name}</p>
                        {audioData.name.toLowerCase().endsWith('.ogg') && (
                            <p className="text-xs text-green-600">✓ Arquivo do WhatsApp detectado</p>
                        )}
                    </div>
                </div>
                <Button onClick={resetState} variant="ghost" size="icon">
                    <Trash2 className="w-5 h-5 text-slate-500"/>
                </Button>
            </div>
        )}
        
        {audioData && !isRecording && (
             <div className="border-t pt-6 flex flex-col items-center">
                 {audioSource === 'record' && recordingTime < 5 &&
                    <p className="text-sm text-amber-600 mb-4 text-center">Para uma análise mais precisa, recomendamos uma gravação de pelo menos 30 segundos. Você pode continuar, mas o resultado pode ser menos confiável.</p>
                 }
                <Button 
                    size="lg" 
                    className="bg-green-600 hover:bg-green-700" 
                    onClick={() => onAnalyze({ audioBlob: audioData, file: audioSource === 'upload' ? audioData : null })}
                >
                    <Send className="w-5 h-5 mr-2" /> Enviar para Análise
                </Button>
             </div>
        )}
      </CardContent>
    </Card>
  );
}
