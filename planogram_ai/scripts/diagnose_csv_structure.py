"""
Script pour diagnostiquer la structure exacte du fichier CSV
"""

import pandas as pd
import csv
import os
from pathlib import Path


def diagnose_csv_file(file_path):
    """
    Diagnostique la structure exacte du fichier CSV
    """
    print("=" * 60)
    print(f"DIAGNOSTIC COMPLET DU FICHIER: {file_path}")
    print("=" * 60)

    if not os.path.exists(file_path):
        print(f"❌ Fichier non trouvé: {file_path}")
        return

    # 1. Lire les premières lignes brutes
    print("\n1. PREMIÈRES LIGNES BRUTES DU FICHIER:")
    print("-" * 40)
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            for i, line in enumerate(f):
                if i < 5:  # Afficher les 5 premières lignes
                    print(f"Ligne {i}: {line.strip()}")
                else:
                    break
    except Exception as e:
        print(f"Erreur lors de la lecture: {e}")

    # 2. Détecter le séparateur
    print("\n2. DÉTECTION DU SÉPARATEUR:")
    print("-" * 40)
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            sample = f.read(1024)
            sniffer = csv.Sniffer()
            delimiter = sniffer.sniff(sample).delimiter
            print(f"Séparateur détecté: '{delimiter}'")
    except Exception as e:
        print(f"Erreur détection séparateur: {e}")
        delimiter = ','

    # 3. Charger avec pandas et analyser
    print("\n3. ANALYSE AVEC PANDAS:")
    print("-" * 40)
    try:
        df = pd.read_csv(file_path, encoding='utf-8', sep=delimiter)
        print(f"Dimensions: {df.shape}")
        print(f"Nombre de colonnes: {len(df.columns)}")

        print("\n4. PREMIÈRES COLONNES ET LEURS VALEURS:")
        print("-" * 40)
        for i, col in enumerate(df.columns[:10]):
            print(f"Colonne {i}: '{col}'")
            sample_values = df[col].head(3).tolist()
            print(f"  Valeurs: {sample_values}")
            print()

        # 5. Rechercher les colonnes qui contiennent des IDs de produits
        print("\n5. RECHERCHE DES VRAIES COLONNES PRODUIT:")
        print("-" * 40)

        for col in df.columns:
            sample_values = df[col].head(5).astype(str).tolist()

            # Vérifier si ça ressemble à des IDs de produits
            if any(val.startswith(('P', 'PROD', 'ID')) or val.isdigit() for val in sample_values if val != 'nan'):
                print(f"🔍 Colonne '{col}' pourrait contenir des IDs:")
                print(f"   Valeurs: {sample_values}")

            # Vérifier si ça ressemble à des noms de produits courts
            elif any(len(str(val)) < 50 and len(str(val)) > 3 and not str(val).replace('.', '').isdigit() for val in
                     sample_values if val != 'nan'):
                print(f"🔍 Colonne '{col}' pourrait contenir des noms:")
                print(f"   Valeurs: {sample_values}")

        # 6. Analyser spécifiquement les colonnes problématiques
        print("\n6. ANALYSE DES COLONNES SPÉCIFIQUES:")
        print("-" * 40)

        target_columns = ['input_produit_id', 'input_nom_produit', 'input_description_produit']
        for col in target_columns:
            if col in df.columns:
                print(f"Colonne '{col}':")
                values = df[col].head(5).tolist()
                print(f"  Valeurs: {values}")
                print(f"  Type: {df[col].dtype}")
                print(f"  Valeurs uniques (5 premières): {df[col].unique()[:5]}")
                print()

        # 7. Proposer une correction
        print("\n7. PROPOSITION DE CORRECTION:")
        print("-" * 40)

        # Essayer de détecter si les colonnes sont inversées
        if 'input_produit_id' in df.columns and 'input_nom_produit' in df.columns:
            id_values = df['input_produit_id'].head(3).astype(str).tolist()
            name_values = df['input_nom_produit'].head(3).astype(str).tolist()

            print("Analyse des valeurs actuelles:")
            print(f"input_produit_id: {id_values}")
            print(f"input_nom_produit: {name_values}")

            # Vérifier si les valeurs semblent inversées
            id_looks_like_names = any(len(val) > 10 and not val.isdigit() for val in id_values)
            name_looks_like_descriptions = any(len(val) > 30 for val in name_values)

            if id_looks_like_names:
                print("⚠️  Les IDs ressemblent à des noms de produits")
            if name_looks_like_descriptions:
                print("⚠️  Les noms ressemblent à des descriptions")

            # Chercher la vraie colonne d'ID
            for col in df.columns:
                sample = df[col].head(5).astype(str).tolist()
                if any(val.startswith(('P', 'PROD')) or (val.isdigit() and len(val) < 10) for val in sample):
                    print(f"✅ Vraie colonne ID trouvée: '{col}'")
                    print(f"   Valeurs: {sample}")

        return df

    except Exception as e:
        print(f"Erreur lors de l'analyse pandas: {e}")
        return None


# Chemins possibles pour le dataset
possible_paths = [
    "data/planogram_dataset.csv",
    "planogram_dataset.csv",
    "dataset.csv",
    "data/dataset.csv"
]

print("DIAGNOSTIC DU FICHIER CSV")
print("=" * 60)

# Chercher le fichier
dataset_path = None
for path in possible_paths:
    if os.path.exists(path):
        dataset_path = path
        break

if dataset_path:
    df = diagnose_csv_file(dataset_path)

    if df is not None:
        print("\n" + "=" * 60)
        print("RÉSUMÉ ET RECOMMANDATIONS")
        print("=" * 60)

        # Générer un fichier de correction si nécessaire
        print("\nGénération d'un fichier de correction...")

        # Créer une version corrigée du dataset
        corrected_df = df.copy()

        # Si les colonnes semblent inversées, les corriger
        if 'input_produit_id' in df.columns and 'input_nom_produit' in df.columns:
            id_values = df['input_produit_id'].head(3).astype(str).tolist()

            # Si les IDs ressemblent à des noms, chercher la vraie colonne d'ID
            if any(len(val) > 10 for val in id_values):
                print("Tentative de correction automatique...")

                # Chercher une colonne qui ressemble à des vrais IDs
                for col in df.columns:
                    sample = df[col].head(5).astype(str).tolist()
                    if any(val.startswith(('P', 'PROD')) or (val.isdigit() and len(val) < 10) for val in sample if
                           val != 'nan'):
                        print(f"Utilisation de '{col}' comme vraie colonne ID")
                        corrected_df['input_produit_id'] = df[col]
                        break

                # Utiliser input_produit_id original comme nom si c'est plus court
                if 'input_nom_produit' in df.columns:
                    # Si le nom actuel est trop long (description), utiliser l'ancien ID comme nom
                    name_values = df['input_nom_produit'].astype(str)
                    if name_values.str.len().mean() > 30:  # Si les noms sont trop longs
                        corrected_df['input_nom_produit'] = df['input_produit_id']

        # Sauvegarder le fichier corrigé
        output_path = dataset_path.replace('.csv', '_corrected.csv')
        corrected_df.to_csv(output_path, index=False, encoding='utf-8')
        print(f"✅ Fichier corrigé sauvegardé: {output_path}")

        print(f"\n📋 POUR UTILISER LE FICHIER CORRIGÉ:")
        print(f"Modifiez config.py pour utiliser: {output_path}")

else:
    print(f"❌ Aucun fichier CSV trouvé dans: {possible_paths}")
