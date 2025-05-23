import { ChangeEvent, FormEvent, useState, useRef, useEffect } from 'react';

// Importing the icons
import { LuImagePlus } from "react-icons/lu";
// import { TfiVideoClapper } from "react-icons/tfi";
import { IoSend } from "react-icons/io5";
import { TbRefreshAlert } from "react-icons/tb";
import { CiCircleRemove } from "react-icons/ci";

import { ThreeDots } from "react-loader-spinner";

import Markdown from 'react-markdown'
import './Chatbot.css';
import axios from 'axios';
// import AudioStreamer from './AudioStreamer.tsx';
// import SendAudioSocket from './SendAudioSocket.tsx';

const apiEndpoint = 'http://localhost:8000';

// const apiEndpoint = 'https://lightly-rare-starfish.ngrok-free.app';

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

const formData = new FormData();

const Chatbot = ({ chatType, setChatType, videoStatus, warning, infType, videoName, messages, setMessages }: { 
  chatType: chatType, 
  setChatType: React.Dispatch<React.SetStateAction<chatType>>,
  videoStatus:  VideoStatus,
  warning: string,
  infType: InfType,
  videoName: string,
  messages: MessageProps[],
  setMessages: React.Dispatch<React.SetStateAction<MessageProps[]>>
}) => {
  // const [messages, setMessages] = useState<MessageProps[]>([]);
  const [input, setInput] = useState<string>('');
  const [imageUrl, setImage] = useState<string>('');
  const [videoUrl, setVideo] = useState<string>('');
  const [responseLoading, setResponseLoading] = useState<boolean>(false);

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
      if (chatType.mode === 'Image') {
        setResponseLoading(true);
        const response = await axios.post(`${apiEndpoint}/api/chatbot/Chatbot`, formData, {
          headers: {
            'content-type': 'multipart/form-data',
          },
        });
        answer = response.data.answer;
        answer ? setResponseLoading(false) : setResponseLoading(true);
      }
      else if (chatType.mode === 'Video'){
        formData.append('inference_type', infType.mode);
        formData.append('video_id', videoName);
        console.warn(`video_id: ${videoName}\ntext: ${input}\ninference_type: ${infType.mode}`);
        setResponseLoading(true);
        const response = await axios.post(`${apiEndpoint}/api/chatbot/video_chatbot_2.0`, formData, {
          headers: {
            'content-type': 'multipart/form-data',
          },
        });

        answer = response.data.answer;
        answer ? setResponseLoading(false) : setResponseLoading(true);
        console.log(responseLoading);
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
      setChatType({mode: "Image"});
      console.log(`Chat Type => ${chatType.mode}`);
    } else {
      console.error("Unable to upload image");
    }
  };

  const handleVideoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      formData.append('video', e.target.files[0].name);
      // const reader = new FileReader();
      // reader.onload = () => {
      //   if (reader.result) {
      //     setVideo(reader.result as string);
      //   }
      // };
      // reader.readAsDataURL(e.target.files[0]);
      setChatType({mode: "Video"});
      console.log(`Chat Type = ${chatType.mode}`);
    } else {
      console.error("Unable to upload video");
    }
  };

  const handleHistoryReset = async () => {
    try {
      await axios.get(`${apiEndpoint}/api/chatbot/reset_chat_history`);
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
            setChatType({mode: "Image"});
            console.log(`Chat Type: ${chatType.mode}`);
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

  const handlePressEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && videoStatus.status !== 'processing') {
      e.preventDefault();
      const form = document.querySelector('form.input-area') as HTMLFormElement;
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }
  };

  const handleClearTextArea = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      setInput('');
      setImage('');
    }
  }

  const removeImagePreview = () => {
    setImage('');
    formData.delete('image');
  }

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

  // <button
  //         type="button"
  //         onClick={() => videoInputRef.current?.click()}
  //         className='file-upload-button'
  //         aria-label='Upload Video'
  //       >
  //         <TfiVideoClapper />
  //       </button>

  return (
    <div className='chatbot-container'>
      <div className='chat-window'>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            <Markdown className='message-text'>{message.text}</Markdown>
            {message.imageUrl && <img src={message.imageUrl} alt='Uploaded content' className='uploaded-image' />}
            
              {message.sender === 'bot' && message.responseTime && (
                <div className="message-time">
                  <div className='response-time-style'>Response time: {message.responseTime} secs</div>
                  <Markdown className="message-timestamp-bot">{message.timestamp.toLocaleString()}</Markdown>
                </div>
              )}
              {message.sender === 'user' && (
                <Markdown className="message-timestamp">{message.timestamp.toLocaleString()}</Markdown>
              )}
          </div>
        ))}
        { responseLoading && (
          <div key="temp" className="message bot">
            <ThreeDots color='#000' height={50} width={50} />
          </div> 
        ) };
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
        
        <div className='text-box-with-preview'>
          {imageUrl && (
            <div className='img-preview'>
              <div className='remove-button-div'>
                <button className='remove-img-preview' onClick={removeImagePreview}>
                  <CiCircleRemove 
                    strokeWidth={1}
                    size={25}
                  />
                </button>
                <div className="image-preview-thumbnail">
                  <img src={imageUrl} alt="Image preview" className="preview-image" />
                </div>
              </div>
              <div className='warning-message'>{warning}</div>
            </div>
          )}
          {videoStatus.status === 'processing' && (
            <div className='warning-message'>{warning}</div>
          )}
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handlePressEnter}
            onKeyUp={handleClearTextArea}
            className='text-box'
            aria-label='Message Input'
            ref={textInputRef}
            disabled={videoStatus.status === 'processing'}
          />
        </div>
        <button type='submit' className='submit-button' aria-label='Send Message' disabled={videoStatus.status === 'processing'}>
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
