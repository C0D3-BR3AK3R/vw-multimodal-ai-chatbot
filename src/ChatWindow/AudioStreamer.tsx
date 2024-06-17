import React, { useState, useRef, useEffect } from 'react';
import { IoMic, IoMicOff } from "react-icons/io5";
import './AudioStreamer.css';

interface AudioStreamerProps {
  onReceiveMessage: (message: string) => void;
}

const AudioStreamer: React.FC<AudioStreamerProps> = ({ onReceiveMessage }) => {
  
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const handleAudioStream = (stream: MediaStream) => {
    mediaRecorder.current = new MediaRecorder(stream);
    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.current.push(event.data);
        console.log(audioChunks.current)
      }
    };
    mediaRecorder.current.start();
  };

  const handleStartRecording = () => {
    // setIsRecording(true);
    audioChunks.current = [];
    navigator.mediaDevices.getUserMedia({ audio: true }).then(handleAudioStream);
  };

  const handleStopRecording = () => {
    // setIsRecording(false);
    mediaRecorder.current?.stop();
    const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
    const reader = new FileReader();
    reader.onloadend = () => {
      if (socket) {
        socket.send(reader.result as string);
      }
    };
    reader.readAsDataURL(audioBlob);
  };

  const handleRecording = () => {
    setIsRecording(!isRecording);
    if (isRecording){
      handleStartRecording()
    }
    else {
      handleStopRecording()
    }
  }

  useEffect(() => {
    const newSocket = new WebSocket('ws://localhost:8000/ws');
    newSocket.onopen = () => {
      console.log('WebSocket connection established');
    };
    newSocket.onmessage = (event) => {
      onReceiveMessage(event.data);
    };
    newSocket.onclose = () => {
      console.log('WebSocket connection closed');
    };
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [onReceiveMessage]);

  return (
    <div className="audio-streamer">
      <button
        type="button"
        onClick={handleRecording}
        className='record-button'
        aria-label='Record Audio'
      >
        {isRecording ? <IoMicOff /> : <IoMic />}
      </button>
    </div>
  );
};

export default AudioStreamer;
