import React, { useState, useEffect } from 'react';
import { Table, Button, Space, notification, Modal, Input, Switch, Form, InputNumber, Select } from 'antd';
import { 
  EyeOutlined, EyeInvisibleOutlined, DeleteOutlined, 
  EditOutlined, CheckOutlined, CloseOutlined, 
  PlusOutlined, SaveOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import './DisplayData.css';
import { motion } from 'framer-motion';

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

const DisplayData: React.FC = () => {
  // États pour les données
  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  
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

  // Chargement des données
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, magasinsRes, zonesRes] = await Promise.all([
        /*axios.get('http://localhost:8081/api/management/getAllCategories'),
        axios.get('http://localhost:8081/api/management/getAllMagasins'),
        axios.get('http://localhost:8081/api/management/getAllZones')*/
        axios.get('http://localhost:8081/api/categories/getAllCategories'),
        axios.get('http://localhost:8081/api/magasins/getAllMagasins'),
        axios.get('http://localhost:8081/api/zones/getAllZones')
      ]);
      
      setCategories(categoriesRes.data);
      setMagasins(magasinsRes.data);
      setZones(zonesRes.data);
    } catch (error) {
      notification.error({
        message: 'Erreur',
        description: 'Impossible de charger les données'
      });
      console.error('Error fetching data:', error);
    }
  };

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
    try {
      const values = await addForm.validateFields();
      values.date_modification = new Date().toISOString();
  
      let endpoint = '';
      let updateFunction = null;

      switch (editingType) {
        case 'magasin':
          //endpoint = 'http://localhost:8081/api/management/addMagasin';
          endpoint = 'http://localhost:8081/api/magasins/createMagasin';
          updateFunction = setMagasins;
          break;
        case 'categorie':
          //endpoint = 'http://localhost:8081/api/management/addCategorie';
          endpoint = 'http://localhost:8081/api/categories/createCategorie';
          updateFunction = setCategories;
          break;
        case 'zone':
          //endpoint = 'http://localhost:8081/api/management/addZone';
          endpoint = 'http://localhost:8081/api/zones/createZone';
          updateFunction = setZones;
          break;
      }

      const response = await axios.post(endpoint, values);

      if (response.data) {
        notification.success({
          message: 'Succès',
          description: 'Nouvel élément ajouté avec succès'
        });
        setIsAddingModalVisible(false);
        fetchData(); // Recharger les données pour afficher le nouvel élément
      }
    } catch (error) {
      notification.error({
        message: 'Erreur',
        description: "Échec de l'ajout du nouvel élément"
      });
      console.error('Error adding new item:', error);
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
          endpoint = `http://localhost:8081/api/magasins/updateMagasin/${currentRecord.id}`;
          updateFunction = setMagasins;
          dataKey = 'id';
          break;
        case 'categorie':
          endpoint = `http://localhost:8081/api/categories/updateCategorie/${currentRecord.id}`;
          updateFunction = setCategories;
          dataKey = 'id';
          break;
        case 'zone':
          endpoint = `http://localhost:8081/api/zones/updateZone/${currentRecord.id}`;
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
          endpoint = `http://localhost:8081/api/magasins/updateMagasin/${editingId}`;
          updateFunction = setMagasins;
          break;
        case 'categorie':
          endpoint = `http://localhost:8081/api/categories/updateCategorie/${editingId}`;
          updateFunction = setCategories;
          break;
        case 'zone':
          endpoint = `http://localhost:8081/api/zones/updateZone/${editingId}`;
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
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Êtes-vous sûr de vouloir supprimer cet élément ?',
      okText: 'Oui',
      cancelText: 'Non',
      onOk: async () => {
        try {
          let endpoint = '';
          let updateFunction = null;

          switch (type) {
            case 'magasin':
              endpoint = `http://localhost:8081/api/magasins/deleteMagasin/${id}`;
              updateFunction = setMagasins;
              break;
            case 'categorie':
              endpoint = `http://localhost:8081/api/categories/deleteCategorie/${id}`;
              updateFunction = setCategories;
              break;
            case 'zone':
              endpoint = `http://localhost:8081/api/zones/deleteZone/${id}`;
              updateFunction = setZones;
              break;
          }

          await axios.delete(endpoint);

          updateFunction(prev => prev.filter(item => item.id !== id));

          notification.success({
            message: 'Succès',
            description: 'Suppression effectuée avec succès'
          });
        } catch (error) {
          notification.error({
            message: 'Erreur',
            description: 'Échec de la suppression'
          });
          console.error('Error deleting data:', error);
        }
      }
    });
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
      title: 'ID Magasin',
      dataIndex: 'magasin_id',
      key: 'magasin_id',
    },
    {
      title: 'Nom Magasin',
      dataIndex: 'nom_magasin',
      key: 'nom_magasin',
      render: (_: any, record: Magasin) => renderEditableCell('magasin', record, 'nom_magasin')
    },
    {
      title: 'Surface (m²)',
      dataIndex: 'surface',
      key: 'surface',
      render: (_: any, record: Magasin) => renderEditableCell('magasin', record, 'surface', 'number')
    },
    {
      title: 'Adresse',
      dataIndex: 'adresse',
      key: 'adresse',
      render: (_: any, record: Magasin) => renderEditableCell('magasin', record, 'adresse')
    },
    {
      title: 'Date de modification',
      dataIndex: 'date_modification',
      key: 'date_modification',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: 'Actions',
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
      icon={
        <motion.div
          whileHover={{ scale: 1.3, rotate: 20 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            backgroundColor: '#ff4d4f',
            color: 'white',
            padding: '6px',
            borderRadius: '50%',
            fontSize: '16px'
          }}
        >
          <DeleteOutlined />
        </motion.div>
      }
      onClick={() => handleDelete('magasin', record.id)}
    >
      Supprimer
    </Button>
        </Space>
      ),
    },
  ];

  const categoriesColumns = [
    {
      title: 'Nom Catégorie',
      dataIndex: 'nom',
      key: 'nom',
      render: (_: any, record: Categorie) => renderEditableCell('categorie', record, 'nom')
    },
    {
      title: 'Niveau',
      dataIndex: 'niveau',
      key: 'niveau',
      render: (_: any, record: Categorie) => renderEditableCell('categorie', record, 'niveau')
    },
    {
      title: 'Saisonnalité',
      dataIndex: 'saisonnalite',
      key: 'saisonnalite',
      render: (_: any, record: Categorie) => renderEditableCell('categorie', record, 'saisonnalite')
    },
    {
      title: 'Priorité',
      dataIndex: 'priorite',
      key: 'priorite',
      render: (_: any, record: Categorie) => renderEditableCell('categorie', record, 'priorite')
    },
    {
      title: 'Zone Exposition Préférée',
      dataIndex: 'zone_exposition_preferee',
      key: 'zone_exposition_preferee',
      render: (_: any, record: Categorie) => renderEditableCell('categorie', record, 'zone_exposition_preferee')
    },
    {
      title: 'Date de modification',
      dataIndex: 'date_modification',
      key: 'date_modification',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: 'Actions',
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
  icon={
    <motion.div
      whileHover={{ scale: 1.3, rotate: 20 }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        backgroundColor: '#ff4d4f',
        color: 'white',
        padding: '6px',
        borderRadius: '50%',
        fontSize: '16px'
      }}
    >
      <DeleteOutlined />
    </motion.div>
  }
  onClick={() => handleDelete('categorie', record.id)}
>
  Supprimer
</Button>
        </Space>
      ),
    },
  ];

  const zonesColumns = [
    {
      title: 'Nom Zone',
      dataIndex: 'nom_zone',
      key: 'nom_zone',
      render: (_: any, record: Zone) => renderEditableCell('zone', record, 'nom_zone')
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (_: any, record: Zone) => renderEditableCell('zone', record, 'description')
    },
    {
      title: 'Magasin',
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
      title: 'Emplacement',
      dataIndex: 'emplacement',
      key: 'emplacement',
      render: (_: any, record: Zone) => renderEditableCell('zone', record, 'emplacement')
    },
    {
      title: 'Date de modification',
      dataIndex: 'date_modification',
      key: 'date_modification',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: 'Actions',
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
  icon={
    <motion.div
      whileHover={{ scale: 1.3, rotate: 20 }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        backgroundColor: '#ff4d4f',
        color: 'white',
        padding: '6px',
        borderRadius: '50%',
        fontSize: '16px'
      }}
    >
      <DeleteOutlined />
    </motion.div>
  }
  onClick={() => handleDelete('zone', record.id)}
>
  Supprimer
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
            <Form.Item label="Nom du magasin" name="nom_magasin" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Surface (m²)" name="surface" rules={[{ required: true, type: 'number' }]}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="Longueur" name="longueur">
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="Largeur" name="largeur">
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="Adresse" name="adresse">
              <Input.TextArea />
            </Form.Item>
          </>
        );
      case 'categorie':
        return (
          <>
            <Form.Item label="Nom de la catégorie" name="nom" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Catégorie parente" name="parent_id">
              <Select>
                <Select.Option value="">Aucune</Select.Option>
                {categories.map(cat => (
                  <Select.Option key={cat.categorie_id} value={cat.categorie_id}>
                    {cat.nom}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Niveau" name="niveau">
              <Input />
            </Form.Item>
            <Form.Item label="Saisonnalité" name="saisonnalite">
              <Input />
            </Form.Item>
            <Form.Item label="Priorité" name="priorite">
              <Input />
            </Form.Item>
            <Form.Item label="Zone Exposition Préférée" name="zone_exposition_preferee">
              <Input />
            </Form.Item>
          </>
        );
      case 'zone':
        return (
          <>
            <Form.Item label="Nom de la zone" name="nom_zone" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Magasin" name="magasin_id" rules={[{ required: true }]}>
              <Select>
                {magasins.map(mag => (
                  <Select.Option key={mag.magasin_id} value={mag.magasin_id}>
                    {mag.nom_magasin}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Description" name="description">
              <Input.TextArea />
            </Form.Item>
            <Form.Item label="Emplacement" name="emplacement">
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
            <Form.Item label="ID Magasin" name="magasin_id" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Nom du magasin" name="nom_magasin" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Surface (m²)" name="surface" rules={[{ required: true, type: 'number' }]}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="Longueur" name="longueur">
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="Largeur" name="largeur">
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="Adresse" name="adresse">
              <Input.TextArea />
            </Form.Item>
          </>
        );
      case 'categorie':
        return (
          <>
            <Form.Item label="ID Catégorie" name="categorie_id" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Nom de la catégorie" name="nom" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Catégorie parente" name="parent_id">
              <Select>
                <Select.Option value="">Aucune</Select.Option>
                {categories.map(cat => (
                  <Select.Option key={cat.categorie_id} value={cat.categorie_id}>
                    {cat.nom}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Niveau" name="niveau">
              <Input />
            </Form.Item>
            <Form.Item label="Saisonnalité" name="saisonnalite">
              <Input />
            </Form.Item>
            <Form.Item label="Priorité" name="priorite">
              <Input />
            </Form.Item>
            <Form.Item label="Zone Exposition Préférée" name="zone_exposition_preferee">
              <Input />
            </Form.Item>
          </>
        );
      case 'zone':
        return (
          <>
            <Form.Item label="ID Zone" name="zone_id" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Nom de la zone" name="nom_zone" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Magasin" name="magasin_id" rules={[{ required: true }]}>
              <Select>
                {magasins.map(mag => (
                  <Select.Option key={mag.magasin_id} value={mag.magasin_id}>
                    {mag.nom_magasin}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Description" name="description">
              <Input.TextArea />
            </Form.Item>
            <Form.Item label="Emplacement" name="emplacement">
              <Input />
            </Form.Item>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="display-data-container">
      <div className="header-container">
        <h1 className="main-title">📊 Gestion des Données</h1>
        <div className="action-buttons">
          <Button 
            type={editMode ? "primary" : "default"} 
            icon={editMode ? <SaveOutlined /> : <EditOutlined />}
            onClick={toggleEditMode}
          >
            {editMode ? "Quitter le mode édition" : "Mode édition"}
          </Button>
        </div>
      </div>

      {/* Section Magasins */}
      <div className="section">
        <div className="section-header">
          <h2>
            Magasins 
            <span className="count-badge">{magasins.length}</span>
          </h2>
          <div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => openAddModal('magasin')}
              style={{ marginRight: 10 }}
            >
              Ajouter Magasin
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
          <Table
            columns={magasinsColumns}
            dataSource={magasins}
            rowKey="id"
            bordered
            scroll={{ x: 'max-content' }}
            pagination={{ pageSize: 5, showSizeChanger: true }}
          />
        )}
      </div>

      {/* Section Catégories */}
      <div className="section">
        <div className="section-header">
          <h2>
            Catégories 
            <span className="count-badge">{categories.length}</span>
          </h2>
          <div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => openAddModal('categorie')}
              style={{ marginRight: 10 }}
            >
              Ajouter Catégorie
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
          <Table
            columns={categoriesColumns}
            dataSource={categories}
            rowKey="id"
            bordered
            scroll={{ x: 'max-content' }}
            pagination={{ pageSize: 5, showSizeChanger: true }}
          />
        )}
      </div>

      {/* Section Zones */}
      <div className="section">
        <div className="section-header">
          <h2>
            Zones 
            <span className="count-badge">{zones.length}</span>
          </h2>
          <div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => openAddModal('zone')}
              style={{ marginRight: 10 }}
            >
              Ajouter Zone
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
          <Table
            columns={zonesColumns}
            dataSource={zones}
            rowKey="id"
            bordered
            scroll={{ x: 'max-content' }}
            pagination={{ pageSize: 5, showSizeChanger: true }}
          />
        )}
      </div>

      {/* Modal d'édition */}
      <Modal
        title={`Modifier ${editingType}`}
        open={isEditingModalVisible}
        onOk={saveModalEditing}
        onCancel={() => {
          setIsEditingModalVisible(false);
          form.resetFields();
        }}
        okText="Enregistrer"
        cancelText="Annuler"
        width={800}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
        >
          {getFormItems()}
        </Form>
      </Modal>

      {/* Modal d'ajout */}
      <Modal
        title={`Ajouter un nouveau ${editingType}`}
        open={isAddingModalVisible}
        onOk={saveNewItem}
        onCancel={() => {
          setIsAddingModalVisible(false);
          addForm.resetFields();
        }}
        okText="Ajouter"
        cancelText="Annuler"
        width={800}
        destroyOnHidden
      >
        <Form
          form={addForm}
          layout="vertical"
        >
          {getAddFormItems()}
        </Form>
      </Modal>
    </div>
  );
};

export default DisplayData;