"""
Script d'installation automatique des dépendances
pour le Système de Génération de Planogrammes IA
"""

import subprocess
import sys
import os
import platform
from pathlib import Path

def print_status(message, status="INFO"):
    """Affiche un message avec un statut coloré"""
    colors = {
        "INFO": "\033[0;34m",
        "SUCCESS": "\033[0;32m", 
        "WARNING": "\033[1;33m",
        "ERROR": "\033[0;31m",
        "RESET": "\033[0m"
    }
    
    color = colors.get(status, colors["INFO"])
    reset = colors["RESET"]
    print(f"{color}[{status}]{reset} {message}")

def check_python_version():
    """Vérifie la version de Python"""
    print_status("Vérification de la version Python...")
    
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print_status("Python 3.8+ requis. Version actuelle: {}.{}.{}".format(
            version.major, version.minor, version.micro), "ERROR")
        return False
    
    print_status(f"Python {version.major}.{version.minor}.{version.micro} détecté", "SUCCESS")
    return True

def check_pip():
    """Vérifie que pip est disponible"""
    print_status("Vérification de pip...")
    
    try:
        subprocess.run([sys.executable, "-m", "pip", "--version"], 
                      check=True, capture_output=True)
        print_status("pip disponible", "SUCCESS")
        return True
    except subprocess.CalledProcessError:
        print_status("pip non disponible", "ERROR")
        return False

def upgrade_pip():
    """Met à jour pip vers la dernière version"""
    print_status("Mise à jour de pip...")
    
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "--upgrade", "pip"], 
                      check=True)
        print_status("pip mis à jour", "SUCCESS")
        return True
    except subprocess.CalledProcessError as e:
        print_status(f"Erreur lors de la mise à jour de pip: {e}", "WARNING")
        return False

def install_requirements():
    """Installe les dépendances depuis requirements.txt"""
    print_status("Installation des dépendances principales...")
    
    requirements_file = Path("requirements.txt")
    if not requirements_file.exists():
        print_status("Fichier requirements.txt non trouvé", "ERROR")
        return False
    
    try:
        # Installation avec pip
        cmd = [sys.executable, "-m", "pip", "install", "-r", str(requirements_file)]
        
        # Ajout d'options selon le système
        if platform.system() == "Windows":
            cmd.extend(["--user"])
        
        subprocess.run(cmd, check=True)
        print_status("Dépendances principales installées", "SUCCESS")
        return True
        
    except subprocess.CalledProcessError as e:
        print_status(f"Erreur lors de l'installation: {e}", "ERROR")
        return False

def install_optional_dependencies():
    """Installe les dépendances optionnelles"""
    print_status("Installation des dépendances optionnelles...")
    
    optional_packages = [
        "lightgbm>=3.3.0",
        "catboost>=1.1.0", 
        "jupyter>=1.0.0",
        "notebook>=6.4.0"
    ]
    
    for package in optional_packages:
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", package], 
                          check=True, capture_output=True)
            print_status(f"✓ {package.split('>=')[0]}", "SUCCESS")
        except subprocess.CalledProcessError:
            print_status(f"✗ {package.split('>=')[0]} (optionnel)", "WARNING")

def create_directories():
    """Crée les dossiers nécessaires"""
    print_status("Création des dossiers...")
    
    directories = ["data", "outputs", "logs", "models", "temp"]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print_status(f"✓ Dossier {directory}", "SUCCESS")

def verify_installation():
    """Vérifie que les packages principaux sont installés"""
    print_status("Vérification de l'installation...")
    
    required_packages = [
        "pandas", "numpy", "scikit-learn", "xgboost",
        "streamlit", "fastapi", "uvicorn", "plotly"
    ]
    
    failed_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            print_status(f"✓ {package}", "SUCCESS")
        except ImportError:
            print_status(f"✗ {package}", "ERROR")
            failed_packages.append(package)
    
    if failed_packages:
        print_status(f"Packages manquants: {', '.join(failed_packages)}", "ERROR")
        return False
    
    print_status("Tous les packages requis sont installés", "SUCCESS")
    return True

def setup_environment():
    """Configure l'environnement"""
    print_status("Configuration de l'environnement...")
    
    # Création d'un fichier .env d'exemple
    env_file = Path(".env.example")
    if not env_file.exists():
        env_content = """# Configuration Planogramme IA
# Copiez ce fichier vers .env et modifiez les valeurs

# Paramètres ML
ML_RANDOM_SEED=42
ML_OPTIMIZATION_LEVEL=3

# Paramètres API
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=True

# Paramètres Streamlit
STREAMLIT_PORT=8501
STREAMLIT_HOST=localhost

# Chemins
DATA_PATH=data/dataset.csv
OUTPUT_PATH=outputs/
LOG_PATH=logs/

# Debug
DEBUG_MODE=False
VERBOSE_LOGGING=True
"""
        
        with open(env_file, 'w', encoding='utf-8') as f:
            f.write(env_content)
        
        print_status("Fichier .env.example créé", "SUCCESS")
    
    # Création d'un script de démarrage
    if platform.system() == "Windows":
        start_script = Path("start.bat")
        script_content = """@echo off
echo Demarrage du Systeme de Generation de Planogrammes IA
echo =====================================================

echo Choix disponibles:
echo 1. Interface Streamlit
echo 2. API REST
echo 3. Pipeline direct
echo 4. Tests

set /p choice="Votre choix (1-4): "

if "%choice%"=="1" (
    echo Demarrage de Streamlit...
    streamlit run streamlit_app.py
) else if "%choice%"=="2" (
    echo Demarrage de l'API...
    python scripts/api.py
) else if "%choice%"=="3" (
    echo Execution du pipeline...
    python main_pipeline.py
) else if "%choice%"=="4" (
    echo Execution des tests...
    python scripts/test_pipeline.py
) else (
    echo Choix invalide
)

pause
"""
    else:
        start_script = Path("start.sh")
        script_content = """#!/bin/bash
echo "Démarrage du Système de Génération de Planogrammes IA"
echo "====================================================="

echo "Choix disponibles:"
echo "1. Interface Streamlit"
echo "2. API REST" 
echo "3. Pipeline direct"
echo "4. Tests"

read -p "Votre choix (1-4): " choice

case $choice in
    1)
        echo "Démarrage de Streamlit..."
        streamlit run streamlit_app.py
        ;;
    2)
        echo "Démarrage de l'API..."
        python3 scripts/api.py
        ;;
    3)
        echo "Exécution du pipeline..."
        python3 main_pipeline.py
        ;;
    4)
        echo "Exécution des tests..."
        python3 scripts/test_pipeline.py
        ;;
    *)
        echo "Choix invalide"
        ;;
esac
"""
    
    with open(start_script, 'w', encoding='utf-8') as f:
        f.write(script_content)
    
    if platform.system() != "Windows":
        os.chmod(start_script, 0o755)
    
    print_status(f"Script de démarrage {start_script} créé", "SUCCESS")

def main():
    """Fonction principale d'installation"""
    print("🏪 Installation du Système de Génération de Planogrammes IA")
    print("=" * 65)
    
    # Vérifications préliminaires
    if not check_python_version():
        sys.exit(1)
    
    if not check_pip():
        sys.exit(1)
    
    # Mise à jour de pip
    upgrade_pip()
    
    # Installation des dépendances
    if not install_requirements():
        print_status("Échec de l'installation des dépendances principales", "ERROR")
        sys.exit(1)
    
    # Dépendances optionnelles
    install_optional_dependencies()
    
    # Création des dossiers
    create_directories()
    
    # Vérification
    if not verify_installation():
        print_status("Vérification échouée", "ERROR")
        sys.exit(1)
    
    # Configuration de l'environnement
    setup_environment()
    
    # Résumé
    print("\n" + "=" * 50)
    print_status("Installation terminée avec succès!", "SUCCESS")
    print("\n🚀 Prochaines étapes:")
    print("1. Générer des données: python scripts/data_generator.py")
    print("2. Lancer Streamlit: streamlit run streamlit_app.py")
    print("3. Lancer l'API: python scripts/api.py")
    print("4. Exécuter les tests: python scripts/test_pipeline.py")
    
    if platform.system() == "Windows":
        print("5. Ou utiliser: start.bat")
    else:
        print("5. Ou utiliser: ./start.sh")
    
    print("\n📖 Documentation:")
    print("- API: http://localhost:8000/docs")
    print("- Streamlit: http://localhost:8501")
    
    print_status("Système prêt à l'utilisation!", "SUCCESS")

if __name__ == "__main__":
    main()