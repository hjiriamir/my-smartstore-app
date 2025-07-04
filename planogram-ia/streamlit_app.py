import streamlit as st
import streamlit.components.v1 as components
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import json
from datetime import datetime
import os
import sys
import chardet
from io import StringIO

# Import du pipeline principal
try:
    from main_pipeline import PlanogramAIPipeline
except ImportError as e:
    st.error(f"❌ Erreur d'import: {e}")
    st.stop()

# Configuration du chemin (en haut du fichier)
DATA_PATH = r"C:\Users\Dell\Desktop\Smart-Store\SmartStore-IA\dataset.csv"

# NOUVEAU: Chemin pour le fichier de transfert DIRECT
TRANSFER_FILE = "planogram_transfer.json"
TRANSFER_DIR = "transfer"

# Configuration de la page
st.set_page_config(
    page_title="🏪 Planogramme IA",
    page_icon="🏪",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Créer le dossier de transfert s'il n'existe pas
os.makedirs(TRANSFER_DIR, exist_ok=True)

# CSS personnalisé + JavaScript DIRECT
st.markdown("""
<style>
    .main-header {
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        padding: 1rem;
        border-radius: 10px;
        color: white;
        text-align: center;
        margin-bottom: 2rem;
    }
    .metric-card {
        background: white;
        padding: 1rem;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border-left: 4px solid #667eea;
    }
    .success-message {
        background: #d4edda;
        color: #155724;
        padding: 1rem;
        border-radius: 5px;
        border: 1px solid #c3e6cb;
    }
    .transfer-status {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px;
        border-radius: 8px;
        z-index: 9999;
        font-family: Arial, sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-width: 350px;
    }
</style>

<script>
console.log("🚀 Script de transfert DIRECT chargé");

// Fonction pour créer un lien de téléchargement automatique
function createDownloadLink(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log("📥 Fichier téléchargé:", filename);
}

// Fonction pour afficher les données dans une nouvelle fenêtre
function showDataInNewWindow(data) {
    const newWindow = window.open('', '_blank', 'width=800,height=600');
    newWindow.document.write(`
        <html>
        <head>
            <title>Données Planogramme</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { background: #007bff; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                .data { background: #f8f9fa; padding: 15px; border-radius: 5px; white-space: pre-wrap; font-family: monospace; }
                .copy-btn { background: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏪 Données Planogramme</h1>
                <p>ID: ${data.planogram_info?.planogram_id || 'N/A'}</p>
                <p>Meubles: ${data.furniture?.length || 0} | Positions: ${data.product_positions?.length || 0}</p>
            </div>
            <button class="copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('data').textContent)">
                📋 Copier les données
            </button>
            <div class="data" id="data">${JSON.stringify(data, null, 2)}</div>
            <script>
                // Envoyer les données vers la fenêtre parent (React)
                if (window.opener) {
                    window.opener.postMessage({
                        type: 'PLANOGRAM_DATA_DIRECT',
                        data: ${JSON.stringify(data)}
                    }, '*');
                    console.log("📤 Données envoyées vers React via nouvelle fenêtre");
                }
            </script>
        </body>
        </html>
    `);


</script>
""", unsafe_allow_html=True)

# Header principal
st.markdown("""
<div class="main-header">
    <h1>🏪 SmartStore : Système de Génération de Planogrammes IA</h1>
    <p>Génération automatique de planogrammes optimisés avec Intelligence Artificielle - Version TRANSFERT DIRECT</p>
</div>
""", unsafe_allow_html=True)

# Initialisation du session state
if 'pipeline' not in st.session_state:
    st.session_state.pipeline = None
if 'data_loaded' not in st.session_state:
    st.session_state.data_loaded = False
if 'models_trained' not in st.session_state:
    st.session_state.models_trained = False
if 'results' not in st.session_state:
    st.session_state.results = None


# Fonction DIRECTE pour sauvegarder les données dans un fichier
def save_data_to_file_direct(json_data):
    """Sauvegarde DIRECTE dans un fichier JSON"""
    try:
        # Chemin absolu du fichier
        file_path = os.path.abspath(os.path.join(TRANSFER_DIR, TRANSFER_FILE))

        # Ajouter des métadonnées
        data_with_meta = {
            **json_data,
            "_transfer_meta": {
                "timestamp": datetime.now().isoformat(),
                "file_path": file_path,
                "transfer_method": "direct_file",
                "streamlit_port": 8501,
                "react_port": 3000
            }
        }

        # Sauvegarder dans le fichier
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data_with_meta, f, indent=2, ensure_ascii=False)

        st.success(f"✅ Données sauvegardées dans: {file_path}")
        return file_path

    except Exception as e:
        st.error(f"❌ Erreur sauvegarde fichier: {e}")
        return None


# Fonction DIRECTE pour envoyer les données vers React
def send_data_direct_to_react(json_data):
    """Méthode DIRECTE pour envoyer les données vers React"""

    # 1. Sauvegarder dans un fichier
    file_path = save_data_to_file_direct(json_data)

    # 2. Créer une URL avec les données (méthode de secours)
    try:
        import urllib.parse
        data_encoded = urllib.parse.quote(json.dumps(json_data))
        react_url = f"http://localhost:3000?planogram_data={data_encoded[:2000]}"  # Limiter la taille
    except:
        react_url = "http://localhost:3000"

    # 3. JavaScript pour transfert DIRECT
    planogram_id = json_data.get('planogram_info', {}).get('planogram_id', 'N/A')
    furniture_count = len(json_data.get('furniture', []))
    positions_count = len(json_data.get('product_positions', []))

    js_code = f"""
    <script>
        console.log("🚀 TRANSFERT DIRECT démarré");

        const planogramData = {json.dumps(json_data)};
        const filePath = "{file_path}";

        // 1. Afficher les données dans une nouvelle fenêtre
        showDataInNewWindow(planogramData);

        // 2. Créer un téléchargement automatique
        createDownloadLink(planogramData, "planogram_data_direct.json");

        // 3. Essayer localStorage avec domaine partagé
        try {{
            // Utiliser le domaine localhost sans port
            localStorage.setItem('planogram_data_direct', JSON.stringify(planogramData));
            console.log("💾 Données sauvées dans localStorage");
        }} catch (e) {{
            console.error("❌ Erreur localStorage:", e);
        }}

        // 4. Notification de succès
        function showTransferNotification() {{
            const notification = document.createElement('div');
            notification.className = 'transfer-status';
            notification.innerHTML = `
                
                <div style="font-size: 12px; opacity: 0.9;">
                    📊 ID: {planogram_id}<br>
                    🪑 Meubles: {furniture_count}<br>
                    📍 Positions: {positions_count}<br>
                    📁 Fichier: {TRANSFER_FILE}<br>
                    📥 Téléchargement automatique<br>
                    🪟 Nouvelle fenêtre ouverte<br>
                    🕒 ${{new Date().toLocaleTimeString()}}
                </div>
                <div style="margin-top: 10px; font-size: 11px; background: rgba(255,255,255,0.2); padding: 5px; border-radius: 3px;">
                    ✅ Fichier: {file_path}<br>
                    ✅ Nouvelle fenêtre avec données<br>
                    ✅ Téléchargement JSON<br>
                    ✅ localStorage tenté
                </div>
            `;

            document.body.appendChild(notification);

            // Supprimer après 15 secondes
            setTimeout(() => {{
                if (notification.parentNode) {{
                    notification.parentNode.removeChild(notification);
                }}
            }}, 15000);
        }}

        showTransferNotification();

        console.log("🎉 TRANSFERT DIRECT terminé avec succès!");
    </script>
    """

    # Afficher le JavaScript
    components.html(js_code, height=0)

    # Messages dans Streamlit
    #st.success("🚀 TRANSFERT DIRECT RÉUSSI!")
    #st.info(f"📁 Fichier sauvé: {file_path}")
    st.info(f"📊 Planogramme ID: {planogram_id}")
    st.info(f"🪑 Meubles: {furniture_count}")
    st.info(f"📍 Positions: {positions_count}")
    #st.info("📥 Téléchargement automatique lancé")
    #st.info("🪟 Nouvelle fenêtre ouverte avec les données")

    return file_path


# [Garder toutes les autres fonctions existantes...]
def detect_csv_separator_and_encoding(content):
    """Détecte automatiquement le séparateur et l'encodage d'un fichier CSV"""

    # Détection d'encodage
    encoding_result = chardet.detect(content)
    detected_encoding = encoding_result['encoding']

    # Liste d'encodages à tester (priorité aux encodages français)
    encodings_to_try = [
        'latin-1',
        'cp1252',
        'iso-8859-1',
        detected_encoding,
        'utf-8',
        'utf-16'
    ]

    # Supprimer les doublons et None
    encodings_to_try = list(dict.fromkeys([enc for enc in encodings_to_try if enc]))

    # Séparateurs à tester
    separators = [';', ',', '\t', '|']

    best_result = None
    max_columns = 0

    for encoding in encodings_to_try:
        try:
            # Décoder le contenu
            text_content = content.decode(encoding)

            for sep in separators:
                try:
                    # Tester avec ce séparateur
                    string_io = StringIO(text_content)
                    df = pd.read_csv(string_io, sep=sep, nrows=5)

                    # Vérifier la qualité du parsing
                    if len(df.columns) > max_columns and not df.empty:
                        # Vérifier que les colonnes ne sont pas toutes vides
                        non_empty_cols = sum(1 for col in df.columns if not df[col].isna().all())

                        if non_empty_cols > 1:
                            max_columns = len(df.columns)
                            best_result = {
                                'encoding': encoding,
                                'separator': sep,
                                'columns': len(df.columns),
                                'confidence': encoding_result['confidence'] if encoding == detected_encoding else 0.8
                            }

                except Exception:
                    continue

        except Exception:
            continue

    return best_result


def map_product_ids(json_output, original_data):
    """Remplace complètement les IDs générés par les IDs originaux"""
    if 'input_produit_id' not in original_data.columns:
        return json_output

    # Créer un mapping complet
    id_mapping = {}
    for i, (_, row) in enumerate(original_data.iterrows(), 1):
        generated_id = f"PROD_{i:03d}"
        original_id = row['input_produit_id']
        id_mapping[generated_id] = original_id

    # Mapper les IDs dans product_positions
    for position in json_output['product_positions']:
        generated_id = position['produit_id']
        if generated_id in id_mapping:
            position['produit_id'] = id_mapping[generated_id]

    return json_output

# Fonction pour générer des données d'exemple
@st.cache_data
def generate_sample_data():
    """Génère des données d'exemple pour la démonstration"""
    np.random.seed(42)
    n_samples = 100

    data = {
        'input_produit_id': [f'PROD_{i:03d}' for i in range(1, n_samples + 1)],
        'input_nom_produit': [f'Produit {i}' for i in range(1, n_samples + 1)],
        'input_prix_produit': np.random.uniform(5, 50, n_samples),
        'input_longueur_produit': np.random.uniform(10, 30, n_samples),
        'input_largeur_produit': np.random.uniform(5, 20, n_samples),
        'input_hauteur_produit': np.random.uniform(15, 35, n_samples),
        'input_priorite_merchandising': np.random.randint(1, 11, n_samples),
        'input_contrainte_temperature_produit': np.random.choice([0, 1], n_samples, p=[0.8, 0.2]),
        'input_magasin_id': np.random.choice(['MAG_001', 'MAG_002', 'MAG_003'], n_samples),
        'input_categorie_id': np.random.choice(['CAT_001', 'CAT_002', 'CAT_003'], n_samples),
        'input_surface_magasin': np.random.uniform(200, 800, n_samples),
        'input_longueur_zone': np.random.uniform(5, 15, n_samples),
        'input_largeur_zone': np.random.uniform(2, 5, n_samples),
    }

    return pd.DataFrame(data)


@st.cache_data
def load_data_safe(file_path=None, uploaded_file=None):
    """Charge les données avec détection automatique du séparateur et encodage"""

    if uploaded_file is not None:
        try:
            # Lire le contenu brut
            content = uploaded_file.read()

            # Détecter le séparateur et l'encodage
            detection_result = detect_csv_separator_and_encoding(content)

            if detection_result is None:
                st.error("❌ Impossible de détecter le format du fichier CSV")
                st.info("💡 Utilisation des données d'exemple à la place.")
                return generate_sample_data()

            # Afficher les informations de détection
            st.success(
                f"✅ Format détecté: encodage **{detection_result['encoding']}**, séparateur **'{detection_result['separator']}'**")
            st.info(f"🔍 {detection_result['columns']} colonnes détectées")

            # Décoder et lire le fichier avec les bons paramètres
            text_content = content.decode(detection_result['encoding'])
            string_io = StringIO(text_content)
            data = pd.read_csv(string_io, sep=detection_result['separator'])

            if data.empty or len(data.columns) == 0:
                st.error("❌ Le fichier semble vide après parsing")
                return generate_sample_data()

            # Nettoyage des données
            with st.spinner("🧹 Nettoyage des données..."):
                # Nettoyage des noms de colonnes
                data.columns = data.columns.str.strip()
                data.columns = data.columns.str.replace('\n', ' ')
                data.columns = data.columns.str.replace('\r', ' ')

                # Nettoyage des valeurs textuelles
                for col in data.select_dtypes(include=['object']).columns:
                    data[col] = data[col].astype(str).str.strip()
                    data[col] = data[col].str.replace('\n', ' ')
                    data[col] = data[col].str.replace('\r', ' ')
                    data[col] = data[col].replace('nan', pd.NA)

            st.success(f"✅ Données chargées et nettoyées: {len(data)} lignes, {len(data.columns)} colonnes")

            # Afficher un aperçu des colonnes principales
            key_columns = [col for col in data.columns if
                           any(keyword in col.lower() for keyword in ['produit', 'magasin', 'categorie', 'prix'])]
            if key_columns:
                st.info(f"📋 Colonnes principales détectées: {', '.join(key_columns[:5])}")

            return data

        except Exception as e:
            st.error(f"❌ Erreur lors du chargement du fichier uploadé: {e}")
            st.info("💡 Utilisation des données d'exemple à la place.")
            return generate_sample_data()

    elif file_path and os.path.exists(file_path):
        try:
            # Même logique pour les fichiers locaux
            with open(file_path, 'rb') as f:
                content = f.read()

            detection_result = detect_csv_separator_and_encoding(content)

            if detection_result is None:
                st.warning("⚠️ Format du fichier local non détecté. Utilisation des données d'exemple.")
                return generate_sample_data()

            text_content = content.decode(detection_result['encoding'])
            string_io = StringIO(text_content)
            data = pd.read_csv(string_io, sep=detection_result['separator'])

            if not data.empty and len(data.columns) > 0:
                st.success(f"✅ Fichier chargé depuis: {file_path}")
               # st.success(f"Encodage détecté: {detection_result['encoding']}")
                #st.success(f"Séparateur détecté: '{detection_result['separator']}'")
                st.info(f"🔍 {len(data.columns)} colonnes détectées")

                # Afficher les colonnes principales
                key_columns = [col for col in data.columns if
                               any(keyword in col.lower() for keyword in ['produit', 'magasin', 'categorie', 'prix'])]
                if key_columns:
                    st.info(f"📋 Colonnes principales: {', '.join(key_columns[:5])}")

                return data
            else:
                st.warning("⚠️ Le fichier local semble vide. Utilisation des données d'exemple.")
                return generate_sample_data()

        except Exception as e:
            st.error(f"❌ Erreur lors du chargement du fichier local: {e}")
            st.info("💡 Utilisation des données d'exemple à la place.")
            return generate_sample_data()
    else:
        # Pas de fichier spécifié, utiliser les données d'exemple
        st.info("💡 Aucun fichier spécifié. Utilisation des données d'exemple.")
        return generate_sample_data()


# Sidebar pour la configuration
st.sidebar.header("⚙️ Configuration")

# Configuration des paramètres
st.sidebar.subheader("🎛️ Paramètres de génération")

optimization_level = st.sidebar.slider(
    "Niveau d'optimisation",
    min_value=1,
    max_value=5,
    value=3,
    help="1=Rapide, 5=Qualité maximale"
)

apply_temperature_constraints = st.sidebar.checkbox(
    "Appliquer les contraintes de température",
    value=True,
    help="Force les produits froids vers des meubles réfrigérés"
)

# Interface principale
tab1, tab2, tab3, tab4 = st.tabs(["📊 Dashboard", "🎯 Génération", "📋 Résultats", "📈 Analytics"])

with tab1:
    st.header("📊 Dashboard")

    # Chargement automatique avec affichage des détails
    if os.path.exists(DATA_PATH):
        data = load_data_safe(file_path=DATA_PATH)
        st.session_state.data_loaded = True

        # Métriques principales
        col1, col2, col3, col4 = st.columns(4)

        with col1:
            st.markdown(f"""
            <div class="metric-card">
                <h3>📦 Produits</h3>
                <h2>{len(data)}</h2>
            </div>
            """, unsafe_allow_html=True)

        with col2:
            magasin_cols = [col for col in data.columns if 'magasin' in col.lower() and 'id' in col.lower()]
            n_magasins = data[magasin_cols[0]].nunique() if magasin_cols else 0
            st.markdown(f"""
            <div class="metric-card">
                <h3>🏬 Magasins</h3>
                <h2>{n_magasins}</h2>
            </div>
            """, unsafe_allow_html=True)

        with col3:
            categorie_cols = [col for col in data.columns if 'categorie' in col.lower() and 'id' in col.lower()]
            n_categories = data[categorie_cols[0]].nunique() if categorie_cols else 0
            st.markdown(f"""
            <div class="metric-card">
                <h3>📂 Catégories</h3>
                <h2>{n_categories}</h2>
            </div>
            """, unsafe_allow_html=True)

        with col4:
            prix_cols = [col for col in data.columns if 'prix' in col.lower() and 'produit' in col.lower()]
            if prix_cols:
                data[prix_cols[0]] = pd.to_numeric(data[prix_cols[0]], errors='coerce')
                avg_price = data[prix_cols[0]].mean()
            else:
                avg_price = 0
            st.markdown(f"""
            <div class="metric-card">
                <h3>💰 Prix Moyen</h3>
                <h2>{avg_price:.2f}€</h2>
            </div>
            """, unsafe_allow_html=True)

        # Graphiques et aperçu des données
        st.subheader("👀 Aperçu des données")
        st.dataframe(data.head(10), use_container_width=True)

        # Informations sur les colonnes
        st.subheader("📋 Informations sur les colonnes")
        col_info = pd.DataFrame({
            'Colonne': data.columns,
            'Type': data.dtypes,
            'Valeurs non-nulles': data.count(),
            'Valeurs uniques': data.nunique()
        })
        st.dataframe(col_info, use_container_width=True)

    else:
        st.error(f"❌ Fichier introuvable à l'emplacement : {DATA_PATH}")
        st.info("💡 Utilisation des données d'exemple.")
        data = generate_sample_data()
        st.session_state.data_loaded = True

with tab2:
    st.header("🎯 Génération de Planogramme")

    if not st.session_state.data_loaded:
        st.warning("⚠️ Veuillez d'abord charger des données dans l'onglet Dashboard.")
    else:
        # Configuration de la génération
        col1, col2 = st.columns(2)

        with col1:
            st.subheader("⚙️ Configuration")

            # Sélection des filtres avec recherche flexible
            magasin_cols = [col for col in data.columns if 'magasin' in col.lower() and 'id' in col.lower()]
            if magasin_cols:
                magasins_disponibles = ['Tous'] + list(data[magasin_cols[0]].unique())
                magasin_selected = st.selectbox("Magasin", magasins_disponibles)
            else:
                magasin_selected = "Tous"

            categorie_cols = [col for col in data.columns if 'categorie' in col.lower() and 'id' in col.lower()]
            if categorie_cols:
                categories_disponibles = ['Toutes'] + list(data[categorie_cols[0]].unique())
                categorie_selected = st.selectbox("Catégorie", categories_disponibles)
            else:
                categorie_selected = "Toutes"

        with col2:
            st.subheader("📋 Types de meubles supportés")

            furniture_types = {
                1: {"name": "planogram", "faces": 1},
                2: {"name": "gondola", "faces": 2},
                3: {"name": "shelves-display", "faces": 4},
                4: {"name": "clothing-rack", "faces": 1},
                5: {"name": "wall-display", "faces": 1},
                6: {"name": "accessory-display", "faces": 1},
                7: {"name": "modular-cube", "faces": 1},
                8: {"name": "table", "faces": 1},
                9: {"name": "refrigerator", "faces": 1},
                10: {"name": "refrigerated-showcase", "faces": 1},
                11: {"name": "clothing-display", "faces": 1},
                12: {"name": "clothing-wall", "faces": 1}
            }

            for id_type, info in furniture_types.items():
                face_text = f"{info['faces']} face{'s' if info['faces'] > 1 else ''}"
                st.write(f"**{id_type}**: {info['name']} ({face_text})")

        # Bouton de génération
        st.markdown("<br>", unsafe_allow_html=True)

        if st.button("🚀 Générer le Planogramme", type="primary", use_container_width=True):
            with st.spinner("🔄 Génération en cours..."):
                try:
                    # Filtrage des données
                    filtered_data = data.copy()

                    if magasin_selected != "Tous" and magasin_cols:
                        filtered_data = filtered_data[filtered_data[magasin_cols[0]] == magasin_selected]

                    if categorie_selected != "Toutes" and categorie_cols:
                        filtered_data = filtered_data[filtered_data[categorie_cols[0]] == categorie_selected]

                    if filtered_data.empty:
                        st.error("❌ Aucune donnée après filtrage!")
                    else:
                        # Sauvegarde temporaire des données
                        temp_file = "temp_data.csv"
                        filtered_data.to_csv(temp_file, index=False)

                        # Initialisation du pipeline
                        st.session_state.pipeline = PlanogramAIPipeline(temp_file)

                        # Génération
                        results = st.session_state.pipeline.run_filtered_pipeline(
                            filtered_data,
                            magasin_id=magasin_selected if magasin_selected != "Tous" else "MAG_001",
                            categorie_id=categorie_selected if categorie_selected != "Toutes" else "CAT_001"
                        )

                        if results:
                            # Génération du JSON final
                            json_output = st.session_state.pipeline.generate_json_output(
                                results,
                                magasin_id=magasin_selected if magasin_selected != "Tous" else "MAG_001",
                                categorie_id=categorie_selected if categorie_selected != "Toutes" else "CAT_001"
                            )

                            # Appliquer le mapping des IDs
                            json_output = map_product_ids(json_output, filtered_data)

                            st.session_state.results = json_output

                            st.markdown("""
                            <div class="success-message">
                                ✅ <strong>Planogramme généré avec succès!</strong><br>
                                Consultez l'onglet "Résultats" pour voir les détails.
                            </div>
                            """, unsafe_allow_html=True)

                            # Envoi automatique DIRECT vers React
                            #st.info("🚀 Envoi DIRECT automatique vers React...")
                            send_data_direct_to_react(json_output)

                        else:
                            st.error("❌ Erreur lors de la génération du planogramme.")

                except Exception as e:
                    st.error(f"❌ Erreur: {str(e)}")

with tab3:
    st.header("📋 Résultats du Planogramme")

    if st.session_state.results is None:
        st.info("💡 Aucun planogramme généré. Utilisez l'onglet 'Génération' pour créer un planogramme.")
    else:
        results = st.session_state.results

        # Informations générales
        st.subheader("ℹ️ Informations générales")

        col1, col2, col3 = st.columns(3)

        with col1:
            st.metric("ID Planogramme", results['planogram_info']['planogram_id'])
            st.metric("Statut", results['planogram_info']['statut'])

        with col2:
            # Calculer le nombre total de meubles et positions
            total_furniture = len(results['furniture'])
            total_positions = len(results['product_positions'])

            st.metric("Total Meubles", total_furniture)
            st.metric("Total Positions", total_positions)

        with col3:
            # Calculer le nombre de types de meubles uniques
            furniture_types = {f['furniture_type_id'] for f in results['furniture']}
            furniture_types_count = len(furniture_types)

            # Calculer la moyenne des quantités
            quantities = [p['quantite'] for p in results['product_positions']]
            avg_quantity = sum(quantities) / len(quantities) if quantities else 0

            st.metric("Types de meubles", furniture_types_count)
            st.metric("Moy. produits/position", f"{avg_quantity:.1f}")

        # Détails des meubles
        st.subheader("🪑 Détails des Meubles")

        furniture_df = pd.DataFrame(results['furniture'])
        st.dataframe(furniture_df, use_container_width=True)

        # Détails des positions
        st.subheader("📍 Positions des Produits")

        positions_df = pd.DataFrame(results['product_positions'])

        # Réorganiser les colonnes pour mettre en avant l'ID original
        columns_order = ['position_id', 'produit_id', 'furniture_id', 'face', 'etagere', 'colonne', 'quantite']
        columns_order = [col for col in columns_order if col in positions_df.columns]

        st.dataframe(positions_df[columns_order], use_container_width=True)

        # Export et Communication DIRECTE
        st.subheader("💾 Export et Communication DIRECTE")

        # Affichage animé du JSON généré
        with st.expander("📄 Afficher le JSON généré (avec effet visuel)", expanded=True):
            json_str = json.dumps(results, indent=2, ensure_ascii=False)

            # Créer un effet de chargement progressif
            placeholder = st.empty()
            full_json = ""

            for i in range(0, len(json_str), 100):
                chunk = json_str[i:i + 100]
                full_json += chunk
                placeholder.code(full_json, language='json')

                # Ajouter un petit délai pour l'effet visuel
                import time

                time.sleep(0.05)

            # Finaliser l'affichage
            placeholder.code(json_str, language='json')

            # Bouton de téléchargement stylisé
            st.download_button(
                label="⬇️ Télécharger le JSON complet",
                data=json_str,
                file_name=f"planogramme_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
                mime="application/json",
                use_container_width=True,
                key="download_json"
            )





with tab4:
    st.header("📈 Analytics")

    if st.session_state.results is None:
        st.info("💡 Générez d'abord un planogramme pour voir les analytics.")
    else:
        results = st.session_state.results

        # Analyse des types de meubles
        st.subheader("🪑 Répartition des Types de Meubles")

        furniture_df = pd.DataFrame(results['furniture'])
        furniture_type_counts = furniture_df['furniture_type_id'].value_counts()

        fig_furniture_types = px.pie(
            values=furniture_type_counts.values,
            names=furniture_type_counts.index,
            title="Répartition des Types de Meubles"
        )
        st.plotly_chart(fig_furniture_types, use_container_width=True)

        # Analyse des dimensions
        st.subheader("📏 Analyse des Dimensions")

        col1, col2 = st.columns(2)

        with col1:
            fig_dimensions = px.scatter(
                furniture_df,
                x='largeur',
                y='hauteur',
                color='furniture_type_id',
                size='profondeur',
                title="Largeur vs Hauteur des Meubles",
                hover_data=['furniture_id']
            )
            st.plotly_chart(fig_dimensions, use_container_width=True)

        with col2:
            # Vérifier si la colonne existe avant de créer le graphique
            if 'nb_etageres_unique_face' in furniture_df.columns:
                fig_shelves = px.bar(
                    furniture_df,
                    x='furniture_type_id',
                    y='nb_etageres_unique_face',
                    title="Nombre d'Étagères par Type"
                )
                st.plotly_chart(fig_shelves, use_container_width=True)
            else:
                st.info("Pas de données sur les étagères disponibles")

        # Analyse des positions
        st.subheader("📍 Analyse des Positions")

        positions_df = pd.DataFrame(results['product_positions'])

        col1, col2 = st.columns(2)

        with col1:
            face_counts = positions_df['face'].value_counts()
            fig_faces = px.bar(
                x=face_counts.index,
                y=face_counts.values,
                title="Répartition par Face",
                labels={'x': 'Face', 'y': 'Nombre de positions'}
            )
            st.plotly_chart(fig_faces, use_container_width=True)

        with col2:
            fig_quantities = px.histogram(
                positions_df,
                x='quantite',
                title="Distribution des Quantités",
                nbins=10
            )
            st.plotly_chart(fig_quantities, use_container_width=True)

# Footer
st.markdown("---")
st.markdown("""
<div style="text-align: center; color: #666; padding: 1rem;">
    🏪 <strong>Système de Génération de Planogrammes IA</strong> - 
    Développé avec Streamlit, XGBoost et Random Forest
</div>
""", unsafe_allow_html=True)
