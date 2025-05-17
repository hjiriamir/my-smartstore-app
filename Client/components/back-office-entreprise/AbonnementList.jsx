"use client";

import { useState, useEffect } from "react";
import { fetchDemandes } from "../../src/services/demandesService";
import SideBarEssai from "./SideBarEssai";
import DemandeRow from "../../src/services/DemandeRow";
import { usePathname, useRouter  } from 'next/navigation'; // Remplace useLocation
import "./AbonnementList.css"; // Importez le fichier CSS
const AbonnementList = () => {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDemandes = async () => {
      try {
        const data = await fetchDemandes();
        setDemandes(data.demandes);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDemandes();
  }, []);

  const handleDemandeAccepted = (idDemande) => {
    setDemandes((prev) => prev.filter((d) => d.idDemande !== idDemande));
  };

  if (loading) return <div>Chargement des données...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div className="layout">
      <SideBarEssai />
      <main className="main">
        <h1>Liste des Demandes d'Abonnement</h1>
        <table>
          <thead>
            <tr>
              <th>Client</th>
              <th>Type</th>
              <th>Date début</th>
              <th>Date fin</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {demandes.map((demande) => (
              <DemandeRow key={demande.idDemande} demande={demande} onDemandeAccepted={handleDemandeAccepted} />
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default AbonnementList;
