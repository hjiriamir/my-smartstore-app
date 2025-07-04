import pandas as pd
import numpy as np
import sys
import os
from pathlib import Path
import chardet


def diagnose_csv_file(file_path):
    """Diagnostique un fichier CSV"""
    print(f"\n🔍 Diagnostic de {file_path}")
    print("-" * 40)

    if not os.path.exists(file_path):
        print("❌ Fichier non trouvé")
        return False

    # Taille du fichier
    file_size = os.path.getsize(file_path)
    print(f"📏 Taille: {file_size:,} bytes ({file_size / 1024 / 1024:.2f} MB)")

    # Détection d'encodage
    try:
        with open(file_path, 'rb') as f:
            raw_data = f.read(10000)  # Lire les premiers 10KB
            encoding_info = chardet.detect(raw_data)
            print(f"🔤 Encodage détecté: {encoding_info['encoding']} (confiance: {encoding_info['confidence']:.2f})")
    except Exception as e:
        print(f"❌ Erreur détection encodage: {e}")
        return False

    # Tentative de lecture
    encodings_to_try = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1', encoding_info['encoding']]

    for encoding in encodings_to_try:
        if encoding is None:
            continue

        try:
            df = pd.read_csv(file_path, encoding=encoding, nrows=5)
            print(f"✅ Lecture réussie avec {encoding}")
            print(f"📊 Dimensions: {df.shape[0]} lignes × {df.shape[1]} colonnes")

            # Colonnes
            print(f"📋 Premières colonnes: {list(df.columns[:5])}")

            # Caractères spéciaux
            text_columns = df.select_dtypes(include=['object']).columns
            special_chars = set()

            for col in text_columns:
                for value in df[col].astype(str):
                    for char in value:
                        if ord(char) > 127:
                            special_chars.add(char)

            if special_chars:
                print(f"🔤 Caractères spéciaux trouvés: {list(special_chars)[:10]}")
            else:
                print("✅ Pas de caractères spéciaux détectés")

            return True

        except Exception as e:
            print(f"❌ Échec avec {encoding}: {str(e)[:100]}")

    return False


def diagnose_streamlit_issues():
    """Diagnostique les problèmes Streamlit courants"""
    print("\n🔍 Diagnostic Streamlit")
    print("-" * 25)

    # Vérification des imports
    required_packages = [
        'streamlit', 'pandas', 'numpy', 'plotly',
        'sklearn', 'xgboost'
    ]

    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package}")
        except ImportError as e:
            print(f"❌ {package}: {e}")

    # Vérification des fichiers
    required_files = [
        'streamlit_app.py',
        'main_pipeline.py',
        'data/dataset.csv'
    ]

    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path} manquant")


def fix_common_issues():
    """Corrige les problèmes courants"""
    print("\n🔧 Correction des problèmes courants")
    print("-" * 35)

    # Création des dossiers manquants
    folders = ['data', 'outputs', 'logs', 'temp']
    for folder in folders:
        os.makedirs(folder, exist_ok=True)
        print(f"✅ Dossier {folder} créé/vérifié")

    # Génération de données d'exemple si manquantes
    if not os.path.exists('../data/dataset.csv'):
        print("📊 Génération de données d'exemple...")
        try:
            # Import du générateur
            sys.path.append('')
            from data_generator import generate_comprehensive_dataset

            generate_comprehensive_dataset(100, 'data/dataset.csv')
            print("✅ Données d'exemple générées")
        except Exception as e:
            print(f"❌ Erreur génération données: {e}")


def main():
    """Fonction principale de diagnostic"""
    print("🏥 Diagnostic du Système Planogramme IA")
    print("=" * 45)

    # Diagnostic des fichiers CSV
    csv_files = ['data/dataset.csv', 'data/mini_dataset.csv']

    for csv_file in csv_files:
        if os.path.exists(csv_file):
            diagnose_csv_file(csv_file)

    # Diagnostic Streamlit
    diagnose_streamlit_issues()

    # Correction automatique
    fix_common_issues()

    print("\n💡 Recommandations:")
    print("1. Si problème d'encodage: python scripts/fix_encoding.py")
    print("2. Si données manquantes: python scripts/data_generator.py")
    print("3. Si erreur Plotly: vérifier les noms de colonnes")
    print("4. Redémarrer Streamlit après corrections")


if __name__ == "__main__":
    main()
