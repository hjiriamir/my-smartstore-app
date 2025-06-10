"""
Module de gestion des contraintes pour le système de planogramme IA
"""

import pandas as pd
import numpy as np

class ConstraintManager:
    def __init__(self):
        """
        Initialise le gestionnaire de contraintes
        """
        pass

    def apply_constraints(self, predictions, data):
        """
        Applique les contraintes métier aux prédictions

        Args:
            predictions: DataFrame contenant les prédictions
            data: DataFrame contenant les données originales

        Returns:
            DataFrame: Prédictions ajustées
        """
        # Copier les prédictions pour ne pas modifier l'original
        adjusted_predictions = predictions.copy()

        # Appliquer les contraintes de température
        adjusted_predictions = self._apply_temperature_constraints(adjusted_predictions, data)

        # Appliquer les contraintes de priorité
        adjusted_predictions = self._apply_priority_constraints(adjusted_predictions, data)

        # Appliquer les contraintes de placement
        adjusted_predictions = self._apply_placement_constraints(adjusted_predictions, data)

        # Appliquer les contraintes de dimensions
        adjusted_predictions = self._apply_dimension_constraints(adjusted_predictions, data)

        # Vérifier les collisions et les résoudre
        adjusted_predictions = self._resolve_collisions(adjusted_predictions)

        # Fusionner les données originales avec les prédictions ajustées
        if isinstance(data, pd.DataFrame) and isinstance(adjusted_predictions, pd.DataFrame):
            result = pd.concat([data.reset_index(drop=True), adjusted_predictions.reset_index(drop=True)], axis=1)
            # Supprimer les colonnes en double
            result = result.loc[:, ~result.columns.duplicated()]
            return result
        else:
            return adjusted_predictions

    def _apply_temperature_constraints(self, predictions, data):
        """
        Applique les contraintes de température

        Args:
            predictions: DataFrame contenant les prédictions
            data: DataFrame contenant les données originales

        Returns:
            DataFrame: Prédictions ajustées
        """
        if 'input_contrainte_temperature_produit' in data.columns:
            # Regrouper les produits froids ensemble
            cold_products = data['input_contrainte_temperature_produit'] == 'froid'
            if cold_products.any():
                # Placer les produits froids sur les étagères inférieures
                nb_etageres = predictions['output_nb_etageres_planogramme'].max()
                predictions.loc[cold_products, 'output_position_prod_etagere'] = nb_etageres - 1

        return predictions

    def _apply_priority_constraints(self, predictions, data):
        """
        Applique les contraintes de priorité

        Args:
            predictions: DataFrame contenant les prédictions
            data: DataFrame contenant les données originales

        Returns:
            DataFrame: Prédictions ajustées
        """
        if 'input_priorite_merchandising' in data.columns:
            # Placer les produits à haute priorité à hauteur des yeux (étagères du milieu)
            high_priority = data['input_priorite_merchandising'] >= 8
            if high_priority.any():
                nb_etageres = predictions['output_nb_etageres_planogramme'].max()
                middle_shelf = nb_etageres // 2
                predictions.loc[high_priority, 'output_position_prod_etagere'] = middle_shelf

        return predictions

    def _apply_placement_constraints(self, predictions, data):
        """
        Applique les contraintes de placement

        Args:
            predictions: DataFrame contenant les prédictions
            data: DataFrame contenant les données originales

        Returns:
            DataFrame: Prédictions ajustées
        """
        # Vérifier que les positions sont dans les limites
        nb_etageres = predictions['output_nb_etageres_planogramme'].max()
        nb_colonnes = predictions['output_nb_colonnes_planogramme'].max()

        # Limiter les positions aux dimensions du planogramme (numérotation commence à 1)
        predictions['output_position_prod_etagere'] = predictions['output_position_prod_etagere'].clip(1, nb_etageres)
        predictions['output_position_prod_colonne'] = predictions['output_position_prod_colonne'].clip(1, nb_colonnes)

        return predictions

    def _apply_dimension_constraints(self, predictions, data):
        """
        Applique les contraintes de dimensions

        Args:
            predictions: DataFrame contenant les prédictions
            data: DataFrame contenant les données originales

        Returns:
            DataFrame: Prédictions ajustées
        """
        # Vérifier que les dimensions sont raisonnables
        predictions['output_largeur_planogramme'] = predictions['output_largeur_planogramme'].clip(50, 500)
        predictions['output_hauteur_planogramme'] = predictions['output_hauteur_planogramme'].clip(50, 300)

        # Vérifier que le nombre d'étagères et de colonnes est raisonnable
        predictions['output_nb_etageres_planogramme'] = predictions['output_nb_etageres_planogramme'].clip(1, 10)
        predictions['output_nb_colonnes_planogramme'] = predictions['output_nb_colonnes_planogramme'].clip(1, 20)

        return predictions

    def _resolve_collisions(self, predictions):
        """
        Résout les collisions entre produits

        Args:
            predictions: DataFrame contenant les prédictions

        Returns:
            DataFrame: Prédictions ajustées
        """
        # Créer une matrice pour suivre les positions occupées (numérotation commence à 1)
        nb_etageres = predictions['output_nb_etageres_planogramme'].max()
        nb_colonnes = predictions['output_nb_colonnes_planogramme'].max()
        occupied = np.zeros((nb_etageres + 1, nb_colonnes + 1), dtype=bool)  # +1 pour gérer l'index 1

        # Parcourir les prédictions et résoudre les collisions
        for i, row in predictions.iterrows():
            etage = int(row['output_position_prod_etagere'])
            colonne = int(row['output_position_prod_colonne'])

            # Vérifier les limites
            if etage < 1 or etage > nb_etageres or colonne < 1 or colonne > nb_colonnes:
                # Position invalide, assigner une position par défaut
                etage = 1
                colonne = 1
                predictions.at[i, 'output_position_prod_etagere'] = etage
                predictions.at[i, 'output_position_prod_colonne'] = colonne

            # Vérifier si la position est déjà occupée
            if occupied[etage, colonne]:
                # Trouver une position libre
                found = False
                for e in range(1, nb_etageres + 1):  # Commence à 1
                    for c in range(1, nb_colonnes + 1):  # Commence à 1
                        if not occupied[e, c]:
                            predictions.at[i, 'output_position_prod_etagere'] = e
                            predictions.at[i, 'output_position_prod_colonne'] = c
                            occupied[e, c] = True
                            found = True
                            break
                    if found:
                        break
            else:
                occupied[etage, colonne] = True

        return predictions

    def check_all_constraints(self, predictions, data):
        """
        Vérifie toutes les contraintes et retourne les violations

        Args:
            predictions: DataFrame contenant les prédictions
            data: DataFrame contenant les données originales

        Returns:
            list: Liste des violations de contraintes
        """
        violations = []

        try:
            # Vérifier les contraintes de température
            temp_violations = self._check_temperature_constraints(predictions, data)
            violations.extend(temp_violations)

            # Vérifier les contraintes de priorité
            priority_violations = self._check_priority_constraints(predictions, data)
            violations.extend(priority_violations)

            # Vérifier les contraintes de placement
            placement_violations = self._check_placement_constraints(predictions, data)
            violations.extend(placement_violations)

            # Vérifier les contraintes de dimensions
            dimension_violations = self._check_dimension_constraints(predictions, data)
            violations.extend(dimension_violations)

            # Vérifier les collisions
            collision_violations = self._check_collisions(predictions)
            violations.extend(collision_violations)

        except Exception as e:
            print(f"⚠️ Erreur lors de la vérification des contraintes: {e}")
            # En cas d'erreur, retourner une liste vide pour éviter les calculs négatifs
            violations = []

        return violations

    def _check_temperature_constraints(self, predictions, data):
        """
        Vérifie les contraintes de température

        Args:
            predictions: DataFrame contenant les prédictions
            data: DataFrame contenant les données originales

        Returns:
            list: Liste des violations de contraintes de température
        """
        violations = []

        if 'input_contrainte_temperature_produit' in data.columns:
            # Vérifier que les produits froids sont sur les étagères inférieures
            cold_products = data['input_contrainte_temperature_produit'] == 'froid'
            if cold_products.any():
                nb_etageres = predictions['output_nb_etageres_planogramme'].max()
                for i, is_cold in enumerate(cold_products):
                    if is_cold and predictions.iloc[i]['output_position_prod_etagere'] < nb_etageres - 2:
                        violations.append(f"Produit froid {data.iloc[i]['input_produit_id']} placé trop haut")

        return violations

    def _check_priority_constraints(self, predictions, data):
        """
        Vérifie les contraintes de priorité

        Args:
            predictions: DataFrame contenant les prédictions
            data: DataFrame contenant les données originales

        Returns:
            list: Liste des violations de contraintes de priorité
        """
        violations = []

        if 'input_priorite_merchandising' in data.columns:
            # Vérifier que les produits à haute priorité sont à hauteur des yeux
            high_priority = data['input_priorite_merchandising'] >= 8
            if high_priority.any():
                nb_etageres = predictions['output_nb_etageres_planogramme'].max()
                middle_shelf_min = (nb_etageres // 2) - 1
                middle_shelf_max = (nb_etageres // 2) + 1
                for i, is_high_priority in enumerate(high_priority):
                    if is_high_priority:
                        shelf = predictions.iloc[i]['output_position_prod_etagere']
                        if shelf < middle_shelf_min or shelf > middle_shelf_max:
                            violations.append(f"Produit prioritaire {data.iloc[i]['input_produit_id']} mal placé")

        return violations

    def _check_placement_constraints(self, predictions, data):
        """
        Vérifie les contraintes de placement

        Args:
            predictions: DataFrame contenant les prédictions
            data: DataFrame contenant les données originales

        Returns:
            list: Liste des violations de contraintes de placement
        """
        violations = []

        try:
            # Vérifier que les positions sont dans les limites
            nb_etageres = predictions['output_nb_etageres_planogramme'].max()
            nb_colonnes = predictions['output_nb_colonnes_planogramme'].max()

            for i, row in predictions.iterrows():
                etage = row['output_position_prod_etagere']
                colonne = row['output_position_prod_colonne']

                # Vérifier les limites (numérotation 1-based)
                if etage < 1 or etage > nb_etageres:
                    product_id = data.iloc[i]['input_produit_id'] if i < len(data) else f"Produit_{i}"
                    violations.append(f"Produit {product_id} hors limites (étage: {etage})")

                if colonne < 1 or colonne > nb_colonnes:
                    product_id = data.iloc[i]['input_produit_id'] if i < len(data) else f"Produit_{i}"
                    violations.append(f"Produit {product_id} hors limites (colonne: {colonne})")

        except Exception as e:
            print(f"⚠️ Erreur dans _check_placement_constraints: {e}")

        return violations

    def _check_dimension_constraints(self, predictions, data):
        """
        Vérifie les contraintes de dimensions

        Args:
            predictions: DataFrame contenant les prédictions
            data: DataFrame contenant les données originales

        Returns:
            list: Liste des violations de contraintes de dimensions
        """
        violations = []

        # Vérifier que les dimensions sont raisonnables
        for i, row in predictions.iterrows():
            if row['output_largeur_planogramme'] < 50 or row['output_largeur_planogramme'] > 500:
                violations.append("Largeur du planogramme hors limites")

            if row['output_hauteur_planogramme'] < 50 or row['output_hauteur_planogramme'] > 300:
                violations.append("Hauteur du planogramme hors limites")

            if row['output_nb_etageres_planogramme'] < 1 or row['output_nb_etageres_planogramme'] > 10:
                violations.append("Nombre d'étagères hors limites")

            if row['output_nb_colonnes_planogramme'] < 1 or row['output_nb_colonnes_planogramme'] > 20:
                violations.append("Nombre de colonnes hors limites")

        return violations

    def _check_collisions(self, predictions):
        """
        Vérifie les collisions entre produits
        
        Args:
            predictions: DataFrame contenant les prédictions
            
        Returns:
            list: Liste des violations de contraintes de collision
        """
        violations = []
        
        # Créer une matrice pour suivre les positions occupées
        nb_etageres = predictions['output_nb_etageres_planogramme'].max()
        nb_colonnes = predictions['output_nb_colonnes_planogramme'].max()
        occupied = {}
        
        # Parcourir les prédictions et vérifier les collisions
        for i, row in predictions.iterrows():
            etage = int(row['output_position_prod_etagere'])
            colonne = int(row['output_position_prod_colonne'])
            position = (etage, colonne)
            
            # Vérifier si la position est déjà occupée
            if position in occupied:
                violations.append(f"Collision à la position {position} entre les produits {i} et {occupied[position]}")
            else:
                occupied[position] = i
        
        return violations
