import { ChangeEvent, FormEvent, useState, useRef, useEffect } from 'react';
import { LuImagePlus } from "react-icons/lu";
import { TfiVideoClapper } from "react-icons/tfi";
import { IoSend } from "react-icons/io5";
import { TbRefreshAlert } from "react-icons/tb";
import './Chatbot.css';
import axios from 'axios';
// import AudioStreamer from './AudioStreamer.tsx';
import SendAudioSocket from './SendAudioSocket.tsx';

const apiEndpoint = 'http://localhost:8000';

interface MessageProps {
  sender: 'user' | 'bot';
  text: string;
  imageUrl?: string;
  timestamp: string;
  responseTime?: number;
}

const formData = new FormData();

const Chatbot = () => {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [input, setInput] = useState<string>('');
  const [imageUrl, setImage] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;

    formData.append('text', input);

    try {
      const userMessage: MessageProps = { 
        sender: 'user',
        text: input,
        imageUrl: imageUrl,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      };
      setMessages((prevMessages) => ([...prevMessages, userMessage]));

      const startTime = Date.now();
      const response = await axios.post(`${apiEndpoint}/Chatbot`, formData, {
        headers: {
          'content-type': 'multipart/form-data',
        },
      });
      const endTime = Date.now();

      const botMessage: MessageProps = { 
        sender: 'bot',
        text: response.data.answer,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        responseTime: (endTime - startTime) / 1000
      };
      setMessages((prevMessages) => ([...prevMessages, botMessage]));
    } catch (error) {
      console.error(error);
    }

    formData.delete('text');
    formData.delete('image');
    setInput('');
    setImage('');
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      formData.append('image', e.target.files[0]);
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setImage(reader.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    } else {
      console.error("Unable to upload file");
    }
  };

  const handleHistoryReset = async () => {
    try {
      await axios.get(`${apiEndpoint}/reset_chat_history`);
      setMessages([]);
    } catch (error) {
      console.error(`Unable to wipe message history due to following error: ${error}`);
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            formData.append('image', file);
            const reader = new FileReader();
            reader.onload = () => {
              if (reader.result) {
                setImage(reader.result as string);
              }
            };
            reader.readAsDataURL(file);
          }
          break;
        }
      }
    }
  };

  useEffect(() => {
    if (textInputRef.current) {
      textInputRef.current.addEventListener('paste', handlePaste);
    }

    return () => {
      if (textInputRef.current) {
        textInputRef.current.removeEventListener('paste', handlePaste);
      }
    };
  }, []);

  // const handleReceiveMessage = (message: string) => {
  //   const botMessage: MessageProps = { sender: 'bot', text: message };
  //   setMessages((prevMessages) => ([...prevMessages, botMessage]));
  // };

  return (
    <div className='chatbot-container'>
      <div className='chat-window'>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            <div className='message-text'>{message.text}</div>
            {message.imageUrl && <img src={message.imageUrl} alt='Uploaded content' className='uploaded-image' />}
            <div className='message-timestamp'>{message.timestamp.toLocaleString()}</div>
            {message.sender === 'bot' && message.responseTime && 
              <div className='message-response-time'>Response time: {message.responseTime} seconds</div>
            }
        </div>
        ))}
      </div>
      <form onSubmit={handleSend} className='input-area' method='POST' encType='multipart/form-data'>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          style={{ display: 'none' }}
          className='file-upload'
          accept=".jpg"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className='file-upload-button'
          aria-label='Upload Image'
        >
          <LuImagePlus />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          style={{ display: 'none' }}
          className='file-upload'
          accept=".mp4,.jpg,.png"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className='file-upload-button'
          aria-label='Upload Video'
        >
          <TfiVideoClapper />
        </button>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder='How can I help you today?'
          className='text-box'
          aria-label='Message Input'
          ref={textInputRef}
        />
        <button type='submit' className='submit-button' aria-label='Send Message'>
          <IoSend />
        </button>
        <button onClick={handleHistoryReset} type="button" className='reset-chat-button' aria-label='Reset Chat'>
          <TbRefreshAlert />
        </button>
      </form>
      {/* <AudioStreamer/> */}
      <SendAudioSocket />
    </div>
  );
};

export default Chatbot;
