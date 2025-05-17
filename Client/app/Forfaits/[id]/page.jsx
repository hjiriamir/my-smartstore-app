"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePlans } from "../../../components/back-office/data/planse" // Import the custom hook
import ForfaitService from "../../../src/services/forfaitService"
import Swal from "sweetalert2"
import "../../../components/back-office/forfaits.css"
import "../../../components/multilingue/i18n.js"
import { useTranslation } from "react-i18next"

function DescriptionForfait({ params }) {
  const router = useRouter();
  const { id } = React.use(params);
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    comment: "",
  })

  const { t, i18n } = useTranslation()
  const plans = usePlans() // Use the custom hook to get translated plans

  // Find the plan by ID
  const plan = plans.find((p) => p.id === id)
  if (!plan) {
    return <div className="error">{t("planNotFound")}</div>
  }

  // Generate dates
  const currentDate = new Date()
  const dateDebut = currentDate.toISOString().split("T")[0] // YYYY-MM-DD
  const dateFin = new Date(currentDate.setMonth(currentDate.getMonth() + 1)).toISOString().split("T")[0]

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    const requestData = {
      nom: formData.lastName,
      prenom: formData.firstName,
      entreprise: formData.company,
      email: formData.email,
      telephone: formData.phone,
      commentaire: formData.comment,
      titre_post: formData.position,
      prix_abonnement: plan.price,
      date_debut: dateDebut,
      date_fin: dateFin,
      forfait: plan.id,
    }

    try {
      const response = await ForfaitService.createDemande(requestData)

      if (response.status === "Success demande ajoutée") {
        Swal.fire({
          title: t("requestSuccessTitle"),
          text: t("requestSuccessText"),
          icon: "success",
          confirmButtonText: t("okButton"),
          confirmButtonColor: "#006d77",
        })

        // Reset form data
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          company: "",
          position: "",
          comment: "",
        })

        // Hide the form
        setShowForm(false)
      }
    } catch (error) {
      Swal.fire({
        title: t("errorTitle"),
        text: t("errorText"),
        icon: "error",
        confirmButtonText: t("okButton"),
        confirmButtonColor: "#ff4444",
      })
    }
  }

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // État pour gérer la direction du texte
  const [textDirection, setTextDirection] = useState("ltr");
  const [textAlign, setTextAlign] = useState("left");

  useEffect(() => {
    // Mettre à jour la direction et l'alignement en fonction de la langue
    const isRTL = i18n.language === "ar";
    setTextDirection(isRTL ? "rtl" : "ltr");
    setTextAlign(isRTL ? "right" : "left");
  }, [i18n.language]); // Dépendance sur la langue

  return (
    <div dir={textDirection} style={{ textAlign }}>
      <main>
        <section className="details-hero">
          
          <h1>{plan.title}</h1>
          <div className="price">
            
            <span className="amount">{plan.price}</span>
            <span className="text-4xl font-bold">{t("unite")}</span>/
                <span className="text-sm text-gray-500">{t("mois")}</span>
          </div>
          <p>{t(plan.description)}</p>
        </section>

        <section className="features-details">
        <h2 style={{ textAlign: i18n.language === "ar" ? "right" : "left" }}>
              {t("features")}
            </h2>         
            <ul>
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
        </section>

        <button className="cta-button" onClick={() => setShowForm(!showForm)}>
          {t("sendRequest")}
        </button>

        {showForm && (
          <section className="contact-form">
            <h3>{t("requestInformation")}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>* {t("lastName")}</label>
                  <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>* {t("firstName")}</label>
                  <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>* {t("companyName")}</label>
                  <input type="text" name="company" required value={formData.company} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>* {t("email")}</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>* {t("phone")}</label>
                  <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>* {t("position")}</label>
                  <input type="text" name="position" required value={formData.position} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label>{t("comment")}</label>
                <textarea name="comment" value={formData.comment} onChange={handleChange} rows="4" />
              </div>

              <button type="submit" className="submit-btn">
                {t("sendRequest")}
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}

export default DescriptionForfait;