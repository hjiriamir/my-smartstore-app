"""
Module de visualisation des planogrammes
"""

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from PIL import Image, ImageDraw, ImageFont
import io
import json
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
import matplotlib.colors as mcolors

class PlanogramVisualizer:
    def __init__(self):
        """
        Initialise le visualiseur de planogrammes
        """
        self.colors = list(mcolors.TABLEAU_COLORS.values())
        
    def create_2d_planogram(self, results):
        """
        Crée une visualisation 2D du planogramme
        
        Args:
            results: Résultats du pipeline contenant les prédictions et les dimensions
            
        Returns:
            Image: Image du planogramme
        """
        # Extraire les dimensions du planogramme
        largeur = results['dimensions']['output_largeur_planogramme']
        hauteur = results['dimensions']['output_hauteur_planogramme']
        nb_etageres = results['dimensions']['output_nb_etageres_planogramme']
        nb_colonnes = results['dimensions']['output_nb_colonnes_planogramme']
        
        # Créer une image vide
        img_width = int(nb_colonnes * 100)
        img_height = int(nb_etageres * 100)
        img = Image.new('RGB', (img_width, img_height), color='white')
        draw = ImageDraw.Draw(img)
        
        # Dessiner les étagères
        for i in range(nb_etageres + 1):
            y = i * (img_height / nb_etageres)
            draw.line([(0, y), (img_width, y)], fill='black', width=2)
        
        # Dessiner les colonnes
        for i in range(nb_colonnes + 1):
            x = i * (img_width / nb_colonnes)
            draw.line([(x, 0), (x, img_height)], fill='black', width=2)
        
        # Placer les produits (numérotation commence à 1, étagère 1 en bas)
        if 'predictions' in results and 'input_produit_id' in results['predictions']:
            for i, row in results['predictions'].iterrows():
                etage = int(row['output_position_prod_etagere'])
                colonne = int(row['output_position_prod_colonne'])

                # Vérifier que l'étage et la colonne sont valides (numérotation 1-based)
                if 1 <= etage <= nb_etageres and 1 <= colonne <= nb_colonnes:
                    # Calculer les coordonnées (étagère 1 = en bas, donc inverser l'axe Y)
                    x1 = (colonne - 1) * (img_width / nb_colonnes)
                    y1 = (nb_etageres - etage) * (img_height / nb_etageres)  # Inverser pour que 1 soit en bas
                    x2 = colonne * (img_width / nb_colonnes)
                    y2 = (nb_etageres - etage + 1) * (img_height / nb_etageres)

                    # Dessiner le produit
                    color_idx = hash(str(row['input_produit_id'])) % len(self.colors)
                    draw.rectangle([x1, y1, x2, y2], fill=self.colors[color_idx], outline='black')

                    # Ajouter l'ID du produit
                    product_id = str(row['input_produit_id'])
                    draw.text((x1 + 5, y1 + 5), product_id[:10], fill='black')
        
        return img
    
    def export_to_pdf(self, results):
        """
        Exporte le planogramme au format PDF
        
        Args:
            results: Résultats du pipeline contenant les prédictions et les dimensions
            
        Returns:
            bytes: Contenu du PDF
        """
        buffer = io.BytesIO()
        
        # Créer le document PDF
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        
        # Styles
        styles = getSampleStyleSheet()
        title_style = styles['Heading1']
        subtitle_style = styles['Heading2']
        normal_style = styles['Normal']
        
        # Titre
        elements.append(Paragraph("Planogramme", title_style))
        
        # Informations générales
        elements.append(Paragraph("Informations générales", subtitle_style))
        
        # Tableau des dimensions
        data = [
            ["Paramètre", "Valeur"],
            ["Largeur", f"{results['dimensions']['output_largeur_planogramme']:.2f} cm"],
            ["Hauteur", f"{results['dimensions']['output_hauteur_planogramme']:.2f} cm"],
            ["Nombre d'étagères", str(results['dimensions']['output_nb_etageres_planogramme'])],
            ["Nombre de colonnes", str(results['dimensions']['output_nb_colonnes_planogramme'])]
        ]
        
        t = Table(data)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(t)
        
        # Ajouter l'image du planogramme
        elements.append(Paragraph("Visualisation du planogramme", subtitle_style))
        
        # Générer l'image du planogramme
        img = self.create_2d_planogram(results)
        img_buffer = io.BytesIO()
        img.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        
        # Ajouter l'image au PDF
        from reportlab.platypus import Image as ReportLabImage
        img_width, img_height = img.size
        aspect_ratio = img_width / img_height
        
        # Ajuster la taille de l'image pour qu'elle tienne sur la page
        max_width = 450
        width = min(img_width, max_width)
        height = width / aspect_ratio
        
        elements.append(ReportLabImage(img_buffer, width=width, height=height))
        
        # Construire le document
        doc.build(elements)
        
        # Retourner le contenu du buffer
        buffer.seek(0)
        return buffer.getvalue()
    
    def export_to_json(self, results, zone_name="Zone principale"):
        """
        Exporte le planogramme au format JSON selon la structure demandée
        
        Args:
            results: Résultats du pipeline contenant les prédictions et les dimensions
            zone_name: Nom de la zone d'emplacement du planogramme
            
        Returns:
            str: JSON du planogramme
        """
        # Extraire les dimensions du planogramme
        largeur = results['dimensions']['output_largeur_planogramme']
        hauteur = results['dimensions']['output_hauteur_planogramme']
        nb_etageres = results['dimensions']['output_nb_etageres_planogramme']
        nb_colonnes = results['dimensions']['output_nb_colonnes_planogramme']
        
        # Préparer les placements de produits
        product_placements = []
        
        if 'predictions' in results and isinstance(results['predictions'], pd.DataFrame):
            for i, row in results['predictions'].iterrows():
                if 'input_produit_id' in row:
                    etage = int(row['output_position_prod_etagere'])
                    colonne = int(row['output_position_prod_colonne'])
                    
                    # Vérifier que l'étage et la colonne sont valides
                    if 0 <= etage < nb_etageres and 0 <= colonne < nb_colonnes:
                        product_placements.append({
                            "produit_id": str(row['input_produit_id']),
                            "etage": etage,
                            "colonne": colonne
                        })
        
        # Créer la structure JSON demandée
        planogram_json = {
            "emplacement_magasin": zone_name,
            "dimension_longueur_planogramme": float(largeur),
            "dimension_largeur_planogramme": float(hauteur),
            "nb_etageres": int(nb_etageres),
            "nb_colonnes": int(nb_colonnes),
            "product_placements": product_placements
        }
        
        # Convertir en JSON
        return json.dumps(planogram_json, indent=2)
