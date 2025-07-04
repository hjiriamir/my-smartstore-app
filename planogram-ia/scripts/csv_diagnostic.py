import pandas as pd
import requests
import chardet
import os


def diagnose_csv_url(url):
    """Diagnostique un fichier CSV depuis une URL"""
    print(f"🔍 Diagnostic du fichier CSV")
    print(f"URL: {url}")
    print("=" * 60)

    try:
        # Téléchargement
        print("📥 Téléchargement...")
        response = requests.get(url)
        response.raise_for_status()

        print(f"✅ Téléchargé: {len(response.content)} bytes")

        # Analyse du contenu brut
        content = response.content

        # Détection d'encodage
        encoding_result = chardet.detect(content[:10000])
        print(f"🔤 Encodage détecté: {encoding_result}")

        # Sauvegarde temporaire
        temp_file = "temp_diagnostic.csv"
        with open(temp_file, 'wb') as f:
            f.write(content)

        # Analyse des premières lignes
        print(f"\n📋 Premières lignes (brut):")
        with open(temp_file, 'rb') as f:
            for i in range(5):
                line = f.readline()
                if not line:
                    break
                print(f"  {i + 1}: {line[:100]}")

        # Tentatives de lecture
        encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
        separators = [',', ';', '\t', '|']

        print(f"\n🔄 Tentatives de lecture:")

        for encoding in encodings:
            for sep in separators:
                try:
                    df = pd.read_csv(temp_file, encoding=encoding, sep=sep, nrows=5)
                    if not df.empty and len(df.columns) > 1:
                        print(f"✅ Succès avec encoding={encoding}, sep='{sep}'")
                        print(f"   Colonnes: {len(df.columns)}")
                        print(f"   Premières colonnes: {list(df.columns[:3])}")

                        # Essai de lecture complète
                        try:
                            full_df = pd.read_csv(temp_file, encoding=encoding, sep=sep)
                            print(f"   Lecture complète: {full_df.shape}")
                            return True
                        except Exception as e:
                            print(f"   ❌ Erreur lecture complète: {str(e)[:50]}")

                except Exception as e:
                    continue

        print("❌ Aucune combinaison n'a fonctionné")
        return False

    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False
    finally:
        if os.path.exists("temp_diagnostic.csv"):
            os.remove("temp_diagnostic.csv")


if __name__ == "__main__":
    url = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dataset-DSFrCHFbbjo4u7X6CV8nIrAHJlud6L.csv"
    diagnose_csv_url(url)
