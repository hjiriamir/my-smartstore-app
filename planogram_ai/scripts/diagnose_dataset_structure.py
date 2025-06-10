"""
Script de diagnostic pour analyser la structure complète du dataset
et identifier les vraies colonnes pour les produits
"""

import pandas as pd
import numpy as np
from config import DATASET_PATH


def analyze_dataset_structure():
    """
    Analyse complète de la structure du dataset pour identifier les vraies colonnes
    """
    print("🔍 DIAGNOSTIC COMPLET DU DATASET")
    print("=" * 50)

    # Charger le dataset
    try:
        # Détecter le séparateur
        with open(DATASET_PATH, 'r', encoding='utf-8', errors='ignore') as file:
            first_line = file.readline()

        separators = [',', ';', '\t', '|']
        separator_counts = {sep: first_line.count(sep) for sep in separators}
        separator = max(separator_counts, key=separator_counts.get)

        print(f"📁 Chargement du dataset: {DATASET_PATH}")
        print(f"🔧 Séparateur détecté: '{separator}'")

        # Charger avec différents encodages
        try:
            data = pd.read_csv(DATASET_PATH, encoding='utf-8', sep=separator)
        except UnicodeDecodeError:
            try:
                data = pd.read_csv(DATASET_PATH, encoding='latin-1', sep=separator)
            except UnicodeDecodeError:
                data = pd.read_csv(DATASET_PATH, encoding='cp1252', sep=separator)

        print(f"📊 Dimensions du dataset: {data.shape}")
        print(f"📋 Nombre de colonnes: {len(data.columns)}")

    except Exception as e:
        print(f"❌ Erreur lors du chargement: {e}")
        return

    print("\n" + "=" * 50)
    print("📋 LISTE COMPLÈTE DES COLONNES")
    print("=" * 50)

    for i, col in enumerate(data.columns, 1):
        print(f"{i:2d}. {col}")

    print("\n" + "=" * 50)
    print("🔍 ANALYSE DÉTAILLÉE DES COLONNES")
    print("=" * 50)

    # Analyser chaque colonne
    column_analysis = {}

    for col in data.columns:
        print(f"\n📊 Colonne: {col}")
        print("-" * 40)

        # Échantillon de valeurs
        sample_values = data[col].dropna().head(5).tolist()
        print(f"Échantillon: {sample_values}")

        # Type de données
        print(f"Type pandas: {data[col].dtype}")

        # Statistiques de base
        non_null_count = data[col].count()
        null_count = data[col].isnull().sum()
        unique_count = data[col].nunique()

        print(f"Non-null: {non_null_count}, Null: {null_count}, Uniques: {unique_count}")

        # Analyse du contenu
        analysis = analyze_column_content(data, col)
        column_analysis[col] = analysis

        print(f"Type détecté: {analysis['type']}")
        print(f"Confiance: {analysis['confidence']:.2f}")
        if analysis['patterns']:
            print(f"Patterns: {', '.join(set(analysis['patterns']))}")

    print("\n" + "=" * 50)
    print("🎯 IDENTIFICATION DES COLONNES PRODUIT")
    print("=" * 50)

    # Identifier les colonnes par catégorie
    product_columns = identify_product_columns(column_analysis, data)

    print("\n🏷️ COLONNES IDENTIFIÉES:")
    for category, columns in product_columns.items():
        print(f"\n{category.upper()}:")
        for col, confidence in columns:
            print(f"  - {col} (confiance: {confidence:.2f})")

    print("\n" + "=" * 50)
    print("🔧 MAPPING RECOMMANDÉ")
    print("=" * 50)

    recommended_mapping = generate_recommended_mapping(product_columns)

    for expected_name, (real_column, confidence) in recommended_mapping.items():
        print(f"{expected_name:20} -> {real_column} (confiance: {confidence:.2f})")

    return recommended_mapping, column_analysis


def analyze_column_content(data, column_name):
    """
    Analyse le contenu d'une colonne pour déterminer son type
    """
    if column_name not in data.columns:
        return {'type': 'missing', 'confidence': 0, 'patterns': []}

    sample_values = data[column_name].dropna().head(20).astype(str).tolist()

    if not sample_values:
        return {'type': 'empty', 'confidence': 0, 'patterns': []}

    analysis = {
        'type': 'unknown',
        'confidence': 0,
        'patterns': [],
        'sample_values': sample_values
    }

    # Compteurs pour différents types
    numeric_count = 0
    id_pattern_count = 0
    name_pattern_count = 0
    price_pattern_count = 0
    dimension_pattern_count = 0

    for value in sample_values:
        value_str = str(value).strip().lower()

        # Pattern ID produit
        if any(pattern in value_str for pattern in ['prod', 'p_', 'product', 'item']):
            id_pattern_count += 1
            analysis['patterns'].append('product_id')

        # Pattern ID magasin
        elif any(pattern in value_str for pattern in ['mg', 'mag', 'store', 'shop']):
            id_pattern_count += 1
            analysis['patterns'].append('store_id')

        # Pattern ID catégorie
        elif any(pattern in value_str for pattern in ['cat', 'category', 'ctg']):
            id_pattern_count += 1
            analysis['patterns'].append('category_id')

        # Pattern nom de produit (texte descriptif long)
        elif len(value_str) > 10 and any(word in value_str for word in
                                         ['café', 'lait', 'pain', 'eau', 'jus', 'yaourt', 'fromage', 'viande',
                                          'poisson', 'fruit', 'légume', 'smartphone', 'ordinateur', 'télé']):
            name_pattern_count += 1
            analysis['patterns'].append('product_name')

        # Pattern prix (nombre avec décimales, généralement entre 0.1 et 1000)
        try:
            float_val = float(value_str.replace(',', '.'))
            if 0.1 <= float_val <= 1000:
                price_pattern_count += 1
                analysis['patterns'].append('price')
            elif 0.1 <= float_val <= 100:  # Dimensions probables
                dimension_pattern_count += 1
                analysis['patterns'].append('dimension')
            numeric_count += 1
        except:
            pass

        # Pattern nom générique (texte court)
        if 3 <= len(value_str) <= 30 and not value_str.replace('.', '').replace(',', '').isdigit():
            name_pattern_count += 1
            analysis['patterns'].append('name')

    # Déterminer le type basé sur les patterns
    total_samples = len(sample_values)

    if id_pattern_count / total_samples > 0.6:
        analysis['type'] = 'id'
        analysis['confidence'] = id_pattern_count / total_samples
    elif price_pattern_count / total_samples > 0.6:
        analysis['type'] = 'price'
        analysis['confidence'] = price_pattern_count / total_samples
    elif dimension_pattern_count / total_samples > 0.6:
        analysis['type'] = 'dimension'
        analysis['confidence'] = dimension_pattern_count / total_samples
    elif name_pattern_count / total_samples > 0.5:
        analysis['type'] = 'name'
        analysis['confidence'] = name_pattern_count / total_samples
    elif numeric_count / total_samples > 0.8:
        analysis['type'] = 'numeric'
        analysis['confidence'] = numeric_count / total_samples
    else:
        analysis['type'] = 'text'
        analysis['confidence'] = 0.5

    return analysis


def identify_product_columns(column_analysis, data):
    """
    Identifie les colonnes par catégorie basé sur l'analyse
    """
    categories = {
        'product_ids': [],
        'product_names': [],
        'store_ids': [],
        'store_names': [],
        'category_ids': [],
        'category_names': [],
        'prices': [],
        'dimensions': [],
        'zones': []
    }

    for col, analysis in column_analysis.items():
        col_lower = col.lower()

        # IDs de produit
        if ('produit' in col_lower or 'product' in col_lower) and 'id' in col_lower:
            categories['product_ids'].append((col, analysis['confidence']))
        elif analysis['type'] == 'id' and 'product_id' in analysis['patterns']:
            categories['product_ids'].append((col, analysis['confidence']))

        # Noms de produit
        elif ('produit' in col_lower or 'product' in col_lower) and ('nom' in col_lower or 'name' in col_lower):
            categories['product_names'].append((col, analysis['confidence']))
        elif analysis['type'] == 'name' and 'product_name' in analysis['patterns']:
            categories['product_names'].append((col, analysis['confidence']))

        # IDs de magasin
        elif ('magasin' in col_lower or 'store' in col_lower) and 'id' in col_lower:
            categories['store_ids'].append((col, analysis['confidence']))
        elif analysis['type'] == 'id' and 'store_id' in analysis['patterns']:
            categories['store_ids'].append((col, analysis['confidence']))

        # Noms de magasin
        elif ('magasin' in col_lower or 'store' in col_lower) and ('nom' in col_lower or 'name' in col_lower):
            categories['store_names'].append((col, analysis['confidence']))

        # IDs de catégorie
        elif ('categorie' in col_lower or 'category' in col_lower) and 'id' in col_lower:
            categories['category_ids'].append((col, analysis['confidence']))
        elif analysis['type'] == 'id' and 'category_id' in analysis['patterns']:
            categories['category_ids'].append((col, analysis['confidence']))

        # Noms de catégorie
        elif ('categorie' in col_lower or 'category' in col_lower) and ('nom' in col_lower or 'name' in col_lower):
            categories['category_names'].append((col, analysis['confidence']))

        # Prix
        elif 'prix' in col_lower or 'price' in col_lower:
            categories['prices'].append((col, analysis['confidence']))
        elif analysis['type'] == 'price':
            categories['prices'].append((col, analysis['confidence']))

        # Dimensions
        elif any(dim in col_lower for dim in ['longueur', 'largeur', 'hauteur', 'length', 'width', 'height']):
            categories['dimensions'].append((col, analysis['confidence']))
        elif analysis['type'] == 'dimension':
            categories['dimensions'].append((col, analysis['confidence']))

        # Zones
        elif 'zone' in col_lower:
            categories['zones'].append((col, analysis['confidence']))

    # Trier par confiance
    for category in categories:
        categories[category].sort(key=lambda x: x[1], reverse=True)

    return categories


def generate_recommended_mapping(product_columns):
    """
    Génère un mapping recommandé basé sur l'analyse
    """
    mapping = {}

    # Mapping direct
    if product_columns['product_ids']:
        mapping['produit_id'] = product_columns['product_ids'][0]

    if product_columns['product_names']:
        mapping['produit_nom'] = product_columns['product_names'][0]

    if product_columns['store_ids']:
        mapping['magasin_id'] = product_columns['store_ids'][0]

    if product_columns['store_names']:
        mapping['magasin_nom'] = product_columns['store_names'][0]

    if product_columns['category_ids']:
        mapping['categorie_id'] = product_columns['category_ids'][0]

    if product_columns['category_names']:
        mapping['categorie_nom'] = product_columns['category_names'][0]

    if product_columns['prices']:
        mapping['prix_produit'] = product_columns['prices'][0]

    # Pour les dimensions, prendre les 3 meilleures
    if len(product_columns['dimensions']) >= 3:
        mapping['longueur_produit'] = product_columns['dimensions'][0]
        mapping['largeur_produit'] = product_columns['dimensions'][1]
        mapping['hauteur_produit'] = product_columns['dimensions'][2]

    if product_columns['zones']:
        mapping['zone_nom'] = product_columns['zones'][0]

    return mapping


if __name__ == "__main__":
    recommended_mapping, analysis = analyze_dataset_structure()
