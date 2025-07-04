import sys
import os
sys.path.append('..')

import unittest
import pandas as pd
import numpy as np
from main_pipeline import (
    DataProcessor, 
    FurnitureTypePredictor, 
    FurnitureDimensionPredictor,
    PositionPredictor,
    ConstraintManager,
    PlanogramModels,
    PlanogramAIPipeline
)

class TestDataProcessor(unittest.TestCase):
    """Tests pour le processeur de données"""
    
    def setUp(self):
        """Préparation des tests"""
        # Création de données de test
        self.test_data = pd.DataFrame({
            'input_produit_id': ['PROD_001', 'PROD_002', 'PROD_003'],
            'input_prix_produit': [10.5, 15.0, 8.5],
            'input_longueur_produit': [20.0, 25.0, 15.0],
            'input_largeur_produit': [10.0, 12.0, 8.0],
            'input_categorie_id': ['CAT_001', 'CAT_002', 'CAT_001'],
            'input_contrainte_temperature_produit': [0, 1, 0]
        })
        
        # Sauvegarde temporaire
        self.test_file = 'test_data.csv'
        self.test_data.to_csv(self.test_file, index=False)
        
        self.processor = DataProcessor(self.test_file)
    
    def tearDown(self):
        """Nettoyage après tests"""
        if os.path.exists(self.test_file):
            os.remove(self.test_file)
    
    def test_load_data(self):
        """Test du chargement des données"""
        data = self.processor.load_data()
        self.assertFalse(data.empty)
        self.assertEqual(len(data), 3)
        self.assertIn('input_produit_id', data.columns)
    
    def test_preprocess_data(self):
        """Test du prétraitement"""
        processed = self.processor.preprocess_data(self.test_data)
        self.assertFalse(processed.empty)
        
        # Vérification des features dérivées
        if 'surface_produit' in processed.columns:
            self.assertTrue(processed['surface_produit'].notna().all())

class TestFurnitureTypePredictor(unittest.TestCase):
    """Tests pour le prédicteur de types de meubles"""
    
    def setUp(self):
        self.predictor = FurnitureTypePredictor()
        
        # Données de test
        self.X_test = pd.DataFrame({
            'feature1': [1, 2, 3, 4, 5],
            'feature2': [10, 20, 30, 40, 50],
            'input_contrainte_temperature_produit': [0, 1, 0, 1, 0]
        })
    
    def test_generate_labels(self):
        """Test de génération des labels"""
        labels = self.predictor._generate_furniture_type_labels(self.X_test)
        self.assertEqual(len(labels), len(self.X_test))
        self.assertTrue(all(1 <= label <= 12 for label in labels))
    
    def test_train_and_predict(self):
        """Test d'entraînement et prédiction"""
        self.predictor.train(self.X_test)
        predictions = self.predictor.predict(self.X_test)
        
        self.assertEqual(len(predictions), len(self.X_test))
        self.assertTrue(all(1 <= pred <= 12 for pred in predictions))

class TestConstraintManager(unittest.TestCase):
    """Tests pour le gestionnaire de contraintes"""
    
    def setUp(self):
        self.constraint_manager = ConstraintManager()
        
        # Données de test
        self.original_data = pd.DataFrame({
            'input_contrainte_temperature_produit': [0, 1, 0, 1]
        })
        
        self.predictions = {
            'furniture_type': np.array([1, 2, 3, 4]),
            'dimensions': {
                'largeur': np.array([100.0, 150.0, 200.0, 80.0]),
                'hauteur': np.array([180.0, 200.0, 160.0, 180.0]),
                'profondeur': np.array([40.0, 45.0, 35.0, 30.0]),
                'nb_etageres': np.array([4, 5, 4, 1]),
                'nb_colonnes': np.array([5, 6, 4, 8])
            },
            'positions': {
                'face': np.array([1, 2, 4, 1]),
                'etagere': np.array([3, 4, 2, 1]),
                'colonne': np.array([2, 3, 1, 5]),
                'quantite': np.array([4, 6, 3, 8])
            }
        }
    
    def test_apply_constraints(self):
        """Test d'application des contraintes"""
        constrained = self.constraint_manager.apply_constraints(
            self.predictions, 
            self.original_data
        )
        
        # Vérification que la structure est préservée
        self.assertIn('furniture_type', constrained)
        self.assertIn('dimensions', constrained)
        self.assertIn('positions', constrained)
        
        # Vérification des contraintes de faces
        furniture_types = constrained['furniture_type']
        faces = constrained['positions']['face']
        
        for furniture_type, face in zip(furniture_types, faces):
            max_faces = self.constraint_manager.furniture_constraints.get(furniture_type, {}).get('max_faces', 1)
            self.assertLessEqual(face, max_faces)

class TestPlanogramAIPipeline(unittest.TestCase):
    """Tests pour le pipeline principal"""
    
    def setUp(self):
        # Création d'un fichier de test
        test_data = pd.DataFrame({
            'input_produit_id': [f'PROD_{i:03d}' for i in range(1, 21)],
            'input_prix_produit': np.random.uniform(5, 50, 20),
            'input_longueur_produit': np.random.uniform(10, 30, 20),
            'input_largeur_produit': np.random.uniform(5, 20, 20),
            'input_hauteur_produit': np.random.uniform(15, 35, 20),
            'input_priorite_merchandising': np.random.randint(1, 11, 20),
            'input_contrainte_temperature_produit': np.random.choice([0, 1], 20),
            'input_magasin_id': np.random.choice(['MAG_001', 'MAG_002'], 20),
            'input_categorie_id': np.random.choice(['CAT_001', 'CAT_002'], 20),
            'input_surface_magasin': np.random.uniform(200, 800, 20),
        })
        
        self.test_file = 'test_pipeline_data.csv'
        test_data.to_csv(self.test_file, index=False)
        
        self.pipeline = PlanogramAIPipeline(self.test_file)
    
    def tearDown(self):
        if os.path.exists(self.test_file):
            os.remove(self.test_file)
    
    def test_load_and_preprocess(self):
        """Test du chargement et prétraitement"""
        success = self.pipeline.load_and_preprocess_data()
        self.assertTrue(success)
        self.assertIsNotNone(self.pipeline.raw_data)
        self.assertIsNotNone(self.pipeline.processed_data)
    
    def test_generate_planogram(self):
        """Test de génération de planogramme"""
        # Chargement des données
        self.pipeline.load_and_preprocess_data()
        
        # Entraînement rapide
        self.pipeline.train_models()
        
        # Génération
        results = self.pipeline.generate_planogram()
        
        self.assertIsNotNone(results)
        self.assertIn('furniture_type', results)
        self.assertIn('dimensions', results)
        self.assertIn('positions', results)
    
    def test_json_output(self):
        """Test de génération JSON"""
        # Données de test simulées
        mock_results = {
            'furniture_type': np.array([1, 2, 3]),
            'dimensions': {
                'largeur': np.array([120.0, 150.0, 100.0]),
                'hauteur': np.array([180.0, 200.0, 160.0]),
                'profondeur': np.array([40.0, 45.0, 35.0]),
                'nb_etageres': np.array([4, 5, 4]),
                'nb_colonnes': np.array([5, 6, 4])
            },
            'positions': {
                'face': np.array([1, 2, 1]),
                'etagere': np.array([3, 4, 2]),
                'colonne': np.array([2, 3, 1]),
                'quantite': np.array([4, 6, 3])
            }
        }
        
        json_output = self.pipeline.generate_json_output(mock_results)
        
        self.assertIn('planogram_info', json_output)
        self.assertIn('furniture', json_output)
        self.assertIn('product_positions', json_output)
        self.assertIn('statistics', json_output)
        
        # Vérification de la cohérence
        self.assertEqual(len(json_output['furniture']), 3)
        self.assertEqual(len(json_output['product_positions']), 3)

def run_performance_test():
    """Test de performance avec un dataset plus large"""
    print("🚀 Test de performance...")
    
    # Génération de données de test
    n_samples = 200
    test_data = pd.DataFrame({
        'input_produit_id': [f'PROD_{i:03d}' for i in range(1, n_samples+1)],
        'input_prix_produit': np.random.uniform(5, 50, n_samples),
        'input_longueur_produit': np.random.uniform(10, 30, n_samples),
        'input_largeur_produit': np.random.uniform(5, 20, n_samples),
        'input_hauteur_produit': np.random.uniform(15, 35, n_samples),
        'input_priorite_merchandising': np.random.randint(1, 11, n_samples),
        'input_contrainte_temperature_produit': np.random.choice([0, 1], n_samples),
        'input_magasin_id': np.random.choice(['MAG_001', 'MAG_002', 'MAG_003'], n_samples),
        'input_categorie_id': np.random.choice(['CAT_001', 'CAT_002', 'CAT_003'], n_samples),
        'input_surface_magasin': np.random.uniform(200, 800, n_samples),
    })
    
    test_file = 'performance_test_data.csv'
    test_data.to_csv(test_file, index=False)
    
    try:
        import time
        start_time = time.time()
        
        # Test du pipeline complet
        pipeline = PlanogramAIPipeline(test_file)
        results = pipeline.run_full_pipeline()
        
        end_time = time.time()
        duration = end_time - start_time
        
        print(f"✅ Test de performance terminé en {duration:.2f} secondes")
        print(f"📊 Traitement de {n_samples} échantillons")
        print(f"⚡ Vitesse: {n_samples/duration:.1f} échantillons/seconde")
        
        if results:
            json_output = pipeline.generate_json_output(results)
            print(f"🪑 Meubles générés: {len(json_output.get('furniture', []))}")
            print(f"📍 Positions générées: {len(json_output.get('product_positions', []))}")
        
    finally:
        if os.path.exists(test_file):
            os.remove(test_file)

if __name__ == '__main__':
    print("🧪 Tests du Système de Génération de Planogrammes IA")
    print("=" * 60)
    
    # Tests unitaires
    print("\n📋 Exécution des tests unitaires...")
    unittest.main(argv=[''], exit=False, verbosity=2)
    
    # Test de performance
    print("\n⚡ Test de performance...")
    run_performance_test()
    
    print("\n✅ Tous les tests terminés!")
