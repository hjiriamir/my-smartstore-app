# SmartPlanogram

Solution IA de Génération Optimisée de Planogrammes pour magasins.

## Description

SmartPlanogram est une application Python pilotée par IA qui génère automatiquement des paramètres optimaux de planogrammes pour magasins, en s'appuyant sur des données historiques et contextuelles (ventes, promotions, stock, saisonnalité, etc.). L'objectif est d'optimiser l'agencement des produits pour maximiser l'efficacité merchandising et la rentabilité.

## Structure du Projet

\`\`\`
SmartPlanogram/
├── data/                  # Dossier pour les données
│   └── planogram_data.csv # Données d'exemple (à fournir)
├── model/                 # Dossier pour les modèles entraînés
│   └── planogram_model.pkl # Modèle sauvegardé
├── main.py                # Script principal
├── data_preparation.py    # Module de préparation des données
├── model.py               # Module d'entraînement et d'évaluation du modèle
├── visualization.py       # Module de visualisation des planogrammes
├── api.py                 # API FastAPI pour le déploiement
├── test_api.py            # Script de test de l'API
└── README.md              # Documentation
\`\`\`

## Installation

1. Cloner le dépôt :
```bash
git clone https://github.com/votre-utilisateur/smartplanogram.git
cd smartplanogram