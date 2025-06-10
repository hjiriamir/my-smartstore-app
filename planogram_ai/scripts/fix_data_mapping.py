"""
Script pour corriger le mapping des données dans le dataset
"""

import pandas as pd
import os
import re


def fix_data_mapping(input_file, output_file=None):
    """
    Corrige le mapping des données dans le dataset
    """
    if output_file is None:
        output_file = input_file.replace('.csv', '_fixed.csv')

    print(f"Correction du fichier: {input_file}")

    try:
        # Charger le dataset
        df = pd.read_csv(input_file, encoding='utf-8')
        print(f"Dataset chargé: {df.shape}")

        # Analyser et corriger les colonnes produit
        if 'input_produit_id' in df.columns and 'input_nom_produit' in df.columns:

            print("\nAnalyse des colonnes produit...")

            # Vérifier le contenu actuel
            sample_ids = df['input_produit_id'].head(5).astype(str).tolist()
            sample_names = df['input_nom_produit'].head(5).astype(str).tolist()

            print(f"IDs actuels: {sample_ids}")
            print(f"Noms actuels: {sample_names}")

            # Détecter si les données sont inversées
            ids_look_like_names = any(len(str(val)) > 15 and not str(val).isdigit() for val in sample_ids)
            names_look_like_descriptions = any(len(str(val)) > 50 for val in sample_names)

            if ids_look_like_names:
                print("⚠️  Détection: Les IDs ressemblent à des noms")

                # Générer de vrais IDs basés sur les noms actuels
                def generate_product_id(name):
                    if pd.isna(name):
                        return f"P{hash('unknown') % 10000:04d}"

                    name_str = str(name)
                    # Extraire les premières lettres des mots
                    words = re.findall(r'\b\w+', name_str)
                    if words:
                        prefix = ''.join(word[0].upper() for word in words[:2])
                        if len(prefix) < 2:
                            prefix = name_str[:2].upper()
                    else:
                        prefix = "PR"

                    # Ajouter un numéro basé sur le hash
                    number = hash(name_str) % 1000
                    return f"P{prefix}{number:03d}"

                # Créer de nouveaux IDs
                new_ids = df['input_produit_id'].apply(generate_product_id)

                # Utiliser les anciens IDs comme noms (s'ils sont plus courts que les noms actuels)
                if names_look_like_descriptions:
                    print("⚠️  Détection: Les noms ressemblent à des descriptions")
                    # Utiliser les anciens IDs comme noms
                    df['input_nom_produit'] = df['input_produit_id']

                # Assigner les nouveaux IDs
                df['input_produit_id'] = new_ids

                print("✅ Correction appliquée")

            # Vérifier et corriger les descriptions si nécessaire
            if 'input_description_produit' in df.columns:
                # Si les descriptions sont vides et que les noms sont longs, inverser
                empty_descriptions = df['input_description_produit'].isna().sum()
                if empty_descriptions > len(df) * 0.8:  # Si plus de 80% sont vides
                    print("⚠️  Descriptions vides détectées")
                    # Utiliser les noms actuels comme descriptions si ils sont longs
                    long_names = df['input_nom_produit'].astype(str).str.len() > 30
                    if long_names.any():
                        df.loc[long_names, 'input_description_produit'] = df.loc[long_names, 'input_nom_produit']
                        # Créer des noms plus courts
                        df.loc[long_names, 'input_nom_produit'] = df.loc[long_names, 'input_nom_produit'].astype(
                            str).str[:20] + "..."

        # Sauvegarder le fichier corrigé
        df.to_csv(output_file, index=False, encoding='utf-8')
        print(f"✅ Fichier corrigé sauvegardé: {output_file}")

        # Afficher un échantillon du résultat
        print("\nÉchantillon du fichier corrigé:")
        sample_cols = ['input_produit_id', 'input_nom_produit']
        if 'input_description_produit' in df.columns:
            sample_cols.append('input_description_produit')

        print(df[sample_cols].head())

        return output_file

    except Exception as e:
        print(f"❌ Erreur lors de la correction: {e}")
        return None


# Chemins possibles pour le dataset
possible_paths = [
    "data/planogram_dataset.csv",
    "planogram_dataset.csv",
    "dataset.csv",
    "data/dataset.csv"
]

print("CORRECTION DU MAPPING DES DONNÉES")
print("=" * 50)

# Chercher le fichier
dataset_path = None
for path in possible_paths:
    if os.path.exists(path):
        dataset_path = path
        break

if dataset_path:
    fixed_file = fix_data_mapping(dataset_path)
    if fixed_file:
        print(f"\n✅ SUCCÈS!")
        print(f"Fichier original: {dataset_path}")
        print(f"Fichier corrigé: {fixed_file}")
        print(f"\n📋 POUR UTILISER LE FICHIER CORRIGÉ:")
        print(f"Modifiez config.py pour pointer vers: {fixed_file}")
else:
    print(f"❌ Aucun fichier trouvé dans: {possible_paths}")
