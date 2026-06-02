import { useEffect, useRef, useState } from 'react';
import { uploadToCloudinary } from '../utils/cloudinary';

export const useVoiceRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const durationRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Microphone recording is not supported by this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      durationRef.current = 0;
      setDuration(0);
      setError('');
      setRecording(true);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (blob.size > 0) {
          const url = URL.createObjectURL(blob);
          setAudioBlob(blob);
          setAudioUrl(url);
        }
        setRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };

      recorder.start();
      timerRef.current = window.setInterval(() => {
        durationRef.current += 1;
        setDuration(durationRef.current);
      }, 1000);
    } catch (exception) {
      setError('Could not access your microphone. Please allow microphone access and try again.');
      setRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const clearRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    setAudioBlob(null);
    setDuration(0);
    setError('');
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl('');
    }
  };

  const uploadRecording = async () => {
    if (!audioBlob) return '';
    const file = new File([audioBlob], `voice-wish-${Date.now()}.webm`, { type: audioBlob.type });
    const upload = await uploadToCloudinary(file);
    return upload.secureUrl;
  };

  return {
    recording,
    audioBlob,
    audioUrl,
    duration,
    error,
    startRecording,
    stopRecording,
    clearRecording,
    uploadRecording,
  };
};
