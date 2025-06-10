"""
API REST pour le système de planogramme IA
"""

from fastapi import FastAPI, HTTPException, Query, Depends
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import json
import uvicorn

from data_processor import DataProcessor
from main_pipeline import PlanogramAIPipeline
from config import DATASET_PATH

# Créer l'application FastAPI
app = FastAPI(
    title="API Planogramme IA",
    description="API pour générer des planogrammes avec l'IA",
    version="1.0.0"
)

# Modèles de données pour l'API
class ProductPlacement(BaseModel):
    produit_id: str
    etage: int
    colonne: int

class PlanogramOutput(BaseModel):
    emplacement_magasin: str
    dimension_longueur_planogramme: float
    dimension_largeur_planogramme: float
    nb_etageres: int
    nb_colonnes: int
    product_placements: List[ProductPlacement]

# Dépendances
def get_data_processor():
    return DataProcessor(DATASET_PATH)

def get_pipeline():
    return PlanogramAIPipeline(DATASET_PATH)

@app.get("/")
def read_root():
    return {"message": "Bienvenue sur l'API du système de planogramme IA"}

@app.get("/stores", response_model=List[dict])
def get_stores(data_processor: DataProcessor = Depends(get_data_processor)):
    """
    Récupère la liste des magasins disponibles
    """
    try:
        stores = data_processor.get_available_stores()
        return stores.to_dict('records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/categories", response_model=List[dict])
def get_categories(
    magasin_id: Optional[int] = Query(None, description="ID du magasin pour filtrer les catégories"),
    data_processor: DataProcessor = Depends(get_data_processor)
):
    """
    Récupère la liste des catégories disponibles
    """
    try:
        categories = data_processor.get_available_categories(magasin_id)
        return categories.to_dict('records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/subcategories/{categorie_id}", response_model=List[dict])
def get_subcategories(
    categorie_id: int,
    data_processor: DataProcessor = Depends(get_data_processor)
):
    """
    Récupère la liste des sous-catégories disponibles pour une catégorie
    """
    try:
        subcategories = data_processor.get_available_subcategories(categorie_id)
        return subcategories.to_dict('records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/planogram", response_model=PlanogramOutput)
def generate_planogram(
    magasin_id: int = Query(..., description="ID du magasin"),
    categorie_id: int = Query(..., description="ID de la catégorie"),
    sous_categorie_id: Optional[int] = Query(None, description="ID de la sous-catégorie (optionnel)"),
    zone: str = Query("Zone principale", description="Zone d'emplacement du planogramme"),
    pipeline: PlanogramAIPipeline = Depends(get_pipeline),
    data_processor: DataProcessor = Depends(get_data_processor)
):
    """
    Génère un planogramme pour un magasin et une catégorie donnés
    """
    try:
        # Filtrer les données
        filtered_data = data_processor.filter_by_store_and_category(
            magasin_id, 
            categorie_id, 
            sous_categorie_id
        )
        
        # Exécuter le pipeline
        results = pipeline.run_filtered_pipeline(
            filtered_data, 
            magasin_id, 
            categorie_id, 
            sous_categorie_id
        )
        
        # Ajouter la zone aux résultats
        results['zone_name'] = zone
        
        # Générer le JSON
        json_output = pipeline.generate_json_output(results)
        
        # Convertir le JSON en objet Python
        planogram_dict = json.loads(json_output)
        
        # Retourner l'objet
        return planogram_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
