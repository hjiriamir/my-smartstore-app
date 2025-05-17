import React from 'react';
import './Popup.css'; // Créez un fichier CSS pour styliser la popup

const Popup = ({ message, onClose }) => {
    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <p>{message}</p>
                <button onClick={onClose}>إغلاق</button>
            </div>
        </div>
    );
};

export default Popup;