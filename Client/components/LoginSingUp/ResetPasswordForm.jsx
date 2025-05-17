import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import './ResetPasswordForm.css'; // Créez un fichier CSS pour styliser le formulaire

const ResetPasswordForm = ({ token }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage("كلمة المرور غير متطابقة");
            return;
        }

        try {
            const res = await axios.post(`http://localhost:8081/api/auth/reset-password/${token}`, {
                password: newPassword,
            });

            setMessage(res.data.message || "تم إعادة تعيين كلمة المرور بنجاح");
            setTimeout(() => {
                router.push('/LoginSignup'); // Rediriger vers la page de connexion
            }, 3000);
        } catch (err) {
            console.error("Request Error:", err);
            setMessage("خطأ في إعادة تعيين كلمة المرور");
        }
    };

    return (
        <div className="reset-password-form">
            <h1>إعادة تعيين كلمة المرور</h1>
            <form onSubmit={handleSubmit}>
                <div className="input">
                    <label>كلمة المرور الجديدة</label>
                    <input
                        type="password"
                        placeholder="كلمة المرور الجديدة"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="input">
                    <label>تأكيد كلمة المرور الخاصة بك</label>
                    <input
                        type="password"
                        placeholder="تأكيد كلمة المرور الخاصة بك"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                {message && <p className="message">{message}</p>}

                <button type="submit" className="submit">
                    إعادة تعيين كلمة المرور
                </button>
            </form>
        </div>
    );
};

export default ResetPasswordForm;