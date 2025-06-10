"""
Modèles de machine learning pour le système de planogramme IA
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
from config import MODEL_CONFIG

class PlanogramModels:
    def __init__(self):
        """
        Initialise les modèles de machine learning pour le système de planogramme
        """
        self.dimensions_model = None
        self.positions_model = None
        self.is_trained = False
        
    def train_models(self, data):
        """
        Entraîne les modèles sur les données fournies
        
        Args:
            data: DataFrame contenant les données d'entraînement
        """
        # Vérifier si les données contiennent les colonnes de sortie
        output_columns = ['output_largeur_planogramme', 'output_hauteur_planogramme',
                         'output_nb_etageres_planogramme', 'output_nb_colonnes_planogramme',
                         'output_position_prod_etagere', 'output_position_prod_colonne']

        # Vérifier si au moins quelques colonnes de sortie existent
        existing_output_columns = [col for col in output_columns if col in data.columns]

        if len(existing_output_columns) >= 2:
            # Convertir toutes les colonnes de sortie en numérique
            for col in existing_output_columns:
                data[col] = self._ensure_numeric_column(data, col)

            # Entraîner le modèle de dimensions
            self._train_dimensions_model(data)

            # Entraîner le modèle de positions
            self._train_positions_model(data)

            self.is_trained = True
        else:
            print("Les données ne contiennent pas suffisamment de colonnes de sortie. Utilisation de modèles simulés.")
            self._create_simulated_models()
            self.is_trained = True

    def _ensure_numeric_column(self, data, column_name):
        """
        Assure qu'une colonne est de type numérique

        Args:
            data: DataFrame contenant la colonne
            column_name: Nom de la colonne à convertir

        Returns:
            Series: Colonne convertie en numérique
        """
        if column_name not in data.columns:
            print(f"⚠️ Colonne {column_name} non trouvée")
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

            # Remplacer les NaN par des valeurs par défaut selon le type de colonne
            if 'largeur' in column_name or 'hauteur' in column_name:
                default_value = 150.0  # Valeur par défaut pour les dimensions
            elif 'nb_etageres' in column_name:
                default_value = 4.0    # Valeur par défaut pour le nombre d'étagères
            elif 'nb_colonnes' in column_name:
                default_value = 6.0    # Valeur par défaut pour le nombre de colonnes
            elif 'position' in column_name:
                default_value = 1.0    # Valeur par défaut pour les positions
            else:
                default_value = 0.0

            numeric_series = numeric_series.fillna(default_value)

            print(f"✅ Colonne {column_name} convertie en numérique")
            return numeric_series

        except Exception as e:
            print(f"⚠️ Erreur lors de la conversion de {column_name}: {e}")
            return pd.Series([0.0] * len(data))

    def _train_dimensions_model(self, data):
        """
        Entraîne le modèle de prédiction des dimensions du planogramme

        Args:
            data: DataFrame contenant les données d'entraînement
        """
        # Colonnes de features et targets
        feature_columns = ['input_longueur_produit', 'input_largeur_produit', 'input_hauteur_produit',
                          'input_priorite_merchandising', 'input_priorite_categorie', 'input_quantite_stock']
        target_columns = ['output_largeur_planogramme', 'output_hauteur_planogramme',
                         'output_nb_etageres_planogramme', 'output_nb_colonnes_planogramme']

        # Vérifier que les colonnes existent
        available_features = [col for col in feature_columns if col in data.columns]
        available_targets = [col for col in target_columns if col in data.columns]

        if len(available_features) < 3 or len(available_targets) < 2:
            print("⚠️ Pas assez de colonnes pour entraîner le modèle de dimensions. Utilisation d'un modèle simulé.")
            self.dimensions_model = self._SimulatedDimensionsModel()
            return

        # Convertir les features en numérique
        for col in available_features:
            data[col] = self._ensure_numeric_column(data, col)

        # Sélectionner les features et les targets disponibles
        X = data[available_features]
        y = data[available_targets]

        # Vérifier qu'il y a assez de données
        if len(X) < 10:
            print("⚠️ Pas assez de données pour entraîner le modèle. Utilisation d'un modèle simulé.")
            self.dimensions_model = self._SimulatedDimensionsModel()
            return

        try:
            # Diviser les données en ensembles d'entraînement et de test
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

            # Créer et entraîner le modèle
            if MODEL_CONFIG['dimensions']['algorithm'] == 'xgboost':
                self.dimensions_model = xgb.XGBRegressor(**MODEL_CONFIG['dimensions']['params'])
            else:
                self.dimensions_model = RandomForestRegressor(**MODEL_CONFIG['dimensions']['params'])

            self.dimensions_model.fit(X_train, y_train)

            # Évaluer le modèle
            y_pred = self.dimensions_model.predict(X_test)
            mse = mean_squared_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)

            print(f"Modèle de dimensions entraîné avec MSE: {mse:.4f}, R²: {r2:.4f}")

        except Exception as e:
            print(f"⚠️ Erreur lors de l'entraînement du modèle de dimensions: {e}")
            self.dimensions_model = self._SimulatedDimensionsModel()

    def _train_positions_model(self, data):
        """
        Entraîne le modèle de prédiction des positions des produits

        Args:
            data: DataFrame contenant les données d'entraînement
        """
        # Colonnes de features et targets
        feature_columns = ['input_longueur_produit', 'input_largeur_produit', 'input_hauteur_produit',
                          'input_priorite_merchandising', 'input_prix_produit', 'input_quantite_vente']
        target_columns = ['output_position_prod_etagere', 'output_position_prod_colonne']

        # Vérifier que les colonnes existent
        available_features = [col for col in feature_columns if col in data.columns]
        available_targets = [col for col in target_columns if col in data.columns]

        if len(available_features) < 3 or len(available_targets) < 1:
            print("⚠️ Pas assez de colonnes pour entraîner le modèle de positions. Utilisation d'un modèle simulé.")
            self.positions_model = self._SimulatedPositionsModel()
            return

        # Convertir les features en numérique
        for col in available_features:
            data[col] = self._ensure_numeric_column(data, col)

        # Sélectionner les features et les targets disponibles
        X = data[available_features]
        y = data[available_targets]

        # Vérifier qu'il y a assez de données
        if len(X) < 10:
            print("⚠️ Pas assez de données pour entraîner le modèle. Utilisation d'un modèle simulé.")
            self.positions_model = self._SimulatedPositionsModel()
            return

        try:
            # Diviser les données en ensembles d'entraînement et de test
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

            # Créer et entraîner le modèle
            if MODEL_CONFIG['positions']['algorithm'] == 'xgboost':
                self.positions_model = xgb.XGBRegressor(**MODEL_CONFIG['positions']['params'])
            else:
                self.positions_model = RandomForestRegressor(**MODEL_CONFIG['positions']['params'])

            self.positions_model.fit(X_train, y_train)

            # Évaluer le modèle
            y_pred = self.positions_model.predict(X_test)
            mse = mean_squared_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)

            print(f"Modèle de positions entraîné avec MSE: {mse:.4f}, R²: {r2:.4f}")

        except Exception as e:
            print(f"⚠️ Erreur lors de l'entraînement du modèle de positions: {e}")
            self.positions_model = self._SimulatedPositionsModel()

    def _create_simulated_models(self):
        """
        Crée des modèles simulés pour les tests
        """
        # Modèle de dimensions simulé
        self.dimensions_model = self._SimulatedDimensionsModel()

        # Modèle de positions simulé
        self.positions_model = self._SimulatedPositionsModel()

        print("Modèles simulés créés pour les tests")

    def predict(self, data):
        """
        Fait des prédictions avec les modèles entraînés

        Args:
            data: DataFrame contenant les données pour lesquelles faire des prédictions

        Returns:
            DataFrame: Prédictions
        """
        if not self.is_trained:
            print("Les modèles ne sont pas entraînés. Création de modèles simulés.")
            self._create_simulated_models()
            self.is_trained = True

        # Prédire les dimensions du planogramme
        dimensions_features = data[['input_longueur_produit', 'input_largeur_produit', 'input_hauteur_produit',
                                   'input_priorite_merchandising', 'input_priorite_categorie', 'input_quantite_stock']]
        dimensions_pred = self.dimensions_model.predict(dimensions_features)

        # Prédire les positions des produits
        positions_features = data[['input_longueur_produit', 'input_largeur_produit', 'input_hauteur_produit',
                                  'input_priorite_merchandising', 'input_prix_produit', 'input_quantite_vente']]
        positions_pred = self.positions_model.predict(positions_features)

        # Créer un DataFrame avec les prédictions
        predictions = pd.DataFrame({
            'output_largeur_planogramme': dimensions_pred[:, 0],
            'output_hauteur_planogramme': dimensions_pred[:, 1],
            'output_nb_etageres_planogramme': dimensions_pred[:, 2],
            'output_nb_colonnes_planogramme': dimensions_pred[:, 3],
            'output_position_prod_etagere': positions_pred[:, 0],
            'output_position_prod_colonne': positions_pred[:, 1]
        })

        # Arrondir les positions à des entiers
        predictions['output_position_prod_etagere'] = np.round(predictions['output_position_prod_etagere']).astype(int)
        predictions['output_position_prod_colonne'] = np.round(predictions['output_position_prod_colonne']).astype(int)

        # Arrondir le nombre d'étagères et de colonnes à des entiers
        predictions['output_nb_etageres_planogramme'] = np.round(predictions['output_nb_etageres_planogramme']).astype(int)
        predictions['output_nb_colonnes_planogramme'] = np.round(predictions['output_nb_colonnes_planogramme']).astype(int)

        return predictions

    class _SimulatedDimensionsModel:
        """
        Modèle simulé pour les dimensions du planogramme
        """
        def predict(self, X):
            """
            Fait des prédictions simulées pour les dimensions du planogramme

            Args:
                X: Features

            Returns:
                array: Prédictions
            """
            n_samples = X.shape[0]

            # Simuler des prédictions réalistes
            largeur = np.random.uniform(100, 200, n_samples)
            hauteur = np.random.uniform(180, 250, n_samples)
            nb_etageres = np.random.randint(3, 7, n_samples)
            nb_colonnes = np.random.randint(4, 10, n_samples)

            return np.column_stack([largeur, hauteur, nb_etageres, nb_colonnes])

    class _SimulatedPositionsModel:
        """
        Modèle simulé pour les positions des produits
        """
        def predict(self, X):
            """
            Fait des prédictions simulées pour les positions des produits

            Args:
                X: Features

            Returns:
                array: Prédictions
            """
            n_samples = X.shape[0]

            # Simuler des prédictions réalistes (numérotation commence à 1)
            etagere = np.random.randint(1, 6, n_samples)  # Étagères 1-5
            colonne = np.random.randint(1, 9, n_samples)  # Colonnes 1-8
            
            return np.column_stack([etagere, colonne])
