import streamlit as st
import pandas as pd
import requests
import io
import base64
from PIL import Image
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import numpy as np
from streamlit.components.v1 import html as components_html, components

# Configuration de la page avec un thème plus proche de l'interface Next.js
st.set_page_config(
    page_title="SmartPlanogram IA",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Create the tabs at the top level (before any with tab1: statements)
tab1, tab2, tab3 = st.tabs(["Générateur IA", "Données historiques", "À propos"])

# Style CSS pour correspondre au thème Next.js
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

    /* En-tête */
    .stApp header {
        background-color: var(--card) !important;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    /* Cartes */
    .stCard {
        background-color: var(--card) !important;
        border: 1px solid var(--border) !important;
        border-radius: 0.5rem !important;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
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

    /* Inputs */
    .stTextInput input, .stSelectbox select, .stTextArea textarea {
        border: 1px solid var(--border) !important;
        border-radius: 0.375rem !important;
        padding: 0.5rem 0.75rem !important;
    }

    /* Onglets */
    .stTabs [role="tablist"] {
        gap: 0.5rem !important;
    }

    .stTabs [role="tab"] {
        border-radius: 0.375rem !important;
        padding: 0.5rem 1rem !important;
        background-color: transparent !important;
        color: var(--muted-foreground) !important;
        border: none !important;
    }

    .stTabs [role="tab"][aria-selected="true"] {
        background-color: var(--primary) !important;
        color: white !important;
    }

    /* Sidebar */
    [data-testid="stSidebar"] {
        background-color: var(--card) !important;
        border-right: 1px solid var(--border) !important;
    }

    /* Progress bar */
    .stProgress > div > div > div {
        background-color: var(--primary) !important;
    }

    /* Alertes */
    .stAlert {
        border-radius: 0.5rem !important;
    }

    /* Tableaux */
    table {
        border-radius: 0.5rem !important;
        overflow: hidden !important;
    }

    th {
        background-color: var(--primary) !important;
        color: white !important;
    }

    /* Icônes */
    .icon {
        margin-right: 0.5rem;
    }
</style>
""", unsafe_allow_html=True)


# Fonction pour afficher une étape avec badge
def display_step(step_num, label, active=False, completed=False):
    badge_color = "var(--primary)" if active or completed else "var(--muted-foreground)"
    text_color = "var(--foreground)" if active or completed else "var(--muted-foreground)"

    return f"""
    <div style="display: flex; align-items: center; margin-right: 1.5rem;">
        <div style="width: 24px; height: 24px; border-radius: 9999px; background-color: {badge_color}; 
                    color: white; display: flex; align-items: center; justify-content: center; margin-right: 0.5rem;">
            {step_num}
        </div>
        <span style="color: {text_color}; font-weight: {'500' if active or completed else '400'}">{label}</span>
    </div>
    """


# Sidebar pour les paramètres
with st.sidebar:
    st.markdown("""
    <div style="margin-bottom: 2rem;">
        <div style="display: flex; align-items: center; margin-bottom: 1rem;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 0.75rem;">
                <path d="M3 6H21M3 12H21M3 18H21" stroke="var(--primary)" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <h2 style="font-size: 1.25rem; font-weight: 600; margin: 0; color: var(--primary);">Configuration</h2>
        </div>
        <p style="color: var(--muted-foreground); font-size: 0.875rem; margin-bottom: 1.5rem;">
            Configurez les paramètres pour générer un planogramme optimisé
        </p>
    </div>
    """, unsafe_allow_html=True)

    # Section Paramètres avec icône
    with st.expander("**Paramètres de base**", expanded=True):
        st.markdown("""
        <style>
            .st-emotion-cache-1jmvea6 {
                padding: 0.75rem 1rem;
                border-radius: 0.5rem;
                background-color: var(--card);
                border: 1px solid var(--border);
            }
        </style>
        """, unsafe_allow_html=True)

        magasin_cible = st.selectbox(
            "Magasin cible",
            ["Aucun", "Magasin Y", "Magasin Z", "Magasin A"],
            help="Sélectionnez le magasin pour lequel générer le planogramme"
        )

        regroupement_produits = st.selectbox(
            "Regroupement des produits",
            ["Aucun", "Marque", "Catégorie", "Promotion"],
            help="Critère principal pour organiser les produits"
        )

        categorie_produits = st.selectbox(
            "Catégorie de produits",
            ["Aucun", "Vetements", "Alimentaire", "Electronique", "Maison", "Beauté"],
            help="Filtrez par catégorie de produits"
        )

    # Section Options avancées
    with st.expander("**Options avancées**"):
        poids_ventes = st.slider(
            "Poids des ventes historiques",
            min_value=0.0, max_value=1.0, value=0.7,
            help="Importance donnée aux ventes passées dans l'optimisation"
        )

        poids_stock = st.slider(
            "Poids du niveau de stock",
            min_value=0.0, max_value=1.0, value=0.3,
            help="Importance donnée aux niveaux de stock actuels"
        )

        inclure_promos = st.checkbox(
            "Prioriser les produits en promotion",
            value=True,
            help="Donner plus de visibilité aux produits en promotion"
        )

    # Bouton de génération stylisé
    st.markdown("""
    <style>
        div[data-testid="stHorizontalBlock"] {
            width: 100%;
        }

        div[data-testid="stHorizontalBlock"] > button {
            width: 100%;
            margin-top: 1rem;
            background-color: var(--primary) !important;
            transition: all 0.2s !important;
        }

        div[data-testid="stHorizontalBlock"] > button:hover {
            background-color: var(--primary-hover) !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        }

        div[data-testid="stHorizontalBlock"] > button:active {
            transform: translateY(0) !important;
        }
    </style>
    """, unsafe_allow_html=True)



    # Section d'information
    st.markdown("""
    <div style="margin-top: 2rem; padding: 1rem; background-color: rgba(59, 130, 246, 0.05); border-radius: 0.5rem; border-left: 4px solid var(--primary);">
        <div style="display: flex; align-items: flex-start;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 0.5rem; margin-top: 2px; flex-shrink: 0;">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 16V12M12 8H12.01" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div>
                <p style="font-weight: 500; margin-bottom: 0.25rem; color: var(--primary);">Conseil d'utilisation</p>
                <p style="font-size: 0.75rem; color: var(--muted-foreground); margin: 0;">
                    Pour des résultats optimaux, combinez les filtres de catégorie avec les paramètres de regroupement. Utilisez les options avancées pour affiner les priorités.
                </p>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)


# Fonction de génération 3D (inchangée)
def generate_3d_planogram(planogram_params, product_placements, products_df):
    """Génère une visualisation 3D améliorée du planogramme"""
    fig = plt.figure(figsize=(12, 10))
    ax = fig.add_subplot(111, projection='3d')

    # Dimensions
    longueur = planogram_params['dimension_longueur_planogramme']
    largeur = planogram_params['dimension_largeur_planogramme']
    nb_etageres = planogram_params['nb_etageres']
    nb_colonnes = planogram_params['nb_colonnes']
    cell_depth = 20  # Profondeur réduite pour une meilleure visualisation

    # Couleurs par catégorie (palette plus distincte)
    categories = products_df['categorie_produit'].unique()
    color_map = {
        'Vetements': '#1f77b4',
        'Alimentaire': '#ff7f0e',
        'Electronique': '#2ca02c',
        'Autre': '#d62728'
    }

    # Style de la grille
    ax.grid(True, linestyle='--', alpha=0.5)
    ax.set_facecolor('#f8f9fa')

    # Dessin de la structure du planogramme
    for i in range(nb_etageres + 1):
        y = i * (largeur / nb_etageres)
        ax.plot([0, longueur], [y, y], [0, 0], 'k-', linewidth=0.5, alpha=0.7)

    for j in range(nb_colonnes + 1):
        x = j * (longueur / nb_colonnes)
        ax.plot([x, x], [0, largeur], [0, 0], 'k-', linewidth=0.5, alpha=0.7)

    # Placement des produits
    cell_width = longueur / nb_colonnes
    cell_height = largeur / nb_etageres

    for placement in product_placements:
        row = nb_etageres - placement['position_etagere']
        col = placement['position_colonne'] - 1
        x = col * cell_width
        y = row * cell_height

        product = products_df[products_df['produit_id'] == placement['produit_id']].iloc[0]
        cat = product['categorie_produit']
        color = color_map.get(cat, '#d62728')  # Couleur par défaut si catégorie inconnue

        # Dessin du produit en 3D avec ombrage
        xx, yy = np.meshgrid([x, x + cell_width], [y, y + cell_height])

        # Face inférieure
        ax.plot_surface(xx, yy, np.array([[0, 0], [0, 0]]),
                        color=color, alpha=0.7, shade=True)

        # Face supérieure
        ax.plot_surface(xx, yy, np.array([[cell_depth, cell_depth], [cell_depth, cell_depth]]),
                        color=color, alpha=0.7, shade=True)

        # Faces latérales
        ax.plot_surface(np.array([[x, x], [x, x]]),
                        np.array([[y, y], [y + cell_height, y + cell_height]]),
                        np.array([[0, cell_depth], [0, cell_depth]]),
                        color=color, alpha=0.5)

        ax.plot_surface(np.array([[x + cell_width, x + cell_width], [x + cell_width, x + cell_width]]),
                        np.array([[y, y], [y + cell_height, y + cell_height]]),
                        np.array([[0, cell_depth], [0, cell_depth]]),
                        color=color, alpha=0.5)

        # Étiquette simplifiée
        ax.text(x + cell_width / 2, y + cell_height / 2, cell_depth / 2,
                placement['produit_id'],
                ha='center', va='center', fontsize=7, color='white')

    # Configuration des axes
    ax.set_xlabel('Longueur (cm)', labelpad=15)
    ax.set_ylabel('Largeur (cm)', labelpad=15)
    ax.set_zlabel('Profondeur', labelpad=15)

    # Ajustement des limites pour une meilleure visibilité
    ax.set_xlim(0, longueur)
    ax.set_ylim(0, largeur)
    ax.set_zlim(0, cell_depth * 1.2)

    # Titre et légende
    ax.set_title('Visualisation 3D du Planogramme', pad=20)

    # Création de la légende
    legend_elements = [plt.Rectangle((0, 0), 1, 1, facecolor=color, alpha=0.7, label=cat)
                       for cat, color in color_map.items()]
    ax.legend(handles=legend_elements, bbox_to_anchor=(1.1, 0.9), title='Catégories')

    # Angle de vue amélioré
    ax.view_init(elev=30, azim=45)

    return fig


with tab1:
    st.header("Générateur de planogramme")
    DATA_PATH = 'data/planogram_data.csv'

    try:
        data = pd.read_csv(DATA_PATH, sep=';', encoding='latin1')
        st.subheader("Aperçu des données")
        st.dataframe(data.head())

        required_columns = ['planogramme_id', 'dimension_longueur_planogramme', 'dimension_largeur_planogramme',
                            'nb_etageres', 'nb_colonnes', 'emplacement_magasin', 'magasin_id', 'surface_magasin_m2',
                            'produit_id', 'categorie_produit', 'promo_en_cours', 'ventes_moyennes', 'stock_moyen',
                            'prev_demande', 'position_etagere', 'position_colonne', 'score_priorite']

        data.columns = data.columns.str.strip()

        if all(col in data.columns for col in required_columns):
            if len(data) == 0:
                st.error("Le fichier CSV ne contient aucune donnée.")
                st.stop()

            # Filtrage des données si une catégorie est sélectionnée
            if categorie_produits != "Aucun":
                filtered_data = data[data['categorie_produit'].str.lower() == categorie_produits.lower()]
                if len(filtered_data) == 0:
                    st.error(f"Aucun produit trouvé dans la catégorie {categorie_produits}")
                    st.stop()
            else:
                filtered_data = data.copy()

            # Préparation des données pour l'API
            api_data = {
                "magasin_cible": magasin_cible if magasin_cible != "Aucun" else None,
                "regroupement_produits": regroupement_produits if regroupement_produits != "Aucun" else None,
                "categorie_produits": categorie_produits if categorie_produits != "Aucun" else None,
                "surface_m2": float(filtered_data['surface_magasin_m2'].iloc[0]) if len(filtered_data) > 0 else 0.0,
                "promo_en_cours": bool(filtered_data['promo_en_cours'].iloc[0]) if len(filtered_data) > 0 else False,
                "products": filtered_data.to_dict(orient='records')
            }

            if st.sidebar.button("Générer le planogramme"):
                with st.spinner("Génération du planogramme en cours..."):
                    try:
                        # Appel à l'API
                        response = requests.post(
                            "http://localhost:8000/predict",
                            json=api_data
                        )

                        if response.status_code == 200:
                            result = response.json()

                            # Création du dictionnaire pour la sortie JSON
                            output_json = {
                                "emplacement_magasin": data['emplacement_magasin'].iloc[0] if not data[
                                    'emplacement_magasin'].empty else "Non spécifié",
                                "dimension_longueur_planogramme": result['dimension_longueur_planogramme'],
                                "dimension_largeur_planogramme": result['dimension_largeur_planogramme'],
                                "nb_etageres": result['nb_etageres'],
                                "nb_colonnes": result['nb_colonnes'],
                                "product_placements": [
                                    {
                                        "produit_id": placement['produit_id'],
                                        "etage": placement['position_etagere'],
                                        "colonne": placement['position_colonne']
                                    } for placement in result['product_placements']
                                ]
                            }

                            # Affichage du JSON
                            st.json(output_json)
                            # Après avoir généré output_json
                            components_html(
                                f"""
                                <script>
                                // Fonction d'envoi robuste
                                function sendData() {{
                                    const payload = {{
                                        type: "GENERATED_JSON",
                                        json: {output_json},
                                        timestamp: new Date().toISOString()
                                    }};

                                    console.log("Envoi payload:", payload);

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
                            # Affichage des résultats
                            col1, col2 = st.columns(2)

                            with col1:
                                st.subheader("Paramètres du planogramme")
                                emplacement = data['emplacement_magasin'].iloc[0] if not data[
                                    'emplacement_magasin'].empty else "Non spécifié"
                                st.info(f"""
                                    - **Emplacement du magasin**: {emplacement}
                                    - **Dimensions**: {result['dimension_longueur_planogramme']:.2f} × {result['dimension_largeur_planogramme']:.2f} cm
                                    - **Configuration**: {result['nb_etageres']} étagères × {result['nb_colonnes']} colonnes
                                """)

                                # Affichage des placements
                                st.subheader("Placement des produits")
                                placements_df = pd.DataFrame(result['product_placements'])
                                st.dataframe(placements_df)

                            with col2:
                                st.subheader("Visualisation du planogramme")

                                # Onglets pour 2D et 3D
                                tab2d, tab3d = st.tabs(["2D", "3D"])

                                with tab2d:
                                    if result.get('planogram_image'):
                                        image_data = base64.b64decode(result['planogram_image'])
                                        image = Image.open(io.BytesIO(image_data))
                                        st.image(image, use_column_width=True)

                                        # Bouton de téléchargement
                                        buf = io.BytesIO()
                                        image.save(buf, format="PNG")
                                        byte_im = buf.getvalue()
                                        st.download_button(
                                            label="Télécharger le planogramme 2D",
                                            data=byte_im,
                                            file_name="planogramme_2d.png",
                                            mime="image/png"
                                        )

                                with tab3d:
                                    st.markdown("### Visualisation 3D du Planogramme")
                                    products_df = pd.DataFrame(api_data['products'])
                                    fig = generate_3d_planogram(result, result['product_placements'], products_df)

                                    # Convertir la figure matplotlib en image
                                    buf = io.BytesIO()
                                    plt.savefig(buf, format='png', dpi=150, bbox_inches='tight')
                                    buf.seek(0)
                                    st.image(buf, use_column_width=True)

                                    # Bouton de téléchargement
                                    st.download_button(
                                        label="Télécharger le planogramme 3D",
                                        data=buf,
                                        file_name="planogramme_3d.png",
                                        mime="image/png"
                                    )
                                    plt.close(fig)

                        else:
                            st.error(f"Erreur: {response.status_code} - {response.text}")

                    except Exception as e:
                        st.error(f"Erreur lors de la communication avec l'API: {e}")
        else:
            st.error("Le fichier CSV doit contenir toutes les colonnes nécessaires.")

    except FileNotFoundError:
        st.error(f"Fichier de données introuvable à l'emplacement: {DATA_PATH}")
    except Exception as e:
        st.error(f"Erreur lors du chargement des données: {e}")

with tab2:
    st.header("Données historiques")
    try:
        # Afficher les données directement
        data = pd.read_csv(DATA_PATH, encoding='latin1')
        st.dataframe(data)
    except Exception as e:
        st.error(f"Erreur lors du chargement des données historiques: {e}")

with tab3:
    st.header("À propos")
    st.markdown("""
    **SmartPlanogram** est une solution IA innovante pour la génération optimisée de planogrammes.

    Fonctionnalités :
    - Génération automatique de planogrammes basée sur les données historiques
    - Optimisation de l'espace et de la visibilité des produits
    - Prise en compte des promotions en cours
    - Personnalisation par magasin et catégorie de produits
    - Visualisations 2D et 3D des planogrammes

    Développé par [Smart-Store] - © 2025
    """)