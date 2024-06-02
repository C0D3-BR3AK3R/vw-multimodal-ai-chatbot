import { ChangeEvent, FormEvent, useState, useRef } from 'react';
import { ImAttachment } from "react-icons/im";
import { IoSend } from "react-icons/io5";
import './Chatbot.css';

interface MessageProps {
  sender: 'user' | 'bot';
  text: string;
}

const Chatbot = () => {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [input, setInput] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const userMessage: MessageProps = { sender: 'user', text: input };
    const botMessage: MessageProps = { sender: 'bot', text: 'Random Bot message' };

    setMessages((prevMessages) => ([...prevMessages, userMessage, botMessage]));
    setInput('');  // Clear the input field after sending a message
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).map(file => file.name);
      console.log('Selected files:', files);
    }
  }

  return (
    <div className='chatbot-container'>
      <div className='chat-window'>
        {
          messages.map((message, index) => (
            <div key={index} className={`message ${message.sender}`}>
              {message.text}
            </div>
          ))
        }
      </div>
      <form onSubmit={handleSend} className='input-area'>
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleImageUpload}
          style={{ display: 'none' }}
          className='file-upload'
          accept=".jpg,.jpeg,.png,.mp4"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className='file-upload-button'
          aria-label='Upload File'
        >
          <ImAttachment />
        </button>
        <input 
          type="text" 
          value={input}
          onChange={handleInputChange}
          placeholder='How can I help you today?'
          className='text-box'
          aria-label='Message Input'
        />
        <button type='submit' className='submit-button' aria-label='Send Message'>
          <IoSend />
        </button>
      </form>
    </div>
  )
}

export default Chatbot;
