import pandas as pd
import chardet
import streamlit as st
from io import StringIO, BytesIO


def convert_uploaded_file_encoding(uploaded_file):
    """Convertit un fichier uploadé vers UTF-8 avec détection automatique d'encodage"""

    try:
        # Lire le contenu brut
        content = uploaded_file.read()

        # Détecter l'encodage
        encoding_result = chardet.detect(content)
        detected_encoding = encoding_result['encoding']
        confidence = encoding_result['confidence']

        print(f"🔤 Encodage détecté: {detected_encoding} (confiance: {confidence:.2f})")

        # Liste des encodages à essayer
        encodings_to_try = [
            detected_encoding,
            'latin-1',
            'cp1252',
            'iso-8859-1',
            'windows-1252',
            'utf-8',
            'utf-16'
        ]

        # Supprimer les doublons et None
        encodings_to_try = list(dict.fromkeys([enc for enc in encodings_to_try if enc]))

        successful_data = None
        successful_encoding = None

        for encoding in encodings_to_try:
            try:
                # Décoder le contenu avec cet encodage
                text_content = content.decode(encoding)

                # Créer un StringIO pour pandas
                string_io = StringIO(text_content)

                # Essayer de lire avec pandas
                data = pd.read_csv(string_io)

                if not data.empty and len(data.columns) > 1:
                    successful_data = data
                    successful_encoding = encoding
                    print(f"✅ Succès avec l'encodage: {encoding}")
                    break

            except (UnicodeDecodeError, pd.errors.EmptyDataError, Exception) as e:
                print(f"❌ Échec avec {encoding}: {str(e)[:50]}")
                continue

        if successful_data is not None:
            # Nettoyage des données
            print("🧹 Nettoyage des données...")

            # Nettoyage des colonnes
            successful_data.columns = successful_data.columns.str.strip()
            successful_data.columns = successful_data.columns.str.replace('\n', ' ')
            successful_data.columns = successful_data.columns.str.replace('\r', ' ')

            # Nettoyage des valeurs
            for col in successful_data.select_dtypes(include=['object']).columns:
                successful_data[col] = successful_data[col].astype(str).str.strip()
                successful_data[col] = successful_data[col].str.replace('\n', ' ')
                successful_data[col] = successful_data[col].str.replace('\r', ' ')
                successful_data[col] = successful_data[col].replace('nan', pd.NA)

            print(f"✅ Données converties: {len(successful_data)} lignes × {len(successful_data.columns)} colonnes")
            return successful_data, successful_encoding

        else:
            print("❌ Aucun encodage n'a fonctionné")
            return None, None

    except Exception as e:
        print(f"❌ Erreur lors de la conversion: {e}")
        return None, None


def save_converted_csv(data, filename="data/converted_dataset.csv"):
    """Sauvegarde les données converties en UTF-8"""
    try:
        import os
        os.makedirs(os.path.dirname(filename), exist_ok=True)

        data.to_csv(filename, index=False, encoding='utf-8')
        print(f"✅ Fichier converti sauvegardé: {filename}")
        return True

    except Exception as e:
        print(f"❌ Erreur sauvegarde: {e}")
        return False


if __name__ == "__main__":
    print("🔧 Convertisseur d'Encodage CSV")
    print("=" * 35)

    # Test avec un fichier local si disponible
    import sys

    if len(sys.argv) > 1:
        file_path = sys.argv[1]
        try:
            with open(file_path, 'rb') as f:
                class MockUploadedFile:
                    def __init__(self, content):
                        self.content = content
                        self.position = 0

                    def read(self):
                        return self.content

                    def seek(self, position):
                        self.position = position


                mock_file = MockUploadedFile(f.read())
                data, encoding = convert_uploaded_file_encoding(mock_file)

                if data is not None:
                    save_converted_csv(data)
                    print("✅ Conversion terminée!")
                else:
                    print("❌ Conversion échouée")

        except Exception as e:
            print(f"❌ Erreur: {e}")
    else:
        print("Usage: python convert_csv_encoding.py <fichier.csv>")
