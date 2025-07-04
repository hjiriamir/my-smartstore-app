import pandas as pd
import chardet
import os
from pathlib import Path
import requests


def download_and_fix_csv(url, output_file="data/dataset_fixed.csv"):
    """Télécharge et corrige un fichier CSV depuis une URL"""
    print(f"📥 Téléchargement du fichier depuis: {url}")

    try:
        # Téléchargement du fichier
        response = requests.get(url)
        response.raise_for_status()

        # Sauvegarde temporaire
        temp_file = "temp_download.csv"
        with open(temp_file, 'wb') as f:
            f.write(response.content)

        print(f"✅ Fichier téléchargé: {len(response.content)} bytes")

        # Diagnostic et correction
        return fix_csv_file(temp_file, output_file)

    except Exception as e:
        print(f"❌ Erreur lors du téléchargement: {e}")
        return False
    finally:
        # Nettoyage
        if os.path.exists("temp_download.csv"):
            os.remove("temp_download.csv")


def detect_encoding(file_path):
    """Détecte l'encodage d'un fichier"""
    try:
        with open(file_path, 'rb') as file:
            raw_data = file.read(10000)  # Lire les premiers 10KB
            result = chardet.detect(raw_data)
            return result['encoding'], result['confidence']
    except Exception as e:
        print(f"❌ Erreur détection encodage: {e}")
        return None, 0


def analyze_csv_structure(file_path):
    """Analyse la structure du fichier CSV"""
    print(f"\n🔍 Analyse de la structure: {file_path}")

    # Taille du fichier
    file_size = os.path.getsize(file_path)
    print(f"📏 Taille: {file_size:,} bytes ({file_size / 1024 / 1024:.2f} MB)")

    # Lecture des premières lignes en mode binaire
    with open(file_path, 'rb') as f:
        first_lines = []
        for i in range(5):
            line = f.readline()
            if not line:
                break
            first_lines.append(line)

    print(f"📋 Premières lignes (binaire):")
    for i, line in enumerate(first_lines):
        print(f"  Ligne {i + 1}: {line[:100]}...")

    # Détection de l'encodage
    encoding, confidence = detect_encoding(file_path)
    print(f"🔤 Encodage détecté: {encoding} (confiance: {confidence:.2f})")

    return encoding, confidence


def fix_csv_file(input_file, output_file):
    """Corrige un fichier CSV problématique"""
    print(f"\n🔧 Correction du fichier CSV...")

    # Analyse de la structure
    encoding, confidence = analyze_csv_structure(input_file)

    if not encoding:
        print("❌ Impossible de détecter l'encodage")
        return False

    # Essai de lecture avec différents paramètres
    read_params = [
        {'encoding': encoding, 'sep': ','},
        {'encoding': encoding, 'sep': ';'},
        {'encoding': encoding, 'sep': '\t'},
        {'encoding': 'utf-8', 'sep': ','},
        {'encoding': 'latin-1', 'sep': ','},
        {'encoding': 'cp1252', 'sep': ','},
        {'encoding': 'iso-8859-1', 'sep': ','},
    ]

    df = None
    successful_params = None

    for params in read_params:
        try:
            print(f"🔄 Essai avec: {params}")
            df = pd.read_csv(input_file, **params, low_memory=False)

            if not df.empty and len(df.columns) > 1:
                successful_params = params
                print(f"✅ Lecture réussie!")
                print(f"📊 Dimensions: {df.shape[0]} lignes × {df.shape[1]} colonnes")
                print(f"📋 Colonnes: {list(df.columns[:5])}...")
                break

        except Exception as e:
            print(f"❌ Échec: {str(e)[:100]}")
            continue

    if df is None or df.empty:
        print("❌ Impossible de lire le fichier CSV")
        return False

    # Nettoyage des données
    print(f"\n🧹 Nettoyage des données...")

    # Suppression des colonnes entièrement vides
    df = df.dropna(axis=1, how='all')

    # Suppression des lignes entièrement vides
    df = df.dropna(axis=0, how='all')

    # Nettoyage des noms de colonnes
    df.columns = df.columns.str.strip()
    df.columns = df.columns.str.replace('\n', ' ')
    df.columns = df.columns.str.replace('\r', ' ')

    # Nettoyage des valeurs textuelles
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = df[col].astype(str).str.strip()
        df[col] = df[col].str.replace('\n', ' ')
        df[col] = df[col].str.replace('\r', ' ')
        # Remplacer 'nan' par NaN réel
        df[col] = df[col].replace('nan', pd.NA)

    print(f"✅ Données nettoyées: {df.shape[0]} lignes × {df.shape[1]} colonnes")

    # Sauvegarde du fichier corrigé
    try:
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        df.to_csv(output_file, index=False, encoding='utf-8')
        print(f"✅ Fichier corrigé sauvegardé: {output_file}")

        # Vérification de la sauvegarde
        test_df = pd.read_csv(output_file)
        print(f"✅ Vérification: {test_df.shape[0]} lignes × {test_df.shape[1]} colonnes")

        return True

    except Exception as e:
        print(f"❌ Erreur lors de la sauvegarde: {e}")
        return False


def generate_sample_data_if_needed():
    """Génère des données d'exemple si le fichier ne peut pas être corrigé"""
    print(f"\n🔄 Génération de données d'exemple...")

    import numpy as np
    np.random.seed(42)
    n_samples = 200

    data = {
        'input_produit_id': [f'PROD_{i:04d}' for i in range(1, n_samples + 1)],
        'input_nom_produit': [f'Produit {i}' for i in range(1, n_samples + 1)],
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

    df = pd.DataFrame(data)

    output_file = "data/dataset.csv"
    os.makedirs("data", exist_ok=True)
    df.to_csv(output_file, index=False, encoding='utf-8')

    print(f"✅ Données d'exemple générées: {output_file}")
    print(f"📊 {len(df)} lignes × {len(df.columns)} colonnes")

    return True


if __name__ == "__main__":
    print("🔧 Correcteur de Fichier CSV - Planogramme IA")
    print("=" * 50)

    # URL du fichier
    csv_url = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dataset-DSFrCHFbbjo4u7X6CV8nIrAHJlud6L.csv"

    # Tentative de téléchargement et correction
    success = download_and_fix_csv(csv_url, "data/dataset.csv")

    if not success:
        print("\n⚠️ Impossible de corriger le fichier original")
        print("🔄 Génération de données d'exemple à la place...")
        generate_sample_data_if_needed()

    print("\n✅ Processus terminé!")
    print("📁 Fichier disponible: data/dataset.csv")
    print("🚀 Vous pouvez maintenant lancer: streamlit run streamlit_app.py")

