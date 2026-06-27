import { useState, useRef } from "react";

export function useVoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.current.start();
      setRecording(true);
      setDuration(0);

      timer.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch {
      alert(
        "Microphone access denied. Please allow microphone access to record voice notes."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && recording) {
      mediaRecorder.current.stop();
      setRecording(false);
      if (timer.current) clearInterval(timer.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder.current && recording) {
      mediaRecorder.current.stop();
    }
    setRecording(false);
    setAudioBlob(null);
    setDuration(0);
    if (timer.current) clearInterval(timer.current);
  };

  const resetAudio = () => {
    setAudioBlob(null);
    setDuration(0);
  };

  return {
    recording,
    audioBlob,
    duration,
    startRecording,
    stopRecording,
    cancelRecording,
    resetAudio,
  };
}