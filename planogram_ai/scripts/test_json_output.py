"""
Script de test pour vérifier la sortie JSON du modèle
"""

import pandas as pd
import numpy as np
import json
import sys
import os

# Ajouter le répertoire parent au chemin de recherche des modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data_processor import DataProcessor
from main_pipeline import PlanogramAIPipeline
from config import DATASET_PATH

def test_json_output():
    """
    Teste la génération de la sortie JSON du modèle
    """
    print("Chargement du dataset...")
    data_processor = DataProcessor(DATASET_PATH)
    
    try:
        data = data_processor.load_data()
        print(f"Dataset chargé avec succès: {data.shape} lignes")
        
        # Sélectionner un magasin et une catégorie pour le test
        stores = data_processor.get_available_stores()
        if stores.empty:
            print("Aucun magasin trouvé dans le dataset")
            return
        
        magasin_id = stores['input_magasin_id'].iloc[0]
        print(f"Magasin sélectionné pour le test: {magasin_id}")
        
        categories = data_processor.get_available_categories(magasin_id)
        if categories.empty:
            print("Aucune catégorie trouvée pour ce magasin")
            return
        
        categorie_id = categories['input_categorie_id'].iloc[0]
        print(f"Catégorie sélectionnée pour le test: {categorie_id}")
        
        # Filtrer les données
        filtered_data = data_processor.filter_by_store_and_category(magasin_id, categorie_id)
        print(f"Données filtrées: {filtered_data.shape} lignes")
        
        # Créer des données simulées si nécessaire
        if filtered_data.shape[0] < 5:
            print("Pas assez de données, création de données simulées...")
            filtered_data = create_simulated_data(magasin_id, categorie_id)
        
        # Exécuter le pipeline
        print("Exécution du pipeline...")
        pipeline = PlanogramAIPipeline()
        results = pipeline.run_filtered_pipeline(filtered_data, magasin_id, categorie_id)
