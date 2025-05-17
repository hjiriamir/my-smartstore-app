import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.metrics import mean_squared_error, r2_score
import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

# Import des modules personnalisés
from data_preparation import load_and_clean_data, calculate_product_score
from model import train_model, evaluate_model
from visualization import visualize_planogram
from api import place_products  # Import de la fonction de placement des produits


def main():
    # 1. Chargement et préparation des données
    print("Chargement et préparation des données...")
    try:
        data = load_and_clean_data('data/planogram_data.csv')
        data = calculate_product_score(data)
        print("Données préparées avec succès.")
    except Exception as e:
        print(f"Erreur lors de la préparation des données: {e}")
        return

    # 2. Entraînement du modèle
    print("Entraînement du modèle...")
    X = data[['surface_magasin_m2', 'promo_en_cours', 'ventes_moyennes',
              'stock_moyen', 'prev_demande', 'score_priorite']]
    y = data[['dimension_longueur_planogramme', 'dimension_largeur_planogramme',
              'nb_etageres', 'nb_colonnes']]

    # Normalisation des données
    from sklearn.preprocessing import StandardScaler
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
    model = train_model(X_train, y_train)

    # 3. Évaluation du modèle
    print("Évaluation du modèle...")
    metrics = evaluate_model(model, X_test, y_test)
    print(f"Métriques d'évaluation: {metrics}")

    # 4. Sauvegarde du modèle et du scaler
    print("Sauvegarde du modèle...")
    joblib.dump(model, 'model/planogram_model.pkl')
    joblib.dump(scaler, 'model/scaler.pkl')
    print("Modèle sauvegardé avec succès.")

    # 5. Visualisation d'un exemple de planogramme
    print("Génération d'un exemple de planogramme...")
    sample_idx = 0
    sample_data = X_test[sample_idx].reshape(1, -1)
    predicted_params = model.predict(sample_data)[0]

    planogram_params = {
        'longueur': predicted_params[0],
        'largeur': predicted_params[1],
        'nb_etageres': max(1, int(round(predicted_params[2]))),
        'nb_colonnes': max(1, int(round(predicted_params[3])))
    }

    # Échantillonnage sécurisé
    nb_produits = planogram_params['nb_etageres'] * planogram_params['nb_colonnes']
    nb_produits = min(nb_produits, len(data))
    products = data.sample(nb_produits, replace=True if nb_produits > len(data) else False)

    # Création des placements de produits
    product_placements = []
    for idx, (_, product) in enumerate(products.iterrows()):
        # Calcul de la position (simple placement linéaire pour l'exemple)
        position_etagere = (idx // planogram_params['nb_colonnes']) + 1
        position_colonne = (idx % planogram_params['nb_colonnes']) + 1

        product_placements.append({
            'produit_id': product['produit_id'],
            'position_etagere': position_etagere,
            'position_colonne': position_colonne,
            'score': product['score_priorite']
        })

    # OU utiliser la fonction de placement plus sophistiquée de l'API
    # (vous devrez peut-être adapter les paramètres)
    try:
        from api import place_products
        product_placements = place_products(
            products,
            planogram_params['nb_etageres'],
            planogram_params['nb_colonnes'],
            rules=[],  # Liste des règles de placement
            total_height=planogram_params['largeur']
        )
    except ImportError:
        print("Utilisation du placement simplifié car la fonction place_products n'est pas disponible")

    # Visualisation du planogramme
    visualize_planogram(planogram_params, products, product_placements)
    print("Exemple de planogramme généré avec succès.")


if __name__ == "__main__":
    main()