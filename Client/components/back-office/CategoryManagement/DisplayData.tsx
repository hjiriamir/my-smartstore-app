import React, { useState, useEffect } from 'react';
import { Table, Button, Space, notification, Modal, Input, Switch, Form, InputNumber, Select } from 'antd';

import axios from 'axios';
import './DisplayData.css';
import { motion } from 'framer-motion';
import '../../multilingue/i18n.js';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { 
  EyeOutlined, EyeInvisibleOutlined, DeleteOutlined, 
  EditOutlined, CheckOutlined, CloseOutlined, 
  PlusOutlined, SaveOutlined, ArrowLeftOutlined 
} from '@ant-design/icons';


interface Magasin {
  id: number;
  magasin_id: string;
  nom_magasin: string;
  surface: number;
  longueur?: number;
  largeur?: number;
  adresse: string;
  date_modification: string;
}

interface Categorie {
  id: number;
  categorie_id: string;
  nom: string;
  parent_id?: string;
  niveau: string;
  saisonnalite: string;
  priorite: string;
  zone_exposition_preferee?: string;
  temperature_exposition?: string;
  conditionnement?: string;
  clientele_ciblee?: string;
  magasin_id ?: string;
  date_modification: string;
}

interface Zone {
  id: number;
  zone_id: string;
  nom_zone: string;
  description: string;
  magasin_id: string;
  emplacement?: string;
  date_modification: string;
}
interface User {
  idUtilisateur: number;
  entreprises_id: number;
  name: string;
  role: string;
  email: string;
 
}

const DisplayData: React.FC = () => {
  // États pour les données
  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const { t, i18n } = useTranslation(); 
  const isRTL = i18n.language === 'ar'; // RTL pour l'arabe, sinon LTR
  const textDirection = isRTL ? 'rtl' : 'ltr';
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);

// Ajoutez ces styles constants en haut du composant
const tableStyle: React.CSSProperties = {
  width: '100%',
  overflowX: 'auto',
  border: '1px solid #f0f0f0',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  marginBottom: '24px',
};

const tableContainerStyle: React.CSSProperties = {
  maxHeight: '500px',
  overflowY: 'auto',
};


  // États pour la visibilité des sections
  const [showMagasins, setShowMagasins] = useState(true);
  const [showCategories, setShowCategories] = useState(true);
  const [showZones, setShowZones] = useState(true);
  
  // États pour l'édition
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<string>('');
  const [editingValue, setEditingValue] = useState<any>('');
  const [editingType, setEditingType] = useState<'magasin' | 'categorie' | 'zone'>('magasin');
  const [editMode, setEditMode] = useState<boolean>(false);
  const [isEditingModalVisible, setIsEditingModalVisible] = useState(false);
  const [isAddingModalVisible, setIsAddingModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Chargement des données
  useEffect(() => {
    console.log("Début du chargement des données..."); // Debug
    
    const fetchCurrentUser = async () => {
      try {
        console.log("Tentative de récupération de l'utilisateur...");
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
          withCredentials: true
        });
        const userData = response.data.user || response.data;
        console.log("Utilisateur récupéré:", userData);
        setCurrentUser(userData);
        return userData.entreprises_id; 
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
        notification.error({
          message: 'Erreur',
          description: "Impossible de récupérer les informations de l'utilisateur"
        });
        return null;
      }
    };
  
    const fetchData = async (entrepriseId: number) => {
      if (!entrepriseId) {
        console.log("Aucun ID d'entreprise, arrêt du chargement des données"); // Debug
        return;
      }
      
      try {
        console.log(`Récupération des magasins pour l'entreprise ${entrepriseId}...`); // Debug
        const magasinsRes = await axios.get(`${API_BASE_URL}/magasins/getMagasinsByEntrepriseId/${entrepriseId}`);
        console.log("Magasins récupérés:", magasinsRes.data); // Debug
        setMagasins(magasinsRes.data);
  
        // Pour les catégories et zones, on les charge pour chaque magasin
        console.log("Récupération des catégories et zones pour chaque magasin..."); // Debug
        const categoriesPromises = magasinsRes.data.map((magasin: Magasin) => {
          console.log(`Récupération des catégories pour le magasin ${magasin.magasin_id}`); // Debug
          return axios.get(`${API_BASE_URL}/categories/getCategoriesByMagasin/${magasin.magasin_id}`);
        });
        
        const zonesPromises = magasinsRes.data.map((magasin: Magasin) => {
          console.log(`Récupération des zones pour le magasin ${magasin.magasin_id}`); // Debug
          return axios.get(`${API_BASE_URL}/zones/getZonesMagasin/${magasin.magasin_id}`);
        });
  
        const [categoriesResults, zonesResults] = await Promise.all([
          Promise.all(categoriesPromises),
          Promise.all(zonesPromises)
        ]);
  
        // Fusionner toutes les catégories et zones
        const allCategories = categoriesResults.flatMap(res => {
          console.log("Catégories récupérées:", res.data); // Debug
          return res.data;
        });
        const allZones = zonesResults.flatMap(res => {
          console.log("Zones récupérées:", res.data); // Debug
          return res.data;
        });
  
        setCategories(allCategories);
        setZones(allZones);
        
        console.log("Données finales:", { // Debug
          magasins: magasinsRes.data,
          categories: allCategories,
          zones: allZones
        });
      } catch (error) {
        console.error('Error fetching data:', error); // Debug
        notification.error({
          message: 'Erreur',
          description: 'Impossible de charger les données'
        });
      }
    };
  
    // Exécution
    fetchCurrentUser()
      .then(entrepriseId => {
        console.log("ID entreprise récupéré:", entrepriseId); // Debug
        if (entrepriseId) {
          fetchData(entrepriseId);
        } else {
          console.log("Aucun ID entreprise trouvé"); // Debug
        }
      });
  }, []);

  // Fonction pour ouvrir le modal d'ajout
  const openAddModal = (type: 'magasin' | 'categorie' | 'zone') => {
    setEditingType(type);
    addForm.resetFields();
    setIsAddingModalVisible(true);
  };

  // Fonction pour ouvrir le modal d'édition
  const openEditModal = (
    type: 'magasin' | 'categorie' | 'zone',
    record: any
  ) => {
    console.log('Opening edit modal for:', type, record);
    setEditingType(type);
    setCurrentRecord(record);
    form.setFieldsValue(record);
    setIsEditingModalVisible(true);
  };

  // Sauvegarde d'un nouvel élément via le modal
  const saveNewItem = async () => {
    // Vérification que le formulaire est bien initialisé
    if (!addForm || !currentUser) {
      console.error('Form instance or user not available');
      return;
    }
  
    try {
      const values = await addForm.validateFields();
      values.date_modification = new Date().toISOString();
      
      // Ajout de l'entreprise_id pour les magasins
      if (editingType === 'magasin') {
        values.entreprise_id = currentUser.entreprise_id;
      }
  
      let endpoint = '';
      let successMessage = '';
      let errorMessage = '';
  
      switch (editingType) {
        case 'magasin':
          endpoint = `${API_BASE_URL}/magasins/createMagasin`;
          successMessage = 'Nouveau magasin ajouté avec succès';
          errorMessage = "Échec de l'ajout du magasin";
          break;
        case 'categorie':
          endpoint = `${API_BASE_URL}/categories/createCategorie`;
          successMessage = 'Nouvelle catégorie ajoutée avec succès';
          errorMessage = "Échec de l'ajout de la catégorie";
          break;
        case 'zone':
          endpoint = `${API_BASE_URL}/zones/createZone`;
          successMessage = 'Nouvelle zone ajoutée avec succès';
          errorMessage = "Échec de l'ajout de la zone";
          break;
        default:
          throw new Error('Type inconnu');
      }
  
      // Envoi de la requête avec timeout
      const response = await axios.post(endpoint, values, {
        timeout: 10000 // 10 secondes timeout
      });
  
      // Vérification de la réponse
      if (response.data && response.status === 201) {
        notification.success({
          message: 'Succès',
          description: successMessage,
          duration: 2.5
        });
  
        // Réinitialisation du formulaire et fermeture du modal
        addForm.resetFields();
        setIsAddingModalVisible(false);
        
        // Rechargement des données
        await fetchData();
        
        // Retourner le résultat pour un éventuel traitement supplémentaire
        return response.data;
      } else {
        throw new Error('Réponse inattendue du serveur');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      
      let description = "Une erreur est survenue lors de l'ajout";
      
      // Gestion des erreurs spécifiques
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Erreur serveur (4xx, 5xx)
          description = error.response.data.message || `Erreur ${error.response.status}: ${error.response.statusText}`;
        } else if (error.request) {
          // Pas de réponse du serveur
          description = "Pas de réponse du serveur - vérifiez votre connexion";
        }
      } else if (error instanceof Error) {
        description = error.message;
      }
  
      notification.error({
        message: 'Erreur',
        description,
        duration: 4
      });
      
      // Relancer l'erreur pour un éventuel traitement supplémentaire
      throw error;
    } finally {
      // Nettoyage éventuel
    }
  };

  // Sauvegarde via le modal d'édition
  const saveModalEditing = async () => {
    try {
      const values = await form.validateFields();
      values.date_modification = new Date().toISOString();
  
      let endpoint = '';
      let updateFunction = null;
      let dataKey = 'id';

      switch (editingType) {
        case 'magasin':
          endpoint = `${API_BASE_URL}/magasins/updateMagasin/${currentRecord.id}`;
          updateFunction = setMagasins;
          dataKey = 'id';
          break;
        case 'categorie':
          endpoint = `${API_BASE_URL}/categories/updateCategorie/${currentRecord.id}`;
          updateFunction = setCategories;
          dataKey = 'id';
          break;
        case 'zone':
          endpoint = `${API_BASE_URL}/zones/updateZone/${currentRecord.id}`;
          updateFunction = setZones;
          dataKey = 'id';
          break;
      }
  
      const response = await axios.put(endpoint, values);
  
      if (response.data) {
        updateFunction(prev => 
          prev.map(item => 
            item[dataKey] === currentRecord[dataKey] 
              ? { ...item, ...values, date_modification: values.date_modification }
              : item
          )
        );
  
        notification.success({
          message: 'Succès',
          description: 'Modification enregistrée avec succès'
        });
      }
    } catch (error) {
      notification.error({
        message: 'Erreur',
        description: 'Échec de la modification'
      });
      console.error('Error updating data:', error);
    } finally {
      setIsEditingModalVisible(false);
      fetchData();
    }
  };

  // Édition en ligne (double-clic)
  const renderEditableCell = (
    type: 'magasin' | 'categorie' | 'zone',
    record: any,
    field: string,
    fieldType: 'text' | 'number' | 'select' = 'text',
    options?: { value: string; label: string }[]
  ) => {
    if (editMode && editingId === record.id && editingField === field && editingType === type) {
      return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {fieldType === 'number' ? (
            <InputNumber
              value={editingValue}
              onChange={(value) => setEditingValue(value)}
              style={{ width: '100%' }}
              autoFocus
            />
          ) : fieldType === 'select' ? (
            <Select
              value={editingValue}
              onChange={(value) => setEditingValue(value)}
              style={{ width: '100%' }}
              options={options}
              autoFocus
            />
          ) : (
            <Input
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              style={{ flex: 1 }}
              autoFocus
            />
          )}
          <Button 
            type="primary" 
            icon={<CheckOutlined />} 
            size="small" 
            onClick={saveEditing}
          />
          <Button 
            icon={<CloseOutlined />} 
            size="small" 
            onClick={cancelEditing}
          />
        </div>
      );
    }
    return (
      <div 
        onDoubleClick={() => editMode && handleCellClick(type, record, field)}
        style={{ minHeight: '32px', display: 'flex', alignItems: 'center' }}
        className="editable-cell"
      >
        {field === 'magasin_id' && type === 'zone' ? 
          magasins.find(m => m.magasin_id === record[field])?.nom_magasin || record[field] : 
          record[field]}
      </div>
    );
  };

  const handleCellClick = (
    type: 'magasin' | 'categorie' | 'zone',
    record: any,
    field: string
  ) => {
    startEditing(type, record.id, field, record[field]);
  };

  const startEditing = (
    type: 'magasin' | 'categorie' | 'zone',
    id: number,
    field: string,
    value: any
  ) => {
    setEditingType(type);
    setEditingId(id);
    setEditingField(field);
    setEditingValue(value);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingField('');
    setEditingValue('');
  };

  const saveEditing = async () => {
    if (!editingId) return;
  
    try {
      let endpoint = '';
      let data: any = { id: editingId };
      let updateFunction = null;
  
      data[editingField] = editingValue;
      data.date_modification = new Date().toISOString();
  
      switch (editingType) {
        case 'magasin':
          endpoint =`${API_BASE_URL}/magasins/updateMagasin/${editingId}`;
          updateFunction = setMagasins;
          break;
        case 'categorie':
          endpoint = `${API_BASE_URL}/categories/updateCategorie/${editingId}`;
          updateFunction = setCategories;
          break;
        case 'zone':
          endpoint = `${API_BASE_URL}/zones/updateZone/${editingId}`;
          updateFunction = setZones;
          break;
      }
  
      const response = await axios.put(endpoint, data);
  
      if (response.data) {
        updateFunction(prev => 
          prev.map(item => 
            item.id === editingId 
              ? { ...item, [editingField]: editingValue, date_modification: data.date_modification }
              : item
          )
        );
  
        notification.success({
          message: 'Succès',
          description: 'Modification enregistrée avec succès'
        });
  
        setEditingId(null);
        setEditingField('');
        setEditingValue('');
      }
    } catch (error) {
      notification.error({
        message: 'Erreur',
        description: 'Échec de la modification'
      });
      console.error('Error updating data:', error);
    }
  };

  const handleDelete = async (type: 'magasin' | 'categorie' | 'zone', id: number) => {
    // Confirmation native du navigateur
    const isConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cet élément ?");
    if (!isConfirmed) return;
  
    try {
      const endpoint = `${API_BASE_URL}/${type}s/delete${type.charAt(0).toUpperCase() + type.slice(1)}/${id}`;
      await axios.delete(endpoint);
  
      // Mise à jour de l'état
      switch (type) {
        case 'magasin': setMagasins(prev => prev.filter(m => m.id !== id)); break;
        case 'categorie': setCategories(prev => prev.filter(c => c.id !== id)); break;
        case 'zone': setZones(prev => prev.filter(z => z.id !== id)); break;
      }
  
      // Remplacement de notification.success (optionnel)
      alert("Suppression réussie !");
    } catch (error) {
      console.error("Erreur:", error);
      alert("Échec de la suppression");
    }
  };

  const toggleEditMode = () => {
    setEditMode(prev => !prev);
    if (editMode) {
      cancelEditing();
    }
    notification.info({
      message: `Mode édition ${editMode ? 'désactivé' : 'activé'}`,
      description: editMode ? 
        'Vous ne pouvez plus modifier les données en double-cliquant' : 
        'Double-cliquez sur une cellule pour la modifier'
    });
  };

  // Colonnes pour les tables
  const magasinsColumns = [
    {
      title: t('category3Managment.displayData.idMagasin'),
      dataIndex: 'magasin_id',
      key: 'magasin_id',
    },
    {
      title: t('category3Managment.displayData.nomMagasin'),
      dataIndex: 'nom_magasin',
      key: 'nom_magasin',
      render: (_: any, record: Magasin) => renderEditableCell('magasin', record, 'nom_magasin')
    },
    {
      title: t('category3Managment.displayData.surface'),
      dataIndex: 'surface',
      key: 'surface',
      render: (_: any, record: Magasin) => renderEditableCell('magasin', record, 'surface', 'number')
    },
    {
      title: t('category3Managment.displayData.adresse'),
      dataIndex: 'adresse',
      key: 'adresse',
      render: (_: any, record: Magasin) => renderEditableCell('magasin', record, 'adresse')
    },
    {
      title: t('category3Managment.displayData.dateModif'),
      dataIndex: 'date_modification',
      key: 'date_modification',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: t('category3Managment.displayData.actions'),
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_: any, record: Magasin) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => openEditModal('magasin', record)}
          />
        <Button
  danger
  onClick={() => handleDelete('magasin', record.id)}
  icon={<DeleteOutlined />} 
>
{t('category3Managment.displayData.supprimer')}
</Button>
        </Space>
      ),
    },
  ];

  const categoriesColumns = [
    {
      title: t('category3Managment.displayData.nomCategorie'),
      dataIndex: 'nom',
      key: 'nom',
      render: (_: any, record: Categorie) => renderEditableCell('categorie', record, 'nom')
    },
    {
      title: t('category3Managment.displayData.niveau'),
      dataIndex: 'niveau',
      key: 'niveau',
      render: (_: any, record: Categorie) => renderEditableCell('categorie', record, 'niveau')
    },
    {
      title: t('category3Managment.displayData.saisonnalite'),
      dataIndex: 'saisonnalite',
      key: 'saisonnalite',
      render: (_: any, record: Categorie) => renderEditableCell('categorie', record, 'saisonnalite')
    },
    {
      title: t('category3Managment.displayData.priorite'),
      dataIndex: 'priorite',
      key: 'priorite',
      render: (_: any, record: Categorie) => renderEditableCell('categorie', record, 'priorite')
    },
    {
      title: t('category3Managment.displayData.zonePreferer'),
      dataIndex: 'zone_exposition_preferee',
      key: 'zone_exposition_preferee',
      render: (_: any, record: Categorie) => renderEditableCell('categorie', record, 'zone_exposition_preferee')
    },
    {
      title: t('category3Managment.displayData.dateModif'),
      dataIndex: 'date_modification',
      key: 'date_modification',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: t('category3Managment.displayData.actions'),
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_: any, record: Categorie) => (
        <Space>
          <Button 
            type="primary"
            icon={<EditOutlined />}
            onClick={() => openEditModal('categorie', record)}
          />
          <Button
  danger
  onClick={() => handleDelete('categorie', record.id)}
  icon={<DeleteOutlined />} 
>
{t('category3Managment.displayData.supprimer')}
</Button>
        </Space>
      ),
    },
  ];

  const zonesColumns = [
    {
      title: t('category3Managment.displayData.nomZone'),
      dataIndex: 'nom_zone',
      key: 'nom_zone',
      render: (_: any, record: Zone) => renderEditableCell('zone', record, 'nom_zone')
    },
    {
      title: t('category3Managment.displayData.description'),
      dataIndex: 'description',
      key: 'description',
      render: (_: any, record: Zone) => renderEditableCell('zone', record, 'description')
    },
    {
      title: t('category3Managment.displayData.magasin'),
      dataIndex: 'magasin_id',
      key: 'magasin_id',
      render: (_: any, record: Zone) => renderEditableCell(
        'zone', 
        record, 
        'magasin_id',
        'select',
        magasins.map(m => ({ value: m.magasin_id, label: m.nom_magasin }))
      )
    },
    {
      title: t('category3Managment.displayData.emplacement'),
      dataIndex: 'emplacement',
      key: 'emplacement',
      render: (_: any, record: Zone) => renderEditableCell('zone', record, 'emplacement')
    },
    {
      title: t('category3Managment.displayData.dateModif'),
      dataIndex: 'date_modification',
      key: 'date_modification',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: t('category3Managment.displayData.actions'),
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_: any, record: Zone) => (
        <Space>
          <Button 
            type="primary"
            icon={<EditOutlined />}
            onClick={() => openEditModal('zone', record)}
          />
         <Button
  danger
  onClick={() => handleDelete('zone', record.id)}
  icon={<DeleteOutlined />} 
>
{t('category3Managment.displayData.supprimer')}
</Button>
        </Space>
      ),
    },
  ];

  // Configuration des formulaires pour le modal d'édition
  const getFormItems = () => {
    switch (editingType) {
      case 'magasin':
        return (
          <>
            <Form.Item label={t('category3Managment.displayData.nomDelMagasin')} name="nom_magasin" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label={t('category3Managment.displayData.surface')} name="surface" rules={[{ required: true, type: 'number' }]}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label={t('category3Managment.displayData.longueur')} name="longueur">
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label={t('category3Managment.displayData.largeur')} name="largeur">
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label={t('category3Managment.displayData.adresse')} name="adresse">
              <Input.TextArea />
            </Form.Item>
          </>
        );
      case 'categorie':
        return (
          <>
            <Form.Item label={t('category3Managment.displayData.nomDelCategorie')} name="nom" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label={t('category3Managment.displayData.categorieParent')} name="parent_id">
              <Select>
                <Select.Option value="">{t('category3Managment.displayData.aucune')}</Select.Option>
                {categories.map(cat => (
                  <Select.Option key={cat.categorie_id} value={cat.categorie_id}>
                    {cat.nom}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label={t('category3Managment.displayData.niveau')} name="niveau">
              <Input />
            </Form.Item>
            <Form.Item label={t('category3Managment.displayData.saisonnalite')} name="saisonnalite">
              <Input />
            </Form.Item>
            <Form.Item label={t('category3Managment.displayData.priorite')} name="priorite">
              <Input />
            </Form.Item>
            <Form.Item label={t('category3Managment.displayData.zonePreferer')} name="zone_exposition_preferee">
              <Input />
            </Form.Item>
          </>
        );
      case 'zone':
        return (
          <>
            <Form.Item label={t('category3Managment.displayData.nomDelZone')} name="nom_zone" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label={t('category3Managment.displayData.magasin')} name="magasin_id" rules={[{ required: true }]}>
              <Select>
                {magasins.map(mag => (
                  <Select.Option key={mag.magasin_id} value={mag.magasin_id}>
                    {mag.nom_magasin}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label={t('category3Managment.displayData.description')} name="description">
              <Input.TextArea />
            </Form.Item>
            <Form.Item label={t('category3Managment.displayData.emplacement')} name="emplacement">
              <Input />
            </Form.Item>
          </>
        );
      default:
        return null;
    }
  };

  // Configuration des formulaires pour le modal d'ajout
  const getAddFormItems = () => {
    switch (editingType) {
      case 'magasin':
        return (
          <>
            <Form.Item label={t('category3Managment.displayData.idMagasin')} name="magasin_id" rules={[{ required: true }]}>
              <Input />
              </Form.Item>
              <Form.Item name="entreprise_id" initialValue={currentUser?.entreprise_id} hidden>
                <Input />
              </Form.Item>
            <Form.Item label={t('category3Managment.displayData.nomDelMagasin')} name="nom_magasin" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label={t('category3Managment.displayData.surface')} name="surface" rules={[{ required: true, type: 'number' }]}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label={t('category3Managment.displayData.longueur')} name="longueur">
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label={t('category3Managment.displayData.largeur')} name="largeur">
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label={t('category3Managment.displayData.adresse')} name="adresse">
              <Input.TextArea />
            </Form.Item>
          </>
        );
      case 'categorie':
        return (
          <>
            <Form.Item label={t('category3Managment.displayData.idCategorie')} name="categorie_id" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label={t('category3Managment.displayData.nomDelCategorie')} name="nom" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label={t('category3Managment.displayData.categorieParent')} name="parent_id">
              <Select>
                <Select.Option value="">{t('category3Managment.displayData.aucune')}</Select.Option>
                {categories.map(cat => (
                  <Select.Option key={cat.categorie_id} value={cat.categorie_id}>
                    {cat.nom}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label={t('category3Managment.displayData.niveau')} name="niveau">
              <Input />
            </Form.Item>
            <Form.Item label={t('category3Managment.displayData.saisonnalite')} name="saisonnalite">
              <Input />
            </Form.Item>
            <Form.Item label={t('category3Managment.displayData.priorite')} name="priorite">
              <Input />
            </Form.Item>
            <Form.Item label={t('category3Managment.displayData.zonePreferer')} name="zone_exposition_preferee">
              <Input />
            </Form.Item>
            <Form.Item label={t('category3Managment.displayData.temperature')}name="temperature_exposition">
              <Input />
            </Form.Item>
            <Form.Item label={t('category3Managment.displayData.conditionnement')} name="conditionnement">
              <Input />
            </Form.Item>
            <Form.Item label={t('category3Managment.displayData.clientelle')} name="clientele_ciblee">
              <Input />
            </Form.Item>
            <Form.Item label={t('categoryImport.headers.parent_id')} name="parent_id">
              <Select>
                <Select.Option value="">{t('category3Managment.displayData.aucune')}</Select.Option>
                {magasins.map(mag => (
                  <Select.Option key={mag.magasin_id} value={mag.magasin_id}>
                    {mag.nom_magasin}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </>
        );
      case 'zone':
        return (
          <>
            <Form.Item label={t('category3Managment.displayData.idZone')} name="zone_id" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label={t('category3Managment.displayData.nomDelZone')} name="nom_zone" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label={t('category3Managment.displayData.magasin')} name="magasin_id" rules={[{ required: true }]}>
              <Select>
                {magasins.map(mag => (
                  <Select.Option key={mag.magasin_id} value={mag.magasin_id}>
                    {mag.nom_magasin}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label={t('category3Managment.displayData.description')} name="description">
              <Input.TextArea />
            </Form.Item>
            <Form.Item label={t('category3Managment.displayData.emplacement')} name="emplacement">
              <Input />
            </Form.Item>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="display-data-container" dir={textDirection}>
      <Link href="/Dashboard" passHref>
    <Button 
      type="primary" 
      style={{ 
        marginRight: '16px',
        backgroundColor: '#1890ff',
        borderColor: '#1890ff',
        boxShadow: '0 2px 0 rgba(0, 0, 0, 0.045)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      icon={<ArrowLeftOutlined />}
    >
      {t('category3Managment.displayData.retourDashboard')}
    </Button>
  </Link>
      <div className="header-container">
        <h1 className="main-title">📊 {t('category3Managment.displayData.gestionDonnees')}</h1>
        <div className="action-buttons">
          <Button 
            type={editMode ? "primary" : "default"} 
            icon={editMode ? <SaveOutlined /> : <EditOutlined />}
            onClick={toggleEditMode}
          >
           {editMode ? t('category3Managment.displayData.quitEdition') : t('category3Managment.displayData.edition')}

          </Button>
        </div>
      </div>

      {/* Section Magasins */}
      <div className="section">
        <div className="section-header">
          <h2>
          {t('category3Managment.displayData.magasins')} 
            <span className="count-badge">{magasins.length}</span>
          </h2>
          <div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => openAddModal('magasin')}
              style={{ marginRight: 10 }}
            >
              {t('category3Managment.displayData.ajouterMagasin')}
            </Button>
            <Switch 
              checked={showMagasins}
              onChange={setShowMagasins}
              checkedChildren={<EyeOutlined />}
              unCheckedChildren={<EyeInvisibleOutlined />}
            />
          </div>
        </div>
        {showMagasins && (
          <div style={tableContainerStyle}>
            <div style={tableStyle}>
              <Table
                columns={magasinsColumns}
                dataSource={magasins}
                rowKey="id"
                bordered
                scroll={{ x: 'max-content', y: 400 }}
                pagination={{ pageSize: 5, showSizeChanger: true }}
                style={{ minWidth: '100%' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Section Catégories */}
      <div className="section">
        <div className="section-header">
          <h2>
          {t('category3Managment.displayData.categories')} 
            <span className="count-badge">{categories.length}</span>
          </h2>
          <div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => openAddModal('categorie')}
              style={{ marginRight: 10 }}
            >
              {t('category3Managment.displayData.ajouterCategorie')}
            </Button>
            <Switch 
              checked={showCategories}
              onChange={setShowCategories}
              checkedChildren={<EyeOutlined />}
              unCheckedChildren={<EyeInvisibleOutlined />}
            />
          </div>
        </div>
        {showCategories && (
          <div style={tableContainerStyle}>
            <div style={tableStyle}>
              <Table
                columns={categoriesColumns}
                dataSource={categories}
                rowKey="id"
                bordered
                scroll={{ x: 'max-content', y: 400 }}
                pagination={{ pageSize: 5, showSizeChanger: true }}
                style={{ minWidth: '100%' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Section Zones */}
      <div className="section">
        <div className="section-header">
          <h2>
          {t('category3Managment.displayData.zones')}
            <span className="count-badge">{zones.length}</span>
          </h2>
          <div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => openAddModal('zone')}
              style={{ marginRight: 10 }}
            >
              {t('category3Managment.displayData.ajouterZone')}
            </Button>
            <Switch 
              checked={showZones}
              onChange={setShowZones}
              checkedChildren={<EyeOutlined />}
              unCheckedChildren={<EyeInvisibleOutlined />}
            />
          </div>
        </div>
        {showZones && (
          <div style={tableContainerStyle}>
            <div style={tableStyle}>
              <Table
                columns={zonesColumns}
                dataSource={zones}
                rowKey="id"
                bordered
                scroll={{ x: 'max-content', y: 400 }}
                pagination={{ pageSize: 5, showSizeChanger: true }}
                style={{ minWidth: '100%' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modal d'édition */}
      <Modal
        title={`${t('category3Managment.displayData.modifier')} ${editingType}`}
        open={isEditingModalVisible}
        onOk={saveModalEditing}
        onCancel={() => {
          setIsEditingModalVisible(false);
          form.resetFields();
        }}
        okText={t('front.support.enregistrer')}
        cancelText={t('category3Managment.displayData.annuler')}
        width={800}
        destroyOnHidden
      >
        <div dir={textDirection}>
        <Form
          form={form}
          layout="vertical"
        >
          {getFormItems()}
        </Form>
        </div>
      </Modal>

      {/* Modal d'ajout */}
      <Modal
        title={`${t('category3Managment.displayData.ajouterNouv')} ${editingType}`}

        open={isAddingModalVisible}
        onOk={saveNewItem}
        onCancel={() => {
          setIsAddingModalVisible(false);
          addForm.resetFields();
        }}
        okText={t('category3Managment.displayData.ajouter')} 
        cancelText={t('category3Managment.displayData.annuler')} 
        width={800}
        destroyOnHidden
      >
        <div dir={textDirection}>
        <Form
          form={addForm}
          layout="vertical"
        >
          {getAddFormItems()}
        </Form>
        </div>
      </Modal>
    </div>
  );
};

export default DisplayData;