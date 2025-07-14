import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { usePathname, useRouter  } from 'next/navigation'; // Remplace useLocation

function Home() {
    const navigate = useNavigate();

    const [auth, setAuth] = useState(false);
    const [message, setMessage] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    axios.defaults.withCredentials = true;

    useEffect(() => {
        axios.get(`${API_BASE_URL}/auth`)
            .then(res => {
                console.log("Response from API:", res.data); // <-- Vérifie ce qui est retourné
                if (res.data.Status === "Success") {
                    setAuth(true);
                    setName(res.data.name);
                    setRole(res.data.role);
                    console.log("home",res.data.role);
                } else {
                    setAuth(false);
                    setMessage(res.data.Error || 'You are not authenticated');
                }
            })
            .catch(err => {
                console.log("Error fetching auth:", err);
                setAuth(false);
                setMessage('You are not authenticated');
            });
    }, []);

    const handleDelete = () => {
        axios.get(`${API_BASE_URL}/auth/logout`)
            .then(res => {
                setAuth(false); // Réinitialise l'état auth
                setMessage('You are not authenticated'); // Affiche le message d'erreur
                navigate('/login'); // Recharge la page pour s'assurer que tout soit réinitialisé
            })
            .catch(err => console.log(err));
    };

    return (
        <div className='container mt-4'>
            {
                auth ?
                    <div>
                        <h3>You are Authorized --- {name}</h3>
                        <h3>You role {role}</h3>
                        <button className='btn btn-danger' onClick={handleDelete}>Logout</button>
                    </div>
                    :
                    <div>
                        <h3>{message}</h3>
                        <h3>Login Now</h3>
                        <Link to="/login" className='btn btn-primary'>Login</Link>
                    </div>
            }
        </div>
    );
}

export default Home;
