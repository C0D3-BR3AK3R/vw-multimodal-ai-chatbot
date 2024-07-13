import { useState } from 'react';
import './App.css'
import Chatbot from './components/ChatWindow/Chatbot'
import Sidebar from './components/sidebar/Sidebar'

type chatType = {
  mode: "Image" | "Video";
}

type VideoStatus = {
  status: "processed" | "processing" | "null";
}

type InfType = {
  mode: "Full Context" | "VectorDB Timestamp";
}

type MessageProps = {
  sender: 'user' | 'bot';
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  timestamp: string;
  responseTime?: number;
}

function App() {

  const [chatType, setChatType] = useState<chatType>({mode: "Image"});
  const [videoStatus, setVideoStatus] = useState<VideoStatus>({status: "null"});
  const [warning, setWarning] = useState<string>('');
  const [infType, setInfType] = useState<InfType>({mode: "Full Context"});
  const [videoName, setVideoName] = useState<string>('');
  const [messages, setMessages] = useState<MessageProps[]>([]);

  return (
    <div className='app'>
      <Sidebar 
        setChatType = {setChatType}
        setVideoStatus = {setVideoStatus}
        setWarning = {setWarning}
        infType = {infType}
        setInfType = {setInfType}
        setVideoName = {setVideoName}
        videoStatus = {videoStatus}
        setMessages = {setMessages}
      />
      <Chatbot 
        chatType={chatType}
        setChatType={setChatType}
        videoStatus={videoStatus}
        warning={warning}
        infType={infType}
        videoName={videoName}
        messages={messages}
        setMessages={setMessages}
      />
    </div>
  )
}

export default App
