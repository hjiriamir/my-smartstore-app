import pandas as pd
import numpy as np
import io

# ===== Nouveau =====
DATA_PATH = 'PythonProject1/planogram_data.csv'

def load_and_clean_data(file=None, file_path=DATA_PATH):
    """
    Charge et nettoie les données du planogramme
    :param file: fichier uploadé (Streamlit UploadedFile)
    :param file_path: chemin local du fichier CSV
    """
    try:
        if isinstance(file, str):
            # Si file est une chaîne, on suppose que c'est un chemin de fichier
            data = pd.read_csv(file, sep=';', encoding='latin1')
        elif file is not None:
            # Lecture d'un fichier uploadé depuis Streamlit
            data = pd.read_csv(io.StringIO(file.read().decode('latin1')), sep=';')
        elif file_path:
            # Lecture d'un fichier local
            data = pd.read_csv(file_path, sep=';', encoding='latin1')
        else:
            raise ValueError("Aucun fichier fourni pour le chargement des données.")

        # Nettoyage des noms de colonnes
        data.columns = data.columns.str.strip()  # Supprime les espaces et les tabulations

        print(f"Données chargées: {data.shape[0]} lignes, {data.shape[1]} colonnes")
        print("Colonnes après chargement:", data.columns.tolist())  # Vérification des colonnes

        required_columns = [
            'planogramme_id', 'dimension_longueur_planogramme', 'dimension_largeur_planogramme',
            'nb_etageres', 'nb_colonnes', 'emplacement_magasin', 'magasin_id', 'surface_magasin_m2',
            'produit_id', 'categorie_produit', 'promo_en_cours', 'ventes_moyennes', 'stock_moyen','fournisseur',
            'prev_demande', 'position_etagere', 'position_colonne', 'score_priorite'
        ]

        missing_columns = [col for col in required_columns if col not in data.columns]
        if missing_columns:
            raise ValueError(f"Colonnes manquantes dans le fichier CSV: {missing_columns}")

        # Nettoyage des colonnes numériques
        numeric_columns = data.select_dtypes(include=[np.number]).columns
        data[numeric_columns] = data[numeric_columns].fillna(data[numeric_columns].mean())

        # Conversion promo_en_cours en int
        if 'promo_en_cours' in data.columns:
            data['promo_en_cours'] = data['promo_en_cours'].astype(int)

        # Arrondi pour certaines colonnes
        integer_columns = ['nb_etageres', 'nb_colonnes', 'position_etagere', 'position_colonne']
        for col in integer_columns:
            if col in data.columns:
                data[col] = data[col].round().astype(int)



        return data

    except Exception as e:
        print(f"Erreur lors du chargement des données: {e}")
        raise


def calculate_product_score(data: pd.DataFrame) -> pd.DataFrame:
    """
    Calcule un score de priorité pour chaque produit en fonction de plusieurs critères.
    """
    try:
        # Créer une copie explicite pour éviter les SettingWithCopyWarning
        data = data.copy()



        # Colonnes obligatoires avec valeurs par défaut
        required = {
            'ventes_moyennes': 0,
            'stock_moyen': 0,
            'prev_demande': 0,
            'promo_en_cours': 0
        }

        for col, default in required.items():
            if col not in data.columns:
                data[col] = default

        # Conversion des types

        data['promo_en_cours'] = data['promo_en_cours'].astype(int)
        # Remplissage des valeurs manquantes
        data['ventes_moyennes'] = data['ventes_moyennes'].fillna(0)
        data['stock_moyen'] = data['stock_moyen'].fillna(0)
        data['prev_demande'] = data['prev_demande'].fillna(0)




        # Vérification si 'promo_en_cours' existe
        if 'promo_en_cours' not in data.columns:
            data['promo_en_cours'] = 0
        else:
            data['promo_en_cours'] = data['promo_en_cours'].fillna(0).astype(int)

        # Normalisation
        ventes_norm = (data['ventes_moyennes'] - data['ventes_moyennes'].min()) / \
                      (data['ventes_moyennes'].max() - data['ventes_moyennes'].min() + 1e-9)
        stock_norm = (data['stock_moyen'] - data['stock_moyen'].min()) / \
                     (data['stock_moyen'].max() - data['stock_moyen'].min() + 1e-9)
        demande_norm = (data['prev_demande'] - data['prev_demande'].min()) / \
                       (data['prev_demande'].max() - data['prev_demande'].min() + 1e-9)



        # Calcul du score
        poids = {
            'ventes': 0.5,
            'stock': 0.2,
            'demande': 0.2,
            'promo': 0.1
        }

        data['score'] = (
                poids['ventes'] * ventes_norm +
                poids['stock'] * stock_norm +
                poids['demande'] * demande_norm +
                poids['promo'] * data['promo_en_cours']
        )

        return data

    except Exception as e:
        print(f"Erreur lors du calcul du score des produits: {e}")
        raise