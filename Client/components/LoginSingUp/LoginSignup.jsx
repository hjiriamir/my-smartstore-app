import React, { useState, useContext } from 'react';
import axios from 'axios';
import './LoginSignup.css';
import Popup from './Popup'; // Importez le composant Popup
const email_icon = '/Assets/email.png';
const user_icon = '/Assets/person.png';
const password_icon = '/Assets/password.png';
import { AuthContext } from '../../src/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useTranslation } from "react-i18next"
import "../multilingue/i18n.js"

function LoginSignup() {
    const [action, setAction] = useState("Login");
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [values, setValues] = useState({
        name: '',
        email: '',
        password: '',
        role: ''
    });
    const [popupMessage, setPopupMessage] = useState('');
    const [showPopup, setShowPopup] = useState(false);

    const { setUser } = useContext(AuthContext);
    const router = useRouter();
    axios.defaults.withCredentials = true;

    const handleSubmit = async (event) => {
        event.preventDefault();
        const url = action === "Login" ? 'http://localhost:8081/api/auth/login' : 'http://localhost:8081/api/auth/register';

        try {
            const res = await axios.post(url, values);
            console.log("Server Response:", res.data);

            if (res.data.status === "Success") {
                if (action === "Login") {
                    setUser({
                        email: values.email,
                        name: res.data.name,
                        role: res.data.role,
                        entreprise_id: res.data.entreprise_id
                    });
                    localStorage.setItem("token", res.data.token);
                    if (res.data.role === "admin") {
                        router.push('/Dashboard');
                    } else {
                        router.push('/');
                    }
                } else {
                    router.push('/Login');
                }
            } else {
                setPopupMessage(res.data.Error || "فشل المصادقة");
                setShowPopup(true);
            }
        } catch (err) {
            console.error("Request Error:", err);
            setPopupMessage("خطأ في الاتصال");
            setShowPopup(true);
        }
    };

    const handleForgotPassword = async (event) => {
        event.preventDefault();
        try {
            const res = await axios.post('http://localhost:8081/api/auth/forgotPassword', {
                email: values.email,
            });
            setPopupMessage(res.data.message || "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني");
            setShowPopup(true);
        } catch (err) {
            console.error("Request Error:", err);
            setPopupMessage("خطأ في الاتصال");
            setShowPopup(true);
        }
    };
    const { t, i18n } = useTranslation();
      // Determine text direction based on language
    const isRTL = i18n.language === "ar"
    const textDirection = isRTL ? "rtl" : "ltr"
    const textAlign = isRTL ? "right" : "left"
    return (
        <div dir={textDirection}>
        <div className="hero">
            <div className="container">
                <div className="header">
                    <div className="text">
                        {showForgotPassword
                            ? t('forgotPassword')
                            : action === "Login"
                                ? t('login')
                                : t('signup')}
                    </div>
                    <div className="underline"></div>
                </div>

                {showForgotPassword ? (
                    <form onSubmit={handleForgotPassword} className="inputs">
                        <div className="input">
                            <img src={email_icon} alt="Email Icon" />
                            <input
                                type="email"
                                placeholder={t('enterEmail')}
                                required
                                onChange={(e) => setValues({ ...values, email: e.target.value })}
                            />
                        </div>

                        <button type="submit" className="submit">
                            {t('sendResetLink')}
                            <div className="submit-overlay"></div>
                        </button>

                        <div className="switch-action">
                            <span onClick={() => setShowForgotPassword(false)}>{t('backToLogin')}</span>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit} className="inputs">
                        {action !== "Login" && (
                            <div className="input">
                                <img src={user_icon} alt="User Icon" />
                                <input
                                    type="text"
                                    placeholder={t('enterName')}
                                    required
                                    onChange={(e) => setValues({ ...values, name: e.target.value })}
                                />
                            </div>
                        )}

                        <div className="input">
                            <img src={email_icon} alt="Email Icon" />
                            <input
                                type="email"
                                placeholder={t('enterEmail')}
                                required
                                onChange={(e) => setValues({ ...values, email: e.target.value })}
                            />
                        </div>

                        <div className="input">
                            <img src={password_icon} alt="Password Icon" />
                            <input
                                type="password"
                                placeholder={t('enterPassword')}
                                required
                                onChange={(e) => setValues({ ...values, password: e.target.value })}
                            />
                        </div>

                        {action === "Login" && (
                            <div className="forgot-password">
                                {t('forgotPassword')}{" "}
                                <span onClick={() => setShowForgotPassword(true)}>{t('forgotPassword')}</span>
                            </div>
                        )}

                        <button type="submit" className="submit">
                            {action === "Login" ? t('login') : t('signup')}
                            <div className="submit-overlay"></div>
                        </button>
                    </form>
                )}

                <div className="submit-container">
                    {action === "Login" ? (
                        <div className="switch-action">
                            {t('notHaveAccount')}{" "}
                            <span onClick={() => setAction("Sign Up")}>{t('signup')}</span>
                        </div>
                    ) : (
                        <div className="switch-action">
                            {t('haveAccount')}{" "}
                            <span onClick={() => setAction("Login")}>{t('login')}</span>
                        </div>
                    )}
                </div>
            </div>

            {showPopup && (
                <Popup
                    message={popupMessage}
                    onClose={() => setShowPopup(false)}
                />
            )}
        </div>
        </div>
    );
}

export default LoginSignup;