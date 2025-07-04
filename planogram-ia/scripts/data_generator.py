import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import os


def generate_comprehensive_dataset(n_samples=1000, output_file="data/dataset.csv"):
    """
    Génère un dataset complet selon les spécifications du cahier des charges
    """
    print(f"🔄 Génération de {n_samples} échantillons...")

    # Seed pour la reproductibilité
    np.random.seed(42)
    random.seed(42)

    # Listes de valeurs possibles
    magasins = ['MAG_001', 'MAG_002', 'MAG_003', 'MAG_004', 'MAG_005']
    categories = ['CAT_001', 'CAT_002', 'CAT_003', 'CAT_004', 'CAT_005', 'CAT_006']
    zones = ['ZONE_001', 'ZONE_002', 'ZONE_003', 'ZONE_004']

    # Noms de produits réalistes
    produit_prefixes = ['Café', 'Thé', 'Chocolat', 'Biscuits', 'Céréales', 'Pâtes', 'Riz', 'Huile', 'Vinaigre', 'Sauce']
    produit_suffixes = ['Bio', 'Premium', 'Classic', 'Light', '250g', '500g', '1kg', 'Family']

    # Noms de magasins
    magasin_noms = {
        'MAG_001': 'Supermarché Centre-Ville',
        'MAG_002': 'Hypermarché Nord',
        'MAG_003': 'Épicerie Quartier',
        'MAG_004': 'Grand Magasin Sud',
        'MAG_005': 'Superette Express'
    }

    # Noms de catégories
    categorie_noms = {
        'CAT_001': 'Épicerie Salée',
        'CAT_002': 'Épicerie Sucrée',
        'CAT_003': 'Boissons',
        'CAT_004': 'Produits Frais',
        'CAT_005': 'Surgelés',
        'CAT_006': 'Hygiène & Beauté'
    }

    # Génération des données
    data = []

    for i in range(n_samples):
        # Sélections aléatoires
        magasin_id = random.choice(magasins)
        categorie_id = random.choice(categories)
        zone_id = random.choice(zones)

        # Génération d'un nom de produit
        produit_nom = f"{random.choice(produit_prefixes)} {random.choice(produit_suffixes)}"

        # Contraintes de température basées sur la catégorie
        if categorie_id in ['CAT_004', 'CAT_005']:  # Frais et Surgelés
            contrainte_temp = 'froid'
            temp_code = 1
        else:
            contrainte_temp = 'ambiante'
            temp_code = 0

        # Dimensions du magasin (cohérentes par magasin)
        if magasin_id == 'MAG_001':
            surface_magasin = np.random.normal(450, 50)
            longueur_magasin = np.random.normal(25, 3)
            largeur_magasin = np.random.normal(18, 2)
        elif magasin_id == 'MAG_002':
            surface_magasin = np.random.normal(800, 100)
            longueur_magasin = np.random.normal(40, 5)
            largeur_magasin = np.random.normal(20, 3)
        else:
            surface_magasin = np.random.normal(300, 40)
            longueur_magasin = np.random.normal(20, 2)
            largeur_magasin = np.random.normal(15, 2)

        # Dates aléatoires
        date_base = datetime.now() - timedelta(days=random.randint(1, 365))
        date_vente = date_base + timedelta(days=random.randint(0, 30))
        date_stock = date_base + timedelta(days=random.randint(-10, 10))

        # Génération de l'échantillon
        sample = {
            # Données Produits
            'input_produit_id': f'PROD_{i + 1:04d}',
            'input_nom_produit': produit_nom,
            'input_description_produit': f'Description du {produit_nom}',
            'input_prix_produit': round(np.random.lognormal(2.5, 0.8), 2),
            'input_categorie_id': categorie_id,
            'input_longueur_produit': round(np.random.uniform(8, 35), 1),
            'input_largeur_produit': round(np.random.uniform(5, 25), 1),
            'input_hauteur_produit': round(np.random.uniform(10, 40), 1),
            'input_saisonnalite_produit': random.choice(['printemps', 'été', 'automne', 'hiver', 'toute_annee']),
            'input_priorite_merchandising': random.randint(1, 10),
            'input_contrainte_temperature_produit': temp_code,
            'input_contrainte_conditionnement_produit': random.choice(['standard', 'fragile', 'liquide']),
            'input_conditionnement_produit': random.choice(['carton', 'plastique', 'verre', 'metal']),

            # Données Magasins
            'input_magasin_id': magasin_id,
            'input_nom_magasin_magasin': magasin_noms[magasin_id],
            'input_surface_magasin': round(max(100, surface_magasin), 1),
            'input_longueur_magasin': round(max(10, longueur_magasin), 1),
            'input_largeur_magasin': round(max(8, largeur_magasin), 1),
            'input_adresse_magasin': f'{random.randint(1, 999)} Rue de la {random.choice(["Paix", "République", "Liberté"])}',

            # Données Zones
            'input_zone_id': zone_id,
            'input_nom_zone': f'Zone {zone_id.split("_")[1]}',
            'input_description_zone': f'Description de la zone {zone_id}',
            'input_emplacement_zone': random.choice(['entrée', 'centre', 'fond', 'côté']),
            'input_longueur_zone': round(np.random.uniform(5, 15), 1),
            'input_largeur_zone': round(np.random.uniform(2, 8), 1),
            'input_hauteur_zone': round(np.random.uniform(2.5, 4), 1),
            'input_temperature_zone': 'froid' if temp_code == 1 else 'ambiante',
            'input_eclairage_zone': random.choice(['LED', 'halogène', 'néon']),

            # Données Stock
            'input_quantite_stock': random.randint(0, 500),
            'input_date_maj_stock': date_stock.strftime('%Y-%m-%d'),

            # Données Ventes
            'input_quantite_vente': random.randint(0, 50),
            'input_prix_unitaire_vente': round(np.random.uniform(5, 100), 2),
            'input_montant_total_vente': 0,  # Sera calculé
            'input_date_vente': date_vente.strftime('%Y-%m-%d'),

            # Données Promotions
            'input_promotion_id': f'PROMO_{random.randint(1, 20):03d}' if random.random() < 0.3 else '',
            'input_nom_promotion': random.choice(
                ['Soldes', 'Promo Flash', 'Offre Spéciale', '']) if random.random() < 0.3 else '',
            'input_description_promotion': 'Description promotion' if random.random() < 0.3 else '',
            'input_date_debut_promotion': (date_base - timedelta(days=5)).strftime(
                '%Y-%m-%d') if random.random() < 0.3 else '',
            'input_date_fin_promotion': (date_base + timedelta(days=10)).strftime(
                '%Y-%m-%d') if random.random() < 0.3 else '',
            'input_type_promotion': random.choice(
                ['pourcentage', 'montant', '2pour1']) if random.random() < 0.3 else '',
            'input_etat_promotion': random.choice(['active', 'inactive', 'planifiee']) if random.random() < 0.3 else '',
            'input_conditions_promotion': 'Conditions spéciales' if random.random() < 0.3 else '',

            # Données Conversion Zone
            'input_date_conversionZone': date_base.strftime('%Y-%m-%d'),
            'input_visiteurs_conversionZone': random.randint(50, 500),
            'input_acheteurs_conversionZone': random.randint(10, 200),
            'input_taux_conversion': 0,  # Sera calculé

            # Données Mouvements
            'input_mouvement_id': f'MOV_{i + 1:04d}',
            'input_date_mouvement': date_base.strftime('%Y-%m-%d'),
            'input_type_mouvement': random.choice(['entree', 'sortie', 'transfert']),
            'input_quantite_mouvement': random.randint(1, 100),
            'input_cout_unitaire_mouvement': round(np.random.uniform(1, 50), 2),
            'input_valeur_mouvement': 0,  # Sera calculé

            # Données Légales
            'input_id_legal': f'LEG_{random.randint(1, 10):03d}' if random.random() < 0.2 else '',
            'input_description_legal': random.choice(
                ['Restriction âge', 'Alcool', 'Tabac', '']) if random.random() < 0.2 else '',
            'input_type_contrainte_legal': random.choice(
                ['age', 'licence', 'certification']) if random.random() < 0.2 else '',
            'input_conditions_legal': 'Conditions légales' if random.random() < 0.2 else '',
            'input_date_debut_legal': date_base.strftime('%Y-%m-%d') if random.random() < 0.2 else '',
            'input_date_fin_legal': (date_base + timedelta(days=365)).strftime(
                '%Y-%m-%d') if random.random() < 0.2 else '',

            # Données Événements
            'input_id_event': f'EVT_{random.randint(1, 15):03d}' if random.random() < 0.4 else '',
            'input_nom_event': random.choice(['Noël', 'Pâques', 'Rentrée', 'Soldes']) if random.random() < 0.4 else '',
            'input_type_event': random.choice(['saisonnier', 'commercial', 'special']) if random.random() < 0.4 else '',
            'input_date_debut_event': date_base.strftime('%Y-%m-%d') if random.random() < 0.4 else '',
            'input_date_fin_event': (date_base + timedelta(days=30)).strftime(
                '%Y-%m-%d') if random.random() < 0.4 else '',
            'input_description_event': 'Description événement' if random.random() < 0.4 else '',

            # Données Fournisseurs
            'input_id_supplier': f'SUP_{random.randint(1, 25):03d}',
            'input_placement_exige_supplier': random.choice(['tête_gondole', 'niveau_oeil', 'standard']),
            'input_espace_minimum_supplier': round(np.random.uniform(0.5, 5), 1),
            'input_date_debut_supplier': date_base.strftime('%Y-%m-%d'),
            'input_date_fin_supplier': (date_base + timedelta(days=180)).strftime('%Y-%m-%d'),

            # Données Heatmap
            'input_id_heatmap': f'HEAT_{i + 1:04d}',
            'input_date_heatmap': date_base.strftime('%Y-%m-%d'),
            'input_visiteurs_heatmap': random.randint(10, 200),
            'input_duree_moyenne_heatmap': round(np.random.uniform(30, 300), 1),
            'input_intensite_heatmap': round(np.random.uniform(0.1, 1.0), 2),

            # Données Catégories détaillées
            'input_nom_categorie': categorie_noms[categorie_id],
            'input_parent_id_categorie': f'PARENT_{random.randint(1, 3):03d}' if random.random() < 0.5 else '',
            'input_saisonnalite_categorie': random.choice(['printemps', 'été', 'automne', 'hiver', 'toute_annee']),
            'input_priorite_categorie': random.randint(1, 10),
            'input_zone_exposition_preferee_categorie': random.choice(['entrée', 'centre', 'fond']),
            'input_temperature_exposition_categorie': contrainte_temp,
            'input_clientele_ciblee_categorie': random.choice(['famille', 'jeune', 'senior', 'tous']),

            # Données de sortie (à prédire)
            'output_planogram_id_planograms': f'PLANO_{i + 1:04d}',
            'output_nom_planograms': f'Planogramme {magasin_id}_{categorie_id}',
            'output_statut_planograms': random.choice(['draft', 'active', 'archived']),
            'input_date_creation_planograms': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),

            # Données Meubles (à prédire)
            'furniture_id_furniture': f'FURN_{i + 1:04d}',
            'output_furniture_type_id_furniture': random.randint(1, 12),
            'output_largeur_furniture': round(np.random.uniform(60, 300), 1),
            'output_hauteur_furniture': round(np.random.uniform(120, 250), 1),
            'output_profondeur_furniture': round(np.random.uniform(30, 80), 1),
            'output_nb_colonnes_unique_face_furniture': random.randint(2, 10),
            'output_nb_etageres_unique_face_furniture': random.randint(3, 8),
            'output_nb_colonnes_front_back_furniture': random.randint(2, 10),
            'output_nb_etageres_front_back_furniture': random.randint(3, 8),
            'output_nb_colonnes_left_right_furniture': random.randint(2, 10),
            'output_nb_etageres_left_right_furniture': random.randint(3, 8),
            'input_imageUrl_furniture': f'/images/furniture_{random.randint(1, 12)}.png',

            # Données Positions (à prédire)
            'position_id_productposition': f'POS_{i + 1:04d}',
            'output_face_productposition': random.randint(1, 4),
            'output_etagere_productposition': random.randint(1, 6),
            'output_colonne_productposition': random.randint(1, 8),
            'output_quantite_productposition': random.randint(1, 10),

            # Type de meuble
            'furniture_type_id_furnituretypes': random.randint(1, 12)
        }

        # Calculs dérivés
        sample['input_montant_total_vente'] = round(
            sample['input_quantite_vente'] * sample['input_prix_unitaire_vente'], 2)
        sample['input_taux_conversion'] = round(
            sample['input_acheteurs_conversionZone'] / max(1, sample['input_visiteurs_conversionZone']), 3)
        sample['input_valeur_mouvement'] = round(
            sample['input_quantite_mouvement'] * sample['input_cout_unitaire_mouvement'], 2)

        data.append(sample)

    # Création du DataFrame
    df = pd.DataFrame(data)

    # Sauvegarde avec gestion d'encodage
    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    # Nettoyage des caractères problématiques
    for col in df.columns:
        if df[col].dtype == 'object':
            df[col] = df[col].astype(str).str.encode('ascii', 'ignore').str.decode('ascii')

    # Sauvegarde en UTF-8 avec BOM pour Excel
    df.to_csv(output_file, index=False, encoding='utf-8-sig')

    print(f"✅ Dataset généré avec succès!")
    print(f"📁 Fichier: {output_file}")
    print(f"📊 Lignes: {len(df)}")
    print(f"📋 Colonnes: {len(df.columns)}")

    # Statistiques
    print("\n📈 Statistiques du dataset:")
    print(f"  • Produits uniques: {df['input_produit_id'].nunique()}")
    print(f"  • Magasins: {df['input_magasin_id'].nunique()}")
    print(f"  • Catégories: {df['input_categorie_id'].nunique()}")
    print(f"  • Prix moyen: {df['input_prix_produit'].mean():.2f}€")
    print(f"  • Produits froids: {(df['input_contrainte_temperature_produit'] == 1).sum()}")

    return df


def generate_mini_dataset(n_samples=50, output_file="data/mini_dataset.csv"):
    """Génère un petit dataset pour les tests rapides"""
    print(f"🔄 Génération d'un mini dataset ({n_samples} échantillons)...")
    return generate_comprehensive_dataset(n_samples, output_file)


if __name__ == "__main__":
    print("🏪 Générateur de Données - Planogramme IA")
    print("=" * 50)

    # Génération du dataset principal
    df_main = generate_comprehensive_dataset(1000, "data/dataset.csv")

    # Génération d'un mini dataset pour les tests
    df_mini = generate_mini_dataset(100, "data/mini_dataset.csv")

    print("\n✅ Génération terminée!")
    print("📁 Fichiers générés:")
    print("  • data/dataset.csv (dataset principal)")
    print("  • data/mini_dataset.csv (dataset de test)")
