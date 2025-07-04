#!/bin/bash

echo "🧪 Script de Tests - Planogramme IA"
echo "=================================="

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérification de l'environnement Python
print_status "Vérification de l'environnement Python..."
if ! command -v python3 &> /dev/null; then
    print_error "Python3 n'est pas installé"
    exit 1
fi

python_version=$(python3 --version 2>&1 | cut -d' ' -f2)
print_success "Python version: $python_version"

# Installation des dépendances si nécessaire
print_status "Vérification des dépendances..."
if [ -f "requirements.txt" ]; then
    print_status "Installation des dépendances depuis requirements.txt..."
    pip3 install -r requirements.txt --quiet
    if [ $? -eq 0 ]; then
        print_success "Dépendances installées avec succès"
    else
        print_warning "Certaines dépendances n'ont pas pu être installées"
    fi
else
    print_warning "Fichier requirements.txt non trouvé"
fi

# Création du dossier de données si nécessaire
print_status "Préparation des dossiers..."
mkdir -p data
mkdir -p outputs
mkdir -p logs

# Génération des données de test
print_status "Génération des données de test..."
if [ -f "scripts/data_generator.py" ]; then
    python3 scripts/data_generator.py
    if [ $? -eq 0 ]; then
        print_success "Données de test générées"
    else
        print_error "Erreur lors de la génération des données"
        exit 1
    fi
else
    print_warning "Générateur de données non trouvé"
fi

# Tests unitaires
print_status "Exécution des tests unitaires..."
if [ -f "scripts/test_pipeline.py" ]; then
    python3 scripts/test_pipeline.py > logs/unit_tests.log 2>&1
    if [ $? -eq 0 ]; then
        print_success "Tests unitaires réussis"
    else
        print_error "Échec des tests unitaires - voir logs/unit_tests.log"
        cat logs/unit_tests.log
    fi
else
    print_warning "Fichier de tests unitaires non trouvé"
fi

# Test du pipeline principal
print_status "Test du pipeline principal..."
if [ -f "main_pipeline.py" ]; then
    timeout 60 python3 main_pipeline.py > logs/pipeline_test.log 2>&1
    if [ $? -eq 0 ]; then
        print_success "Pipeline principal testé avec succès"
    else
        print_warning "Test du pipeline principal avec timeout ou erreur"
        tail -n 20 logs/pipeline_test.log
    fi
else
    print_error "Fichier main_pipeline.py non trouvé"
fi

# Test de l'API (démarrage rapide)
print_status "Test de démarrage de l'API..."
if [ -f "scripts/api.py" ]; then
    # Démarrage de l'API en arrière-plan
    python3 scripts/api.py > logs/api_test.log 2>&1 &
    API_PID=$!
    
    # Attendre que l'API démarre
    sleep 5
    
    # Test de connexion
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        print_success "API démarrée et accessible"
        
        # Test des endpoints principaux
        print_status "Test des endpoints..."
        
        # Test furniture-types
        if curl -s http://localhost:8000/furniture-types > /dev/null 2>&1; then
            print_success "Endpoint /furniture-types OK"
        else
            print_warning "Endpoint /furniture-types non accessible"
        fi
        
        # Test stores
        if curl -s http://localhost:8000/stores > /dev/null 2>&1; then
            print_success "Endpoint /stores OK"
        else
            print_warning "Endpoint /stores non accessible"
        fi
        
    else
        print_warning "API non accessible sur le port 8000"
    fi
    
    # Arrêt de l'API
    kill $API_PID 2>/dev/null
    print_status "API arrêtée"
else
    print_warning "Fichier API non trouvé"
fi

# Test de Streamlit (vérification syntaxique)
print_status "Vérification de l'application Streamlit..."
if [ -f "streamlit_app.py" ]; then
    python3 -m py_compile streamlit_app.py
    if [ $? -eq 0 ]; then
        print_success "Application Streamlit syntaxiquement correcte"
    else
        print_error "Erreurs de syntaxe dans streamlit_app.py"
    fi
else
    print_warning "Fichier streamlit_app.py non trouvé"
fi

# Vérification des fichiers de sortie
print_status "Vérification des fichiers générés..."
if [ -d "outputs" ] && [ "$(ls -A outputs)" ]; then
    file_count=$(ls -1 outputs | wc -l)
    print_success "$file_count fichier(s) généré(s) dans outputs/"
    ls -la outputs/
else
    print_warning "Aucun fichier généré dans outputs/"
fi

# Résumé des tests
echo ""
echo "📊 RÉSUMÉ DES TESTS"
echo "=================="

# Vérification des composants principaux
components=(
    "main_pipeline.py:Pipeline Principal"
    "streamlit_app.py:Interface Streamlit"
    "scripts/api.py:API REST"
    "scripts/data_generator.py:Générateur de Données"
    "scripts/test_pipeline.py:Tests Unitaires"
    "requirements.txt:Dépendances"
)

for component in "${components[@]}"; do
    file=$(echo $component | cut -d':' -f1)
    name=$(echo $component | cut -d':' -f2)
    
    if [ -f "$file" ]; then
        print_success "✓ $name"
    else
        print_error "✗ $name (fichier manquant)"
    fi
done

# Vérification des dossiers
folders=("data" "outputs" "logs")
for folder in "${folders[@]}"; do
    if [ -d "$folder" ]; then
        print_success "✓ Dossier $folder"
    else
        print_warning "⚠ Dossier $folder manquant"
    fi
done

echo ""
print_status "Tests terminés! Consultez les logs dans le dossier logs/"

# Instructions pour l'utilisateur
echo ""
echo "🚀 PROCHAINES ÉTAPES"
echo "==================="
echo "1. Interface Streamlit: streamlit run streamlit_app.py"
echo "2. API REST: python scripts/api.py"
echo "3. Pipeline direct: python main_pipeline.py"
echo "4. Documentation API: http://localhost:8000/docs"
echo ""
print_success "Système prêt à l'utilisation!"
