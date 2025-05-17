import React, { useState, useEffect, useContext } from 'react';
import RightSidebarDashboard from './rightSidebarDashboard';
import './Dashboard.css';
import TopBanner from './TopBanner';
import { AuthContext } from "../../src/context/AuthContext";
import { fetchUsers, fetchCompanyName, createUser, sendEmail } from "../../src/services/userService";
//  import { useRouter } from 'next/router'; // Utilisez useRouter de Next.js
import { usePathname, useRouter  } from 'next/navigation'; // Remplace useLocation
import '../multilingue/i18n.js';
import { useTranslation } from 'react-i18next';

const UserManagement = () => {
    const { t, i18n } = useTranslation(); 
    const isRTL = i18n.language === 'ar'; // RTL pour l'arabe, sinon LTR
    const textDirection = isRTL ? 'rtl' : 'ltr';

    const { user } = useContext(AuthContext);
    const router = useRouter(); // Utilisez useRouter pour la navigation

    const [showForm, setShowForm] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
    });

    const [users, setUsers] = useState([]);
    const [companyName, setCompanyName] = useState('');

    useEffect(() => {
        const loadUsers = async () => {
            const usersData = await fetchUsers();
            setUsers(usersData);
        };
        loadUsers();
    }, []);

    useEffect(() => {
        if (user?.entreprise_id) {
            const loadCompanyName = async () => {
                const companyData = await fetchCompanyName(user.entreprise_id);
                if (companyData) {
                    setCompanyName(companyData.entrepriseName);
                }
            };
            loadCompanyName();
        }
    }, [user]);

    const handleInputChange = (e) => {
        setNewUser({ ...newUser, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const currentTime = new Date().toISOString();

        const newUserPayload = {
            ...newUser,
            company: companyName,
            created_at: currentTime,
            updated_at: null,
            entreprise_id: user.entreprise_id
        };

        const userData = await createUser(newUserPayload);
        if (!userData) return;

        const emailPayload = {
            toEmail: newUser.email,
            userEmail: newUser.email,
            userPassword: newUser.password,
        };

        await sendEmail(emailPayload);

        setUsers([...users, userData]);
        setShowForm(false);
        setNewUser({ name: '', email: '', password: '', role: 'user' });
    };

    if (!user) return <p>{t("chargement")}</p>;

    return (
        <div className="dashboard-container">
            <RightSidebarDashboard />
            <main className="main-content">
                <TopBanner />
                <section className="user-management">
                    <div className="user-management-header">
                        <h2>{t("userManagement")}</h2>
                        <div className="user-actions">
                        <button 
                            className={`add-user-button ${showForm ? 'cancel' : ''}`} 
                            onClick={() => setShowForm(!showForm)}
                        >
                            {showForm ? t('cancel') : t('addUser')}
                        </button>
                        </div>
                    </div>

                    {showForm && (
                        <form className="add-user-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">{t("name")}</label>
                                <input type="text" id="name" name="name" placeholder="Name" value={newUser.name} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">{t("email")}</label>
                                <input type="email" id="email" name="email" placeholder="Email Address" value={newUser.email} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">{t("password")}</label>
                                <input type="password" id="password" name="password" placeholder="Password" value={newUser.password} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="role">{t("role")}</label>
                                <select id="role" name="role" value={newUser.role} onChange={handleInputChange}>
                                    <option value="user">{t("user")}</option>
                                    <option value="seller">{t("seller")}</option>
                                    <option value="cashier">{t("cashier")}</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="company">{t("company")}</label>
                                <input type="text" id="company" name="company" value={companyName} disabled />
                            </div>

                            <button type="submit">{t("create_user")}</button>
                        </form>
                    )}

                    <div className="user-list">
                        <table>
                            <thead>
                                <tr>
                                    <th>{t("Tname")}</th>
                                    <th>{t("Temail")}</th>
                                    <th>{t("Trole")}</th>
                                    <th>{t("Tactions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? users.map((user) => (
                                    <tr key={user.idUtilisateur}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.role}</td>
                                        <td><button className="edit-button">{t("details")}</button></td>
                                    </tr>
                                )) : <tr><td colSpan="4">{t("noUsers")}</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default UserManagement;