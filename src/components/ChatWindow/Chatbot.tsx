import { ChangeEvent, FormEvent, useState, useRef, useEffect } from 'react';
import { LuImagePlus } from "react-icons/lu";
import { TfiVideoClapper } from "react-icons/tfi";
import { IoSend } from "react-icons/io5";
import { TbRefreshAlert } from "react-icons/tb";
import Markdown from 'react-markdown'
import './Chatbot.css';
import axios from 'axios';
// import AudioStreamer from './AudioStreamer.tsx';
// import SendAudioSocket from './SendAudioSocket.tsx';

const apiEndpoint = 'http://localhost:8000';

interface MessageProps {
  sender: 'user' | 'bot';
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  timestamp: string;
  responseTime?: number;
}

const formData = new FormData();

const Chatbot = () => {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [input, setInput] = useState<string>('');
  const [chatType, setChatType] = useState<string>('Image');
  const [imageUrl, setImage] = useState<string>('');
  const [videoUrl, setVideo] = useState<string>('');

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
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
        videoUrl: videoUrl,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      };
      setMessages((prevMessages) => ([...prevMessages, userMessage]));

      const startTime = Date.now();
      let answer = '';
      if (chatType === 'Image') {
        const response = await axios.post(`${apiEndpoint}/Chatbot`, formData, {
          headers: {
            'content-type': 'multipart/form-data',
          },
        });
        answer = response.data.answer;
      }
      else if (chatType === 'Video'){
        const response = await axios.post(`${apiEndpoint}/VideoChatbot`, formData, {
          headers: {
            'content-type': 'multipart/form-data',
          },
        });
        answer = response.data.answer;
      }
      const endTime = Date.now();

      const botMessage: MessageProps = { 
        sender: 'bot',
        text: answer,
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
    setVideo('');
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
      setChatType('Image');
      console.log(`Chat Type => ${chatType}`);
    } else {
      console.error("Unable to upload image");
    }
  };

  const handleVideoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      formData.append('video', e.target.files[0]);
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setVideo(reader.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
      setChatType('Video');
      console.log(`Chat Type = ${chatType}`);
    } else {
      console.error("Unable to upload video");
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
            setChatType('Image');
            console.log(`Chat Type: ${chatType}`);
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
            <Markdown className='message-text'>{message.text}</Markdown>
            {message.imageUrl && <img src={message.imageUrl} alt='Uploaded content' className='uploaded-image' />}
            <Markdown className='message-timestamp'>{message.timestamp.toLocaleString()}</Markdown>
            {message.sender === 'bot' && message.responseTime && 
              <div className='message-response-time response-time-style'>Response time: {message.responseTime} seconds</div>
            }
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className='input-area' method='POST' encType='multipart/form-data'>
        <input
          type="file"
          ref={videoInputRef}
          onChange={handleVideoUpload}
          style={{ display: 'none' }}
          className='file-upload'
          accept=".mp4"
        />
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className='file-upload-button'
          aria-label='Upload Image'
        >
          <LuImagePlus />
        </button>
        <input
          type="file"
          ref={imageInputRef}
          onChange={handleImageUpload}
          style={{ display: 'none' }}
          className='file-upload'
          accept=".jpg,.png,.jpeg"
        />
        <button
          type="button"
          onClick={() => videoInputRef.current?.click()}
          className='file-upload-button'
          aria-label='Upload Video'
        >
          <TfiVideoClapper />
        </button>
        <div className='text-box-with-preview'>
          {imageUrl && (
            <div className="image-preview">
              <img src={imageUrl} alt="Image preview" className="preview-image" />
            </div>
          )}
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder='How can I help you today?'
            className='text-box'
            aria-label='Message Input'
            ref={textInputRef}
          />
        </div>
        <button type='submit' className='submit-button' aria-label='Send Message'>
          <IoSend />
        </button>
        <button onClick={handleHistoryReset} type="button" className='reset-chat-button' aria-label='Reset Chat'>
          <TbRefreshAlert />
        </button>
      </form>
      {/* <AudioStreamer/> */}
      {/* <SendAudioSocket /> */}
    </div>
  );
};

export default Chatbot;
