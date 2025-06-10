"""
Interface utilisateur Streamlit pour le système de planogramme IA
Version corrigée pour l'envoi des données JSON
"""

import streamlit as st
from streamlit.components.v1 import html as components_html
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from PIL import Image, ImageDraw, ImageFont
import io
import json
import re

from data_processor import DataProcessor
from planogram_models import PlanogramModels
from constraint_manager import ConstraintManager
from planogram_visualizer import PlanogramVisualizer
from planogram_3d_visualizer import Planogram3DVisualizer
from main_pipeline import PlanogramAIPipeline
from config import DATASET_PATH, UI_CONFIG

# Configuration de la page Streamlit
st.set_page_config(
    page_title=UI_CONFIG["title"],
    layout="wide",
    initial_sidebar_state="expanded",
)

# Style CSS pour correspondre au thème Next.js (comme dans display-step.py)
st.markdown("""
<style>
    /* Couleurs principales */
    :root {
        --primary: #3b82f6;
        --primary-hover: #2563eb;
        --destructive: #ef4444;
        --muted-foreground: #64748b;
        --border: #e2e8f0;
        --background: #ffffff;
        --foreground: #020817;
        --card: #ffffff;
        --card-foreground: #020817;
    }

    /* Style général */
    body {
        font-family: 'Inter', sans-serif;
        background-color: var(--background);
        color: var(--foreground);
    }

    /* Boutons */
    .stButton button {
        background-color: var(--primary) !important;
        color: white !important;
        border-radius: 0.375rem !important;
        padding: 0.5rem 1rem !important;
        font-weight: 500 !important;
        transition: all 0.2s !important;
        border: none !important;
    }

    .stButton button:hover {
        background-color: var(--primary-hover) !important;
        transform: translateY(-1px) !important;
    }
</style>
""", unsafe_allow_html=True)

# Titre de l'application
st.title("Système de Génération de Planogrammes IA")
st.markdown("---")

# Initialisation des classes
@st.cache_resource
def load_processor():
    return DataProcessor(DATASET_PATH)

data_processor = load_processor()

# Sidebar pour les filtres et paramètres
st.sidebar.title("Paramètres")

# Chargement des données
try:
    data = data_processor.load_data()
    st.sidebar.success("Dataset chargé avec succès!")
except Exception as e:
    st.sidebar.error(f"Erreur lors du chargement du dataset: {e}")
    st.stop()

# Sélection du magasin
stores = data_processor.get_available_stores()
selected_store_id = st.sidebar.selectbox(
    "Sélectionnez un magasin",
    options=stores['input_magasin_id'].tolist(),
    format_func=lambda x: f"{x} - {stores[stores['input_magasin_id'] == x]['input_nom_magasin_magasin'].values[0]}"
)

# Sélection de la catégorie
categories = data_processor.get_available_categories(selected_store_id)
selected_category_id = st.sidebar.selectbox(
    "Sélectionnez une catégorie",
    options=categories['input_categorie_id'].tolist(),
    format_func=lambda x: f"{x} - {categories[categories['input_categorie_id'] == x]['input_nom_categorie'].values[0]}"
)

# Sélection de la sous-catégorie (optionnel)
subcategories = data_processor.get_available_subcategories(selected_category_id)
if not subcategories.empty:
    selected_subcategory_id = st.sidebar.selectbox(
        "Sélectionnez une sous-catégorie (optionnel)",
        options=[None] + subcategories['input_categorie_id'].tolist(),
        format_func=lambda x: "Toutes les sous-catégories" if x is None else f"{x} - {subcategories[subcategories['input_categorie_id'] == x]['input_nom_categorie'].values[0]}"
    )
else:
    selected_subcategory_id = None

# Sélection de la zone d'emplacement
if 'input_nom_zone' in data.columns:
    zones = data[data['input_magasin_id'] == selected_store_id]['input_nom_zone'].unique()
    selected_zone = st.sidebar.selectbox(
        "Sélectionnez une zone d'emplacement",
        options=zones,
        index=0
    )
else:
    selected_zone = "Zone principale"

# Bouton pour générer le planogramme
generate_button = st.sidebar.button("Générer le Planogramme", type="primary")

# Affichage des informations sur les données filtrées
st.header("Données sélectionnées")

# Filtrer les données selon les sélections
filtered_data = data_processor.filter_by_store_and_category(
    selected_store_id,
    selected_category_id,
    selected_subcategory_id
)

# Afficher le tableau avec les données réelles
st.subheader("Aperçu des produits")

# Fonction pour créer un mapping global des produits avec des IDs séquentiels
@st.cache_data
def create_product_id_mapping(full_data):
    """Crée un mapping global des produits avec des IDs séquentiels"""
    unique_products = full_data['input_produit_id'].unique()
    product_mapping = {}
    for i, product_name in enumerate(sorted(unique_products), 1):
        product_mapping[product_name] = f"P{i:03d}"
    return product_mapping

# Créer le mapping global
product_id_mapping = create_product_id_mapping(data)

# Fonction pour corriger les données avec le bon mapping
def fix_data_mapping(df, id_mapping):
    """Corrige le mapping des données en tenant compte de l'inversion"""
    corrected_df = df.copy()
    st.info("🔧 Correction du mapping des données détectée...")

    # Générer des IDs réels basés sur le mapping global
    real_product_ids = []
    for _, row in df.iterrows():
        product_name = str(row['input_produit_id'])
        if product_name in id_mapping:
            real_product_ids.append(id_mapping[product_name])
        else:
            new_id = f"P{len(id_mapping)+1:03d}"
            id_mapping[product_name] = new_id
            real_product_ids.append(new_id)

    # Assigner les bonnes données aux bonnes colonnes
    corrected_df['real_product_id'] = real_product_ids
    corrected_df['real_product_name'] = df['input_produit_id'].astype(str)
    corrected_df['real_product_description'] = df['input_nom_produit'].astype(str)
    corrected_df['real_product_full_description'] = df['input_description_produit'].astype(str)

    return corrected_df

# Appliquer la correction
corrected_data = fix_data_mapping(filtered_data, product_id_mapping)

# Créer le DataFrame pour l'affichage avec les bonnes colonnes
display_columns = ['real_product_id', 'real_product_name', 'input_prix_produit',
                  'input_longueur_produit', 'input_largeur_produit', 'input_hauteur_produit']

display_data = corrected_data[display_columns].head(10).copy()
display_data.columns = ['ID Produit', 'Nom Produit', 'Prix (€)', 'Longueur (cm)', 'Largeur (cm)', 'Hauteur (cm)']

st.dataframe(display_data, hide_index=True)
st.success("✅ Données affichées avec le mapping corrigé")

# Génération du planogramme
if generate_button:
    st.header("Génération du Planogramme")

    with st.spinner("Génération du planogramme en cours..."):
        # Créer le pipeline
        pipeline = PlanogramAIPipeline()

        # Exécuter le pipeline avec les données filtrées
        try:
            # Utiliser les données corrigées pour le pipeline
            pipeline_data = corrected_data.copy()
            pipeline_data['input_produit_id'] = pipeline_data['real_product_id']
            pipeline_data['input_nom_produit'] = pipeline_data['real_product_name']

            results = pipeline.run_filtered_pipeline(
                pipeline_data,
                selected_store_id,
                selected_category_id,
                selected_subcategory_id
            )

            # Ajouter la zone sélectionnée aux résultats
            results['zone_name'] = selected_zone

            # Afficher les résultats
            st.success("Planogramme généré avec succès!")

            # Générer le JSON de sortie compatible avec l'interface React
            json_output = pipeline.generate_json_output(results)

            # CORRECTION PRINCIPALE: Convertir au format attendu par l'interface React
            # Adapter le format JSON pour correspondre à celui attendu par planogram-ia.tsx
            react_compatible_json = {
                "emplacement_magasin": json_output.get("emplacement_magasin", f"Magasin {selected_store_id}"),
                "dimension_longueur_planogramme": float(json_output.get("dimension_longueur_planogramme", 200.0)),
                "dimension_largeur_planogramme": float(json_output.get("dimension_largeur_planogramme", 150.0)),
                "nb_etageres": int(json_output.get("nb_etageres", 4)),
                "nb_colonnes": int(json_output.get("nb_colonnes", 3)),
                "product_placements": []
            }

            # Convertir les placements de produits au bon format
            if "product_placements" in json_output and json_output["product_placements"]:
                for placement in json_output["product_placements"]:
                    react_placement = {
                        "produit_id": str(placement.get("produit_id", "")),
                        "etage": int(placement.get("etage", placement.get("position_etagere", 1))),
                        "colonne": int(placement.get("colonne", placement.get("position_colonne", 1)))
                    }
                    react_compatible_json["product_placements"].append(react_placement)

            # Afficher les dimensions du planogramme
            st.subheader("Dimensions du Planogramme")
            dimensions_df = pd.DataFrame({
                "Paramètre": ["Largeur", "Hauteur", "Nombre d'étagères", "Nombre de colonnes"],
                "Valeur": [
                    results['dimensions']['output_largeur_planogramme'],
                    results['dimensions']['output_hauteur_planogramme'],
                    results['dimensions']['output_nb_etageres_planogramme'],
                    results['dimensions']['output_nb_colonnes_planogramme']
                ]
            })
            st.table(dimensions_df)

            # Créer des onglets pour différentes visualisations
            tab1, tab2, tab3, tab4 = st.tabs(["Vue 2D", "Vue 3D Améliorée", "Statistiques", "JSON"])

            with tab1:
                visualizer = PlanogramVisualizer()
                planogram_image = visualizer.create_2d_planogram(results)
                st.image(planogram_image, caption="Planogramme 2D", use_column_width=True)

            with tab2:
                st.subheader("Visualisation 3D Améliorée du Planogramme")
                try:
                    visualizer_3d = Planogram3DVisualizer()
                    fig_3d = visualizer_3d.create_3d_planogram(results)
                    st.pyplot(fig_3d, use_container_width=True)
                except Exception as e:
                    st.error(f"Erreur lors de la génération de la vue 3D: {e}")

            with tab3:
                st.subheader("Statistiques du planogramme")
                if 'predictions' in results and isinstance(results['predictions'], pd.DataFrame):
                    etage_counts = results['predictions']['output_position_prod_etagere'].value_counts().sort_index()
                    fig, ax = plt.subplots(figsize=(10, 6))
                    etage_counts.plot(kind='bar', ax=ax)
                    ax.set_title('Répartition des produits par étagère')
                    ax.set_xlabel('Numéro d\'étagère')
                    ax.set_ylabel('Nombre de produits')
                    st.pyplot(fig)

            with tab4:
                # Afficher le JSON compatible React
                st.json(react_compatible_json)

                # CORRECTION PRINCIPALE: Envoyer les données à l'interface React
                # Utiliser le même système que display-step.py
                components_html(
                    f"""
                    <script>
                    // Fonction d'envoi robuste (identique à display-step.py)
                    function sendData() {{
                        const payload = {{
                            type: "GENERATED_JSON",
                            json: {json.dumps(react_compatible_json)},
                            timestamp: new Date().toISOString()
                        }};

                        console.log("Envoi payload depuis load-processor:", payload);

                        // Envoyer de trois manières différentes pour maximiser les chances
                        try {{
                            // 1. Envoi standard
                            window.parent.postMessage(payload, "*");

                            // 2. Envoi via window.top
                            if (window.top !== window.self) {{
                                window.top.postMessage(payload, "*");
                            }}

                            // 3. Envoi direct à l'iframe
                            const iframes = window.parent.document.getElementsByTagName('iframe');
                            for (let iframe of iframes) {{
                                if (iframe.contentWindow) {{
                                    iframe.contentWindow.postMessage(payload, "*");
                                }}
                            }}
                        }} catch (e) {{
                            console.error("Erreur d'envoi:", e);
                        }}
                    }}

                    // Envoyer dès que possible
                    if (document.readyState === 'complete') {{
                        sendData();
                    }} else {{
                        window.addEventListener('load', sendData);
                        document.addEventListener('DOMContentLoaded', sendData);
                    }}

                    // Répondre aux demandes
                    window.addEventListener('message', (event) => {{
                        if (event.data?.type === "REQUEST_JSON") {{
                            sendData();
                        }}
                    }});
                    </script>
                    """,
                    height=0
                )

                # Bouton pour télécharger le JSON
                st.download_button(
                    label="Télécharger le JSON",
                    data=json.dumps(react_compatible_json, indent=2, ensure_ascii=False),
                    file_name=f"planogramme_{selected_store_id}_{selected_category_id}.json",
                    mime="application/json"
                )

            # Afficher les métriques de performance
            st.subheader("Métriques de Performance")
            col1, col2 = st.columns(2)

            with col1:
                metrics_df = pd.DataFrame({
                    "Métrique": ["MSE", "MAE", "RMSE"],
                    "Valeur": [
                        f"{results['metrics']['mse']:.4f}",
                        f"{results['metrics']['mae']:.4f}",
                        f"{results['metrics']['rmse']:.4f}"
                    ]
                })
                st.table(metrics_df)

            with col2:
                constraint_rate = results['metrics']['constraint_respect_rate']
                violations_count = results['metrics'].get('violations_count', 0)
                total_products = results['metrics'].get('total_products', 0)

                st.metric(
                    label="Taux de respect des contraintes",
                    value=f"{constraint_rate*100:.1f}%",
                    delta=f"{violations_count} violations sur {total_products} produits" if violations_count > 0 else "Aucune violation"
                )

        except Exception as e:
            st.error(f"Erreur lors de la génération du planogramme: {e}")
            st.exception(e)
else:
    st.info("Cliquez sur 'Générer le Planogramme' pour lancer la génération.")

# Afficher des statistiques sur les données
st.header("Statistiques")

# Créer des onglets pour différentes statistiques
tab1, tab2, tab3 = st.tabs(["Produits", "Ventes", "Contraintes"])

with tab1:
    st.subheader("Distribution des dimensions des produits")
    fig, ax = plt.subplots(1, 3, figsize=(15, 5))

    sns.histplot(filtered_data['input_longueur_produit'], kde=True, ax=ax[0])
    ax[0].set_title('Longueur')

    sns.histplot(filtered_data['input_largeur_produit'], kde=True, ax=ax[1])
    ax[1].set_title('Largeur')

    sns.histplot(filtered_data['input_hauteur_produit'], kde=True, ax=ax[2])
    ax[2].set_title('Hauteur')

    st.pyplot(fig)

with tab2:
    st.subheader("Analyse des ventes")
    if 'input_quantite_vente' in filtered_data.columns and 'input_prix_unitaire_vente' in filtered_data.columns:
        filtered_data['ca_produit'] = filtered_data['input_quantite_vente'] * filtered_data['input_prix_unitaire_vente']
        top_products = filtered_data.sort_values('ca_produit', ascending=False).head(10)

        fig, ax = plt.subplots(figsize=(10, 6))
        sns.barplot(x='ca_produit', y='input_nom_produit', data=top_products, ax=ax)
        ax.set_title('Top 10 des produits par chiffre d\'affaires')
        ax.set_xlabel('Chiffre d\'affaires')
        ax.set_ylabel('Produit')

        st.pyplot(fig)
    else:
        st.info("Données de vente non disponibles pour cette sélection.")

with tab3:
    st.subheader("Contraintes et priorités")
    if 'input_contrainte_temperature_produit' in filtered_data.columns:
        temp_counts = filtered_data['input_contrainte_temperature_produit'].value_counts()
        fig, ax = plt.subplots(figsize=(8, 5))
        temp_counts.plot.pie(autopct='%1.1f%%', ax=ax)
        ax.set_title('Répartition des contraintes de température')
        ax.set_ylabel('')
        st.pyplot(fig)

    if 'input_priorite_merchandising' in filtered_data.columns:
        fig, ax = plt.subplots(figsize=(8, 5))
        sns.countplot(x='input_priorite_merchandising', data=filtered_data, ax=ax)
        ax.set_title('Répartition des priorités de merchandising')
        ax.set_xlabel('Priorité')
        ax.set_ylabel('Nombre de produits')
        st.pyplot(fig)

# Pied de page
st.markdown("---")
st.markdown("© 2023 Système de Génération de Planogrammes IA")
