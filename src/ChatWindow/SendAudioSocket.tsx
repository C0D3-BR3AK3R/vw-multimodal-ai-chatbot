import { useState, useRef } from "react";
import { IoMic, IoMicOff } from "react-icons/io5";
import "./SendAudioSocket.css";

const SendAudioSocket = () => {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const audioSocket = useRef<WebSocket | null>(null);
    const mediaRecorder = useRef<MediaRecorder | null>(null);

    const handleDataAvailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        if (audioSocket.current?.readyState === WebSocket.OPEN) {
          console.log(`Data: ${event.data.size} sent at time ${new Date().toLocaleTimeString()}`);
          audioSocket.current.send(event.data);
        }
      }
    }

    const handleStop = () => {
      audioSocket.current?.close();
    }

    const handleRecording = () => {
      setIsRecording(prevIsRecording => {
        return !prevIsRecording;
      });

      if (isRecording) {
        mediaRecorder.current?.stop();
      }
      else {
        navigator.mediaDevices.getUserMedia({audio: true}).then((stream) => {
          mediaRecorder.current = new MediaRecorder(stream, {
            mimeType: 'audio/webm; codecs=opus'
          });

          mediaRecorder.current.ondataavailable = handleDataAvailable;
          mediaRecorder.current.onstop = handleStop;

          mediaRecorder.current.start();
        
          audioSocket.current = new WebSocket("ws://localhost:8000/audio-stream");

          audioSocket.current.onopen = () => {
            console.log("WebSocket connection established.");
          }
          audioSocket.current.onerror = (error) => console.error(`WebSocket error: ${error}`);
          audioSocket.current.onclose = () => console.log("WebSocket connection closed.");
        }).catch((error) => console.error(`Error: ${error}`));
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