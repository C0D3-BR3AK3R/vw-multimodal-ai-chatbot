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

function App() {

  const [chatType, setChatType] = useState<chatType>({mode: "Image"});
  const [videoStatus, setVideoStatus] = useState<VideoStatus>({status: "null"});
  const [warning, setWarning] = useState<string>('');

  return (
    <div className='app'>
      <Sidebar 
        setChatType = {setChatType}
        setVideoStatus = {setVideoStatus}
        setWarning = {setWarning}
      />
      <Chatbot 
        chatType={chatType}
        setChatType={setChatType}
        videoStatus={videoStatus}
        warning={warning}
      />
    </div>
  )
}

export default App
