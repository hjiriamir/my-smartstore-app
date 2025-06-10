"""
Configuration du système de planogramme IA
"""

import os
from pathlib import Path

# Chemins des fichiers
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"

# Chercher le fichier CSV dans différents emplacements possibles
possible_paths = [
    DATA_DIR / "planogram_dataset.csv",
    BASE_DIR / "planogram_dataset.csv",
    Path("planogram_dataset.csv"),
    Path("data/planogram_dataset.csv"),
    Path(r"C:\Users\Dell\Desktop\Smart-Store\SmartStore-IA\Dataset\dataset.csv"),
    Path("data/dataset.csv")
]

DATASET_PATH = None
for path in possible_paths:
    if path.exists():
        DATASET_PATH = str(path)
        break

if DATASET_PATH is None:
    # Si aucun fichier n'est trouvé, utiliser le chemin par défaut
    DATASET_PATH = str(DATA_DIR / "planogram_dataset.csv")
    print(f"⚠️  Aucun dataset trouvé. Chemin par défaut: {DATASET_PATH}")
else:
    print(f"✅ Dataset trouvé: {DATASET_PATH}")

MODELS_DIR = BASE_DIR / "models"
OUTPUT_DIR = BASE_DIR / "outputs"

# Assurez-vous que les répertoires existent
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Configuration des modèles
MODEL_CONFIG = {
    "dimensions": {
        "algorithm": "xgboost",
        "params": {
            "n_estimators": 100,
            "learning_rate": 0.1,
            "max_depth": 6
        }
    },
    "positions": {
        "algorithm": "random_forest",
        "params": {
            "n_estimators": 100,
            "max_depth": 10,
            "min_samples_split": 5
        }
    }
}

# Configuration de l'interface utilisateur
UI_CONFIG = {
    "title": "Système de Génération de Planogrammes IA",
    "theme": "light",
    "sidebar_width": 300
}
