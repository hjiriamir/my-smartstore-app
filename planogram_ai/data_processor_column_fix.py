"""
Module de traitement et préparation des données avec correction automatique des décalages de colonnes
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
        """
        self.dataset_path = dataset_path
        self.data = None
        self.preprocessor = None
        self.column_mapping = {}
        self.column_shift_detected = {}  # Pour tracker les décalages par magasin

        # Colonnes attendues avec des alternatives possibles
        self.expected_columns = {
            'magasin_id': ['input_magasin_id', 'magasin_id', 'store_id', 'id_magasin'],
            'magasin_nom': ['input_nom_magasin_magasin', 'input_nom_magasin', 'nom_magasin', 'magasin_nom',
                            'store_name'],
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

    def _detect_column_shift(self, data, magasin_id):
        """
        Détecte si les colonnes sont décalées pour un magasin spécifique

        Args:
            data: DataFrame filtré pour le magasin
            magasin_id: ID du magasin à analyser

        Returns:
            dict: Informations sur le décalage détecté
        """
        shift_info = {
            'has_shift': False,
            'shift_amount': 0,
            'corrected_mapping': {},
            'issues': []
        }

        print(f"🔍 Analyse du décalage pour magasin: {magasin_id}")

        # Analyser les colonnes critiques
        if 'input_categorie_id' in data.columns:
            sample_categories = data['input_categorie_id'].head(5).astype(str).tolist()
            print(f"Échantillon categorie_id: {sample_categories}")

            # Vérifier si les catégories ressemblent à des valeurs numériques (longueur/largeur)
            numeric_like = []
            for val in sample_categories:
                try:
                    float_val = float(val)
                    if 0 < float_val < 100:  # Probable dimension de produit
                        numeric_like.append(val)
                except:
                    pass

            if len(numeric_like) > 0:
                shift_info['has_shift'] = True
                shift_info['issues'].append(f"Catégorie contient des valeurs numériques: {numeric_like}")
                print(f"⚠️ Décalage détecté: catégorie_id contient des valeurs numériques")

                # Essayer de trouver la vraie colonne catégorie
                for col in data.columns:
                    if col != 'input_categorie_id':
                        sample_vals = data[col].head(5).astype(str).tolist()
                        # Chercher des valeurs qui ressemblent à des IDs de catégorie
                        if any(val.startswith(('CAT', 'cat', 'C')) or
                               (val.isdigit() and len(val) <= 3) for val in sample_vals):
                            shift_info['corrected_mapping']['categorie_id'] = col
                            print(f"✅ Vraie colonne catégorie trouvée: {col}")
                            break

        # Analyser les prix
        if 'input_prix_produit' in data.columns:
            sample_prices = data['input_prix_produit'].head(5).astype(str).tolist()
            print(f"Échantillon prix: {sample_prices}")

            # Vérifier si les prix sont cohérents
            valid_prices = 0
            for val in sample_prices:
                try:
                    price = float(val)
                    if 0.1 <= price <= 10000:  # Prix raisonnable
                        valid_prices += 1
                except:
                    pass

            if valid_prices < len(sample_prices) / 2:
                shift_info['has_shift'] = True
                shift_info['issues'].append(f"Prix incohérents: {sample_prices}")
                print(f"⚠️ Prix incohérents détectés")

        return shift_info

    def _apply_column_correction(self, data, shift_info):
        """
        Applique la correction des colonnes décalées

        Args:
            data: DataFrame à corriger
            shift_info: Informations sur le décalage

        Returns:
            DataFrame: Données corrigées
        """
        if not shift_info['has_shift']:
            return data

        corrected_data = data.copy()
        print(f"🔧 Application de la correction des colonnes...")

        # Appliquer les mappings corrigés
        for expected_col, real_col in shift_info['corrected_mapping'].items():
            if real_col in corrected_data.columns:
                # Créer une nouvelle colonne avec le bon nom
                new_col_name = f"corrected_{expected_col}"
                corrected_data[new_col_name] = corrected_data[real_col]
                print(f"✅ Correction: {expected_col} -> {real_col}")

        # Si on n'a pas trouvé de vraie colonne catégorie, créer des IDs génériques
        if 'corrected_categorie_id' not in corrected_data.columns:
            # Analyser les données pour deviner la catégorie basée sur les produits
            if 'input_nom_produit' in corrected_data.columns:
                product_names = corrected_data['input_nom_produit'].astype(str).str.lower()

                # Mapping basique basé sur les noms de produits
                def guess_category(product_name):
                    if any(word in product_name for word in ['café', 'coffee', 'arabica']):
                        return 'CAT001'
                    elif any(word in product_name for word in ['smartphone', 'phone', 'mobile']):
                        return 'CAT002'
                    elif any(word in product_name for word in ['fruit', 'légume', 'pomme']):
                        return 'CAT003'
                    else:
                        return 'CAT999'  # Catégorie par défaut

                corrected_data['corrected_categorie_id'] = product_names.apply(guess_category)
                print("✅ Catégories générées basées sur les noms de produits")

        return corrected_data

    def _detect_separator(self, file_path):
        """
        Détecte automatiquement le séparateur du fichier CSV
        """
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
                first_line = file.readline()

            separators = [',', ';', '\t', '|']
            separator_counts = {}

            for sep in separators:
                separator_counts[sep] = first_line.count(sep)

            detected_separator = max(separator_counts, key=separator_counts.get)
            print(f"Séparateur détecté: '{detected_separator}' (occurrences: {separator_counts[detected_separator]})")

            return detected_separator
        except Exception as e:
            print(f"Erreur lors de la détection du séparateur: {e}")
            return ','

    def _ensure_numeric(self, data, column_name):
        """
        Assure qu'une colonne est de type numérique
        """
        if column_name not in data.columns:
            print(f"⚠️ Colonne {column_name} non trouvée dans le DataFrame")
            return pd.Series([0.0] * len(data))

        try:
            series = data[column_name].astype(str)
            series = series.str.replace(',', '.', regex=False)
            series = series.str.replace(r'[^\d.-]', '', regex=True)
            numeric_series = pd.to_numeric(series, errors='coerce')
            numeric_series = numeric_series.fillna(0)

            print(f"✅ Colonne {column_name} convertie en numérique: {numeric_series.dtype}")
            return numeric_series

        except Exception as e:
            print(f"⚠️ Erreur lors de la conversion de {column_name}: {e}")
            return pd.Series([0.0] * len(data))

    def _convert_id_column(self, data, column_name):
        """
        Convertit une colonne d'ID en format utilisable
        """
        if column_name not in data.columns:
            print(f"⚠️ Colonne {column_name} non trouvée dans le DataFrame")
            return pd.Series([''] * len(data))

        try:
            series = data[column_name].astype(str).str.strip()
            series = series.replace(['nan', 'None', 'null', ''], '')

            print(f"✅ Colonne ID {column_name} convertie en string")
            return series

        except Exception as e:
            print(f"⚠️ Erreur lors de la conversion de {column_name}: {e}")
            return pd.Series([''] * len(data))

    def load_data(self):
        """
        Charge le dataset depuis le chemin spécifié
        """
        try:
            separator = self._detect_separator(self.dataset_path)

            try:
                self.data = pd.read_csv(self.dataset_path, encoding='utf-8', sep=separator)
            except UnicodeDecodeError:
                print("Échec UTF-8, tentative avec l'encodage latin-1...")
                try:
                    self.data = pd.read_csv(self.dataset_path, encoding='latin-1', sep=separator)
                except UnicodeDecodeError:
                    print("Échec latin-1, tentative avec l'encodage cp1252...")
                    try:
                        self.data = pd.read_csv(self.dataset_path, encoding='cp1252', sep=separator)
                    except UnicodeDecodeError:
                        print("Échec cp1252, utilisation d'UTF-8 avec gestion d'erreurs...")
                        self.data = pd.read_csv(self.dataset_path, encoding='utf-8', errors='replace', sep=separator)

            print(f"Dataset chargé avec succès: {self.dataset_path}")
            print(f"Dimensions: {self.data.shape}")
            print(f"Premières colonnes: {list(self.data.columns[:10])}")

            self._map_columns()
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

        integer_columns = [
            'input_promotion_id', 'input_mouvement_id', 'input_id_legal', 'input_id_event',
            'input_id_supplier', 'input_id_heatmap', 'output_nb_etageres_planogramme',
            'output_nb_colonnes_planogramme', 'output_position_prod_etagere', 'output_position_prod_colonne'
        ]

        id_columns = [
            'input_produit_id', 'input_categorie_id', 'input_parent_id_categorie',
            'input_magasin_id', 'input_zone_id'
        ]

        for col in numeric_columns:
            if col in self.data.columns:
                self.data[col] = self._ensure_numeric(self.data, col)

        for col in integer_columns:
            if col in self.data.columns:
                numeric_col = self._ensure_numeric(self.data, col)
                self.data[col] = numeric_col.astype(int)

        for col in id_columns:
            if col in self.data.columns:
                self.data[col] = self._convert_id_column(self.data, col)

        priority_columns = ['input_priorite_merchandising', 'input_priorite_categorie']
        for col in priority_columns:
            if col in self.data.columns:
                self.data[col] = self._convert_priority_to_numeric(self.data, col)

        print("✅ Conversion des types de données terminée")

    def _convert_priority_to_numeric(self, data, column_name):
        """
        Convertit une colonne de priorité (ENUM) en valeur numérique
        """
        if column_name not in data.columns:
            return pd.Series([5] * len(data))

        try:
            series = data[column_name].astype(str).str.lower().str.strip()

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

            numeric_series = series.map(priority_mapping)
            mask = numeric_series.isna()
            if mask.any():
                direct_numeric = pd.to_numeric(series[mask], errors='coerce')
                numeric_series[mask] = direct_numeric

            numeric_series = numeric_series.fillna(5)
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

    def get_column(self, expected_name):
        """
        Récupère le nom réel de la colonne dans le dataset
        """
        return self.column_mapping.get(expected_name)

    def filter_by_store_and_category(self, magasin_id, categorie_id, sous_categorie_id=None):
        """
        Filtre le dataset par magasin et catégorie avec correction automatique des décalages
        """
        if self.data is None:
            self.load_data()

        magasin_id_col = self.get_column('magasin_id')
        categorie_id_col = self.get_column('categorie_id')
        parent_categorie_id_col = self.get_column('parent_categorie_id')

        if not magasin_id_col:
            raise ValueError("Colonne magasin_id non trouvée dans le dataset")
        if not categorie_id_col:
            raise ValueError("Colonne categorie_id non trouvée dans le dataset")

        data_copy = self.data.copy()
        magasin_id_str = str(magasin_id).strip()

        print(f"🔍 Filtrage par magasin: '{magasin_id_str}'")

        # Filtrer par magasin d'abord
        store_mask = data_copy[magasin_id_col].astype(str).str.strip() == magasin_id_str
        store_data = data_copy[store_mask]
        print(f"Données pour magasin '{magasin_id_str}': {store_data.shape[0]} lignes")

        if store_data.empty:
            print(f"⚠️ Aucune donnée trouvée pour le magasin '{magasin_id_str}'")
            return pd.DataFrame()

        # Détecter et corriger les décalages de colonnes pour ce magasin
        shift_info = self._detect_column_shift(store_data, magasin_id_str)

        if shift_info['has_shift']:
            print(f"🔧 Correction des décalages détectés pour {magasin_id_str}")
            store_data = self._apply_column_correction(store_data, shift_info)

            # Utiliser la colonne corrigée pour le filtrage par catégorie
            if 'corrected_categorie_id' in store_data.columns:
                categorie_id_col = 'corrected_categorie_id'

        # Maintenant filtrer par catégorie
        categorie_id_str = str(categorie_id).strip()
        print(f"🔍 Filtrage par catégorie: '{categorie_id_str}' dans colonne '{categorie_id_col}'")

        # Afficher les catégories disponibles pour debug
        available_categories = store_data[categorie_id_col].astype(str).str.strip().unique()
        print(f"Catégories disponibles pour {magasin_id_str}: {available_categories}")

        category_mask = store_data[categorie_id_col].astype(str).str.strip() == categorie_id_str
        filtered_data = store_data[category_mask]
        print(f"Après filtrage catégorie '{categorie_id_str}': {filtered_data.shape[0]} lignes")

        if filtered_data.empty:
            print(f"⚠️ Aucune donnée trouvée pour la catégorie '{categorie_id_str}' dans le magasin '{magasin_id_str}'")
            return pd.DataFrame()

        # Filtrer par sous-catégorie si spécifiée
        if sous_categorie_id is not None and parent_categorie_id_col:
            sous_categorie_id_str = str(sous_categorie_id).strip()
            subcategory_mask = filtered_data[parent_categorie_id_col].astype(str).str.strip() == sous_categorie_id_str
            filtered_data = filtered_data[subcategory_mask]
            print(f"Après filtrage sous-catégorie '{sous_categorie_id_str}': {filtered_data.shape[0]} lignes")

        print(f"Dataset filtré final: {filtered_data.shape} lignes")
        return filtered_data

    def get_available_stores(self):
        """
        Récupère la liste des magasins disponibles dans le dataset
        """
        if self.data is None:
            self.load_data()

        magasin_id_col = self.get_column('magasin_id')
        magasin_nom_col = self.get_column('magasin_nom')

        if not magasin_id_col:
            raise ValueError(
                f"Colonne magasin_id non trouvée dans le dataset. Colonnes disponibles: {list(self.data.columns)}")

        if magasin_nom_col:
            stores = self.data[[magasin_id_col, magasin_nom_col]].drop_duplicates()
            stores.columns = ['input_magasin_id', 'input_nom_magasin_magasin']
        else:
            stores = self.data[[magasin_id_col]].drop_duplicates()
            stores['input_nom_magasin_magasin'] = stores[magasin_id_col].astype(str)
            stores.columns = ['input_magasin_id', 'input_nom_magasin_magasin']

        stores['input_magasin_id'] = stores['input_magasin_id'].astype(str).str.strip()
        stores = stores.sort_values('input_magasin_id')

        print(f"Magasins disponibles: {stores['input_magasin_id'].tolist()}")
        return stores

    def get_available_categories(self, magasin_id=None):
        """
        Récupère la liste des catégories disponibles avec correction des décalages
        """
        if self.data is None:
            self.load_data()

        categorie_id_col = self.get_column('categorie_id')
        categorie_nom_col = self.get_column('categorie_nom')
        magasin_id_col = self.get_column('magasin_id')

        if not categorie_id_col:
            raise ValueError(f"Colonne categorie_id non trouvée dans le dataset")

        data_copy = self.data.copy()

        # Filtrer par magasin si spécifié
        if magasin_id is not None and magasin_id_col:
            magasin_id_str = str(magasin_id).strip()
            store_mask = data_copy[magasin_id_col].astype(str).str.strip() == magasin_id_str
            filtered_data = data_copy[store_mask]
            print(f"Catégories pour magasin '{magasin_id_str}': {filtered_data.shape[0]} lignes")

            # Détecter et corriger les décalages pour ce magasin
            shift_info = self._detect_column_shift(filtered_data, magasin_id_str)

            if shift_info['has_shift']:
                print(f"🔧 Correction des catégories pour {magasin_id_str}")
                filtered_data = self._apply_column_correction(filtered_data, shift_info)

                # Utiliser la colonne corrigée
                if 'corrected_categorie_id' in filtered_data.columns:
                    categorie_id_col = 'corrected_categorie_id'
        else:
            filtered_data = data_copy

        if categorie_nom_col and categorie_nom_col in filtered_data.columns:
            categories = filtered_data[[categorie_id_col, categorie_nom_col]].drop_duplicates()
            categories.columns = ['input_categorie_id', 'input_nom_categorie']
        else:
            categories = filtered_data[[categorie_id_col]].drop_duplicates()
            categories['input_nom_categorie'] = categories[categorie_id_col].astype(str)
            categories.columns = ['input_categorie_id', 'input_nom_categorie']

        categories['input_categorie_id'] = categories['input_categorie_id'].astype(str).str.strip()
        categories = categories.sort_values('input_categorie_id')

        print(f"Catégories disponibles pour magasin {magasin_id}: {categories['input_categorie_id'].tolist()}")
        return categories

    def get_available_subcategories(self, categorie_id):
        """
        Récupère la liste des sous-catégories disponibles pour une catégorie
        """
        if self.data is None:
            self.load_data()

        parent_categorie_id_col = self.get_column('parent_categorie_id')
        categorie_id_col = self.get_column('categorie_id')
        categorie_nom_col = self.get_column('categorie_nom')

        if not parent_categorie_id_col:
            return pd.DataFrame(columns=['input_categorie_id', 'input_nom_categorie'])

        data_copy = self.data.copy()
        categorie_id_str = str(categorie_id).strip()

        parent_mask = data_copy[parent_categorie_id_col].astype(str).str.strip() == categorie_id_str
        subcategories = data_copy[parent_mask]

        if subcategories.empty:
            return pd.DataFrame(columns=['input_categorie_id', 'input_nom_categorie'])

        if categorie_nom_col:
            subcategories = subcategories[[categorie_id_col, categorie_nom_col]].drop_duplicates()
            subcategories.columns = ['input_categorie_id', 'input_nom_categorie']
        else:
            subcategories = subcategories[[categorie_id_col]].drop_duplicates()
            subcategories['input_nom_categorie'] = subcategories[categorie_id_col].astype(str)
            subcategories.columns = ['input_categorie_id', 'input_nom_categorie']

        subcategories['input_categorie_id'] = subcategories['input_categorie_id'].astype(str).str.strip()
        subcategories = subcategories.sort_values('input_categorie_id')

        return subcategories

    def preprocess_data(self, data=None):
        """
        Prétraite les données pour l'entraînement des modèles
        """
        if data is None:
            if self.data is None:
                self.load_data()
            data = self.data.copy()

        numerical_features = []
        categorical_features = []

        numeric_column_names = ['prix_produit', 'longueur_produit', 'largeur_produit', 'hauteur_produit',
                                'priorite_merchandising', 'priorite_categorie', 'quantite_stock', 'quantite_vente']

        for feature in numeric_column_names:
            col_name = self.get_column(feature)
            if col_name and col_name in data.columns:
                numerical_features.append(col_name)

        for feature in ['categorie_nom', 'zone_nom']:
            col_name = self.get_column(feature)
            if col_name and col_name in data.columns:
                categorical_features.append(col_name)

        print(f"Colonnes numériques identifiées: {numerical_features}")
        print(f"Colonnes catégorielles identifiées: {categorical_features}")

        if numerical_features or categorical_features:
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

            self.preprocessor = ColumnTransformer(transformers=transformers)

        # Calculer des variables dérivées
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
                stock_safe = data[quantite_stock_col].replace(0, 1)
                data['rotation_stock'] = data[quantite_vente_col] / stock_safe
                print("✅ Variable 'rotation_stock' calculée")
            except Exception as e:
                print(f"⚠️ Erreur lors du calcul de la rotation: {e}")
                data['rotation_stock'] = 0.1

        # Gérer les valeurs manquantes
        for col in numerical_features:
            if col in data.columns:
                median_value = data[col].median()
                if pd.isna(median_value):
                    median_value = 0
                data[col] = data[col].fillna(median_value)

        return data
