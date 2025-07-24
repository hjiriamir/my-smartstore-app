import React from 'react';
import './services.css';
import { useTranslation } from "react-i18next";

const ServicesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const textDirection = isRTL ? "rtl" : "ltr";

  return (
    <div dir={textDirection}>
      <main>
        <section className="hero">
          <h1>{t("additionalPages.services.ourServices")}</h1>
          <p>{t("additionalPages.services.ourServicesDescription")}</p>
        </section>

        <section className="services-grid">
          <div className="service-card">
            <div className="icon">📊</div>
            <h3>{t("additionalPages.services.gestionFactures")}</h3>
            <p>{t("additionalPages.services.gestionFacturesDescr")}</p>
          </div>
          <div className="service-card">
            <div className="icon">🏪</div>
            <h3> {t("additionalPages.services.gestionStock")}</h3>
            <p>{t("additionalPages.services.gestionStockDescr")}</p>
          </div>
          <div className="service-card">
            <div className="icon">🏢</div>
            <h3> {t("additionalPages.services.gestionDossier")}</h3>
            <p>{t("additionalPages.services.gestionDossierDescr")}</p>
          </div>
          <div className="service-card">
            <div className="icon">📦</div>
            <h3> {t("additionalPages.services.gestionProduits")}</h3>
            <p>{t("additionalPages.services.gestionProduitsDescr")}</p>
          </div>
          <div className="service-card">
            <div className="icon">📋</div>
            <h3>{t("additionalPages.services.floorPlanning")} </h3>
            <p>  {t("additionalPages.services.floorPlanningDescr")}</p>
          </div>
          <div className="service-card">
            <div className="icon">💰</div>
            <h3>{t("additionalPages.services.pointsVentes")}</h3>
            <p>{t("additionalPages.services.pointsVentesDescr")}</p>
          </div>
          <div className="service-card">
            <div className="icon">👥</div>
            <h3>{t("additionalPages.services.gestionFournisseurs")}</h3>
            <p>{t("additionalPages.services.gestionFournisseursDescr")}</p>
          </div>
          <div className="service-card">
            <div className="icon">👤</div>
            <h3> {t("additionalPages.services.gestionClients")}</h3>
            <p>{t("additionalPages.services.gestionClientsDescr")}</p>
          </div>
        </section>

        <section className="contact-section">
        <h2 className="centered-heading">{t("additionalPages.services.contactUsNow")}</h2>

          <button className="contact-btn-large">{t("additionalPages.services.contactUs")}</button>
        </section>

        <section className="additional-services">
          <h2>{t("additionalPages.services.othersServices")}</h2>
         <div className="services-list">
            <div className="service-item">
              <span className="number">1</span>
              <h3> {t("additionalPages.services.stockEtFactures")}</h3>
              <p> {t("additionalPages.services.stockEtFacturesDescr")}</p>
            </div>
            <div className="service-item">
              <span className="number">2</span>
              <h3>{t("additionalPages.services.is")}</h3>
              <p>{t("additionalPages.services.isDescr")}</p>
            </div>
            <div className="service-item">
              <span className="number">3</span>
              <h3> {t("additionalPages.services.supportTechnique")}</h3>
              <p>{t("additionalPages.services.supportTechniqueDescr")}</p>
            </div>
            <div className="service-item">
              <span className="number">4</span>
              <h3>{t("additionalPages.services.formation")}</h3>
              <p>{t("additionalPages.services.formationDescr")}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ServicesPage;