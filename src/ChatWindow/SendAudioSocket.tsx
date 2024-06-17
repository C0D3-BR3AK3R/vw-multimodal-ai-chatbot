import { useState, useRef } from "react";
import { IoMic, IoMicOff } from "react-icons/io5";
import "./SendAudioSocket.css";

const SendAudioSocket = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioSocket, setAudioSocket] = useState<WebSocket | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const handleAudioStream = (stream: MediaStream) => {
    mediaRecorder.current = new MediaRecorder(stream);
    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.current.push(event.data);
        console.log(audioChunks.current);
      }
    };
    mediaRecorder.current.start();
  };

  const handleStartRecording = () => {
    audioChunks.current = [];
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(handleAudioStream);
  };

  const handleStopRecording = () => {
    // setIsRecording(false);
    mediaRecorder.current?.stop();
    const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
    console.log(`Type: ${audioBlob.type}`)
    console.log(`Blob-Data: ${audioBlob.stream()}`)
    if (audioSocket) audioSocket.send(audioBlob);
  };

  const handleRecording = () => {
    setIsRecording(!isRecording);
    if (isRecording) {
      const newSocket = new WebSocket("ws://localhost:8000/audio-stream");
      if (audioSocket) audioSocket.onopen = () => console.log("Established connection with WebSocket.");
      setAudioSocket(newSocket);
      handleStartRecording();
    } else {
      handleStopRecording();
      if (audioSocket) audioSocket.close();
    }
  };

  return (
    <div className="audio-streamer">
      <button
        type="button"
        onClick={handleRecording}
        className="record-button"
        aria-label="Record Audio"
      >
        {isRecording ? <IoMic /> : <IoMicOff />}
      </button>
    </div>
  );
};

export default SendAudioSocket;
