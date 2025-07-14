import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Search, ChevronDown, User, Trash2, Edit } from 'lucide-react';
import './CreateOrder.css';
import { useToast } from '@/components/ui/use-toast';
import {countries} from './data/countries'; 
import { FiChevronDown, FiSearch } from 'react-icons/fi';
import 'country-flag-icons/3x2/flags.css';
import '../multilingue/i18n.js';
import { useTranslation } from 'react-i18next';

const CreateSupplier = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentEntrepriseID, setcurrentEntrepriseID] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

   // Pour la sélection de pays améliorée
   const [isCountryOpen, setIsCountryOpen] = useState(false);
   const [countrySearch, setCountrySearch] = useState('');
   const countryDropdownRef = useRef(null);

   const { t, i18n } = useTranslation(); 
   const isRTL = i18n.language === 'ar'; // RTL pour l'arabe, sinon LTR
   const textDirection = isRTL ? 'rtl' : 'ltr';

   // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setIsCountryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filtrer les pays basé sur la recherche
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Grouper les pays par première lettre
  const countriesByLetter = filteredCountries.reduce((acc, country) => {
    const firstLetter = country.name[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(country);
    return acc;
  }, {});

  
  // Form state
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    code_postal: '',
    pays: 'France',
    contact_principal: '',
    siret: '',
    statut: 'Actif',
    notes: ''
  });

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
          
        }
        const responseData = await response.json();
        const userData = responseData.user || responseData;
        const entrepriseId = userData.entreprises_id;
        console.log('ID de l’entreprise connectée :', entrepriseId);
        setCurrentUser(userData);
        setcurrentEntrepriseID(entrepriseId);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les informations de l'utilisateur",
          variant: "destructive",
        });
      }
    };

    fetchCurrentUser();
  }, [toast]);

  // Charger les fournisseurs quand l'utilisateur est disponible
  useEffect(() => {
    if (currentEntrepriseID) {
      fetchSuppliers();
    }
  }, [currentEntrepriseID]);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/fournisseur/getAllFournisseursByEntreprise/${currentEntrepriseID}`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des fournisseurs:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les fournisseurs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.telephone.includes(searchQuery) ||
    supplier.contact_principal.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const url = editingId 
        ? `${API_BASE_URL}/fournisseur/updateFournisseur/${editingId}`
        : `${API_BASE_URL}/fournisseur/createFournisseur/${currentEntrepriseID}`;
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      toast({
        title: "Succès",
        description: editingId 
          ? "Fournisseur mis à jour avec succès" 
          : "Fournisseur créé avec succès",
      });
      
      // Réinitialiser le formulaire et recharger les données
      setFormData({
        nom: '',
        email: '',
        telephone: '',
        adresse: '',
        ville: '',
        code_postal: '',
        pays: 'France',
        contact_principal: '',
        siret: '',
        statut: 'Actif',
        notes: ''
      });
      setEditingId(null);
      setIsCreating(false);
      await fetchSuppliers();
    } catch (error) {
      console.error("Erreur lors de l'envoi des données:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'opération",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSupplier = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur?')) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/fournisseur/deleteFournisseur/${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      toast({
        title: "Succès",
        description: "Fournisseur supprimé avec succès",
      });
      
      await fetchSuppliers();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le fournisseur",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (supplier) => {
    setFormData({
      nom: supplier.nom,
      email: supplier.email,
      telephone: supplier.telephone,
      adresse: supplier.adresse,
      ville: supplier.ville,
      code_postal: supplier.code_postal,
      pays: supplier.pays,
      contact_principal: supplier.contact_principal,
      siret: supplier.siret,
      statut: supplier.statut,
      notes: supplier.notes
    });
    setEditingId(supplier.fournisseur_id );
    setIsCreating(true);
  };
  const getFlagEmoji = (countryCode) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  };

  return (
    <div className="dashboard-container" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      <main className="main-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header className="page-header">
          <h1>{t("actionsRapide.createSupplier.gestionFournisseur")}</h1>
          <div className="header-actions">
            <button 
              className="button secondary"
              onClick={() => router.push('/Dashboard')}
              disabled={isLoading}
            >
              <X size={18} /> {t("actionsRapide.createSupplier.annuler")}
            </button>
            <button 
              className="button primary"
              onClick={() => {
                setEditingId(null);
                setIsCreating(true);
              }}
              disabled={isLoading}
            >
              <Plus size={18} /> {t("actionsRapide.createSupplier.nouvFournisseur")}
            </button>
          </div>
        </header>

        {/* Formulaire de création (modal-like) */}
        {isCreating && (
          <div className="creation-modal">
            <div className="modal-content">
              <div className="modal-header">
              <h2>
                {editingId
                  ? t("actionsRapide.createSupplier.modifFournisseur")
                  : t("actionsRapide.createSupplier.nouvFournisseur")}
              </h2>

                <button 
                  className="close-button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingId(null);
                  }}
                  disabled={isLoading}
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="supplier-form">
                <div className="form-row">
                  <div className="form-group">
                    <label> {t("actionsRapide.createSupplier.nom")}</label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label> {t("actionsRapide.createSupplier.email")}</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label> {t("actionsRapide.createSupplier.telephone")}</label>
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label> {t("actionsRapide.createSupplier.contactPrincipal")}</label>
                    <input
                      type="text"
                      name="contact_principal"
                      value={formData.contact_principal}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label> {t("actionsRapide.createSupplier.adresse")}</label>
                  <input
                    type="text"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label> {t("actionsRapide.createSupplier.ville")}</label>
                    <input
                      type="text"
                      name="ville"
                      value={formData.ville}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label> {t("actionsRapide.createSupplier.codePostal")}</label>
                    <input
                      type="text"
                      name="code_postal"
                      value={formData.code_postal}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                <div className="form-group">
    <label> {t("actionsRapide.createSupplier.pays")}</label>
    <div className="country-select-wrapper" ref={countryDropdownRef}>
      <div 
        className="country-select-trigger"
        onClick={() => setIsCountryOpen(!isCountryOpen)}
      >
        <span className={`fi fi-${formData.pays ? countries.find(c => c.name === formData.pays)?.code.toLowerCase() : 'fr'}`}></span>
        <span>{formData.pays || 'Sélectionner un pays'}</span>
        <FiChevronDown className={`chevron ${isCountryOpen ? 'open' : ''}`} />
      </div>
      
      {isCountryOpen && (
        <div className="country-dropdown">
          <div className="country-search">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder= {t("actionsRapide.createSupplier.recherchePays")}
              value={countrySearch}
              onChange={(e) => setCountrySearch(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="country-list">
            {Object.entries(countriesByLetter).map(([letter, letterCountries]) => (
              <div key={letter} className="country-letter-group">
                <div className="country-letter">{letter}</div>
                {letterCountries.map(country => (
                  <div
                    key={country.code}
                    className={`country-item ${formData.pays === country.name ? 'selected' : ''}`}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, pays: country.name }));
                      setIsCountryOpen(false);
                      setCountrySearch('');
                    }}
                  >
                    <span className="country-flag-emoji">{getFlagEmoji(country.code)}</span>
                    <span>{country.name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>

                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>{t("actionsRapide.createSupplier.siret")}</label>
                    <input
                      type="text"
                      name="siret"
                      value={formData.siret}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="form-group enhanced-select">
  <label>{t("actionsRapide.createSupplier.statut")}</label>
  <div className="select-wrapper">
    <select
      name="statut"
      value={formData.statut}
      onChange={handleInputChange}
      disabled={isLoading}
      className="status-select"
    >
      <option value="Actif">{t("actionsRapide.createSupplier.actif")}</option>
      <option value="Inactif">{t("actionsRapide.createSupplier.inactif")}</option>
      <option value="En attente">{t("actionsRapide.createSupplier.enAttente")}</option>
    </select>
    <ChevronDown className="select-chevron" size={16} />
  </div>
</div>
                </div>
                
                <div className="form-group">
                  <label>{t("actionsRapide.createSupplier.notes")}</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="button secondary"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingId(null);
                    }}
                    disabled={isLoading}
                  >
                    {t("actionsRapide.createSupplier.annuler")}
                  </button>
                  <button 
                    type="submit" 
                    className="button primary"
                    disabled={isLoading}
                  >
                    {isLoading
                    ? t("actionsRapide.createSupplier.enCours")
                    : editingId
                      ? t("actionsRapide.createSupplier.metteAJour")
                      : t("actionsRapide.createSupplier.enregistrer")
                      }

                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Liste des fournisseurs */}
        <div className="suppliers-container">
          <div className="search-bar">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder={t("actionsRapide.createSupplier.rechercheFournisseur")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {isLoading && !isCreating ? (
            <div className="loading-state">
              <p>{t("actionsRapide.createSupplier.chargement")}</p>
            </div>
          ) : (
            <div className="suppliers-list">
              {filteredSuppliers.length === 0 ? (
                <div className="empty-state">
                  <p>{t("actionsRapide.createSupplier.aucunFournisseur")}</p>
                  <button 
                    className="button primary"
                    onClick={() => {
                      setEditingId(null);
                      setIsCreating(true);
                    }}
                    disabled={isLoading}
                  >
                    <Plus size={16} /> {t("actionsRapide.createSupplier.ajouterFournisseur")}
                  </button>
                </div>
              ) : (
                <table className="suppliers-table">
                  <thead>
                    <tr>
                      <th>{t("actionsRapide.createSupplier.nom")}</th>
                      <th>{t("actionsRapide.createSupplier.email")}</th>
                      <th>{t("actionsRapide.createSupplier.telephone")}</th>
                      <th>{t("actionsRapide.createSupplier.contact")}</th>
                      <th>{t("actionsRapide.createSupplier.pays")}</th>
                      <th>{t("actionsRapide.createSupplier.statut")}</th>
                      <th>{t("actionsRapide.createSupplier.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSuppliers.map(supplier => (
                      <tr key={supplier.fournisseur_id }>
                        <td>
                          <div className="supplier-info">
                            <User size={16} />
                            <span>{supplier.nom}</span>
                          </div>
                        </td>
                        <td>{supplier.email}</td>
                        <td>{supplier.telephone}</td>
                        <td>{supplier.contact_principal}</td>
                        <td>{supplier.ville}</td>
                        <td>
                          <span className={`status-badge ${supplier.statut === 'Actif' ? 'active' : 'inactive'}`}>
                            {supplier.statut}
                          </span>
                        </td>
                        <td>
                          <div className="actions">
                            <button 
                              className="icon-button edit"
                              onClick={() => startEditing(supplier)}
                              disabled={isLoading}
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="icon-button delete"
                              onClick={() => deleteSupplier(supplier.fournisseur_id)}
                              disabled={isLoading}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CreateSupplier;