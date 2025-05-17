import { useState } from "react";
import { createEntreprise, createAdminUser, sendEmail, updateDemandeStatus } from "./demandesService";

const DemandeRow = ({ demande, onDemandeAccepted }) => {
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    try {
      setLoading(true);
      const entrepriseData = await createEntreprise(demande);
      await createAdminUser(demande, entrepriseData.entrepriseId);
      await sendEmail(demande);
      await updateDemandeStatus(demande.idDemande);
      onDemandeAccepted(demande.idDemande);
    } catch (error) {
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <tr>
      <td>{`${demande.nom} ${demande.prenom}`}</td>
      <td>{demande.forfait}</td>
      <td>{demande.date_debut}</td>
      <td>{demande.date_fin}</td>
      <td>{demande.montant}</td>
      <td>{demande.statut}</td>
      <td>
        <button onClick={handleAccept} disabled={loading}>
          {loading ? "Traitement..." : "Accepter"}
        </button>
        <button>Refuser</button>
      </td>
    </tr>
  );
};

export default DemandeRow;
