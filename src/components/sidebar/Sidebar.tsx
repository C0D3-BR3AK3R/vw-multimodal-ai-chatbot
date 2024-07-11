import { FormEvent, useEffect, useRef, useState } from 'react';
import axios from 'axios';

import './sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faRemove } from '@fortawesome/free-solid-svg-icons';

const apiEndpoint = 'http://localhost:8000';
// const apiEndpoint = 'https://troll-deep-doe.ngrok-free.app';

type chatType = {
    mode: "Image" | "Video";
}
type VideoStatus = {
    status: "processed" | "processing" | "null";
  }

type InfType = {
    mode: "Full Context" | "VectorDB Timestamp";
}

const formData = new FormData();

const Sidebar = ({ setChatType, setVideoStatus, setWarning, infType, setInfType, setVideoName }: {
    setChatType: React.Dispatch<React.SetStateAction<chatType>>,
    setVideoStatus: React.Dispatch<React.SetStateAction<VideoStatus>>,
    setWarning: React.Dispatch<React.SetStateAction<string>>,
    infType: InfType,
    setInfType: React.Dispatch<React.SetStateAction<InfType>>,
    setVideoName: React.Dispatch<React.SetStateAction<string>>
}) => {

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoURL, setVideoURL] = useState<string>('');

    const handleClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setVideoName(event.target.files[0].name);
            formData.append('video', event.target.files[0]);
            console.log(formData.get('video'));
            const file = event.target.files[0];
            const url = URL.createObjectURL(file);
            setVideoURL(url);
        }
    };

    const handleVideoRemoval = () => {
        setVideoURL('');
        formData.delete('video');
        setChatType({mode: 'Image'});
        setVideoStatus({status: 'null'});
    }

    const handleFormSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!videoURL) return;
        try {
            setVideoStatus({status: 'processing'});
            setWarning('Sending messages is disabled while processing video. Please wait.');
            setChatType({mode: 'Video'});
            console.log(formData.get('video'));
            const response = await axios.post(`${apiEndpoint}/api/chatbot/upload_video`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log(response.data.status);
            if (response.data.status === 'processed') {
                setVideoStatus({status: 'processed'});
                setWarning('');
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleInfTypeToggle = () => {
        if (infType.mode === 'Full Context') {
            setInfType({mode: 'VectorDB Timestamp'});
        } else {
            setInfType({mode: 'Full Context'});
        }
        console.log(infType.mode);
    }
    
    useEffect(() => {
        if (videoURL && videoRef.current) {
            videoRef.current.volume = 0.1;
        }
        console.log(videoURL);
    }, [videoURL]);
    
    return (
        <div className='sidebar'>
            <div className="sidebar-title">
                <h1>WishVA</h1>
            </div>
            <form method='POST' onSubmit={handleFormSubmit} encType='multipart/form-data'>
                <div className="sidebar-container">
                    {videoURL ? (
                        <div className="video-preview">
                            <video ref={videoRef} controls src={videoURL} autoPlay className='video'/>
                        </div>
                        ) : (
                        <div className="upload-container">
                            <div className="upload-box" onClick={handleClick}>
                                <input type="file" ref={fileInputRef} style={{display: 'none'}} accept="video/*" onChange={handleFileChange} />
                                <FontAwesomeIcon icon={faUpload} />
                                <p>Click here to upload a file</p>
                            </div>
                        </div>
                    )}
                    <div className="button-container">
                        <button className='remove-button' onClick={handleVideoRemoval}><FontAwesomeIcon icon={faRemove} /></button>
                        <button className="upload-button" type='submit'>Upload</button>
                        {infType.mode === 'Full Context' ? 
                            (<button className='inf-type-toggle full-context' onClick={handleInfTypeToggle}><img src="./multipage_icon.png" alt="" className='toggle-icon' /></button>) :
                            (<button className='inf-type-toggle vectordb' onClick={handleInfTypeToggle}><img src="./db-icon.png" alt="" className='toggle-icon' /></button>)
                        }
                    </div>
                    <div className="transcript">
                        <h2>Transcript</h2>
                        <p>Transcript will be displayed here</p>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default Sidebar