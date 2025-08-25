import React, { useState } from 'react';
import './ContactUs.css';
import "../multilingue/i18n.js"
import { useTranslation } from "react-i18next"

const ContactUs = () => {
    const { t, i18n } = useTranslation()
    
    // Determine text direction based on language
    const isRTL = i18n.language === "ar"
    const textDirection = isRTL ? "rtl" : "ltr"
    const textAlign = isRTL ? "right" : "left"
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    // State to capture form data
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        company_name: '',
        message: '',
        name: '',
        address: '',
        subject: '',
        status: 'unread', 
        category: 'support' 
    });

    // Options for dropdowns
    const statusOptions = ['unread', 'read', 'replied', 'archived'];
    const categoryOptions = ['support', 'billing', 'feature', 'bug'];

    // State for popup
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Create the payload to send to the server
        const messageData = {
            ...formData,
            created_at: new Date().toISOString()  // Automatically set created_at to current time
        };

        try {
            // Send POST request to the API
            const response = await fetch(`${API_BASE_URL}/message/createMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messageData)
            });

            const data = await response.json();
            
            if (response.ok) {
                console.log('Message successfully sent:', data);
                // Show success popup
                setPopupMessage(t("message sent successfully"));
                setIsSuccess(true);
                setShowPopup(true);
                // Reset form
                setFormData({
                    email: '',
                    phone: '',
                    company_name: '',
                    message: '',
                    name: '',
                    address: '',
                    subject: '',
                    status: 'unread',
                    category: 'support'
                });
            } else {
                console.error('Error sending message:', data.message);
                // Show error popup
                setPopupMessage(data.message || t("messageSentError"));
                setIsSuccess(false);
                setShowPopup(true);
            }
        } catch (error) {
            console.error('Error:', error);
            // Show error popup
            setPopupMessage(t("messageSentError"));
            setIsSuccess(false);
            setShowPopup(true);
        }
    };

    // Close popup
    const closePopup = () => {
        setShowPopup(false);
    };

    return (
        <div dir={textDirection} style={{ textAlign }}>
            <main>
                {/* Popup Notification */}
                {showPopup && (
                    <div className={`popup ${isSuccess ? 'success' : 'error'}`}>
                        <div className="popup-content">
                            <span className="close-btn" onClick={closePopup}>&times;</span>
                            <p>{popupMessage}</p>
                        </div>
                    </div>
                )}

                <section className="hero">
                    <h1>{t("contactTitle")}</h1>
                    <p>{t("contactMessage")}</p>
                </section>

                <section className="contact-section">
                    <div className="main-container">
                        <div className="contact-container">
                            <div className="contact-item">
                                <div>
                                    <img src="/Assets/phone.PNG" alt="Phone" />
                                </div>
                                <div className="text-content">
                                    <h3>{t("phoneTitle")}</h3>
                                    <p>+966-55-011-1496</p>
                                </div>
                            </div>

                            <div className="contact-item">
                                <div>
                                    <img src="/Assets/courriel.PNG" alt="Email" />
                                </div>
                                <div className="text-content">
                                    <h3>{t("emailTitle")}</h3>
                                    <p>mohame@gmail.com</p>
                                </div>
                            </div>

                            <div className="contact-item">
                                <div>
                                    <img src="/Assets/location.PNG" alt="Location" />
                                </div>
                                <div className="text-content">
                                    <h3>{t("locationTitle")}</h3>
                                    <p>{t("locationDescription")}</p>
                                </div>
                            </div>
                        </div>

                        <div className="left-container">
                            <h3>{t("sendMessage")}</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <input 
                                            type="email" 
                                            name="email"
                                            placeholder={t("emailPlaceholder")} 
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <input 
                                            type="tel" 
                                            name="phone"
                                            placeholder={t("phonePlaceholder")} 
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <input 
                                        type="text" 
                                        name="subject"
                                        placeholder={t("subjectPlaceholder")} 
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <input 
                                        type="text" 
                                        name="company_name"
                                        placeholder={t("companyNamePlaceholder")} 
                                        value={formData.company_name}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                        >
                                            {statusOptions.map(option => (
                                                <option key={option} value={option}>
                                                    {t(`${option}`)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                        >
                                            {categoryOptions.map(option => (
                                                <option key={option} value={option}>
                                                    {t(`solution.${option}`)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <textarea 
                                        name="message"
                                        placeholder={t("messagePlaceholder")}
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                    ></textarea>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <input 
                                            type="text" 
                                            name="name"
                                            placeholder={t("namePlaceholder")} 
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <input 
                                            type="text" 
                                            name="address"
                                            placeholder={t("addressPlaceholder")} 
                                            value={formData.address}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="submit-btn">{t("submitButton")}</button>
                            </form>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ContactUs;