"""
Script pour analyser la structure du dataset et identifier les colonnes disponibles
"""

import pandas as pd
import sys
import os

# Ajouter le répertoire parent au chemin de recherche des modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import DATASET_PATH


def analyze_dataset():
    """
    Analyse la structure du dataset et affiche les informations
    """
    print("=== Analyse du Dataset ===")
    print(f"Fichier: {DATASET_PATH}")

    try:
        # Essayer différents encodages
        encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
        df = None

        for encoding in encodings:
            try:
                df = pd.read_csv(DATASET_PATH, encoding=encoding)
                print(f"✅ Dataset chargé avec l'encodage: {encoding}")
                break
            except Exception as e:
                print(f"❌ Échec avec l'encodage {encoding}: {str(e)[:100]}...")
                continue

        if df is None:
            print("❌ Impossible de charger le dataset avec les encodages testés")
            return

        print(f"\n📊 Informations générales:")
        print(f"   Dimensions: {df.shape}")
        print(f"   Nombre de colonnes: {len(df.columns)}")
        print(f"   Nombre de lignes: {len(df)}")

        print(f"\n📋 Liste complète des colonnes:")
        for i, col in enumerate(df.columns, 1):
            print(f"   {i:2d}. {col}")

        print(f"\n🔍 Recherche de colonnes similaires:")

        # Rechercher les colonnes liées aux magasins
        magasin_cols = [col for col in df.columns if 'magasin' in col.lower()]
        print(f"   Colonnes magasin: {magasin_cols}")

        # Rechercher les colonnes liées aux catégories
        categorie_cols = [col for col in df.columns if 'categorie' in col.lower()]
        print(f"   Colonnes catégorie: {categorie_cols}")

        # Rechercher les colonnes liées aux produits
        produit_cols = [col for col in df.columns if 'produit' in col.lower()]
        print(f"   Colonnes produit: {produit_cols}")

        # Rechercher les colonnes de sortie
        output_cols = [col for col in df.columns if 'output' in col.lower()]
        print(f"   Colonnes output: {output_cols}")

        print(f"\n📈 Aperçu des données:")
        print(df.head())

        print(f"\n📊 Types de données:")
        print(df.dtypes)

        print(f"\n🔢 Valeurs uniques pour les colonnes clés:")
        for col in magasin_cols[:2]:  # Afficher les 2 premières colonnes magasin
            if col in df.columns:
                unique_count = df[col].nunique()
                print(f"   {col}: {unique_count} valeurs uniques")
                if unique_count < 20:
                    print(f"      Valeurs: {df[col].unique()[:10]}")

        return df

    except Exception as e:
        print(f"❌ Erreur lors de l'analyse: {e}")
        return None


if __name__ == "__main__":
    analyze_dataset()
