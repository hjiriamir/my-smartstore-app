import sys

sys.path.append('..')

import pandas as pd
import numpy as np
from main_pipeline import PlanogramAIPipeline
import json


def validate_furniture_rules(results):
    """Valide que les règles de meubles sont correctement appliquées"""
    print("🔍 Validation des règles de meubles")
    print("=" * 40)

    # Mapping des types vers le nombre de faces
    furniture_faces = {
        1: 1, 2: 2, 3: 4, 4: 1, 5: 1, 6: 1,
        7: 1, 8: 1, 9: 1, 10: 1, 11: 1, 12: 1
    }

    furniture_names = {
        1: "planogram", 2: "gondola", 3: "shelves-display", 4: "clothing-rack",
        5: "wall-display", 6: "accessory-display", 7: "modular-cube", 8: "table",
        9: "refrigerator", 10: "refrigerated-showcase", 11: "clothing-display", 12: "clothing-wall"
    }

    validation_errors = []
    validation_success = []

    if 'furniture' not in results:
        print("❌ Pas de données de meubles à valider")
        return False

    furniture_data = results['furniture']

    for i, furniture in enumerate(furniture_data):
        furniture_type_id = furniture['furniture_type_id']
        expected_faces = furniture_faces.get(furniture_type_id, 1)
        actual_faces = furniture.get('faces', 0)
        furniture_name = furniture_names.get(furniture_type_id, "unknown")

        print(f"\n🪑 Meuble {i + 1}: {furniture_name} (Type {furniture_type_id})")
        print(f"   Faces attendues: {expected_faces}, Faces trouvées: {actual_faces}")

        # Validation du nombre de faces
        if actual_faces != expected_faces:
            error = f"Meuble {i + 1}: Faces incorrectes ({actual_faces} vs {expected_faces})"
            validation_errors.append(error)
            print(f"   ❌ {error}")
        else:
            validation_success.append(f"Meuble {i + 1}: Faces correctes")
            print(f"   ✅ Faces correctes")

        # Validation des colonnes utilisées selon le nombre de faces
        if expected_faces == 1:
            # Doit utiliser uniquement unique_face
            if (furniture['nb_etageres_unique_face'] > 0 and
                    furniture['nb_colonnes_unique_face'] > 0 and
                    furniture['nb_etageres_front_back'] == 0 and
                    furniture['nb_colonnes_front_back'] == 0 and
                    furniture['nb_etageres_left_right'] == 0 and
                    furniture['nb_colonnes_left_right'] == 0):
                validation_success.append(f"Meuble {i + 1}: Colonnes 1 face correctes")
                print(f"   ✅ Utilise correctement unique_face")
                print(
                    f"      Étagères: {furniture['nb_etageres_unique_face']}, Colonnes: {furniture['nb_colonnes_unique_face']}")
            else:
                error = f"Meuble {i + 1}: Devrait utiliser uniquement unique_face"
                validation_errors.append(error)
                print(f"   ❌ {error}")

        elif expected_faces == 2:
            # Doit utiliser front_back
            if (furniture['nb_etageres_unique_face'] == 0 and
                    furniture['nb_colonnes_unique_face'] == 0 and
                    furniture['nb_etageres_front_back'] > 0 and
                    furniture['nb_colonnes_front_back'] > 0 and
                    furniture['nb_etageres_left_right'] == 0 and
                    furniture['nb_colonnes_left_right'] == 0):
                validation_success.append(f"Meuble {i + 1}: Colonnes 2 faces correctes")
                print(f"   ✅ Utilise correctement front_back")
                print(
                    f"      Étagères: {furniture['nb_etageres_front_back']}, Colonnes: {furniture['nb_colonnes_front_back']}")
            else:
                error = f"Meuble {i + 1}: Devrait utiliser uniquement front_back"
                validation_errors.append(error)
                print(f"   ❌ {error}")

        elif expected_faces == 4:
            # Doit utiliser front_back et left_right
            if (furniture['nb_etageres_unique_face'] == 0 and
                    furniture['nb_colonnes_unique_face'] == 0 and
                    furniture['nb_etageres_front_back'] > 0 and
                    furniture['nb_colonnes_front_back'] > 0 and
                    furniture['nb_etageres_left_right'] > 0 and
                    furniture['nb_colonnes_left_right'] > 0):
                validation_success.append(f"Meuble {i + 1}: Colonnes 4 faces correctes")
                print(f"   ✅ Utilise correctement front_back et left_right")
                print(
                    f"      Front/Back - Étagères: {furniture['nb_etageres_front_back']}, Colonnes: {furniture['nb_colonnes_front_back']}")
                print(
                    f"      Left/Right - Étagères: {furniture['nb_etageres_left_right']}, Colonnes: {furniture['nb_colonnes_left_right']}")
            else:
                error = f"Meuble {i + 1}: Devrait utiliser front_back et left_right"
                validation_errors.append(error)
                print(f"   ❌ {error}")

    # Résumé de la validation
    print(f"\n📊 RÉSUMÉ DE LA VALIDATION")
    print(f"=" * 30)
    print(f"✅ Succès: {len(validation_success)}")
    print(f"❌ Erreurs: {len(validation_errors)}")

    if validation_errors:
        print(f"\n❌ ERREURS DÉTECTÉES:")
        for error in validation_errors:
            print(f"   • {error}")
        return False
    else:
        print(f"\n🎉 TOUTES LES RÈGLES SONT RESPECTÉES!")
        return True


def test_furniture_rules():
    """Test complet des règles de meubles"""
    print("🧪 Test des Règles de Meubles")
    print("=" * 35)

    # Génération de données de test
    test_data = pd.DataFrame({
        'input_produit_id': [f'PROD_{i:03d}' for i in range(1, 21)],
        'input_prix_produit': np.random.uniform(5, 50, 20),
        'input_longueur_produit': np.random.uniform(10, 30, 20),
        'input_largeur_produit': np.random.uniform(5, 20, 20),
        'input_hauteur_produit': np.random.uniform(15, 35, 20),
        'input_priorite_merchandising': np.random.randint(1, 11, 20),
        'input_contrainte_temperature_produit': np.random.choice([0, 1], 20),
        'input_magasin_id': np.random.choice(['MAG_001', 'MAG_002'], 20),
        'input_categorie_id': np.random.choice(['CAT_001', 'CAT_002'], 20),
        'input_surface_magasin': np.random.uniform(200, 800, 20),
    })

    # Sauvegarde temporaire
    test_file = 'test_furniture_rules.csv'
    test_data.to_csv(test_file, index=False)

    try:
        # Test du pipeline
        pipeline = PlanogramAIPipeline(test_file)

        # Génération
        print("🔄 Génération du planogramme de test...")
        pipeline.load_and_preprocess_data()
        pipeline.train_models()
        results = pipeline.generate_planogram()

        if results:
            # Génération du JSON
            json_output = pipeline.generate_json_output(results)

            # Validation
            is_valid = validate_furniture_rules(json_output)

            # Sauvegarde du test
            with open('outputs/test_furniture_rules.json', 'w', encoding='utf-8') as f:
                json.dump(json_output, f, indent=2, ensure_ascii=False)

            print(f"\n💾 Résultats sauvegardés: outputs/test_furniture_rules.json")

            return is_valid
        else:
            print("❌ Échec de la génération")
            return False

    except Exception as e:
        print(f"❌ Erreur lors du test: {e}")
        return False
    finally:
        # Nettoyage
        import os
        if os.path.exists(test_file):
            os.remove(test_file)


def display_furniture_specifications():
    """Affiche les spécifications des meubles"""
    print("📋 SPÉCIFICATIONS DES MEUBLES")
    print("=" * 35)

    furniture_specs = [
        (1, "planogram", 1, "Planogramme standard"),
        (2, "gondola", 2, "Gondole 2 faces"),
        (3, "shelves-display", 4, "Présentoir étagères 4 faces"),
        (4, "clothing-rack", 1, "Portant vêtements"),
        (5, "wall-display", 1, "Présentoir mural"),
        (6, "accessory-display", 1, "Présentoir accessoires"),
        (7, "modular-cube", 1, "Cube modulaire"),
        (8, "table", 1, "Table de présentation"),
        (9, "refrigerator", 1, "Réfrigérateur"),
        (10, "refrigerated-showcase", 1, "Vitrine réfrigérée"),
        (11, "clothing-display", 1, "Présentoir vêtements"),
        (12, "clothing-wall", 1, "Mur vêtements")
    ]

    for type_id, name, faces, description in furniture_specs:
        print(f"{type_id:2d}: {name:<20} ({faces} face{'s' if faces > 1 else ''}) - {description}")

    print(f"\n🔧 RÈGLES D'UTILISATION DES COLONNES:")
    print(f"• 1 face  → nb_*_unique_face")
    print(f"• 2 faces → nb_*_front_back")
    print(f"• 4 faces → nb_*_front_back + nb_*_left_right")


if __name__ == "__main__":
    print("🏪 Validation des Règles de Meubles - Planogramme IA")
    print("=" * 55)

    # Affichage des spécifications
    display_furniture_specifications()

    print(f"\n" + "=" * 55)

    # Test des règles
    success = test_furniture_rules()

    if success:
        print(f"\n🎉 VALIDATION RÉUSSIE!")
        print(f"Les règles de meubles sont correctement implémentées.")
    else:
        print(f"\n❌ VALIDATION ÉCHOUÉE!")
        print(f"Des corrections sont nécessaires.")
