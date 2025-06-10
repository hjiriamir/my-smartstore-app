"""
Module de visualisation 3D des planogrammes amélioré
"""

import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
import numpy as np
import pandas as pd
import matplotlib.colors as mcolors
import seaborn as sns

class Planogram3DVisualizer:
    def __init__(self):
        """
        Initialise le visualiseur 3D de planogrammes
        """
        # Utiliser une palette de couleurs plus distincte
        self.colors = sns.color_palette("Set3", 12) + sns.color_palette("tab20", 20)

    def create_3d_planogram(self, results):
        """
        Crée une visualisation 3D améliorée du planogramme

        Args:
            results: Résultats du pipeline contenant les prédictions et les dimensions

        Returns:
            Figure: Figure matplotlib 3D
        """
        # Créer une figure plus grande avec un fond blanc
        fig = plt.figure(figsize=(14, 10), facecolor='white')
        ax = fig.add_subplot(111, projection='3d')
        ax.set_facecolor('white')

        # Extraire les dimensions du planogramme
        nb_etageres = results['dimensions']['output_nb_etageres_planogramme']
        nb_colonnes = results['dimensions']['output_nb_colonnes_planogramme']

        # Dessiner la structure du planogramme (étagères)
        self._draw_shelving_structure(ax, nb_etageres, nb_colonnes)

        # Placer les produits si disponibles
        if 'predictions' in results and isinstance(results['predictions'], pd.DataFrame):
            self._place_products_3d(ax, results['predictions'], nb_etageres, nb_colonnes)

        # Configuration des axes avec des labels en français
        ax.set_xlabel('Colonnes', fontsize=12, fontweight='bold')
        ax.set_ylabel('Profondeur', fontsize=12, fontweight='bold')
        ax.set_zlabel('Étagères', fontsize=12, fontweight='bold')

        # Définir les limites des axes
        ax.set_xlim(0, nb_colonnes + 1)
        ax.set_ylim(0, 2)
        ax.set_zlim(0, nb_etageres + 1)

        # Personnaliser les ticks
        ax.set_xticks(range(1, nb_colonnes + 1))
        ax.set_xticklabels([f'C{i}' for i in range(1, nb_colonnes + 1)])
        ax.set_yticks([0.5, 1.5])
        ax.set_yticklabels(['Avant', 'Arrière'])
        ax.set_zticks(range(1, nb_etageres + 1))
        ax.set_zticklabels([f'É{i}' for i in range(1, nb_etageres + 1)])

        # Titre avec informations
        ax.set_title(f'Planogramme 3D - {nb_etageres} étagères × {nb_colonnes} colonnes',
                    fontsize=14, fontweight='bold', pad=20)

        # Améliorer l'angle de vue
        ax.view_init(elev=25, azim=45)

        # Supprimer les lignes de grille confuses
        ax.grid(False)

        # Ajouter une légende si il y a des produits
        if 'predictions' in results and isinstance(results['predictions'], pd.DataFrame):
            self._add_legend(ax, results['predictions'])

        # Ajuster la mise en page
        plt.tight_layout()

        return fig

    def _draw_shelving_structure(self, ax, nb_etageres, nb_colonnes):
        """
        Dessine la structure des étagères en 3D
        """
        # Couleur des étagères
        shelf_color = '#8B4513'  # Marron pour les étagères
        shelf_alpha = 0.3

        # Dessiner les étagères horizontales
        for etage in range(1, nb_etageres + 1):
            # Créer une surface pour chaque étagère
            xx, yy = np.meshgrid([0.5, nb_colonnes + 0.5], [0, 2])
            zz = np.full_like(xx, etage - 0.1)
            ax.plot_surface(xx, yy, zz, color=shelf_color, alpha=shelf_alpha)

            # Ajouter des bordures pour les étagères
            for col in range(1, nb_colonnes + 1):
                # Bordures avant et arrière
                ax.plot([col - 0.4, col + 0.4], [0, 0], [etage - 0.1, etage - 0.1],
                       color=shelf_color, linewidth=2)
                ax.plot([col - 0.4, col + 0.4], [2, 2], [etage - 0.1, etage - 0.1],
                       color=shelf_color, linewidth=2)

                # Bordures latérales
                ax.plot([col - 0.4, col - 0.4], [0, 2], [etage - 0.1, etage - 0.1],
                       color=shelf_color, linewidth=2)
                ax.plot([col + 0.4, col + 0.4], [0, 2], [etage - 0.1, etage - 0.1],
                       color=shelf_color, linewidth=2)

    def _place_products_3d(self, ax, predictions, nb_etageres, nb_colonnes):
        """
        Place les produits en 3D avec des cubes colorés et étiquetés
        """
        product_count = 0

        for i, row in predictions.iterrows():
            etage = int(row['output_position_prod_etagere'])
            colonne = int(row['output_position_prod_colonne'])

            if 1 <= etage <= nb_etageres and 1 <= colonne <= nb_colonnes:
                # Choisir une couleur unique pour chaque produit
                color_idx = product_count % len(self.colors)
                color = self.colors[color_idx]

                # Créer un cube pour représenter le produit
                self._draw_product_cube(ax, colonne, etage, color, row['input_produit_id'])

                product_count += 1

    def _draw_product_cube(self, ax, colonne, etage, color, product_id):
        """
        Dessine un cube 3D pour représenter un produit
        """
        # Dimensions du cube
        size = 0.3
        x_center = colonne
        y_center = 1  # Centré en profondeur
        z_center = etage + 0.2  # Légèrement au-dessus de l'étagère

        # Définir les 8 sommets du cube
        vertices = [
            [x_center - size/2, y_center - size/2, z_center - size/2],
            [x_center + size/2, y_center - size/2, z_center - size/2],
            [x_center + size/2, y_center + size/2, z_center - size/2],
            [x_center - size/2, y_center + size/2, z_center - size/2],
            [x_center - size/2, y_center - size/2, z_center + size/2],
            [x_center + size/2, y_center - size/2, z_center + size/2],
            [x_center + size/2, y_center + size/2, z_center + size/2],
            [x_center - size/2, y_center + size/2, z_center + size/2]
        ]

        # Définir les 6 faces du cube
        faces = [
            [vertices[0], vertices[1], vertices[2], vertices[3]],  # Bottom
            [vertices[4], vertices[5], vertices[6], vertices[7]],  # Top
            [vertices[0], vertices[1], vertices[5], vertices[4]],  # Front
            [vertices[2], vertices[3], vertices[7], vertices[6]],  # Back
            [vertices[1], vertices[2], vertices[6], vertices[5]],  # Right
            [vertices[4], vertices[7], vertices[3], vertices[0]]   # Left
        ]

        # Créer la collection de polygones 3D
        cube = Poly3DCollection(faces, facecolors=color, edgecolors='black',
                               alpha=0.8, linewidths=1)
        ax.add_collection3d(cube)

        # Ajouter l'étiquette du produit
        ax.text(x_center, y_center, z_center + size/2 + 0.1,
               str(product_id), fontsize=8, ha='center', va='bottom',
               bbox=dict(boxstyle="round,pad=0.1", facecolor='white', alpha=0.8))

    def _add_legend(self, ax, predictions):
        """
        Ajoute une légende pour les produits
        """
        # Créer une légende simple
        legend_text = f"Produits placés: {len(predictions)}"
        ax.text2D(0.02, 0.98, legend_text, transform=ax.transAxes,
                 fontsize=10, verticalalignment='top',
                 bbox=dict(boxstyle="round,pad=0.3", facecolor='lightblue', alpha=0.8))

        # Ajouter des informations sur les étagères
        info_text = "Étagère 1 = Sol\nÉtagère haute = Niveau des yeux"
        ax.text2D(0.02, 0.85, info_text, transform=ax.transAxes,
                 fontsize=9, verticalalignment='top',
                 bbox=dict(boxstyle="round,pad=0.3", facecolor='lightyellow', alpha=0.8))

    def create_interactive_3d_planogram(self, results):
        """
        Crée une version interactive avec Plotly (pour le futur)
        """
        try:
            import plotly.graph_objects as go
            import plotly.express as px

            # Extraire les dimensions
            nb_etageres = results['dimensions']['output_nb_etageres_planogramme']
            nb_colonnes = results['dimensions']['output_nb_colonnes_planogramme']

            # Préparer les données pour Plotly
            if 'predictions' in results and isinstance(results['predictions'], pd.DataFrame):
                df = results['predictions'].copy()

                # Créer le graphique 3D interactif
                fig = go.Figure()

                # Ajouter les produits
                for i, row in df.iterrows():
                    etage = int(row['output_position_prod_etagere'])
                    colonne = int(row['output_position_prod_colonne'])

                    if 1 <= etage <= nb_etageres and 1 <= colonne <= nb_colonnes:
                        fig.add_trace(go.Scatter3d(
                            x=[colonne],
                            y=[1],
                            z=[etage],
                            mode='markers+text',
                            marker=dict(size=20, opacity=0.8),
                            text=[str(row['input_produit_id'])],
                            textposition="middle center",
                            name=f"Produit {row['input_produit_id']}"
                        ))

                # Configuration de la mise en page
                fig.update_layout(
                    title="Planogramme 3D Interactif",
                    scene=dict(
                        xaxis_title="Colonnes",
                        yaxis_title="Profondeur",
                        zaxis_title="Étagères",
                        camera=dict(eye=dict(x=1.5, y=1.5, z=1.5))
                    ),
                    width=800,
                    height=600
                )

                return fig

        except ImportError:
            return None

    def export_3d_to_html(self, results):
        """
        Exporte la visualisation 3D en HTML interactif
        """
        # Essayer de créer une version Plotly
        plotly_fig = self.create_interactive_3d_planogram(results)

        if plotly_fig:
            # Si Plotly est disponible, retourner le HTML
            return plotly_fig.to_html(include_plotlyjs='cdn')
        else:
            # Sinon, retourner un message d'information
            html_content = """
            <div style="text-align: center; padding: 30px; border: 2px dashed #ccc; border-radius: 10px;">
                <h3>🚀 Visualisation 3D Interactive</h3>
                <p><strong>Fonctionnalité en développement</strong></p>
                <p>Pour activer la vue 3D interactive, installez Plotly :</p>
                <code style="background: #f0f0f0; padding: 5px; border-radius: 3px;">pip install plotly</code>
                <br><br>
                <p>Cette version inclura :</p>
                <ul style="text-align: left; display: inline-block;">
                    <li>🔄 Rotation interactive de la vue</li>
                    <li>🔍 Zoom et panoramique</li>
                    <li>📋 Informations détaillées au survol</li>
                    <li>🎨 Couleurs personnalisables</li>
                    <li>📊 Filtres par catégorie</li>
                </ul>
            </div>
            """
            return html_content
