from sklearn.ensemble import RandomForestRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np


def train_model(X_train, y_train):
    """
    Entraîne un modèle MultiOutputRegressor avec RandomForestRegressor
    """
    # Création du modèle
    base_model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42
    )

    # Utilisation de MultiOutputRegressor pour prédire plusieurs variables cibles
    model = MultiOutputRegressor(base_model)

    # Entraînement du modèle
    model.fit(X_train, y_train)

    return model


def evaluate_model(model, X_test, y_test):
    """
    Évalue le modèle et retourne les métriques de performance
    """
    # Prédictions sur l'ensemble de test
    y_pred = model.predict(X_test)

    # Calcul des métriques
    mse = mean_squared_error(y_test, y_pred, multioutput='raw_values')
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred, multioutput='raw_values')

    # Création d'un dictionnaire de métriques
    metrics = {
        'RMSE': {col: round(val, 2) for col, val in zip(y_test.columns, rmse)},
        'R²': {col: round(val, 2) for col, val in zip(y_test.columns, r2)}
    }

    return metrics