import { useEffect, useRef, useState } from 'react';
import './sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faRemove } from '@fortawesome/free-solid-svg-icons';

const Sidebar = () => {

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoURL, setVideoURL] = useState<string>('');

    const handleClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const url = URL.createObjectURL(file);
            setVideoURL(url);
        }
    };

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
                <button className='remove-button' onClick={() => setVideoURL('')}><FontAwesomeIcon icon={faRemove} /></button>
                <button className="upload-button">Upload</button>
            </div>
            <div className="transcript">
                <h2>Transcript</h2>
                <p>Transcript will be displayed here</p>
            </div>
        </div>
    </div>
  )
}

export default Sidebar