import { useRef } from 'react';
import './sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

const Sidebar = () => {

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };
    
  return (
    <div className='sidebar'>
        <div className="sidebar-title">
            <h1>WishVA</h1>
        </div>
        <div className="sidebar-container">
            <div className="upload-container">
                <div className="upload-box" onClick={handleClick}>
                    <input type="file" ref={fileInputRef} style={{display: 'none'}} accept="video/*" />
                    <FontAwesomeIcon icon={faUpload} />
                    <p>Click here to upload a file</p>
                </div>
            </div>
            <div className="button-container">
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