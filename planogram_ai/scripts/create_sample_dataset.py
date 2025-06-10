"""
Script pour créer un dataset d'exemple avec l'encodage correct
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os


def create_sample_dataset():
    """
    Crée un dataset d'exemple avec toutes les colonnes requises
    """
    np.random.seed(42)

    # Nombre d'enregistrements à générer
    n_records = 1000

    # Générer des données d'exemple
    data = {
        # Colonnes produits
        'input_produit_id': [f"PROD_{i:04d}" for i in range(1, n_records + 1)],
        'input_nom_produit': [f"Produit {i}" for i in range(1, n_records + 1)],
        'input_description_produit': [f"Description du produit {i}" for i in range(1, n_records + 1)],
        'input_prix_produit': np.random.uniform(1.0, 100.0, n_records),
        'input_categorie_id': np.random.randint(1, 21, n_records),
        'input_longueur_produit': np.random.uniform(5.0, 30.0, n_records),
        'input_largeur_produit': np.random.uniform(5.0, 20.0, n_records),
        'input_hauteur_produit': np.random.uniform(10.0, 25.0, n_records),
        'input_saisonnalite_produit': np.random.choice(['ete', 'hiver', 'toute_annee'], n_records),
        'input_priorite_merchandising': np.random.randint(1, 11, n_records),
        'input_contrainte_temperature_produit': np.random.choice(['froid', 'chaud', 'ambiante'], n_records),
        'input_contrainte_conditionnement_produit': np.random.choice(['fragile', 'normal', 'resistant'], n_records),
        'input_conditionnement_produit': np.random.choice(['carton', 'plastique', 'verre'], n_records),

        # Colonnes catégories
        'input_nom_categorie': [f"Categorie {(i % 20) + 1}" for i in range(n_records)],
        'input_parent_id_categorie': np.random.choice([None] + list(range(1, 11)), n_records),
        'input_saisonnalite_categorie': np.random.choice(['ete', 'hiver', 'toute_annee'], n_records),
        'input_priorite_categorie': np.random.randint(1, 11, n_records),
        'input_zone_exposition_preferee_categorie': np.random.choice(['entree', 'centre', 'fond'], n_records),
        'input_temperature_exposition_categorie': np.random.choice(['froid', 'chaud', 'ambiante'], n_records),
        'input_clientele_ciblee_categorie': np.random.choice(['enfants', 'adultes', 'seniors'], n_records),

        # Colonnes magasins
        'input_magasin_id': np.random.randint(1, 6, n_records),
        'input_nom_magasin_magasin': [f"Magasin {(i % 5) + 1}" for i in range(n_records)],
        'input_surface_magasin': np.random.uniform(100.0, 1000.0, n_records),
        'input_longueur_magasin': np.random.uniform(20.0, 50.0, n_records),
        'input_largeur_magasin': np.random.uniform(15.0, 40.0, n_records),
        'input_adresse_magasin': [f"Adresse {i}" for i in range(1, n_records + 1)],

        # Colonnes zones
        'input_zone_id': np.random.randint(1, 11, n_records),
        'input_nom_zone': [f"Zone {(i % 10) + 1}" for i in range(n_records)],
        'input_description_zone': [f"Description zone {i}" for i in range(1, n_records + 1)],
        'input_emplacement_zone': np.random.choice(['entree', 'centre', 'fond', 'gauche', 'droite'], n_records),
        'input_longueur_zone': np.random.uniform(5.0, 20.0, n_records),
        'input_largeur_zone': np.random.uniform(3.0, 15.0, n_records),
        'input_hauteur_zone': np.random.uniform(2.0, 4.0, n_records),
        'input_temperature_zone': np.random.uniform(15.0, 25.0, n_records),
        'input_eclairage_zone': np.random.choice(['faible', 'moyen', 'fort'], n_records),

        # Colonnes stock et ventes
        'input_quantite_stock': np.random.randint(0, 1000, n_records),
        'input_date_maj_stock': [datetime.now() - timedelta(days=np.random.randint(0, 30)) for _ in range(n_records)],
        'input_quantite_vente': np.random.randint(0, 100, n_records),
        'input_prix_unitaire_vente': np.random.uniform(1.0, 100.0, n_records),
        'input_montant_total_vente': np.random.uniform(10.0, 1000.0, n_records),
        'input_date_vente': [datetime.now() - timedelta(days=np.random.randint(0, 365)) for _ in range(n_records)],

        # Colonnes promotions
        'input_promotion_id': np.random.choice([None] + [f"PROMO_{i}" for i in range(1, 21)], n_records),
        'input_nom_promotion': [f"Promotion {i}" if i % 5 == 0 else None for i in range(n_records)],
        'input_description_promotion': [f"Description promo {i}" if i % 5 == 0 else None for i in range(n_records)],
        'input_date_debut_promotion': [datetime.now() - timedelta(days=np.random.randint(0, 30)) if i % 5 == 0 else None
                                       for i in range(n_records)],
        'input_date_fin_promotion': [datetime.now() + timedelta(days=np.random.randint(0, 30)) if i % 5 == 0 else None
                                     for i in range(n_records)],
        'input_type_promotion': np.random.choice([None, 'reduction', 'offre_speciale', '2_pour_1'], n_records),
        'input_etat_promotion': np.random.choice([None, 'active', 'inactive', 'planifiee'], n_records),
        'input_conditions_promotion': [f"Conditions {i}" if i % 5 == 0 else None for i in range(n_records)],

        # Colonnes conversion et événements
        'input_date_conversionZone': [datetime.now() - timedelta(days=np.random.randint(0, 30)) for _ in
                                      range(n_records)],
        'input_visiteurs_conversionZone': np.random.randint(10, 1000, n_records),
        'input_acheteurs_conversionZone': np.random.randint(1, 100, n_records),
        'input_taux_conversion': np.random.uniform(0.01, 0.3, n_records),

        # Colonnes mouvements
        'input_mouvement_id': [f"MOV_{i:04d}" for i in range(1, n_records + 1)],
        'input_date_mouvementinput_type_mouvement': np.random.choice(['entree', 'sortie', 'transfert'], n_records),
        'input_quantite_mouvement': np.random.randint(1, 100, n_records),
        'input_cout_unitaire_mouvement': np.random.uniform(0.5, 50.0, n_records),
        'input_valeur_mouvement': np.random.uniform(10.0, 500.0, n_records),

        # Colonnes légales
        'input_id_legal': np.random.choice([None] + [f"LEG_{i}" for i in range(1, 11)], n_records),
        'input_description_legal': [f"Contrainte legale {i}" if i % 10 == 0 else None for i in range(n_records)],
        'input_type_contrainte_legal': np.random.choice([None, 'age', 'alcool', 'medicament'], n_records),
        'input_conditions_legal': [f"Conditions legales {i}" if i % 10 == 0 else None for i in range(n_records)],
        'input_date_debut_legal': [datetime.now() - timedelta(days=np.random.randint(0, 365)) if i % 10 == 0 else None
                                   for i in range(n_records)],
        'input_date_fin_legal': [datetime.now() + timedelta(days=np.random.randint(0, 365)) if i % 10 == 0 else None for
                                 i in range(n_records)],

        # Colonnes événements
        'input_id_event': np.random.choice([None] + [f"EVT_{i}" for i in range(1, 11)], n_records),
        'input_nom_event': [f"Evenement {i}" if i % 8 == 0 else None for i in range(n_records)],
        'input_type_event': np.random.choice([None, 'soldes', 'fete', 'lancement'], n_records),
        'input_date_debut_event': [datetime.now() - timedelta(days=np.random.randint(0, 30)) if i % 8 == 0 else None for
                                   i in range(n_records)],
        'input_date_fin_event': [datetime.now() + timedelta(days=np.random.randint(0, 30)) if i % 8 == 0 else None for i
                                 in range(n_records)],
        'input_description_event': [f"Description evenement {i}" if i % 8 == 0 else None for i in range(n_records)],

        # Colonnes fournisseurs
        'input_id_supplier': np.random.choice([None] + [f"SUP_{i}" for i in range(1, 11)], n_records),
        'input_placement_exige_supplier': np.random.choice([None, 'oui', 'non'], n_records),
        'input_espace_minimum_supplier': np.random.uniform(1.0, 10.0, n_records),
        'input_date_debut_supplier': [datetime.now() - timedelta(days=np.random.randint(0, 365)) if i % 7 == 0 else None
                                      for i in range(n_records)],
        'input_date_fin_supplier': [datetime.now() + timedelta(days=np.random.randint(0, 365)) if i % 7 == 0 else None
                                    for i in range(n_records)],

        # Colonnes heatmap
        'input_id_heatmap': [f"HEAT_{i:04d}" for i in range(1, n_records + 1)],
        'input_date_heatmap': [datetime.now() - timedelta(days=np.random.randint(0, 30)) for _ in range(n_records)],
        'input_visiteurs_heatmap': np.random.randint(10, 500, n_records),
        'input_duree_moyenne_heatmap': np.random.uniform(1.0, 30.0, n_records),
        'input_intensite_heatmap': np.random.uniform(0.1, 1.0, n_records),

        # Colonnes de sortie (planogramme)
        'output_id_planogramme': [f"PLAN_{i:04d}" for i in range(1, n_records + 1)],
        'output_type_planogramme': np.random.choice(['standard', 'promotionnel', 'saisonnier'], n_records),
        'output_largeur_planogramme': np.random.uniform(100.0, 200.0, n_records),
        'output_hauteur_planogramme': np.random.uniform(180.0, 250.0, n_records),
        'output_nb_etageres_planogramme': np.random.randint(3, 7, n_records),
        'output_nb_colonnes_planogramme': np.random.randint(4, 10, n_records),
        'output_position_prod_etagere': np.random.randint(0, 6, n_records),
        'output_position_prod_colonne': np.random.randint(0, 9, n_records)
    }

    # Créer le DataFrame
    df = pd.DataFrame(data)

    # Créer le répertoire data s'il n'existe pas
    os.makedirs('data', exist_ok=True)

    # Sauvegarder en UTF-8
    output_path = 'data/planogram_dataset.csv'
    df.to_csv(output_path, encoding='utf-8', index=False)

    print(f"Dataset d'exemple créé: {output_path}")
    print(f"Dimensions: {df.shape}")
    print(f"Colonnes: {len(df.columns)}")
    print("Encodage: UTF-8")

    return output_path


# Créer le dataset d'exemple
if __name__ == "__main__":
    create_sample_dataset()
