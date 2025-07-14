import React, { useState, useEffect, useContext } from 'react';
import RightSidebarDashboard from './rightSidebarDashboard';
import './Dashboard.css';
import TopBanner from './TopBanner';
import { AuthContext } from "../../src/context/AuthContext";
import { fetchUsers, fetchCompanyName, createUser, sendEmail } from "../../src/services/userService";
import { usePathname, useRouter  } from 'next/navigation';
import '../multilingue/i18n.js';
import { useTranslation } from 'react-i18next';

const UserManagement = () => {
    const { t, i18n } = useTranslation(); 
    const isRTL = i18n.language === 'ar';
    const textDirection = isRTL ? 'rtl' : 'ltr';

    const { user } = useContext(AuthContext);
    const router = useRouter();

    
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const [showForm, setShowForm] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
        magasin_id: '' // Ajout du champ magasin_id
    });

    const [users, setUsers] = useState([]);
    const [companyName, setCompanyName] = useState('');
    const [magasins, setMagasins] = useState([]); // État pour stocker la liste des magasins
    const [loadingMagasins, setLoadingMagasins] = useState(false); // État pour le chargement

    useEffect(() => {
        if (!user || !user.entreprises_id) return;  
    
        const loadUsers = async () => {
            const usersData = await fetchUsers(user.entreprises_id);
            setUsers(usersData);
        };
        loadUsers();
    }, [user]);

    useEffect(() => {
        if (user?.entreprises_id) {
            const loadCompanyName = async () => {
                const companyData = await fetchCompanyName(user.entreprises_id);
                if (companyData) {
                    setCompanyName(companyData.nomEntreprise);
                }
            };
            loadCompanyName();
        }
    }, [user]);

    // Fonction pour charger les magasins depuis l'API
    const loadMagasins = async (entrepriseId) => {
        setLoadingMagasins(true);
        try {
            const response = await fetch(`${API_BASE_URL}/magasins/getMagasinsByEntrepriseId/${entrepriseId}`);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des magasins');
            }
            const data = await response.json();
            setMagasins(data);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoadingMagasins(false);
        }
    };

    // Charger les magasins quand le formulaire est affiché
    useEffect(() => {
        if (showForm && user?.entreprises_id) {
            loadMagasins(user.entreprises_id);
        }
    }, [showForm, user]);

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
            entreprises_id: user.entreprises_id,
            magasin_id: newUser.magasin_id // Ajout du magasin_id
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
        setNewUser({ name: '', email: '', password: '', role: 'user', magasin_id: '' });
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
                            <div className="form-group">
                                <label htmlFor="magasin_id">{t("magasin")}</label>
                                <select 
                                    id="magasin_id" 
                                    name="magasin_id" 
                                    value={newUser.magasin_id} 
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">{loadingMagasins ? t("loading") : t("categoryImport.formulaire.selectMagasin")}</option>
                                    {magasins.map(magasin => (
                                        <option key={magasin.magasin_id} value={magasin.magasin_id}>
                                            {magasin.nom_magasin}
                                        </option>
                                    ))}
                                </select>
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
                                    <th>{t("Tmagasin")}</th>
                                    <th>{t("Tactions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                            {users.length > 0 ? (
    users.map((user, index) => (
        <tr key={user.idUtilisateur || `user-${index}`}>
          <td>{user.name}</td>
          <td>{user.email}</td>
          <td>{user.role}</td>
          <td>{user.magasin_id}</td>
          <td><button className="edit-button">{t("details")}</button></td>
        </tr>
      ))
      
) : (
    <tr key="no-users">
        <td colSpan="4">{t("noUsers")}</td>
    </tr>
)}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default UserManagement;