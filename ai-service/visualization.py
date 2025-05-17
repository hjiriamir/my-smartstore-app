import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import numpy as np
from typing import Dict, List
import pandas as pd


def visualize_planogram(planogram_params: Dict, products: pd.DataFrame, product_placements: List[Dict]):
    """
    Visualise un planogramme avec les produits placés selon leurs positions prédites
    en 2D et en 3D

    Args:
        planogram_params: Dictionnaire contenant les paramètres du planogramme
            - longueur: float
            - largeur: float
            - nb_etageres: int
            - nb_colonnes: int
        products: DataFrame contenant les informations sur les produits
        product_placements: Liste des placements prédits (contient position_etagere et position_colonne)
    """
    # Extraction des paramètres
    longueur = planogram_params['longueur']
    largeur = planogram_params['largeur']
    nb_etageres = planogram_params['nb_etageres']
    nb_colonnes = planogram_params['nb_colonnes']

    # Couleurs par catégorie
    categories = products['categorie_produit'].unique()
    color_map = {cat: plt.cm.tab10(i % 10) for i, cat in enumerate(categories)}

    # 1. Visualisation 2D (version existante)
    fig_2d, ax_2d = plt.subplots(figsize=(12, 8))
    _draw_planogram_2d(ax_2d, longueur, largeur, nb_etageres, nb_colonnes,
                       products, product_placements, color_map)
    plt.tight_layout()
    plt.savefig('planogram_2d.png', dpi=300, bbox_inches='tight')
    plt.close(fig_2d)

    # 2. Visualisation 3D
    fig_3d = plt.figure(figsize=(14, 10))
    ax_3d = fig_3d.add_subplot(111, projection='3d')
    _draw_planogram_3d(ax_3d, longueur, largeur, nb_etageres, nb_colonnes,
                       products, product_placements, color_map)
    plt.tight_layout()
    plt.savefig('planogram_3d.png', dpi=300, bbox_inches='tight')
    plt.close(fig_3d)

    print("Visualisations du planogramme sauvegardées:")
    print("- 2D: 'planogram_2d.png'")
    print("- 3D: 'planogram_3d.png'")
    print(f"Nombre de produits affichés: {len(product_placements)}/{len(products)}")


def _draw_planogram_2d(ax, longueur, largeur, nb_etageres, nb_colonnes,
                       products, product_placements, color_map):
    """Dessine le planogramme en 2D"""
    # Dessin du planogramme (étagères)
    for i in range(nb_etageres + 1):
        y = i * (largeur / nb_etageres)
        ax.plot([0, longueur], [y, y], 'k-', linewidth=2)

    # Dessin des séparations de colonnes
    for j in range(nb_colonnes + 1):
        x = j * (longueur / nb_colonnes)
        ax.plot([x, x], [0, largeur], 'k-', linewidth=1)

    # Placement des produits selon leurs positions prédites
    cell_width = longueur / nb_colonnes
    cell_height = largeur / nb_etageres

    for placement in product_placements:
        # Inversion verticale pour avoir l'étagère 1 en haut
        row = nb_etageres - placement['position_etagere']
        col = placement['position_colonne'] - 1

        # Coordonnées du rectangle
        x = col * cell_width
        y = row * cell_height

        # Récupération des infos du produit
        product = products[products['produit_id'] == placement['produit_id']].iloc[0]

        # Dessin du rectangle représentant le produit
        rect = plt.Rectangle((x, y), cell_width, cell_height,
                             facecolor=color_map[product['categorie_produit']],
                             alpha=0.7)
        ax.add_patch(rect)

        # Ajout du texte (ID produit et score)
        ax.text(x + cell_width / 2, y + cell_height / 2,
                f"{placement['produit_id']}\nScore: {placement['score']:.2f}",
                ha='center', va='center', fontsize=8)

    # Ajout de la légende
    legend_elements = [plt.Rectangle((0, 0), 1, 1, facecolor=color_map[cat], alpha=0.7,
                                     label=cat) for cat in color_map]
    ax.legend(handles=legend_elements, loc='upper right', bbox_to_anchor=(1.15, 1))

    # Configuration des axes
    ax.set_xlim(0, longueur)
    ax.set_ylim(0, largeur)
    ax.set_xlabel('Longueur (cm)')
    ax.set_ylabel('Largeur (cm)')
    ax.set_title(f'Planogramme Optimisé 2D ({nb_etageres} étagères × {nb_colonnes} colonnes)')
    ax.set_aspect('equal')


def _draw_planogram_3d(ax, longueur, largeur, nb_etageres, nb_colonnes,
                       products, product_placements, color_map):
    """Dessine le planogramme en 3D"""
    # Dimensions des cellules
    cell_width = longueur / nb_colonnes
    cell_height = largeur / nb_etageres
    cell_depth = 30  # Profondeur arbitraire pour la visualisation 3D

    # Dessin de la structure du planogramme (étagères)
    for i in range(nb_etageres + 1):
        y = i * cell_height
        ax.plot([0, longueur], [y, y], [0, 0], 'k-', linewidth=1)
        ax.plot([0, longueur], [y, y], [cell_depth, cell_depth], 'k-', linewidth=1)

    # Dessin des séparations verticales
    for j in range(nb_colonnes + 1):
        x = j * cell_width
        ax.plot([x, x], [0, largeur], [0, 0], 'k-', linewidth=1)
        ax.plot([x, x], [0, largeur], [cell_depth, cell_depth], 'k-', linewidth=1)

    # Dessin des arêtes verticales
    for i in range(nb_etageres + 1):
        for j in range(nb_colonnes + 1):
            x = j * cell_width
            y = i * cell_height
            ax.plot([x, x], [y, y], [0, cell_depth], 'k-', linewidth=1)

    # Placement des produits en 3D
    for placement in product_placements:
        # Positionnement (étagère 1 en bas pour la 3D)
        row = placement['position_etagere'] - 1  # Pas d'inversion en 3D
        col = placement['position_colonne'] - 1

        # Coordonnées
        x = col * cell_width
        y = row * cell_height
        z = 0  # Base du produit

        # Récupération des infos du produit
        product = products[products['produit_id'] == placement['produit_id']].iloc[0]

        # Création du cube représentant le produit
        _draw_cube(ax,
                   x, y, z,
                   cell_width, cell_height, cell_depth,
                   color_map[product['categorie_produit']],
                   alpha=0.7)

        # Ajout du label
        ax.text(x + cell_width / 2, y + cell_height / 2, z + cell_depth / 2,
                f"{placement['produit_id']}\n{placement['score']:.2f}",
                ha='center', va='center', fontsize=8)

    # Configuration de la vue 3D
    ax.set_xlim(0, longueur)
    ax.set_ylim(0, largeur)
    ax.set_zlim(0, cell_depth * 1.5)
    ax.set_xlabel('Longueur (cm)')
    ax.set_ylabel('Largeur (cm)')
    ax.set_zlabel('Profondeur')
    ax.set_title(f'Planogramme Optimisé 3D ({nb_etageres} étagères × {nb_colonnes} colonnes)')

    # Légende
    legend_elements = [plt.Rectangle((0, 0), 1, 1, facecolor=color_map[cat], alpha=0.7,
                                     label=cat) for cat in color_map]
    ax.legend(handles=legend_elements, loc='upper right', bbox_to_anchor=(1.1, 0.9))


def _draw_cube(ax, x, y, z, dx, dy, dz, color, alpha=1.0):
    """Dessine un cube en 3D"""
    # Dessine les 6 faces du cube
    xx = [x, x, x + dx, x + dx, x]
    yy = [y, y + dy, y + dy, y, y]

    # Face avant
    ax.plot(xx, yy, [z] * 5, color='k', linewidth=0.5)
    # Face arrière
    ax.plot(xx, yy, [z + dz] * 5, color='k', linewidth=0.5)
    # Faces latérales
    for i in range(4):
        ax.plot([xx[i], xx[i]], [yy[i], yy[i]], [z, z + dz], color='k', linewidth=0.5)

    # Remplissage des faces
    ax.plot_surface(np.array([[x, x + dx], [x, x + dx]]),
                    np.array([[y, y], [y + dy, y + dy]]),
                    np.array([[z, z], [z, z]]),
                    color=color, alpha=alpha)
    ax.plot_surface(np.array([[x, x + dx], [x, x + dx]]),
                    np.array([[y, y], [y + dy, y + dy]]),
                    np.array([[z + dz, z + dz], [z + dz, z + dz]]),
                    color=color, alpha=alpha)


def visualize_model_performance(metrics: Dict):
    """Visualise les performances du modèle"""
    # Extraction des métriques
    rmse_values = [metrics['RMSE'][col] for col in metrics['RMSE']]
    r2_values = [metrics['R²'][col] for col in metrics['R²']]
    columns = list(metrics['RMSE'].keys())

    # Création de la figure
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

    # Graphique RMSE
    ax1.bar(columns, rmse_values, color='salmon')
    ax1.set_title('RMSE par paramètre')
    ax1.set_ylabel('RMSE')
    ax1.set_xticklabels(columns, rotation=45, ha='right')

    # Graphique R²
    ax2.bar(columns, r2_values, color='skyblue')
    ax2.set_title('R² par paramètre')
    ax2.set_ylabel('R²')
    ax2.set_xticklabels(columns, rotation=45, ha='right')

    plt.tight_layout()
    plt.savefig('model_performance.png', dpi=300, bbox_inches='tight')
    plt.close()

    print("Visualisation des performances du modèle sauvegardée dans 'model_performance.png'")