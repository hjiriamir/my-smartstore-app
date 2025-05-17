import requests
import json
import random
import base64
from PIL import Image
from io import BytesIO


def test_api():
    """
    Teste l'API en envoyant une requête de prédiction
    """
    # URL de l'API
    url = "http://localhost:8000/predict"

    # Génération de données de test
    categories = ['boissons', 'frais', 'épicerie', 'hygiène', 'ménager']

    # Création de produits aléatoires
    products = []
    for i in range(30):  # 30 produits
        product = {
            "produit_id": f"PROD_{i:04d}",
            "categorie_produit": random.choice(categories),
            "ventes_moyennes": random.uniform(10, 100),
            "stock_moyen": random.uniform(20, 200),
            "prev_demande": random.uniform(5, 120),
            "saisonnalite": random.uniform(0.5, 1.5)
        }
        products.append(product)

    # Données du magasin
    store_data = {
        "surface_m2": random.uniform(100, 500),
        "promo_en_cours": random.choice([0, 1]),
        "products": products
    }

    # Envoi de la requête
    try:
        response = requests.post(url, json=store_data)

        if response.status_code == 200:
            result = response.json()
            print("Prédiction réussie!")
            print(
                f"Dimensions du planogramme: {result['dimension_longueur_planogramme']} x {result['dimension_largeur_planogramme']} cm")
            print(f"Configuration: {result['nb_etageres']} étagères x {result['nb_colonnes']} colonnes")

            # Affichage de l'image si disponible
            if result.get('planogram_image'):
                image_data = base64.b64decode(result['planogram_image'])
                image = Image.open(BytesIO(image_data))
                image.save('test_planogram.png')
                print("Image du planogramme sauvegardée dans 'test_planogram.png'")

            # Affichage des placements de produits
            if result.get('product_placements'):
                print("\nPlacements des produits:")
                for placement in result['product_placements'][:5]:  # Afficher les 5 premiers
                    print(f"Produit {placement['produit_id']} ({placement['categorie']}) - "
                          f"Position: étagère {placement['position_etagere']}, colonne {placement['position_colonne']}")
                print(f"... et {len(result['product_placements']) - 5} autres produits")
        else:
            print(f"Erreur: {response.status_code}")
            print(response.text)

    except Exception as e:
        print(f"Erreur lors de la requête: {e}")


if __name__ == "__main__":
    print("Test de l'API SmartPlanogram")
    test_api()