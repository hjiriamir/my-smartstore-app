import pandas as pd
import csv
from io import StringIO


def detect_csv_separator(content, encodings=['latin-1', 'utf-8', 'cp1252']):
    """Détecte le séparateur CSV et l'encodage optimal"""

    separators = [';', ',', '\t', '|']
    best_result = None
    max_columns = 0

    for encoding in encodings:
        try:
            # Décoder le contenu
            if isinstance(content, bytes):
                text_content = content.decode(encoding)
            else:
                text_content = content

            for sep in separators:
                try:
                    # Tester avec ce séparateur
                    string_io = StringIO(text_content)
                    df = pd.read_csv(string_io, sep=sep, nrows=5)

                    # Vérifier si on a plus de colonnes et des données valides
                    if len(df.columns) > max_columns and not df.empty:
                        # Vérifier que les colonnes ne sont pas toutes vides
                        non_empty_cols = sum(1 for col in df.columns if not df[col].isna().all())

                        if non_empty_cols > 1:
                            max_columns = len(df.columns)
                            best_result = {
                                'encoding': encoding,
                                'separator': sep,
                                'columns': len(df.columns),
                                'sample_data': df
                            }

                except Exception:
                    continue

        except Exception:
            continue

    return best_result


def load_csv_with_detection(content):
    """Charge un CSV avec détection automatique du séparateur et encodage"""

    detection_result = detect_csv_separator(content)

    if detection_result is None:
        raise ValueError("Impossible de détecter le format du fichier CSV")

    # Décoder le contenu avec le bon encodage
    if isinstance(content, bytes):
        text_content = content.decode(detection_result['encoding'])
    else:
        text_content = content

    # Lire le fichier complet avec les bons paramètres
    string_io = StringIO(text_content)
    df = pd.read_csv(string_io, sep=detection_result['separator'])

    return df, detection_result


if __name__ == "__main__":
    # Test avec un fichier
    import sys

    if len(sys.argv) > 1:
        file_path = sys.argv[1]
        with open(file_path, 'rb') as f:
            content = f.read()

        try:
            df, result = load_csv_with_detection(content)
            print(f"✅ Détection réussie:")
            print(f"  Encodage: {result['encoding']}")
            print(f"  Séparateur: '{result['separator']}'")
            print(f"  Colonnes: {result['columns']}")
            print(f"  Aperçu: {list(df.columns[:5])}")
        except Exception as e:
            print(f"❌ Erreur: {e}")
