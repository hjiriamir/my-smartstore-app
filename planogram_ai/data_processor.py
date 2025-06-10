"""
Module de traitement et préparation des données pour le système de planogramme IA
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from config import DATASET_PATH

class DataProcessor:
    def __init__(self, dataset_path=DATASET_PATH):
        """
        Initialise le processeur de données avec le chemin du dataset

        Args:
            dataset_path: Chemin vers le fichier CSV du dataset (utilise le chemin par défaut si non spécifié)
        """
        self.dataset_path = dataset_path
        self.data = None
        self.preprocessor = None
        self.column_mapping = {}

        # Colonnes attendues avec des alternatives possibles
        self.expected_columns = {
            'magasin_id': ['input_magasin_id', 'magasin_id', 'store_id', 'id_magasin'],
            'magasin_nom': ['input_nom_magasin_magasin', 'input_nom_magasin', 'nom_magasin', 'magasin_nom', 'store_name'],
            'categorie_id': ['input_categorie_id', 'categorie_id', 'category_id', 'id_categorie'],
            'categorie_nom': ['input_nom_categorie', 'nom_categorie', 'category_name', 'categorie_nom'],
            'produit_id': ['input_produit_id', 'produit_id', 'product_id', 'id_produit'],
            'produit_nom': ['input_nom_produit', 'nom_produit', 'product_name', 'produit_nom'],
            'parent_categorie_id': ['input_parent_id_categorie', 'parent_id_categorie', 'parent_category_id'],
            'prix_produit': ['input_prix_produit', 'prix_produit', 'price', 'product_price'],
            'longueur_produit': ['input_longueur_produit', 'longueur_produit', 'length', 'product_length'],
            'largeur_produit': ['input_largeur_produit', 'largeur_produit', 'width', 'product_width'],
            'hauteur_produit': ['input_hauteur_produit', 'hauteur_produit', 'height', 'product_height'],
            'priorite_merchandising': ['input_priorite_merchandising', 'priorite_merchandising', 'priority'],
            'priorite_categorie': ['input_priorite_categorie', 'priorite_categorie', 'category_priority'],
            'quantite_stock': ['input_quantite_stock', 'quantite_stock', 'stock_quantity', 'stock'],
            'quantite_vente': ['input_quantite_vente', 'quantite_vente', 'sales_quantity', 'vente'],
            'zone_nom': ['input_nom_zone', 'nom_zone', 'zone_name', 'zone'],
            'temperature_zone': ['input_temperature_zone', 'temperature_zone', 'zone_temperature']
        }

    def _detect_separator(self, file_path):
        """
        Détecte automatiquement le séparateur du fichier CSV

        Args:
            file_path: Chemin vers le fichier CSV

        Returns:
            str: Séparateur détecté
        """
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
                first_line = file.readline()

            # Compter les occurrences de différents séparateurs
            separators = [',', ';', '\t', '|']
            separator_counts = {}

            for sep in separators:
                separator_counts[sep] = first_line.count(sep)

            # Retourner le séparateur le plus fréquent
            detected_separator = max(separator_counts, key=separator_counts.get)
            print(f"Séparateur détecté: '{detected_separator}' (occurrences: {separator_counts[detected_separator]})")

            return detected_separator
        except Exception as e:
            print(f"Erreur lors de la détection du séparateur: {e}")
            return ','  # Valeur par défaut

    def _ensure_numeric(self, data, column_name):
        """
        Assure qu'une colonne est de type numérique

        Args:
            data: DataFrame contenant la colonne
            column_name: Nom de la colonne à convertir

        Returns:
            Series: Colonne convertie en numérique
        """
        if column_name not in data.columns:
            print(f"⚠️ Colonne {column_name} non trouvée dans le DataFrame")
            return pd.Series([0.0] * len(data))

        try:
            # Convertir en string d'abord pour gérer tous les types
            series = data[column_name].astype(str)

            # Remplacer les virgules par des points (format européen)
            series = series.str.replace(',', '.', regex=False)

            # Supprimer les caractères non numériques sauf le point décimal et le signe moins
            series = series.str.replace(r'[^\d.-]', '', regex=True)

            # Convertir en numérique, les valeurs non convertibles deviennent NaN
            numeric_series = pd.to_numeric(series, errors='coerce')

            # Remplacer les NaN par 0
            numeric_series = numeric_series.fillna(0)

            print(f"✅ Colonne {column_name} convertie en numérique: {numeric_series.dtype}")
            return numeric_series

        except Exception as e:
            print(f"⚠️ Erreur lors de la conversion de {column_name}: {e}")
            return pd.Series([0.0] * len(data))

    def _convert_id_column(self, data, column_name):
        """
        Convertit une colonne d'ID (VARCHAR) en format utilisable pour les comparaisons

        Args:
            data: DataFrame contenant la colonne
            column_name: Nom de la colonne à convertir

        Returns:
            Series: Colonne convertie
        """
        if column_name not in data.columns:
            print(f"⚠️ Colonne {column_name} non trouvée dans le DataFrame")
            return pd.Series([''] * len(data))

        try:
            # Convertir en string et nettoyer
            series = data[column_name].astype(str).str.strip()

            # Remplacer les valeurs nulles par des chaînes vides
            series = series.replace(['nan', 'None', 'null', ''], '')

            print(f"✅ Colonne ID {column_name} convertie en string")
            return series

        except Exception as e:
            print(f"⚠️ Erreur lors de la conversion de {column_name}: {e}")
            return pd.Series([''] * len(data))

    def load_data(self):
        """
        Charge le dataset depuis le chemin spécifié

        Returns:
            DataFrame: Le dataset chargé
        """
        try:
            # Détecter le séparateur
            separator = self._detect_separator(self.dataset_path)

            # Essayer d'abord avec UTF-8
            try:
                self.data = pd.read_csv(self.dataset_path, encoding='utf-8', sep=separator)
            except UnicodeDecodeError:
                # Si UTF-8 échoue, essayer avec latin-1 (ISO-8859-1)
                print("Échec UTF-8, tentative avec l'encodage latin-1...")
                try:
                    self.data = pd.read_csv(self.dataset_path, encoding='latin-1', sep=separator)
                except UnicodeDecodeError:
                    # Si latin-1 échoue, essayer avec cp1252 (Windows)
                    print("Échec latin-1, tentative avec l'encodage cp1252...")
                    try:
                        self.data = pd.read_csv(self.dataset_path, encoding='cp1252', sep=separator)
                    except UnicodeDecodeError:
                        # En dernier recours, utiliser utf-8 avec gestion d'erreurs
                        print("Échec cp1252, utilisation d'UTF-8 avec gestion d'erreurs...")
                        self.data = pd.read_csv(self.dataset_path, encoding='utf-8', errors='replace', sep=separator)

            print(f"Dataset chargé avec succès: {self.dataset_path}")
            print(f"Séparateur utilisé: '{separator}'")
            print(f"Dimensions: {self.data.shape}")
            print(f"Premières colonnes: {list(self.data.columns[:10])}")

            # Mapper les colonnes
            self._map_columns()

            # Convertir les types de données selon les spécifications
            self._convert_data_types()

            print(f"Colonnes mappées: {len(self.column_mapping)}")
            return self.data
        except Exception as e:
            print(f"Erreur lors du chargement du dataset: {e}")
            raise

    def _convert_data_types(self):
        """
        Convertit les types de données selon les spécifications fournies
        """
        print("🔄 Conversion des types de données...")

        # Colonnes numériques (float/decimal/int)
        numeric_columns = [
            'input_prix_produit', 'input_longueur_produit', 'input_largeur_produit',
            'input_hauteur_produit', 'input_surface_magasin', 'input_longueur_magasin',
            'input_largeur_magasin', 'input_longueur_zone', 'input_largeur_zone',
            'input_hauteur_zone', 'input_quantite_stock', 'input_quantite_vente',
            'input_prix_unitaire_vente', 'input_montant_total_vente', 'input_visiteurs_conversionZone',
            'input_acheteurs_conversionZone', 'input_taux_conversion', 'input_quantite_mouvement',
            'input_cout_unitaire_mouvement', 'input_valeur_mouvement', 'input_espace_minimum_supplier',
            'input_visiteurs_heatmap', 'input_duree_moyenne_heatmap', 'input_intensite_heatmap',
            'output_largeur_planogramme', 'output_hauteur_planogramme'
        ]

        # Colonnes entières
        integer_columns = [
            'input_promotion_id', 'input_mouvement_id', 'input_id_legal', 'input_id_event',
            'input_id_supplier', 'input_id_heatmap', 'output_nb_etageres_planogramme',
            'output_nb_colonnes_planogramme', 'output_position_prod_etagere', 'output_position_prod_colonne'
        ]

        # Colonnes d'ID (VARCHAR mais traitées comme des identifiants)
        id_columns = [
            'input_produit_id', 'input_categorie_id', 'input_parent_id_categorie',
            'input_magasin_id', 'input_zone_id'
        ]

        # Convertir les colonnes numériques
        for col in numeric_columns:
            if col in self.data.columns:
                self.data[col] = self._ensure_numeric(self.data, col)

        # Convertir les colonnes entières
        for col in integer_columns:
            if col in self.data.columns:
                numeric_col = self._ensure_numeric(self.data, col)
                self.data[col] = numeric_col.astype(int)

        # Convertir les colonnes d'ID
        for col in id_columns:
            if col in self.data.columns:
                self.data[col] = self._convert_id_column(self.data, col)

        # Convertir les colonnes de priorité (ENUM vers numérique)
        priority_columns = ['input_priorite_merchandising', 'input_priorite_categorie']
        for col in priority_columns:
            if col in self.data.columns:
                self.data[col] = self._convert_priority_to_numeric(self.data, col)

        print("✅ Conversion des types de données terminée")

    def _convert_priority_to_numeric(self, data, column_name):
        """
        Convertit une colonne de priorité (ENUM) en valeur numérique

        Args:
            data: DataFrame contenant la colonne
            column_name: Nom de la colonne à convertir

        Returns:
            Series: Colonne convertie en numérique
        """
        if column_name not in data.columns:
            return pd.Series([5] * len(data))  # Priorité moyenne par défaut

        try:
            series = data[column_name].astype(str).str.lower().str.strip()

            # Mapping des valeurs textuelles vers des valeurs numériques
            priority_mapping = {
                'très faible': 1, 'tres faible': 1, 'very low': 1, '1': 1,
                'faible': 2, 'low': 2, '2': 2,
                'moyen': 3, 'moyenne': 3, 'medium': 3, '3': 3,
                'élevé': 4, 'eleve': 4, 'high': 4, '4': 4,
                'très élevé': 5, 'tres eleve': 5, 'very high': 5, '5': 5,
                'critique': 6, 'critical': 6, '6': 6,
                'maximum': 7, 'max': 7, '7': 7,
                'urgent': 8, '8': 8,
                'prioritaire': 9, '9': 9,
                'essentiel': 10, 'essential': 10, '10': 10
            }

            # Appliquer le mapping
            numeric_series = series.map(priority_mapping)

            # Pour les valeurs non mappées, essayer de convertir directement en numérique
            mask = numeric_series.isna()
            if mask.any():
                direct_numeric = pd.to_numeric(series[mask], errors='coerce')
                numeric_series[mask] = direct_numeric

            # Remplacer les valeurs restantes par 5 (priorité moyenne)
            numeric_series = numeric_series.fillna(5)

            # S'assurer que les valeurs sont dans la plage 1-10
            numeric_series = numeric_series.clip(1, 10)

            print(f"✅ Colonne de priorité {column_name} convertie")
            return numeric_series.astype(int)

        except Exception as e:
            print(f"⚠️ Erreur lors de la conversion de priorité {column_name}: {e}")
            return pd.Series([5] * len(data))

    def _map_columns(self):
        """
        Mappe les colonnes du dataset aux noms attendus
        """
        available_columns = list(self.data.columns)
        print(f"Nombre de colonnes disponibles: {len(available_columns)}")
        print(f"Premières colonnes du dataset: {available_columns[:10]}")

        for expected_name, possible_names in self.expected_columns.items():
            found = False
            for possible_name in possible_names:
                if possible_name in available_columns:
                    self.column_mapping[expected_name] = possible_name
                    found = True
                    print(f"✅ {expected_name} -> {possible_name}")
                    break

        if not found:
            print(f"⚠️  Colonne non trouvée pour '{expected_name}'. Alternatives recherchées: {possible_names}")

        print(f"Mapping des colonnes: {self.column_mapping}")

        # Debug spécifique pour les colonnes produit
        if 'input_produit_id' in available_columns:
            sample_ids = self.data['input_produit_id'].head(3).tolist()
            print(f"🔍 Échantillon input_produit_id: {sample_ids}")

        if 'input_nom_produit' in available_columns:
            sample_names = self.data['input_nom_produit'].head(3).tolist()
            print(f"🔍 Échantillon input_nom_produit: {sample_names}")

        if 'input_description_produit' in available_columns:
            sample_descriptions = self.data['input_description_produit'].head(3).tolist()
            print(f"🔍 Échantillon input_description_produit: {sample_descriptions}")

    def get_column(self, expected_name):
        """
        Récupère le nom réel de la colonne dans le dataset

        Args:
            expected_name: Nom attendu de la colonne

        Returns:
            str: Nom réel de la colonne ou None si non trouvée
        """
        return self.column_mapping.get(expected_name)

    def filter_by_store_and_category(self, magasin_id, categorie_id, sous_categorie_id=None):
        """
        Filtre le dataset par magasin et catégorie/sous-catégorie

        Args:
            magasin_id: ID du magasin à filtrer (peut être string ou int)
            categorie_id: ID de la catégorie à filtrer (peut être string ou int)
            sous_categorie_id: ID de la sous-catégorie à filtrer (optionnel)

        Returns:
            DataFrame: Dataset filtré
        """
        if self.data is None:
            self.load_data()

        # Récupérer les noms réels des colonnes
        magasin_id_col = self.get_column('magasin_id')
        categorie_id_col = self.get_column('categorie_id')
        parent_categorie_id_col = self.get_column('parent_categorie_id')

        if not magasin_id_col:
            raise ValueError("Colonne magasin_id non trouvée dans le dataset")
        if not categorie_id_col:
            raise ValueError("Colonne categorie_id non trouvée dans le dataset")

        # Créer une copie pour éviter les warnings
        data_copy = self.data.copy()

        # Convertir les IDs en string pour la comparaison (car ils sont en VARCHAR)
        magasin_id_str = str(magasin_id)
        categorie_id_str = str(categorie_id)

        print(f"🔍 Filtrage par magasin: '{magasin_id_str}' et catégorie: '{categorie_id_str}'")

        # Filtrer par magasin (comparaison de strings)
        filtered_data = data_copy[data_copy[magasin_id_col].astype(str) == magasin_id_str]
        print(f"Après filtrage magasin: {filtered_data.shape[0]} lignes")

        # Filtrer par catégorie (comparaison de strings)
        filtered_data = filtered_data[filtered_data[categorie_id_col].astype(str) == categorie_id_str]
        print(f"Après filtrage catégorie: {filtered_data.shape[0]} lignes")

        # Filtrer par sous-catégorie si spécifiée et si la colonne existe
        if sous_categorie_id is not None and parent_categorie_id_col:
            sous_categorie_id_str = str(sous_categorie_id)
            filtered_data = filtered_data[filtered_data[parent_categorie_id_col].astype(str) == sous_categorie_id_str]
            print(f"Après filtrage sous-catégorie: {filtered_data.shape[0]} lignes")

        print(f"Dataset filtré final: {filtered_data.shape} lignes")
        return filtered_data

    def preprocess_data(self, data=None):
        """
        Prétraite les données pour l'entraînement des modèles

        Args:
            data: DataFrame à prétraiter (utilise self.data si non spécifié)

        Returns:
            DataFrame: Données prétraitées
        """
        if data is None:
            if self.data is None:
                self.load_data()
            data = self.data.copy()  # Faire une copie pour éviter de modifier l'original

        # Identifier les colonnes numériques et catégorielles disponibles
        numerical_features = []
        categorical_features = []

        # Colonnes numériques - déjà converties dans _convert_data_types
        numeric_column_names = ['prix_produit', 'longueur_produit', 'largeur_produit', 'hauteur_produit',
                               'priorite_merchandising', 'priorite_categorie', 'quantite_stock', 'quantite_vente']

        for feature in numeric_column_names:
            col_name = self.get_column(feature)
            if col_name and col_name in data.columns:
                numerical_features.append(col_name)

        # Colonnes catégorielles
        for feature in ['categorie_nom', 'zone_nom']:
            col_name = self.get_column(feature)
            if col_name and col_name in data.columns:
                categorical_features.append(col_name)

        print(f"Colonnes numériques identifiées: {numerical_features}")
        print(f"Colonnes catégorielles identifiées: {categorical_features}")

        if numerical_features or categorical_features:
            # Créer un pipeline de prétraitement
            transformers = []

            if numerical_features:
                numerical_transformer = Pipeline(steps=[
                    ('scaler', StandardScaler())
                ])
                transformers.append(('num', numerical_transformer, numerical_features))

            if categorical_features:
                categorical_transformer = Pipeline(steps=[
                    ('onehot', OneHotEncoder(handle_unknown='ignore'))
                ])
                transformers.append(('cat', categorical_transformer, categorical_features))

            # Combiner les transformateurs
            self.preprocessor = ColumnTransformer(transformers=transformers)

        # Calculer des variables dérivées si les colonnes existent
        longueur_col = self.get_column('longueur_produit')
        largeur_col = self.get_column('largeur_produit')
        hauteur_col = self.get_column('hauteur_produit')

        if longueur_col and largeur_col and hauteur_col:
            try:
                data['volume_produit'] = data[longueur_col] * data[largeur_col] * data[hauteur_col]
                print("✅ Variable 'volume_produit' calculée")
            except Exception as e:
                print(f"⚠️ Erreur lors du calcul du volume: {e}")
                data['volume_produit'] = 0.0

        quantite_vente_col = self.get_column('quantite_vente')
        quantite_stock_col = self.get_column('quantite_stock')

        if quantite_vente_col and quantite_stock_col:
            try:
                # Remplacer les zéros par 1 pour éviter la division par zéro
                stock_safe = data[quantite_stock_col].replace(0, 1)
                data['rotation_stock'] = data[quantite_vente_col] / stock_safe
                print("✅ Variable 'rotation_stock' calculée")
            except Exception as e:
                print(f"⚠️ Erreur lors du calcul de la rotation: {e}")
                data['rotation_stock'] = 0.1

        # Gérer les valeurs manquantes pour les colonnes numériques
        for col in numerical_features:
            if col in data.columns:
                median_value = data[col].median()
                if pd.isna(median_value):
                    median_value = 0
                data[col] = data[col].fillna(median_value)

        return data

    def get_available_stores(self):
        """
        Récupère la liste des magasins disponibles dans le dataset

        Returns:
            DataFrame: ID et noms des magasins disponibles
        """
        if self.data is None:
            self.load_data()

        magasin_id_col = self.get_column('magasin_id')
        magasin_nom_col = self.get_column('magasin_nom')

        if not magasin_id_col:
            raise ValueError(f"Colonne magasin_id non trouvée dans le dataset. Colonnes disponibles: {list(self.data.columns)}")

        if magasin_nom_col:
            stores = self.data[[magasin_id_col, magasin_nom_col]].drop_duplicates()
            stores.columns = ['input_magasin_id', 'input_nom_magasin_magasin']
        else:
            stores = self.data[[magasin_id_col]].drop_duplicates()
            stores['input_nom_magasin_magasin'] = stores[magasin_id_col].astype(str)
            stores.columns = ['input_magasin_id', 'input_nom_magasin_magasin']

        return stores

    def get_available_categories(self, magasin_id=None):
        """
        Récupère la liste des catégories disponibles dans le dataset

        Args:
            magasin_id: ID du magasin pour filtrer les catégories (optionnel)

        Returns:
            DataFrame: ID et noms des catégories disponibles
        """
        if self.data is None:
            self.load_data()

        categorie_id_col = self.get_column('categorie_id')
        categorie_nom_col = self.get_column('categorie_nom')
        magasin_id_col = self.get_column('magasin_id')

        if not categorie_id_col:
            raise ValueError(f"Colonne categorie_id non trouvée dans le dataset. Colonnes disponibles: {list(self.data.columns)}")

        data_copy = self.data.copy()

        # Filtrer par magasin si spécifié (comparaison de strings)
        if magasin_id is not None and magasin_id_col:
            magasin_id_str = str(magasin_id)
            filtered_data = data_copy[data_copy[magasin_id_col].astype(str) == magasin_id_str]
        else:
            filtered_data = data_copy

        if categorie_nom_col:
            categories = filtered_data[[categorie_id_col, categorie_nom_col]].drop_duplicates()
            categories.columns = ['input_categorie_id', 'input_nom_categorie']
        else:
            categories = filtered_data[[categorie_id_col]].drop_duplicates()
            categories['input_nom_categorie'] = categories[categorie_id_col].astype(str)
            categories.columns = ['input_categorie_id', 'input_nom_categorie']

        return categories

    def get_available_subcategories(self, categorie_id):
        """
        Récupère la liste des sous-catégories disponibles pour une catégorie

        Args:
            categorie_id: ID de la catégorie parent

        Returns:
            DataFrame: ID et noms des sous-catégories disponibles
        """
        if self.data is None:
            self.load_data()

        parent_categorie_id_col = self.get_column('parent_categorie_id')
        categorie_id_col = self.get_column('categorie_id')
        categorie_nom_col = self.get_column('categorie_nom')

        if not parent_categorie_id_col:
            return pd.DataFrame(columns=['input_categorie_id', 'input_nom_categorie'])

        data_copy = self.data.copy()
        categorie_id_str = str(categorie_id)

        # Filtrer les produits qui ont cette catégorie comme parent (comparaison de strings)
        subcategories = data_copy[data_copy[parent_categorie_id_col].astype(str) == categorie_id_str]

        if subcategories.empty:
            return pd.DataFrame(columns=['input_categorie_id', 'input_nom_categorie'])

        if categorie_nom_col:
            subcategories = subcategories[[categorie_id_col, categorie_nom_col]].drop_duplicates()
            subcategories.columns = ['input_categorie_id', 'input_nom_categorie']
        else:
            subcategories = subcategories[[categorie_id_col]].drop_duplicates()
            subcategories['input_nom_categorie'] = subcategories[categorie_id_col].astype(str)
            subcategories.columns = ['input_categorie_id', 'input_nom_categorie']

        return subcategories
