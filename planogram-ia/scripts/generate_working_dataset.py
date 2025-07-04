import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta
import random


def create_comprehensive_dataset():
    """Crée un dataset complet et fonctionnel"""
    print("🔄 Création d'un dataset complet...")

    # Configuration
    np.random.seed(42)
    random.seed(42)
    n_samples = 500

    # Listes de référence
    magasins = ['MAG_001', 'MAG_002', 'MAG_003', 'MAG_004', 'MAG_005']
    categories = ['CAT_001', 'CAT_002', 'CAT_003', 'CAT_004', 'CAT_005', 'CAT_006']
    zones = ['ZONE_001', 'ZONE_002', 'ZONE_003', 'ZONE_004']

    # Noms de produits réalistes
    produits_base = [
        'Café Arabica', 'Thé Vert', 'Chocolat Noir', 'Biscuits Sablés', 'Céréales Muesli',
        'Pâtes Penne', 'Riz Basmati', 'Huile Olive', 'Vinaigre Balsamique', 'Sauce Tomate',
        'Lait Entier', 'Yaourt Nature', 'Fromage Emmental', 'Jambon Blanc', 'Pain Complet',
        'Pommes Golden', 'Bananes', 'Oranges', 'Carottes', 'Pommes de Terre',
        'Eau Minérale', 'Jus Orange', 'Soda Cola', 'Bière Blonde', 'Vin Rouge',
        'Shampoing', 'Dentifrice', 'Savon', 'Déodorant', 'Crème Visage'
    ]

    # Génération des données
    data = []

    for i in range(n_samples):
        # Sélections aléatoires
        magasin_id = random.choice(magasins)
        categorie_id = random.choice(categories)
        zone_id = random.choice(zones)
        produit_nom = random.choice(produits_base)

        # Contraintes de température basées sur la catégorie
        if categorie_id in ['CAT_004', 'CAT_005']:  # Produits frais
            contrainte_temp = 1
            temp_zone = 'froid'
        else:
            contrainte_temp = 0
            temp_zone = 'ambiante'

        # Dimensions cohérentes par magasin
        if magasin_id == 'MAG_001':  # Grand magasin
            surface_magasin = np.random.normal(600, 50)
            longueur_magasin = np.random.normal(30, 3)
            largeur_magasin = np.random.normal(20, 2)
        elif magasin_id == 'MAG_002':  # Hypermarché
            surface_magasin = np.random.normal(1000, 100)
            longueur_magasin = np.random.normal(50, 5)
            largeur_magasin = np.random.normal(20, 3)
        else:  # Magasins moyens
            surface_magasin = np.random.normal(400, 50)
            longueur_magasin = np.random.normal(25, 3)
            largeur_magasin = np.random.normal(16, 2)

        # Dates
        date_base = datetime.now() - timedelta(days=random.randint(1, 180))

        # Échantillon de données
        sample = {
            # === DONNÉES PRODUITS ===
            'input_produit_id': f'PROD_{i + 1:04d}',
            'input_nom_produit': f'{produit_nom} {random.choice(["Premium", "Bio", "Classic", "Light"])}',
            'input_description_produit': f'Description du {produit_nom}',
            'input_prix_produit': round(np.random.lognormal(2.5, 0.6), 2),
            'input_categorie_id': categorie_id,
            'input_longueur_produit': round(np.random.uniform(8, 30), 1),
            'input_largeur_produit': round(np.random.uniform(5, 20), 1),
            'input_hauteur_produit': round(np.random.uniform(10, 35), 1),
            'input_saisonnalite_produit': random.choice(['printemps', 'ete', 'automne', 'hiver', 'toute_annee']),
            'input_priorite_merchandising': random.randint(1, 10),
            'input_contrainte_temperature_produit': contrainte_temp,
            'input_contrainte_conditionnement_produit': random.choice(['standard', 'fragile', 'liquide']),
            'input_conditionnement_produit': random.choice(['carton', 'plastique', 'verre', 'metal']),

            # === DONNÉES MAGASINS ===
            'input_magasin_id': magasin_id,
            'input_nom_magasin_magasin': f'Magasin {magasin_id}',
            'input_surface_magasin': round(max(200, surface_magasin), 1),
            'input_longueur_magasin': round(max(15, longueur_magasin), 1),
            'input_largeur_magasin': round(max(10, largeur_magasin), 1),
            'input_adresse_magasin': f'{random.randint(1, 999)} Rue {random.choice(["de la Paix", "République", "Liberté"])}',

            # === DONNÉES ZONES ===
            'input_zone_id': zone_id,
            'input_nom_zone': f'Zone {zone_id.split("_")[1]}',
            'input_description_zone': f'Zone {random.choice(["centrale", "périphérique", "spécialisée"])}',
            'input_emplacement_zone': random.choice(['entree', 'centre', 'fond', 'cote']),
            'input_longueur_zone': round(np.random.uniform(5, 12), 1),
            'input_largeur_zone': round(np.random.uniform(2, 6), 1),
            'input_hauteur_zone': round(np.random.uniform(2.5, 3.5), 1),
            'input_temperature_zone': temp_zone,
            'input_eclairage_zone': random.choice(['LED', 'halogene', 'neon']),

            # === DONNÉES STOCK ===
            'input_quantite_stock': random.randint(5, 200),
            'input_date_maj_stock': date_base.strftime('%Y-%m-%d'),

            # === DONNÉES VENTES ===
            'input_quantite_vente': random.randint(1, 30),
            'input_prix_unitaire_vente': round(np.random.uniform(8, 80), 2),
            'input_date_vente': (date_base + timedelta(days=random.randint(0, 30))).strftime('%Y-%m-%d'),

            # === DONNÉES PROMOTIONS ===
            'input_promotion_id': f'PROMO_{random.randint(1, 50):03d}' if random.random() < 0.25 else '',
            'input_nom_promotion': random.choice(
                ['Soldes Hiver', 'Promo Flash', 'Offre Spéciale', 'Black Friday']) if random.random() < 0.25 else '',
            'input_type_promotion': random.choice(
                ['pourcentage', 'montant', '2pour1']) if random.random() < 0.25 else '',
            'input_etat_promotion': random.choice(
                ['active', 'inactive', 'planifiee']) if random.random() < 0.25 else '',

            # === DONNÉES FOURNISSEURS ===
            'input_id_supplier': f'SUP_{random.randint(1, 30):03d}',
            'input_placement_exige_supplier': random.choice(['tete_gondole', 'niveau_oeil', 'standard']),
            'input_espace_minimum_supplier': round(np.random.uniform(0.5, 3), 1),

            # === DONNÉES CATÉGORIES ===
            'input_nom_categorie': f'Catégorie {categorie_id}',
            'input_saisonnalite_categorie': random.choice(['printemps', 'ete', 'automne', 'hiver', 'toute_annee']),
            'input_priorite_categorie': random.randint(1, 10),
            'input_zone_exposition_preferee_categorie': random.choice(['entree', 'centre', 'fond']),
            'input_temperature_exposition_categorie': temp_zone,
            'input_clientele_ciblee_categorie': random.choice(['famille', 'jeune', 'senior', 'tous']),
        }

        # Calculs dérivés
        sample['input_montant_total_vente'] = round(
            sample['input_quantite_vente'] * sample['input_prix_unitaire_vente'], 2)
        sample['input_valeur_stock'] = round(sample['input_quantite_stock'] * sample['input_prix_produit'], 2)

        data.append(sample)

    # Création du DataFrame
    df = pd.DataFrame(data)

    print(f"✅ Dataset créé: {len(df)} lignes × {len(df.columns)} colonnes")
    return df


def save_dataset(df, filename="data/dataset.csv"):
    """Sauvegarde le dataset avec vérifications"""
    try:
        # Création du dossier
        os.makedirs(os.path.dirname(filename), exist_ok=True)

        # Sauvegarde
        df.to_csv(filename, index=False, encoding='utf-8')
        print(f"✅ Dataset sauvegardé: {filename}")

        # Vérification
        test_df = pd.read_csv(filename)
        print(f"✅ Vérification: {test_df.shape[0]} lignes × {test_df.shape[1]} colonnes")

        # Statistiques
        print(f"\n📊 Statistiques:")
        print(f"  • Produits uniques: {test_df['input_produit_id'].nunique()}")
        print(f"  • Magasins: {test_df['input_magasin_id'].nunique()}")
        print(f"  • Catégories: {test_df['input_categorie_id'].nunique()}")
        print(f"  • Prix moyen: {test_df['input_prix_produit'].mean():.2f}€")
        print(f"  • Produits froids: {(test_df['input_contrainte_temperature_produit'] == 1).sum()}")

        return True

    except Exception as e:
        print(f"❌ Erreur sauvegarde: {e}")
        return False


def create_mini_dataset():
    """Crée un petit dataset pour les tests rapides"""
    print("🔄 Création d'un mini dataset...")

    np.random.seed(42)
    n_samples = 50

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

    df = pd.DataFrame(data)
    save_dataset(df, "data/mini_dataset.csv")
    return df


if __name__ == "__main__":
    print("🏪 Générateur de Dataset - Planogramme IA")
    print("=" * 50)

    # Création du dataset principal
    df_main = create_comprehensive_dataset()
    success_main = save_dataset(df_main, "data/dataset.csv")

    # Création du mini dataset
    df_mini = create_mini_dataset()

    if success_main:
        print(f"\n🎉 SUCCÈS!")
        print(f"📁 Fichiers créés:")
        print(f"  • data/dataset.csv (dataset principal)")
        print(f"  • data/mini_dataset.csv (dataset de test)")
        print(f"\n🚀 Vous pouvez maintenant lancer:")
        print(f"  streamlit run streamlit_app.py")
    else:
        print(f"\n❌ Échec de la création du dataset")
