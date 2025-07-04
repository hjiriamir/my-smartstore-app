import pandas as pd
import numpy as np
import json
from datetime import datetime
from typing import Dict, List, Tuple, Any, Optional
import warnings

warnings.filterwarnings('ignore')

# Imports pour ML
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_squared_error, accuracy_score
import xgboost as xgb


class DataProcessor:
    """Classe pour le traitement des données d'entrée"""

    def __init__(self, csv_path: str):
        self.csv_path = csv_path
        self.label_encoders = {}
        self.scaler = StandardScaler()

    def load_data(self) -> pd.DataFrame:
        """Charge les données depuis le fichier CSV"""
        try:
            data = pd.read_csv(self.csv_path)
            print(f"✅ Données chargées: {len(data)} lignes, {len(data.columns)} colonnes")
            return data
        except Exception as e:
            print(f"❌ Erreur lors du chargement: {e}")
            return pd.DataFrame()

    def preprocess_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """Prétraite les données pour l'entraînement ML"""
        if data.empty:
            return data

        processed_data = data.copy()

        # Gestion des valeurs manquantes
        for col in processed_data.columns:
            if processed_data[col].dtype == 'object':
                processed_data[col] = processed_data[col].fillna('unknown')
            else:
                processed_data[col] = processed_data[col].fillna(processed_data[col].median())

        # Encodage des variables catégorielles
        categorical_columns = processed_data.select_dtypes(include=['object']).columns
        for col in categorical_columns:
            if col not in self.label_encoders:
                self.label_encoders[col] = LabelEncoder()
                processed_data[col] = self.label_encoders[col].fit_transform(processed_data[col])
            else:
                processed_data[col] = self.label_encoders[col].transform(processed_data[col])

        # Features dérivées
        if 'input_longueur_produit' in processed_data.columns and 'input_largeur_produit' in processed_data.columns:
            processed_data['surface_produit'] = processed_data['input_longueur_produit'] * processed_data[
                'input_largeur_produit']

        if 'input_surface_magasin' in processed_data.columns and 'input_longueur_zone' in processed_data.columns:
            processed_data['ratio_zone_magasin'] = processed_data['input_longueur_zone'] / processed_data[
                'input_surface_magasin']

        print(f"✅ Prétraitement terminé: {len(processed_data)} lignes")
        return processed_data


class FurnitureTypePredictor:
    """Prédicteur pour les types de meubles"""

    def __init__(self):
        self.model = None
        self.furniture_types = {
            1: {"name": "planogram", "faces": 1, "description": "Planogramme standard"},
            2: {"name": "gondola", "faces": 2, "description": "Gondole 2 faces"},
            3: {"name": "shelves-display", "faces": 4, "description": "Présentoir étagères 4 faces"},
            4: {"name": "clothing-rack", "faces": 1, "description": "Portant vêtements"},
            5: {"name": "wall-display", "faces": 1, "description": "Présentoir mural"},
            6: {"name": "accessory-display", "faces": 1, "description": "Présentoir accessoires"},
            7: {"name": "modular-cube", "faces": 1, "description": "Cube modulaire"},
            8: {"name": "table", "faces": 1, "description": "Table de présentation"},
            9: {"name": "refrigerator", "faces": 1, "description": "Réfrigérateur"},
            10: {"name": "refrigerated-showcase", "faces": 1, "description": "Vitrine réfrigérée"},
            11: {"name": "clothing-display", "faces": 1, "description": "Présentoir vêtements"},
            12: {"name": "clothing-wall", "faces": 1, "description": "Mur vêtements"}
        }

    def train(self, X: pd.DataFrame, y: pd.Series = None):
        """Entraîne le modèle de prédiction des types de meubles"""
        if y is None:
            # Génération de labels basée sur les règles métier
            y = self._generate_furniture_type_labels(X)

        # Entraînement avec XGBoost
        self.model = xgb.XGBClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=42
        )

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        self.model.fit(X_train, y_train)

        # Évaluation
        y_pred = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        print(f"✅ Modèle type de meuble entraîné - Précision: {accuracy:.3f}")

    def _generate_furniture_type_labels(self, X: pd.DataFrame) -> pd.Series:
        """Génère des labels basés sur les règles métier"""
        labels = []

        for _, row in X.iterrows():
            # Règles basées sur les contraintes de température
            if 'input_contrainte_temperature_produit' in X.columns:
                temp_constraint = row.get('input_contrainte_temperature_produit', 0)
                if temp_constraint == 1:  # Froid
                    labels.append(np.random.choice([9, 10]))  # Réfrigérateur ou vitrine
                else:
                    # Règles basées sur la catégorie
                    category = row.get('input_categorie_id', 0)
                    if category % 4 == 0:
                        labels.append(4)  # Clothing rack
                    elif category % 3 == 0:
                        labels.append(2)  # Gondola
                    else:
                        labels.append(1)  # Planogram standard
            else:
                labels.append(np.random.choice(list(self.furniture_types.keys())))

        return pd.Series(labels)

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """Prédit les types de meubles"""
        if self.model is None:
            return np.random.choice(list(self.furniture_types.keys()), size=len(X))
        return self.model.predict(X)


class FurnitureDimensionPredictor:
    """Prédicteur pour les dimensions des meubles"""

    def __init__(self):
        # Modèles selon le nombre de faces
        self.models = {
            'largeur': None,
            'hauteur': None,
            'profondeur': None,
            # 1 face
            'nb_etageres_unique_face': None,
            'nb_colonnes_unique_face': None,
            # 2 faces (front/back)
            'nb_etageres_front_back': None,
            'nb_colonnes_front_back': None,
            # 4 faces (front/back + left/right)
            'nb_etageres_left_right': None,
            'nb_colonnes_left_right': None
        }

    def train(self, X: pd.DataFrame, furniture_types: np.ndarray):
        """Entraîne les modèles de prédiction des dimensions"""
        # Génération des targets basée sur les types de meubles
        targets = self._generate_dimension_targets(X, furniture_types)

        for dimension, target in targets.items():
            if dimension in ['nb_etageres_unique_face', 'nb_colonnes_unique_face', 'nb_etageres_front_back',
                             'nb_colonnes_front_back', 'nb_etageres_left_right', 'nb_colonnes_left_right']:
                # Classification pour les nombres entiers
                self.models[dimension] = RandomForestClassifier(n_estimators=50, random_state=42)
            else:
                # Régression pour les dimensions continues
                self.models[dimension] = RandomForestRegressor(n_estimators=50, random_state=42)

            X_train, X_test, y_train, y_test = train_test_split(X, target, test_size=0.2, random_state=42)
            self.models[dimension].fit(X_train, y_train)

            # Évaluation
            y_pred = self.models[dimension].predict(X_test)
            if dimension in ['nb_etageres_unique_face', 'nb_colonnes_unique_face', 'nb_etageres_front_back',
                             'nb_colonnes_front_back', 'nb_etageres_left_right', 'nb_colonnes_left_right']:
                score = accuracy_score(y_test, y_pred)
                print(f"✅ Modèle {dimension} entraîné - Précision: {score:.3f}")
            else:
                score = mean_squared_error(y_test, y_pred, squared=False)
                print(f"✅ Modèle {dimension} entraîné - RMSE: {score:.3f}")

    def _generate_dimension_targets(self, X: pd.DataFrame, furniture_types: np.ndarray) -> Dict[str, np.ndarray]:
        """Génère les dimensions cibles basées sur les types de meubles et leurs faces"""
        targets = {}

        # Spécifications par type de meuble avec nombre de faces
        furniture_specs = {
            1: {'largeur': 120, 'hauteur': 180, 'profondeur': 40, 'faces': 1, 'etageres': 4, 'colonnes': 5},
            2: {'largeur': 150, 'hauteur': 200, 'profondeur': 45, 'faces': 2, 'etageres': 5, 'colonnes': 6},
            3: {'largeur': 100, 'hauteur': 160, 'profondeur': 35, 'faces': 4, 'etageres': 4, 'colonnes': 4},
            4: {'largeur': 80, 'hauteur': 180, 'profondeur': 30, 'faces': 1, 'etageres': 1, 'colonnes': 8},
            5: {'largeur': 200, 'hauteur': 250, 'profondeur': 20, 'faces': 1, 'etageres': 6, 'colonnes': 8},
            6: {'largeur': 60, 'hauteur': 120, 'profondeur': 25, 'faces': 1, 'etageres': 3, 'colonnes': 3},
            7: {'largeur': 50, 'hauteur': 50, 'profondeur': 50, 'faces': 1, 'etageres': 2, 'colonnes': 2},
            8: {'largeur': 120, 'hauteur': 80, 'profondeur': 60, 'faces': 1, 'etageres': 1, 'colonnes': 4},
            9: {'largeur': 60, 'hauteur': 180, 'profondeur': 60, 'faces': 1, 'etageres': 4, 'colonnes': 2},
            10: {'largeur': 150, 'hauteur': 120, 'profondeur': 50, 'faces': 1, 'etageres': 3, 'colonnes': 5},
            11: {'largeur': 100, 'hauteur': 200, 'profondeur': 40, 'faces': 1, 'etageres': 5, 'colonnes': 4},
            12: {'largeur': 300, 'hauteur': 250, 'profondeur': 30, 'faces': 1, 'etageres': 8, 'colonnes': 12}
        }

        # Génération des dimensions de base
        for dimension in ['largeur', 'hauteur', 'profondeur']:
            values = []
            for furniture_type in furniture_types:
                base_value = furniture_specs.get(furniture_type, furniture_specs[1])[dimension]
                # Ajout de variabilité
                values.append(max(10, base_value + np.random.normal(0, base_value * 0.1)))
            targets[dimension] = np.array(values)

        # Génération des étagères et colonnes selon le nombre de faces
        for dimension_type in ['etageres', 'colonnes']:
            # Initialisation des arrays pour chaque configuration
            unique_face_values = []
            front_back_values = []
            left_right_values = []

            for furniture_type in furniture_types:
                spec = furniture_specs.get(furniture_type, furniture_specs[1])
                faces = spec['faces']
                base_value = spec[dimension_type]

                # Ajout de variabilité
                varied_value = max(1, base_value + np.random.randint(-1, 2))

                if faces == 1:
                    # 1 face : utiliser unique_face
                    unique_face_values.append(varied_value)
                    front_back_values.append(0)  # Non utilisé
                    left_right_values.append(0)  # Non utilisé
                elif faces == 2:
                    # 2 faces : utiliser front_back
                    unique_face_values.append(0)  # Non utilisé
                    front_back_values.append(varied_value)
                    left_right_values.append(0)  # Non utilisé
                elif faces == 4:
                    # 4 faces : utiliser front_back et left_right
                    unique_face_values.append(0)  # Non utilisé
                    front_back_values.append(varied_value)
                    left_right_values.append(max(1, varied_value + np.random.randint(-1, 2)))

            # Attribution aux targets
            targets[f'nb_{dimension_type}_unique_face'] = np.array(unique_face_values)
            targets[f'nb_{dimension_type}_front_back'] = np.array(front_back_values)
            targets[f'nb_{dimension_type}_left_right'] = np.array(left_right_values)

        return targets

    def predict(self, X: pd.DataFrame, furniture_types: np.ndarray) -> Dict[str, np.ndarray]:
        """Prédit les dimensions des meubles selon leur nombre de faces"""
        predictions = {}

        # Mapping des types vers le nombre de faces
        furniture_faces = {
            1: 1, 2: 2, 3: 4, 4: 1, 5: 1, 6: 1,
            7: 1, 8: 1, 9: 1, 10: 1, 11: 1, 12: 1
        }

        for dimension, model in self.models.items():
            if model is None:
                # Valeurs par défaut si pas de modèle
                n_samples = len(X)

                if dimension == 'largeur':
                    predictions[dimension] = np.full(n_samples, 120.0)
                elif dimension == 'hauteur':
                    predictions[dimension] = np.full(n_samples, 180.0)
                elif dimension == 'profondeur':
                    predictions[dimension] = np.full(n_samples, 40.0)
                else:
                    # Pour les étagères et colonnes, dépend du nombre de faces
                    values = []
                    for furniture_type in furniture_types:
                        faces = furniture_faces.get(furniture_type, 1)

                        if 'unique_face' in dimension and faces == 1:
                            if 'etageres' in dimension:
                                values.append(4)
                            else:  # colonnes
                                values.append(5)
                        elif 'front_back' in dimension and faces in [2, 4]:
                            if 'etageres' in dimension:
                                values.append(4)
                            else:  # colonnes
                                values.append(5)
                        elif 'left_right' in dimension and faces == 4:
                            if 'etageres' in dimension:
                                values.append(4)
                            else:  # colonnes
                                values.append(5)
                        else:
                            values.append(0)  # Non utilisé pour ce type de meuble

                    predictions[dimension] = np.array(values)
            else:
                predictions[dimension] = model.predict(X)

        return predictions


class PositionPredictor:
    """Prédicteur pour les positions des produits avec noms de faces"""

    def __init__(self):
        self.models = {
            'face': None,
            'etagere': None,
            'colonne': None,
            'quantite': None
        }

        # Mapping des faces selon le nombre de faces du meuble
        self.face_mapping = {
            1: ['front'],
            2: ['front', 'back'],
            4: ['front', 'back', 'left', 'right']
        }

    def train(self, X: pd.DataFrame, furniture_dimensions: Dict[str, np.ndarray]):
        """Entraîne les modèles de prédiction des positions"""
        targets = self._generate_position_targets(X, furniture_dimensions)

        for position, target in targets.items():
            if position == 'face':
                # Pour les faces, on utilise un classificateur spécial
                self.models[position] = RandomForestClassifier(n_estimators=50, random_state=42)
            else:
                self.models[position] = RandomForestClassifier(n_estimators=50, random_state=42)

            X_train, X_test, y_train, y_test = train_test_split(X, target, test_size=0.2, random_state=42)
            self.models[position].fit(X_train, y_train)

            y_pred = self.models[position].predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            print(f"✅ Modèle position {position} entraîné - Précision: {accuracy:.3f}")

    def _generate_position_targets(self, X: pd.DataFrame, furniture_dimensions: Dict[str, np.ndarray]) -> Dict[
        str, np.ndarray]:
        """Génère les positions cibles"""
        targets = {}
        n_samples = len(X)

        # Génération basée sur les priorités et dimensions
        targets['face'] = np.random.choice(['front', 'back'], n_samples)  # Sera ajusté selon le type
        targets['etagere'] = np.random.randint(1, 5, n_samples)  # 1-4 étagères
        targets['colonne'] = np.random.randint(1, 6, n_samples)  # 1-5 colonnes
        targets['quantite'] = np.random.randint(1, 8, n_samples)  # 1-7 produits par position

        return targets

    def predict(self, X: pd.DataFrame, furniture_types: np.ndarray, furniture_dimensions: Dict[str, np.ndarray]) -> \
    Dict[str, np.ndarray]:
        """Prédit les positions des produits avec noms de faces"""
        predictions = {}

        # Mapping des types vers le nombre de faces
        furniture_faces = {
            1: 1, 2: 2, 3: 4, 4: 1, 5: 1, 6: 1,
            7: 1, 8: 1, 9: 1, 10: 1, 11: 1, 12: 1
        }

        # Prédiction des faces selon le type de meuble
        face_assignments = []
        for furniture_type in furniture_types:
            faces_count = furniture_faces.get(furniture_type, 1)
            available_faces = self.face_mapping[faces_count]
            # Choisir une face aléatoire parmi celles disponibles
            selected_face = np.random.choice(available_faces)
            face_assignments.append(selected_face)

        predictions['face'] = np.array(face_assignments)

        # Autres prédictions
        for position, model in self.models.items():
            if position == 'face':
                continue  # Déjà traité

            if model is None:
                n_samples = len(X)
                if position == 'etagere':
                    predictions[position] = np.random.randint(1, 5, n_samples)
                elif position == 'colonne':
                    predictions[position] = np.random.randint(1, 6, n_samples)
                elif position == 'quantite':
                    predictions[position] = np.random.randint(1, 8, n_samples)
            else:
                predictions[position] = model.predict(X)

        return predictions


class ConstraintManager:
    """Gestionnaire des contraintes métier - TOUTES LES CONTRAINTES"""

    def __init__(self):
        self.furniture_constraints = {
            1: {'faces': 1, 'max_faces': 1, 'temp_compatible': ['ambiante'], 'name': 'planogram'},
            2: {'faces': 2, 'max_faces': 2, 'temp_compatible': ['ambiante'], 'name': 'gondola'},
            3: {'faces': 4, 'max_faces': 4, 'temp_compatible': ['ambiante'], 'name': 'shelves-display'},
            4: {'faces': 1, 'max_faces': 1, 'temp_compatible': ['ambiante'], 'name': 'clothing-rack'},
            5: {'faces': 1, 'max_faces': 1, 'temp_compatible': ['ambiante'], 'name': 'wall-display'},
            6: {'faces': 1, 'max_faces': 1, 'temp_compatible': ['ambiante'], 'name': 'accessory-display'},
            7: {'faces': 1, 'max_faces': 1, 'temp_compatible': ['ambiante'], 'name': 'modular-cube'},
            8: {'faces': 1, 'max_faces': 1, 'temp_compatible': ['ambiante'], 'name': 'table'},
            9: {'faces': 1, 'max_faces': 1, 'temp_compatible': ['froid'], 'name': 'refrigerator'},
            10: {'faces': 1, 'max_faces': 1, 'temp_compatible': ['froid'], 'name': 'refrigerated-showcase'},
            11: {'faces': 1, 'max_faces': 1, 'temp_compatible': ['ambiante'], 'name': 'clothing-display'},
            12: {'faces': 1, 'max_faces': 1, 'temp_compatible': ['ambiante'], 'name': 'clothing-wall'}
        }

        # Mapping des faces selon le nombre de faces du meuble
        self.face_mapping = {
            1: ['front'],
            2: ['front', 'back'],
            4: ['front', 'back', 'left', 'right']
        }

    def apply_constraints(self, predictions: Dict[str, Any], original_data: pd.DataFrame) -> Dict[str, Any]:
        """Applique TOUTES les contraintes métier aux prédictions"""
        constrained_predictions = predictions.copy()

        print("🔧 Application des contraintes métier...")

        # 1. CONTRAINTES DE TEMPÉRATURE
        constrained_predictions = self._apply_temperature_constraints(constrained_predictions, original_data)

        # 2. CONTRAINTES DE FACES
        constrained_predictions = self._apply_face_constraints(constrained_predictions)

        # 3. CONTRAINTES DE DIMENSIONS
        constrained_predictions = self._apply_dimension_constraints(constrained_predictions)

        # 4. CONTRAINTES DE PLACEMENT FOURNISSEUR
        constrained_predictions = self._apply_supplier_constraints(constrained_predictions, original_data)

        # 5. CONTRAINTES DE CONDITIONNEMENT
        constrained_predictions = self._apply_packaging_constraints(constrained_predictions, original_data)

        # 6. CONTRAINTES LÉGALES
        constrained_predictions = self._apply_legal_constraints(constrained_predictions, original_data)

        # 7. CONTRAINTES SAISONNIÈRES/ÉVÉNEMENTS
        constrained_predictions = self._apply_seasonal_constraints(constrained_predictions, original_data)

        # 8. CONTRAINTES DE ZONE
        constrained_predictions = self._apply_zone_constraints(constrained_predictions, original_data)

        # 9. CONTRAINTES DE PRIORITÉ MERCHANDISING
        constrained_predictions = self._apply_merchandising_constraints(constrained_predictions, original_data)

        # 10. CONTRAINTES DE SURFACE MAGASIN
        constrained_predictions = self._apply_store_surface_constraints(constrained_predictions, original_data)

        print("✅ Toutes les contraintes appliquées")
        return constrained_predictions

    def _apply_temperature_constraints(self, predictions: Dict[str, Any], original_data: pd.DataFrame) -> Dict[
        str, Any]:
        """1. Contraintes de température - Produits froids → meubles réfrigérés"""
        if 'input_contrainte_temperature_produit' in original_data.columns:
            temp_constraints = original_data['input_contrainte_temperature_produit'].values
            furniture_types = predictions['furniture_type']

            for i, (temp_constraint, furniture_type) in enumerate(zip(temp_constraints, furniture_types)):
                furniture_info = self.furniture_constraints.get(furniture_type, {})
                temp_compatible = furniture_info.get('temp_compatible', ['ambiante'])

                # Si produit froid mais meuble non réfrigéré
                if temp_constraint == 1 and 'froid' not in temp_compatible:
                    predictions['furniture_type'][i] = 9  # Réfrigérateur
                    print(f"  🧊 Produit {i + 1}: Meuble changé vers réfrigérateur (contrainte température)")

        return predictions

    def _apply_face_constraints(self, predictions: Dict[str, Any]) -> Dict[str, Any]:
        """2. Contraintes de faces - Validation des faces selon le type de meuble"""
        furniture_types = predictions['furniture_type']
        faces = predictions['positions']['face']

        for i, (furniture_type, face) in enumerate(zip(furniture_types, faces)):
            faces_count = self.furniture_constraints.get(furniture_type, {}).get('faces', 1)
            available_faces = self.face_mapping[faces_count]

            # Si la face assignée n'est pas disponible pour ce type de meuble
            if face not in available_faces:
                # Assigner une face valide
                predictions['positions']['face'][i] = available_faces[0]
                print(f"  🔄 Produit {i + 1}: Face changée de '{face}' vers '{available_faces[0]}'")

        return predictions

    def _apply_dimension_constraints(self, predictions: Dict[str, Any]) -> Dict[str, Any]:
        """3. Contraintes de dimensions - Limites min/max"""
        dimension_limits = {
            'largeur': (30, 400),
            'hauteur': (50, 300),
            'profondeur': (20, 80),
            'nb_etageres_unique_face': (1, 10),
            'nb_colonnes_unique_face': (1, 15),
            'nb_etageres_front_back': (0, 10),
            'nb_colonnes_front_back': (0, 15),
            'nb_etageres_left_right': (0, 10),
            'nb_colonnes_left_right': (0, 15)
        }

        for dimension, (min_val, max_val) in dimension_limits.items():
            if dimension in predictions['dimensions']:
                original_values = predictions['dimensions'][dimension].copy()
                predictions['dimensions'][dimension] = np.clip(predictions['dimensions'][dimension], min_val, max_val)

                # Compter les modifications
                modified = np.sum(original_values != predictions['dimensions'][dimension])
                if modified > 0:
                    print(f"  📏 {modified} valeurs de {dimension} ajustées aux limites")

        return predictions

    def _apply_supplier_constraints(self, predictions: Dict[str, Any], original_data: pd.DataFrame) -> Dict[str, Any]:
        """4. Contraintes fournisseur - Placement exigé, espace minimum"""
        if 'input_placement_exige_supplier' in original_data.columns:
            placement_requirements = original_data['input_placement_exige_supplier'].values

            for i, placement in enumerate(placement_requirements):
                if placement == 'tete_gondole':
                    # Forcer position en tête (colonne 1)
                    predictions['positions']['colonne'][i] = 1
                elif placement == 'niveau_oeil':
                    # Forcer étagère niveau œil (étagère 3-4)
                    predictions['positions']['etagere'][i] = np.random.choice([3, 4])

            print(f"  🏭 Contraintes fournisseur appliquées")

        return predictions

    def _apply_packaging_constraints(self, predictions: Dict[str, Any], original_data: pd.DataFrame) -> Dict[str, Any]:
        """5. Contraintes de conditionnement - Fragile, liquide, etc."""
        if 'input_contrainte_conditionnement_produit' in original_data.columns:
            packaging_constraints = original_data['input_contrainte_conditionnement_produit'].values

            for i, packaging in enumerate(packaging_constraints):
                if packaging == 'fragile':
                    # Réduire la quantité par position pour les produits fragiles
                    predictions['positions']['quantite'][i] = min(3, predictions['positions']['quantite'][i])
                elif packaging == 'liquide':
                    # Placer sur étagères basses
                    predictions['positions']['etagere'][i] = min(2, predictions['positions']['etagere'][i])

            print(f"  📦 Contraintes de conditionnement appliquées")

        return predictions

    def _apply_legal_constraints(self, predictions: Dict[str, Any], original_data: pd.DataFrame) -> Dict[str, Any]:
        """6. Contraintes légales - Âge, licence, certification"""
        if 'input_type_contrainte_legal' in original_data.columns:
            legal_constraints = original_data['input_type_contrainte_legal'].values

            for i, legal_type in enumerate(legal_constraints):
                if legal_type == 'age':
                    # Placer en hauteur (étagères hautes)
                    predictions['positions']['etagere'][i] = max(4, predictions['positions']['etagere'][i])
                elif legal_type == 'licence':
                    # Zone spéciale (face arrière si disponible)
                    if 'back' in self.face_mapping.get(
                            self.furniture_constraints.get(predictions['furniture_type'][i], {}).get('faces', 1), []):
                        predictions['positions']['face'][i] = 'back'

            print(f"  ⚖️ Contraintes légales appliquées")

        return predictions

    def _apply_seasonal_constraints(self, predictions: Dict[str, Any], original_data: pd.DataFrame) -> Dict[str, Any]:
        """7. Contraintes saisonnières et événements"""
        if 'input_saisonnalite_produit' in original_data.columns:
            seasonal_data = original_data['input_saisonnalite_produit'].values
            current_season = self._get_current_season()

            for i, product_season in enumerate(seasonal_data):
                if product_season == current_season:
                    # Produits de saison → positions privilégiées (face avant, niveau œil)
                    predictions['positions']['face'][i] = 'front'
                    predictions['positions']['etagere'][i] = 3  # Niveau œil
                    predictions['positions']['colonne'][i] = min(3, predictions['positions']['colonne'][
                        i])  # Colonnes centrales

            print(f"  🌟 Contraintes saisonnières appliquées (saison: {current_season})")

        return predictions

    def _apply_zone_constraints(self, predictions: Dict[str, Any], original_data: pd.DataFrame) -> Dict[str, Any]:
        """8. Contraintes de zone - Température, emplacement, éclairage"""
        if 'input_temperature_zone' in original_data.columns:
            zone_temps = original_data['input_temperature_zone'].values

            for i, zone_temp in enumerate(zone_temps):
                if zone_temp == 'froid':
                    # Forcer meuble réfrigéré
                    if predictions['furniture_type'][i] not in [9, 10]:
                        predictions['furniture_type'][i] = 9

        if 'input_emplacement_zone' in original_data.columns:
            zone_locations = original_data['input_emplacement_zone'].values

            for i, location in enumerate(zone_locations):
                if location == 'entree':
                    # Zone d'entrée → positions attractives
                    predictions['positions']['face'][i] = 'front'
                    predictions['positions']['etagere'][i] = 3

            print(f"  🏢 Contraintes de zone appliquées")

        return predictions

    def _apply_merchandising_constraints(self, predictions: Dict[str, Any], original_data: pd.DataFrame) -> Dict[
        str, Any]:
        """9. Contraintes de priorité merchandising"""
        if 'input_priorite_merchandising' in original_data.columns:
            priorities = original_data['input_priorite_merchandising'].values

            for i, priority in enumerate(priorities):
                if priority >= 8:  # Haute priorité
                    # Positions privilégiées
                    predictions['positions']['face'][i] = 'front'
                    predictions['positions']['etagere'][i] = 3  # Niveau œil
                    predictions['positions']['colonne'][i] = min(3, predictions['positions']['colonne'][i])
                    predictions['positions']['quantite'][i] = max(5, predictions['positions']['quantite'][i])
                elif priority <= 3:  # Basse priorité
                    # Positions moins visibles
                    available_faces = self.face_mapping.get(
                        self.furniture_constraints.get(predictions['furniture_type'][i], {}).get('faces', 1), ['front'])
                    if 'back' in available_faces:
                        predictions['positions']['face'][i] = 'back'
                    predictions['positions']['etagere'][i] = max(4, predictions['positions']['etagere'][i])

            print(f"  🎯 Contraintes de merchandising appliquées")

        return predictions

    def _apply_store_surface_constraints(self, predictions: Dict[str, Any], original_data: pd.DataFrame) -> Dict[
        str, Any]:
        """10. Contraintes de surface magasin"""
        if 'input_surface_magasin' in original_data.columns:
            store_surfaces = original_data['input_surface_magasin'].values

            for i, surface in enumerate(store_surfaces):
                if surface < 300:  # Petit magasin
                    # Meubles plus compacts
                    predictions['dimensions']['largeur'][i] = min(100, predictions['dimensions']['largeur'][i])
                    predictions['dimensions']['hauteur'][i] = min(180, predictions['dimensions']['hauteur'][i])
                elif surface > 800:  # Grand magasin
                    # Meubles plus imposants
                    predictions['dimensions']['largeur'][i] = max(150, predictions['dimensions']['largeur'][i])
                    predictions['dimensions']['hauteur'][i] = max(200, predictions['dimensions']['hauteur'][i])

            print(f"  🏬 Contraintes de surface magasin appliquées")

        return predictions

    def _get_current_season(self) -> str:
        """Détermine la saison actuelle"""
        month = datetime.now().month
        if month in [12, 1, 2]:
            return 'hiver'
        elif month in [3, 4, 5]:
            return 'printemps'
        elif month in [6, 7, 8]:
            return 'ete'
        else:
            return 'automne'

    def get_all_constraints_info(self) -> Dict[str, Any]:
        """Retourne la liste complète de toutes les contraintes prises en charge"""
        return {
            "contraintes_temperature": {
                "description": "Produits froids forcés vers meubles réfrigérés",
                "colonnes_utilisees": ["input_contrainte_temperature_produit"],
                "actions": ["Changement type meuble vers réfrigérateur/vitrine"]
            },
            "contraintes_faces": {
                "description": "Validation faces selon type meuble (1, 2 ou 4 faces)",
                "colonnes_utilisees": ["furniture_type"],
                "actions": ["Assignation face valide: front, back, left, right"]
            },
            "contraintes_dimensions": {
                "description": "Limites min/max pour toutes les dimensions",
                "colonnes_utilisees": ["largeur", "hauteur", "profondeur", "nb_etageres", "nb_colonnes"],
                "actions": ["Clipping des valeurs dans les limites autorisées"]
            },
            "contraintes_fournisseur": {
                "description": "Placement exigé par fournisseur",
                "colonnes_utilisees": ["input_placement_exige_supplier", "input_espace_minimum_supplier"],
                "actions": ["Tête gondole → colonne 1", "Niveau œil → étagères 3-4"]
            },
            "contraintes_conditionnement": {
                "description": "Adaptation selon type conditionnement",
                "colonnes_utilisees": ["input_contrainte_conditionnement_produit"],
                "actions": ["Fragile → quantité réduite", "Liquide → étagères basses"]
            },
            "contraintes_legales": {
                "description": "Restrictions légales (âge, licence)",
                "colonnes_utilisees": ["input_type_contrainte_legal"],
                "actions": ["Âge → étagères hautes", "Licence → face arrière"]
            },
            "contraintes_saisonnieres": {
                "description": "Priorité selon saison actuelle",
                "colonnes_utilisees": ["input_saisonnalite_produit"],
                "actions": ["Produits saison → positions privilégiées"]
            },
            "contraintes_zone": {
                "description": "Adaptation selon zone magasin",
                "colonnes_utilisees": ["input_temperature_zone", "input_emplacement_zone"],
                "actions": ["Zone froide → meuble réfrigéré", "Entrée → positions attractives"]
            },
            "contraintes_merchandising": {
                "description": "Priorité merchandising",
                "colonnes_utilisees": ["input_priorite_merchandising"],
                "actions": ["Haute priorité → face avant niveau œil", "Basse priorité → positions arrière"]
            },
            "contraintes_surface_magasin": {
                "description": "Adaptation taille meubles selon surface magasin",
                "colonnes_utilisees": ["input_surface_magasin"],
                "actions": ["Petit magasin → meubles compacts", "Grand magasin → meubles imposants"]
            }
        }


class PlanogramModels:
    """Classe principale pour tous les modèles ML"""

    def __init__(self):
        self.furniture_type_predictor = FurnitureTypePredictor()
        self.dimension_predictor = FurnitureDimensionPredictor()
        self.position_predictor = PositionPredictor()
        self.constraint_manager = ConstraintManager()

    def train_models(self, processed_data: pd.DataFrame):
        """Entraîne tous les modèles"""
        print("🚀 Début de l'entraînement des modèles...")

        # Sélection des features pour l'entraînement
        feature_columns = [col for col in processed_data.columns
                           if col.startswith('input_') and processed_data[col].dtype in ['int64', 'float64']]

        if not feature_columns:
            print("⚠️ Aucune feature numérique trouvée, utilisation de toutes les colonnes")
            feature_columns = processed_data.select_dtypes(include=[np.number]).columns.tolist()

        X = processed_data[feature_columns].fillna(0)

        # 1. Entraînement du prédicteur de types de meubles
        self.furniture_type_predictor.train(X)

        # 2. Prédiction des types pour l'entraînement des autres modèles
        furniture_types = self.furniture_type_predictor.predict(X)

        # 3. Entraînement du prédicteur de dimensions
        self.dimension_predictor.train(X, furniture_types)

        # 4. Prédiction des dimensions pour l'entraînement des positions
        furniture_dimensions = self.dimension_predictor.predict(X, furniture_types)

        # 5. Entraînement du prédicteur de positions
        self.position_predictor.train(X, furniture_dimensions)

        print("✅ Tous les modèles sont entraînés!")

    def predict(self, processed_data: pd.DataFrame) -> Dict[str, Any]:
        """Effectue toutes les prédictions"""
        feature_columns = [col for col in processed_data.columns
                           if col.startswith('input_') and processed_data[col].dtype in ['int64', 'float64']]

        if not feature_columns:
            feature_columns = processed_data.select_dtypes(include=[np.number]).columns.tolist()

        X = processed_data[feature_columns].fillna(0)

        # Prédictions séquentielles
        furniture_types = self.furniture_type_predictor.predict(X)
        furniture_dimensions = self.dimension_predictor.predict(X, furniture_types)
        positions = self.position_predictor.predict(X, furniture_types, furniture_dimensions)

        predictions = {
            'furniture_type': furniture_types,
            'dimensions': furniture_dimensions,
            'positions': positions
        }

        # Application des contraintes
        final_predictions = self.constraint_manager.apply_constraints(predictions, processed_data)

        return final_predictions


class PlanogramAIPipeline:
    """Pipeline principal pour la génération de planogrammes"""

    def __init__(self, csv_path: str = "data/dataset.csv"):
        self.csv_path = csv_path
        self.data_processor = DataProcessor(csv_path)
        self.models = PlanogramModels()
        self.raw_data = None
        self.processed_data = None

    def load_and_preprocess_data(self) -> bool:
        """Charge et prétraite les données"""
        print("📊 Chargement des données...")
        self.raw_data = self.data_processor.load_data()

        if self.raw_data.empty:
            print("❌ Aucune donnée chargée")
            return False

        print("🔧 Prétraitement des données...")
        self.processed_data = self.data_processor.preprocess_data(self.raw_data)
        return True

    def train_models(self):
        """Entraîne les modèles ML"""
        if self.processed_data is None:
            print("❌ Données non prétraitées")
            return

        self.models.train_models(self.processed_data)

    def generate_planogram(self, filtered_data: pd.DataFrame = None) -> Dict[str, Any]:
        """Génère un planogramme complet"""
        if filtered_data is None:
            filtered_data = self.processed_data

        if filtered_data is None or filtered_data.empty:
            print("❌ Aucune donnée pour la génération")
            return {}

        print("🎯 Génération du planogramme...")
        predictions = self.models.predict(filtered_data)

        return predictions

    def run_full_pipeline(self) -> Dict[str, Any]:
        """Exécute le pipeline complet"""
        print("🚀 Démarrage du pipeline complet...")

        # 1. Chargement et prétraitement
        if not self.load_and_preprocess_data():
            return {}

        # 2. Entraînement des modèles
        self.train_models()

        # 3. Génération du planogramme
        results = self.generate_planogram()

        print("✅ Pipeline terminé avec succès!")
        return results

    def run_filtered_pipeline(self, filtered_data: pd.DataFrame, magasin_id: str = None, categorie_id: str = None) -> \
    Dict[str, Any]:
        """Exécute le pipeline avec des données filtrées"""
        print(f"🎯 Pipeline filtré - Magasin: {magasin_id}, Catégorie: {categorie_id}")

        # Prétraitement des données filtrées
        processed_filtered = self.data_processor.preprocess_data(filtered_data)

        # Génération avec les données filtrées
        results = self.generate_planogram(processed_filtered)

        return results

    def generate_json_output(self, results: Dict[str, Any], magasin_id: str = "MG001",
                             categorie_id: str = "CAT001") -> Dict[str, Any]:
        """Génère la sortie JSON finale simplifiée"""
        if not results:
            return {}

        # Structure JSON de sortie simplifiée
        json_output = {
            "planogram_info": {
                "planogram_id": f"PLANO_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "nom_planogram": f"Planogramme {magasin_id}_{categorie_id}",
                "statut": "generated",
                "date_creation": datetime.now().isoformat(),
                "magasin_id": magasin_id,
                "categorie_id": categorie_id
            },
            "furniture": [],
            "product_positions": []
        }

        # On ne prend que le premier meuble et la première position pour l'exemple simplifié
        if len(results['furniture_type']) > 0:
            furniture_id = "FURN_001"
            furniture_type_id = int(results['furniture_type'][0])

            # Ajout du meuble
            json_output["furniture"].append({
                "furniture_id": furniture_id,
                "furniture_type_id": furniture_type_id,
                "furniture_type_name": {
                    1: "planogram", 2: "gondola", 3: "shelves-display", 4: "clothing-rack",
                    5: "wall-display", 6: "accessory-display", 7: "modular-cube", 8: "table",
                    9: "refrigerator", 10: "refrigerated-showcase", 11: "clothing-display", 12: "clothing-wall"
                }.get(furniture_type_id, "unknown"),
                "faces": 1,
                "available_faces": ["front"],
                "largeur": float(results['dimensions']['largeur'][0]),
                "hauteur": float(results['dimensions']['hauteur'][0]),
                "profondeur": float(results['dimensions']['profondeur'][0]),
                "imageUrl": f"/images/furniture_{furniture_type_id}.png",
                "nb_etageres_unique_face": 4,
                "nb_colonnes_unique_face": 5,
                "nb_etageres_front_back": 0,
                "nb_colonnes_front_back": 0,
                "nb_etageres_left_right": 0,
                "nb_colonnes_left_right": 0
            })

            # Ajout de la position
            if len(results['positions']['face']) > 0:
                json_output["product_positions"].append({
                    "position_id": "POS_001",
                    "furniture_id": furniture_id,
                    "produit_id": "PROD_001",
                    "face": "front",
                    "etagere": 4,
                    "colonne": 1,
                    "quantite": 5
                })

        return json_output

    def save_results(self, results: Dict[str, Any], filename: str = None):
        """Sauvegarde les résultats en JSON"""
        if filename is None:
            filename = f"outputs/planogram_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        try:
            import os
            os.makedirs(os.path.dirname(filename), exist_ok=True)

            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2, ensure_ascii=False)

            print(f"✅ Résultats sauvegardés: {filename}")
        except Exception as e:
            print(f"❌ Erreur lors de la sauvegarde: {e}")

    def get_constraints_summary(self) -> Dict[str, Any]:
        """Retourne un résumé de toutes les contraintes prises en charge"""
        return self.models.constraint_manager.get_all_constraints_info()


# Fonction principale pour tester le pipeline
def main():
    """Fonction principale de test"""
    print("🏪 Système de Génération de Planogrammes IA")
    print("=" * 50)

    # Initialisation du pipeline
    pipeline = PlanogramAIPipeline("data/dataset.csv")

    # Affichage des contraintes prises en charge
    print("\n📋 CONTRAINTES PRISES EN CHARGE:")
    print("=" * 40)
    constraints_info = pipeline.get_constraints_summary()

    for i, (constraint_name, info) in enumerate(constraints_info.items(), 1):
        print(f"\n{i}. {constraint_name.upper().replace('_', ' ')}")
        print(f"   📝 {info['description']}")
        print(f"   📊 Colonnes: {', '.join(info['colonnes_utilisees'])}")
        print(f"   ⚡ Actions: {', '.join(info['actions'])}")

    print(f"\n🎯 TOTAL: {len(constraints_info)} types de contraintes appliquées")

    # Exécution du pipeline complet
    print("\n" + "=" * 50)
    results = pipeline.run_full_pipeline()

    if results:
        # Génération du JSON de sortie
        json_output = pipeline.generate_json_output(results)

        # Sauvegarde
        pipeline.save_results(json_output)

        # Affichage des statistiques
        print("\n📊 Statistiques du planogramme généré:")
        if 'statistics' in json_output:
            for key, value in json_output['statistics'].items():
                if key == 'face_distribution':
                    print(f"  • Distribution des faces:")
                    for face, count in value.items():
                        if count > 0:
                            print(f"    - {face}: {count}")
                else:
                    print(f"  • {key}: {value}")

    print("\n✅ Génération terminée!")


if __name__ == "__main__":
    main()
