from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Union
import joblib
import numpy as np
import pandas as pd
import os
from data_preparation import calculate_product_score, load_and_clean_data
from visualization import visualize_planogram
from contextlib import asynccontextmanager
from fastapi import Request
import base64
from io import BytesIO
import matplotlib.pyplot as plt
from enum import Enum
from typing import Literal

DATA_PATH = 'PythonProject1/planogram_data.csv'


# Enum pour les niveaux de visibilité
class VisibilityLevel(str, Enum):
    EYE_LEVEL = "eye_level"  # Niveau des yeux (meilleure visibilité)
    BELOW_EYE = "below_eye"  # Juste en dessous des yeux
    ABOVE_EYE = "above_eye"  # Juste au-dessus des yeux
    LOW_LEVEL = "low_level"  # Niveau bas (près du sol)


# Enum pour les zones commerciales
class CommercialZone(str, Enum):
    GOLDEN_ZONE = "golden_zone"  # 90-160cm (70-130cm pour enfants)
    EYE_LEVEL = "eye_level"  # 120-160cm
    HAND_LEVEL = "hand_level"  # 90-120cm
    HIGH_ZONE = "high_zone"  # 160-200cm
    LOW_ZONE = "low_zone"  # 40-90cm
    VERY_LOW_ZONE = "very_low_zone"  # 0-40cm


# Modèles Pydantic pour les règles
class ProductFilter(BaseModel):
    attribute: str
    values: List[str]
    operation: Literal["include", "exclude"] = "include"


class PlacementRule(BaseModel):
    name: str
    description: str
    priority: int = 0
    active: bool = True


class SalesPriorityRule(PlacementRule):
    metric: str = "ventes_moyennes"
    top_n: Optional[int] = None
    visibility_level: VisibilityLevel = VisibilityLevel.EYE_LEVEL


class StockCoverageRule(PlacementRule):
    min_days: int = 7
    max_days: Optional[int] = None


class ProductLimitRule(PlacementRule):
    max_products: int


class SortingRule(PlacementRule):
    sort_by: str
    ascending: bool = False


class PromotionRule(PlacementRule):
    boost_factor: float = 1.5


class ForcedPlacementRule(PlacementRule):
    product_ids: List[str]
    positions: List[Dict]


class ProductInput(BaseModel):
    planogramme_id: str
    dimension_longueur_planogramme: float
    dimension_largeur_planogramme: float
    nb_etageres: int
    nb_colonnes: int
    emplacement_magasin: str
    magasin_id: str
    surface_magasin_m2: float
    produit_id: str
    fournisseur: str
    categorie_produit: str
    promo_en_cours: int
    ventes_moyennes: float
    stock_moyen: float
    prev_demande: float
    position_etagere: int
    position_colonne: int
    score_priorite: float


class PlanogramRequest(BaseModel):
    magasin_cible: Optional[str] = None
    regroupement_produits: Optional[str] = None  # "Marque" ou "Catégorie"
    categorie_produits: Optional[str] = None
    surface_m2: float
    promo_en_cours: bool
    children_target: bool = False
    products: List[ProductInput]

    class Config:
        json_schema_extra = {
            "examples": [
                {
                    "surface_m2": 250.0,
                    "promo_en_cours": True,
                    "children_target": False,
                    "products": [
                        {
                            "produit_id": "prod1",
                            "categorie_produit": "alimentaire",
                            "promo_en_cours": 1,
                            "ventes_moyennes": 100.0,
                            "stock_moyen": 50.0,
                            "prev_demande": 120.0,
                            "score_priorite": 0.85
                        }
                    ]
                }
            ]
        }


class PlanogramOutput(BaseModel):
    dimension_longueur_planogramme: float
    dimension_largeur_planogramme: float
    nb_etageres: int
    nb_colonnes: int
    planogram_image: Optional[str] = None
    product_placements: Optional[List[Dict]] = None
    visibility_map: Optional[Dict[int, str]] = None
    zone_map: Optional[Dict[int, str]] = None


app = FastAPI(
    title="SmartPlanogram API",
    description="API pour la génération optimisée de planogrammes avec IA",
    version="1.0.0"
)


def apply_product_filters(df: pd.DataFrame, filters: List[ProductFilter]) -> pd.DataFrame:
    filtered_df = df.copy()
    for filter in filters:
        if filter.operation == "include":
            filtered_df = filtered_df[filtered_df[filter.attribute].isin(filter.values)]
        else:
            filtered_df = filtered_df[~filtered_df[filter.attribute].isin(filter.values)]
    return filtered_df


def get_commercial_zone(shelf_mid_height: float, children_target: bool) -> CommercialZone:
    if 90 <= shelf_mid_height <= 160 and not children_target:
        return CommercialZone.GOLDEN_ZONE  # À remplacer par EYE_LEVEL/HAND_LEVEL si nécessaire
    if children_target:
        if 70 <= shelf_mid_height <= 130:  # Zone d'or enfants
            if 100 <= shelf_mid_height <= 130:
                return CommercialZone.EYE_LEVEL
            else:
                return CommercialZone.HAND_LEVEL
    else:
        if 90 <= shelf_mid_height <= 160:  # Zone d'or adultes
            if 120 <= shelf_mid_height <= 160:
                return CommercialZone.EYE_LEVEL
            elif 90 <= shelf_mid_height < 120:
                return CommercialZone.HAND_LEVEL

    # Zones non optimales
    if shelf_mid_height < 90:
        if shelf_mid_height < 40:
            return CommercialZone.VERY_LOW_ZONE
        else:
            return CommercialZone.LOW_ZONE
    else:  # > 160cm
        if shelf_mid_height > 200:
            return CommercialZone.VERY_LOW_ZONE  # Considéré comme inaccessible
        else:
            return CommercialZone.HIGH_ZONE


def calculate_shelf_zones(nb_etageres: int, total_height: float = 200.0, children_target: bool = False) -> Dict[
    int, Dict]:
    shelf_zones = {}
    shelf_height = total_height / nb_etageres

    for shelf in range(1, nb_etageres + 1):
        # Étagère 1 = haut (niveau des yeux)
        shelf_bottom = total_height - (shelf * shelf_height)
        shelf_top = shelf_bottom + shelf_height
        shelf_mid = (shelf_bottom + shelf_top) / 2

        commercial_zone = get_commercial_zone(shelf_mid, children_target)

        # Déterminer le niveau de visibilité en fonction de la zone commerciale
        if commercial_zone == CommercialZone.EYE_LEVEL:
            visibility = VisibilityLevel.EYE_LEVEL
        elif commercial_zone == CommercialZone.HAND_LEVEL:
            visibility = VisibilityLevel.BELOW_EYE
        elif commercial_zone == CommercialZone.HIGH_ZONE:
            visibility = VisibilityLevel.ABOVE_EYE
        else:
            visibility = VisibilityLevel.LOW_LEVEL

        shelf_zones[shelf] = {
            'visibility': visibility,
            'commercial_zone': commercial_zone,
            'height': shelf_mid,
            'shelf_bottom': shelf_bottom,
            'shelf_top': shelf_top
        }

    return shelf_zones


def get_shelf_for_score(score: float, nb_etageres: int) -> int:
    """Détermine l'étagère en fonction du segment de score"""
    if nb_etageres == 1:
        return 1

    # Cas standard (5 étagères ou plus)
    if nb_etageres >= 5:
        if score <= 0.2:
            return min(5, nb_etageres)  # Étagère la plus basse
        elif score <= 0.4:
            return min(4, nb_etageres)
        elif score <= 0.6:
            return min(3, nb_etageres)
        elif score <= 0.8:
            return min(2, nb_etageres)
        else:
            return 1  # Étagère la plus haute

    # Adaptation dynamique pour 2-4 étagères
    else:
        segment_size = 1.0 / nb_etageres
        segment = min(int(score // segment_size), nb_etageres - 1)
        return nb_etageres - segment


def place_products(products_df: pd.DataFrame, nb_etageres: int, nb_colonnes: int,
                   rules: List[PlacementRule], total_height: float = 200.0,
                   children_target: bool = False) -> List[Dict]:
    """Place les produits selon les segments de score"""

    if len(products_df) > nb_etageres * nb_colonnes:
        raise ValueError(
            f"Pas assez d'espace: {len(products_df)} produits pour {nb_etageres * nb_colonnes} emplacements")

    # 1. Calcul des zones des étagères
    shelf_zones = calculate_shelf_zones(nb_etageres, total_height, children_target)

    # 2. Initialisation de la grille
    grid = [[None for _ in range(nb_colonnes)] for _ in range(nb_etageres)]
    product_placements = []

    # 3. Préparation des données
    working_df = products_df.copy()
    working_df['adjusted_score'] = working_df['score']

    # Appliquer les règles de boost pour les promotions
    for rule in rules:
        if isinstance(rule, PromotionRule):
            working_df.loc[working_df['promo_en_cours'] == 1, 'adjusted_score'] *= rule.boost_factor

    # Trier les produits par score ajusté décroissant
    working_df = working_df.sort_values('adjusted_score', ascending=False)

    # 4. Placement des produits selon les segments de score
    for _, product in working_df.iterrows():
        score = product['adjusted_score']
        shelf = get_shelf_for_score(score, nb_etageres)

        # Trouver une colonne libre dans l'étagère déterminée
        row = shelf - 1  # Conversion en index 0-based
        placed = False

        # Essayer d'abord les colonnes centrales (meilleure visibilité)
        columns_order = sorted(range(nb_colonnes), key=lambda x: abs(x - nb_colonnes / 2))

        for col in columns_order:
            if grid[row][col] is None:
                grid[row][col] = product
                placed = True
                break

        # Si l'étagère attribuée est pleine, essayer les étagères adjacentes
        if not placed:
            for delta in [1, -1, 2, -2]:  # Essayer ±1 puis ±2 étagères
                new_shelf = shelf + delta
                if 1 <= new_shelf <= nb_etageres:
                    row = new_shelf - 1
                    for col in columns_order:
                        if grid[row][col] is None:
                            grid[row][col] = product
                            placed = True
                            break
                    if placed:
                        break

        if not placed:
            raise ValueError("Impossible de placer tous les produits")

    # 5. Formatage des résultats
    for row in range(nb_etageres):
        for col in range(nb_colonnes):
            if grid[row][col] is not None:
                product = grid[row][col]
                shelf = row + 1
                zone_info = shelf_zones[shelf]

                placement = {
                    'produit_id': product['produit_id'],
                    'categorie': product['categorie_produit'],
                    'position_etagere': shelf,
                    'position_colonne': col + 1,
                    'score': float(product['score']),
                    'adjusted_score': float(product.get('adjusted_score', product['score'])),
                    'visibility_level': zone_info['visibility'].value,
                    'commercial_zone': zone_info['commercial_zone'].value,
                    'shelf_height': zone_info['height'],
                    'fournisseur': product.get('fournisseur', ''),
                    'promo': bool(product.get('promo_en_cours', 0))
                }
                product_placements.append(placement)

    # Validation et logging
    print("=== Validation du placement ===")
    for shelf in range(1, nb_etageres + 1):
        shelf_products = [p for p in product_placements if p['position_etagere'] == shelf]
        avg_score = sum(p['score'] for p in shelf_products) / len(shelf_products) if shelf_products else 0
        print(f"Étagère {shelf} (hauteur: {shelf_zones[shelf]['height']:.2f}cm) - Score moyen: {avg_score:.2f}")
        for p in sorted(shelf_products, key=lambda x: x['score'], reverse=True):
            print(f"  {p['produit_id']} - Score: {p['score']:.2f} - Position: {p['position_colonne']}")

    return product_placements


@app.on_event("startup")
async def load_model():
    global model
    model_path = 'model/planogram_model.pkl'
    if os.path.exists(model_path):
        model = joblib.load(model_path)
    else:
        os.makedirs('model', exist_ok=True)
        print("Modèle non trouvé. Veuillez exécuter main.py pour entraîner le modèle.")
        model = None


@app.post("/predict_from_file")
async def predict_from_file():
    try:
        DATA_PATH = 'PythonProject1/planogram_data.csv'
        df = pd.read_csv(DATA_PATH, sep=';', encoding='latin1')

        # Préparer les données comme dans la fonction predict_planogram
        request_data = {
            "magasin_cible": "Magasin A",  # Valeur par défaut
            "regroupement_produits": "Catégorie",
            "categorie_produits": "Alimentaire",
            "surface_m2": float(df['surface_magasin_m2'].iloc[0]),
            "promo_en_cours": bool(df['promo_en_cours'].iloc[0]),
            "products": df.to_dict(orient='records')
        }

        # Utiliser la même logique que /predict
        request = PlanogramRequest(**request_data)
        return await predict_planogram(request)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict", response_model=PlanogramOutput)
async def predict_planogram(request: PlanogramRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Modèle non chargé")

    try:
        # 1. Préparation des données
        request_data = request.dict()
        df = pd.DataFrame(request_data['products'])

        # Vérification que le DataFrame n'est pas vide
        if len(df) == 0:
            raise HTTPException(status_code=400, detail="Aucune donnée produit reçue")

        # 2. Si une catégorie est spécifiée, filtrer les produits
        if request.categorie_produits is not None:
            df = df[df['categorie_produit'].str.lower() == request.categorie_produits.lower()]

        # 3. Si un regroupement est spécifié, appliquer le regroupement
        if request.regroupement_produits is not None:
            if request.regroupement_produits == "Marque":
                df = df.groupby('fournisseur').apply(lambda x: x.nlargest(5, 'ventes_moyennes')).reset_index(drop=True)
            elif request.regroupement_produits == "Catégorie":
                df = df.groupby('categorie_produit').apply(lambda x: x.nlargest(5, 'ventes_moyennes')).reset_index(drop=True)

        # 4. Calcul des scores avec vérification des colonnes
        required_cols_for_scoring = ['ventes_moyennes', 'stock_moyen', 'prev_demande', 'promo_en_cours']
        for col in required_cols_for_scoring:
            if col not in df.columns:
                df[col] = 0.0  # Valeur par défaut

        products_df = calculate_product_score(df)

        # 3. Vérification des dimensions avant prédiction
        if 'surface_magasin_m2' not in products_df.columns:
            products_df['surface_magasin_m2'] = request.surface_m2
        features_data = {
            'surface_m2': float(products_df['surface_magasin_m2'].iloc[0]),
            'promo_en_cours': float(products_df['promo_en_cours'].mean()),
            'ventes_moyennes': float(products_df['ventes_moyennes'].mean()),
            'stock_moyen': float(products_df['stock_moyen'].mean()),
            'prev_demande': float(products_df['prev_demande'].mean()),
            'score_priorite': float(products_df['score'].mean())
        }

        feature_order = [
            'surface_m2', 'promo_en_cours', 'ventes_moyennes',
            'stock_moyen', 'prev_demande', 'score_priorite'
        ]

        features = np.array([features_data[feat] for feat in feature_order]).reshape(1, -1)
        prediction = model.predict(features)[0]

        # 4. Post-traitement
        nb_etageres = max(1, int(round(prediction[2])))
        nb_colonnes = max(1, int(round(prediction[3])))
        longueur = float(prediction[0])
        largeur = float(prediction[1])

        # Règles de placement par défaut
        default_rules = [
            SalesPriorityRule(
                name="Priorité aux meilleures ventes",
                description="Placer les meilleurs produits au niveau des yeux",
                priority=2,
                metric="ventes_moyennes",
                top_n=10,
                visibility_level=VisibilityLevel.EYE_LEVEL
            ),
            PromotionRule(
                name="Boost des promotions",
                description="Augmenter la visibilité des produits en promotion",
                priority=1,
                boost_factor=1.5
            )
        ]

        # Placement des produits
        product_placements = place_products(
            products_df,
            nb_etageres,
            nb_colonnes,
            rules=default_rules,
            total_height=largeur,
            children_target=request.children_target
        )

        # Calcul des zones pour la sortie
        shelf_zones = calculate_shelf_zones(nb_etageres, largeur, request.children_target)
        visibility_map = {k: str(v['visibility']) for k, v in shelf_zones.items()}
        zone_map = {k: str(v['commercial_zone']) for k, v in shelf_zones.items()}

        # Génération de l'image
        fig, ax = plt.subplots(figsize=(12, 8))

        # Dessin des étagères
        for i in range(nb_etageres + 1):
            y = i * (largeur / nb_etageres)
            ax.plot([0, longueur], [y, y], 'k-', linewidth=2)

        # Dessin des colonnes
        for j in range(nb_colonnes + 1):
            x = j * (longueur / nb_colonnes)
            ax.plot([x, x], [0, largeur], 'k-', linewidth=1)

        # Couleurs par catégorie
        categories = products_df['categorie_produit'].unique()
        color_map = {cat: plt.cm.tab10(i % 10) for i, cat in enumerate(categories)}

        cell_width = longueur / nb_colonnes
        cell_height = largeur / nb_etageres

        # Placement des produits dans la grille
        for placement in product_placements:
            row = nb_etageres - placement['position_etagere']  # Inversion verticale ici
            col = placement['position_colonne'] - 1
            x = col * cell_width
            y = row * cell_height  # Pas besoin d'inverser y car on a inversé row

            rect = plt.Rectangle(
                (x, y),
                cell_width,
                cell_height,
                facecolor=color_map[placement['categorie']],
                alpha=0.7
            )
            ax.add_patch(rect)

            ax.text(
                x + cell_width / 2,
                y + cell_height / 2,
                f"{placement['produit_id']}\nScore: {placement['score']:.2f}",
                ha='center',
                va='center',
                fontsize=8
            )

        # Légende
        legend_elements = [
            plt.Rectangle((0, 0), 1, 1, facecolor=color_map[cat], alpha=0.7, label=cat)
            for cat in categories
        ]
        ax.legend(handles=legend_elements, loc='upper right', bbox_to_anchor=(1.15, 1))

        # Configuration du graphique
        ax.set_xlim(0, longueur)
        ax.set_ylim(0, largeur)
        ax.set_xlabel('Longueur (cm)')
        ax.set_ylabel('Largeur (cm)')
        ax.set_title(f'Planogramme Optimisé ({nb_etageres} étagères × {nb_colonnes} colonnes)')
        ax.set_aspect('equal')
        plt.tight_layout()

        # Conversion en base64
        buffer = BytesIO()
        plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        plt.close(fig)

        return PlanogramOutput(
            dimension_longueur_planogramme=longueur,
            dimension_largeur_planogramme=largeur,
            nb_etageres=nb_etageres,
            nb_colonnes=nb_colonnes,
            planogram_image=image_base64,
            product_placements=product_placements,
            visibility_map=visibility_map,
            zone_map=zone_map
        )

    except Exception as e:
        print(f"Erreur dans predict_planogram: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():
    return {"message": "Bienvenue sur l'API SmartPlanogram"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)