from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import json
import tempfile
import os
from datetime import datetime
from typing import Optional, Dict, Any, List
import uvicorn

# Import du pipeline principal
import sys
sys.path.append('..')
from main_pipeline import PlanogramAIPipeline

# Initialisation de l'API
app = FastAPI(
    title="🏪 Planogramme IA API",
    description="API REST pour la génération automatique de planogrammes avec IA",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Variables globales
pipeline_instance = None
sample_data = None

# Types de meubles supportés
FURNITURE_TYPES = {
    1: {"name": "planogram", "faces": 1, "description": "Planogramme standard"},
    2: {"name": "gondola", "faces": 2, "description": "Gondole 2 faces"},
    3: {"name": "shelves-display", "faces": 4, "description": "Présentoir étagères 4 faces"},
    4: {"name": "clothing-rack", "faces": 1, "description": "Portant vêtements"},
    5: {"name": "wall-display", "faces": 1, "description": "Présentoir mural"},
    6: {"name": "accessory-display", "faces": 1, "description": "Présentoir accessoires"},
    7: {"name": "modular-cube", "faces": 1, "description": "Cube modulaire"},
    8: {"name": "table", "faces": 1, "description": "Table de présentation"},
    9: {"name": "refrigerator", "faces": 1, "description": "Réfrigérateur"},
    10: {"name": "refrigerated-showcase", "faces": 1, "description": "Vitrine réfrigérée"},
    11: {"name": "clothing-display", "faces": 1, "description": "Présentoir vêtements"},
    12: {"name": "clothing-wall", "faces": 1, "description": "Mur vêtements"}
}

def generate_sample_data():
    """Génère des données d'exemple"""
    import numpy as np
    np.random.seed(42)
    n_samples = 50
    
    data = {
        'input_produit_id': [f'PROD_{i:03d}' for i in range(1, n_samples+1)],
        'input_nom_produit': [f'Produit {i}' for i in range(1, n_samples+1)],
        'input_prix_produit': np.random.uniform(5, 50, n_samples),
        'input_longueur_produit': np.random.uniform(10, 30, n_samples),
        'input_largeur_produit': np.random.uniform(5, 20, n_samples),
        'input_hauteur_produit': np.random.uniform(15, 35, n_samples),
        'input_priorite_merchandising': np.random.randint(1, 11, n_samples),
        'input_contrainte_temperature_produit': np.random.choice([0, 1], n_samples, p=[0.8, 0.2]),
        'input_magasin_id': np.random.choice(['MAG_001', 'MAG_002', 'MAG_003'], n_samples),
        'input_categorie_id': np.random.choice(['CAT_001', 'CAT_002', 'CAT_003'], n_samples),
        'input_surface_magasin': np.random.uniform(200, 800, n_samples),
        'input_longueur_zone': np.random.uniform(5, 15, n_samples),
        'input_largeur_zone': np.random.uniform(2, 5, n_samples),
    }
    
    return pd.DataFrame(data)

@app.on_event("startup")
async def startup_event():
    """Initialisation au démarrage"""
    global sample_data
    sample_data = generate_sample_data()
    print("🚀 API Planogramme IA démarrée")

@app.get("/", response_class=HTMLResponse)
async def root():
    """Page d'accueil de l'API"""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>🏪 Planogramme IA API</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; color: #333; margin-bottom: 30px; }
            .endpoint { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #007bff; }
            .method { font-weight: bold; color: #007bff; }
            .description { color: #666; margin-top: 5px; }
            .footer { text-align: center; margin-top: 30px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏪 Planogramme IA API</h1>
                <p>API REST pour la génération automatique de planogrammes avec Intelligence Artificielle</p>
            </div>
            
            <h2>📋 Endpoints Disponibles</h2>
            
            <div class="endpoint">
                <div class="method">GET /furniture-types</div>
                <div class="description">Liste des 12 types de meubles supportés</div>
            </div>
            
            <div class="endpoint">
                <div class="method">GET /stores</div>
                <div class="description">Liste des magasins disponibles</div>
            </div>
            
            <div class="endpoint">
                <div class="method">GET /categories</div>
                <div class="description">Liste des catégories de produits</div>
            </div>
            
            <div class="endpoint">
                <div class="method">POST /planogram/generate</div>
                <div class="description">Génération d'un planogramme avec filtres optionnels</div>
            </div>
            
            <div class="endpoint">
                <div class="method">POST /planogram/upload-and-generate</div>
                <div class="description">Upload d'un fichier CSV et génération de planogramme</div>
            </div>
            
            <div class="endpoint">
                <div class="method">GET /planogram/stats</div>
                <div class="description">Statistiques générales du système</div>
            </div>
            
            <h2>📖 Documentation</h2>
            <p>
                <a href="/docs" target="_blank">📚 Documentation Swagger</a> | 
                <a href="/redoc" target="_blank">📋 Documentation ReDoc</a>
            </p>
            
            <div class="footer">
                <p>Développé avec FastAPI, XGBoost et Random Forest</p>
            </div>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

@app.get("/furniture-types")
async def get_furniture_types():
    """Retourne la liste des types de meubles supportés"""
    return {
        "furniture_types": FURNITURE_TYPES,
        "total_types": len(FURNITURE_TYPES),
        "description": "12 types de meubles supportés avec leurs caractéristiques"
    }

@app.get("/stores")
async def get_stores():
    """Retourne la liste des magasins disponibles"""
    global sample_data
    
    if sample_data is not None and 'input_magasin_id' in sample_data.columns:
        stores = sample_data['input_magasin_id'].unique().tolist()
        store_details = []
        
        for store_id in stores:
            store_data = sample_data[sample_data['input_magasin_id'] == store_id]
            store_details.append({
                "store_id": store_id,
                "products_count": len(store_data),
                "avg_surface": store_data['input_surface_magasin'].mean() if 'input_surface_magasin' in store_data.columns else 0
            })
        
        return {
            "stores": store_details,
            "total_stores": len(stores)
        }
    
    return {
        "stores": [
            {"store_id": "MAG_001", "products_count": 0, "avg_surface": 450},
            {"store_id": "MAG_002", "products_count": 0, "avg_surface": 320},
            {"store_id": "MAG_003", "products_count": 0, "avg_surface": 680}
        ],
        "total_stores": 3
    }

@app.get("/categories")
async def get_categories():
    """Retourne la liste des catégories disponibles"""
    global sample_data
    
    if sample_data is not None and 'input_categorie_id' in sample_data.columns:
        categories = sample_data['input_categorie_id'].unique().tolist()
        category_details = []
        
        for category_id in categories:
            category_data = sample_data[sample_data['input_categorie_id'] == category_id]
            category_details.append({
                "category_id": category_id,
                "products_count": len(category_data),
                "avg_price": category_data['input_prix_produit'].mean() if 'input_prix_produit' in category_data.columns else 0
            })
        
        return {
            "categories": category_details,
            "total_categories": len(categories)
        }
    
    return {
        "categories": [
            {"category_id": "CAT_001", "products_count": 0, "avg_price": 25.5},
            {"category_id": "CAT_002", "products_count": 0, "avg_price": 18.3},
            {"category_id": "CAT_003", "products_count": 0, "avg_price": 32.1}
        ],
        "total_categories": 3
    }

@app.get("/zones")
async def get_zones():
    """Retourne la liste des zones disponibles"""
    return {
        "zones": [
            {"zone_id": "ZONE_001", "name": "Allée Centrale", "type": "principale"},
            {"zone_id": "ZONE_002", "name": "Entrée Magasin", "type": "accueil"},
            {"zone_id": "ZONE_003", "name": "Fond de Magasin", "type": "stockage"},
            {"zone_id": "ZONE_004", "name": "Caisses", "type": "checkout"}
        ],
        "total_zones": 4
    }

@app.post("/planogram/generate")
async def generate_planogram(
    magasin_id: Optional[str] = Form(None),
    categorie_id: Optional[str] = Form(None),
    optimization_level: int = Form(3),
    apply_temperature_constraints: bool = Form(True)
):
    """Génère un planogramme avec les paramètres spécifiés"""
    global pipeline_instance, sample_data
    
    try:
        # Utilisation des données d'exemple si pas de données chargées
        if sample_data is None:
            sample_data = generate_sample_data()
        
        # Filtrage des données
        filtered_data = sample_data.copy()
        
        if magasin_id and 'input_magasin_id' in filtered_data.columns:
            filtered_data = filtered_data[filtered_data['input_magasin_id'] == magasin_id]
        
        if categorie_id and 'input_categorie_id' in filtered_data.columns:
            filtered_data = filtered_data[filtered_data['input_categorie_id'] == categorie_id]
        
        if filtered_data.empty:
            raise HTTPException(status_code=400, detail="Aucune donnée après filtrage")
        
        # Sauvegarde temporaire
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as tmp_file:
            filtered_data.to_csv(tmp_file.name, index=False)
            temp_path = tmp_file.name
        
        try:
            # Initialisation du pipeline
            pipeline_instance = PlanogramAIPipeline(temp_path)
            
            # Génération
            results = pipeline_instance.run_filtered_pipeline(
                filtered_data,
                magasin_id=magasin_id or "MAG_001",
                categorie_id=categorie_id or "CAT_001"
            )
            
            if not results:
                raise HTTPException(status_code=500, detail="Erreur lors de la génération")
            
            # Génération du JSON final
            json_output = pipeline_instance.generate_json_output(
                results,
                magasin_id=magasin_id or "MAG_001",
                categorie_id=categorie_id or "CAT_001"
            )
            
            return {
                "success": True,
                "message": "Planogramme généré avec succès",
                "planogram": json_output,
                "generation_params": {
                    "magasin_id": magasin_id,
                    "categorie_id": categorie_id,
                    "optimization_level": optimization_level,
                    "apply_temperature_constraints": apply_temperature_constraints,
                    "products_processed": len(filtered_data)
                }
            }
        
        finally:
            # Nettoyage du fichier temporaire
            if os.path.exists(temp_path):
                os.unlink(temp_path)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération: {str(e)}")

@app.post("/planogram/upload-and-generate")
async def upload_and_generate(
    file: UploadFile = File(...),
    magasin_id: Optional[str] = Form(None),
    categorie_id: Optional[str] = Form(None),
    optimization_level: int = Form(3)
):
    """Upload un fichier CSV et génère un planogramme"""
    global pipeline_instance
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Le fichier doit être au format CSV")
    
    try:
        # Lecture du fichier uploadé
        contents = await file.read()
        
        # Sauvegarde temporaire
        with tempfile.NamedTemporaryFile(mode='wb', suffix='.csv', delete=False) as tmp_file:
            tmp_file.write(contents)
            temp_path = tmp_file.name
        
        try:
            # Chargement des données
            data = pd.read_csv(temp_path)
            
            # Filtrage
            filtered_data = data.copy()
            
            if magasin_id and 'input_magasin_id' in filtered_data.columns:
                filtered_data = filtered_data[filtered_data['input_magasin_id'] == magasin_id]
            
            if categorie_id and 'input_categorie_id' in filtered_data.columns:
                filtered_data = filtered_data[filtered_data['input_categorie_id'] == categorie_id]
            
            if filtered_data.empty:
                raise HTTPException(status_code=400, detail="Aucune donnée après filtrage")
            
            # Sauvegarde des données filtrées
            filtered_temp_path = temp_path.replace('.csv', '_filtered.csv')
            filtered_data.to_csv(filtered_temp_path, index=False)
            
            # Génération
            pipeline_instance = PlanogramAIPipeline(filtered_temp_path)
            
            results = pipeline_instance.run_filtered_pipeline(
                filtered_data,
                magasin_id=magasin_id or "MAG_001",
                categorie_id=categorie_id or "CAT_001"
            )
            
            if not results:
                raise HTTPException(status_code=500, detail="Erreur lors de la génération")
            
            json_output = pipeline_instance.generate_json_output(
                results,
                magasin_id=magasin_id or "MAG_001",
                categorie_id=categorie_id or "CAT_001"
            )
            
            return {
                "success": True,
                "message": "Fichier uploadé et planogramme généré avec succès",
                "file_info": {
                    "filename": file.filename,
                    "size": len(contents),
                    "rows_processed": len(filtered_data)
                },
                "planogram": json_output
            }
        
        finally:
            # Nettoyage des fichiers temporaires
            for path in [temp_path, temp_path.replace('.csv', '_filtered.csv')]:
                if os.path.exists(path):
                    os.unlink(path)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du traitement: {str(e)}")

@app.get("/planogram/stats")
async def get_planogram_stats():
    """Retourne les statistiques générales du système"""
    global sample_data
    
    if sample_data is None:
        sample_data = generate_sample_data()
    
    stats = {
        "system_info": {
            "version": "1.0.0",
            "supported_furniture_types": len(FURNITURE_TYPES),
            "ml_models": ["XGBoost", "Random Forest"],
            "last_updated": datetime.now().isoformat()
        },
        "data_stats": {
            "total_products": len(sample_data),
            "unique_stores": sample_data['input_magasin_id'].nunique() if 'input_magasin_id' in sample_data.columns else 0,
            "unique_categories": sample_data['input_categorie_id'].nunique() if 'input_categorie_id' in sample_data.columns else 0,
            "avg_product_price": sample_data['input_prix_produit'].mean() if 'input_prix_produit' in sample_data.columns else 0
        },
        "furniture_capabilities": {
            "max_faces_supported": max([info["faces"] for info in FURNITURE_TYPES.values()]),
            "refrigerated_types": [k for k, v in FURNITURE_TYPES.items() if "refrigerat" in v["name"]],
            "clothing_types": [k for k, v in FURNITURE_TYPES.items() if "clothing" in v["name"]]
        }
    }
    
    return stats

@app.get("/health")
async def health_check():
    """Vérification de l'état de l'API"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

if __name__ == "__main__":
    print("🚀 Démarrage de l'API Planogramme IA...")
    print("📖 Documentation disponible sur: http://localhost:8000/docs")
    print("🏠 Page d'accueil: http://localhost:8000")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
