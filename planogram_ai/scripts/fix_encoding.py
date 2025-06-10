"""
Script pour diagnostiquer et corriger les problèmes d'encodage du dataset
"""

import pandas as pd
import chardet
import os
from pathlib import Path


def detect_encoding(file_path):
    """
    Détecte l'encodage d'un fichier

    Args:
        file_path: Chemin vers le fichier

    Returns:
        str: Encodage détecté
    """
    with open(file_path, 'rb') as file:
        raw_data = file.read()
        result = chardet.detect(raw_data)
        return result['encoding']


def convert_to_utf8(input_file, output_file=None):
    """
    Convertit un fichier CSV vers UTF-8

    Args:
        input_file: Fichier d'entrée
        output_file: Fichier de sortie (optionnel)
    """
    if output_file is None:
        output_file = input_file.replace('.csv', '_utf8.csv')

    # Détecter l'encodage
    detected_encoding = detect_encoding(input_file)
    print(f"Encodage détecté: {detected_encoding}")

    try:
        # Lire avec l'encodage détecté
        df = pd.read_csv(input_file, encoding=detected_encoding)

        # Sauvegarder en UTF-8
        df.to_csv(output_file, encoding='utf-8', index=False)
        print(f"Fichier converti et sauvegardé: {output_file}")

        return output_file
    except Exception as e:
        print(f"Erreur lors de la conversion: {e}")
        return None


def test_multiple_encodings(file_path):
    """
    Teste plusieurs encodages pour lire le fichier

    Args:
        file_path: Chemin vers le fichier
    """
    encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1', 'utf-16']

    for encoding in encodings:
        try:
            df = pd.read_csv(file_path, encoding=encoding)
            print(f"✅ Succès avec l'encodage: {encoding}")
            print(f"   Dimensions: {df.shape}")
            print(f"   Premières colonnes: {list(df.columns[:5])}")
            return encoding, df
        except Exception as e:
            print(f"❌ Échec avec l'encodage {encoding}: {str(e)[:100]}...")

    return None, None


# Chemin vers votre dataset
dataset_path = "data/planogram_dataset.csv"

print("=== Diagnostic d'encodage du dataset ===")
print(f"Fichier: {dataset_path}")

if os.path.exists(dataset_path):
    print("\n1. Détection automatique de l'encodage...")
    detected_encoding = detect_encoding(dataset_path)
    print(f"Encodage détecté: {detected_encoding}")

    print("\n2. Test de différents encodages...")
    working_encoding, df = test_multiple_encodings(dataset_path)

    if working_encoding:
        print(f"\n3. Conversion vers UTF-8...")
        output_file = convert_to_utf8(dataset_path)

        if output_file:
            print(f"\n✅ Solution: Utilisez le fichier {output_file}")
            print("Ou modifiez votre code pour utiliser l'encodage:", working_encoding)
    else:
        print("\n❌ Aucun encodage n'a fonctionné. Le fichier pourrait être corrompu.")
else:
    print(f"❌ Fichier non trouvé: {dataset_path}")
    print("Assurez-vous que le fichier existe dans le bon répertoire.")
