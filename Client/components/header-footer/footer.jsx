"use client"; // Ajouter en haut de Footer.js pour s'assurer qu'il est côté client

import React from 'react';
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Footer.css";
import '../multilingue/i18n.js';
import { useTranslation } from 'react-i18next';
const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="about-text">
          <p style={{ fontSize: "20px" }}>
            {t("footerAboutText")}
          </p>
        </div>
        <div className="quick-links">
          <h3>{t("footerQuickLinks")}</h3>
          <a href="#">{t("home")}</a>
          <a href="#">{t("about")}</a>
          <a href="#">{t("services")}</a>
          <a href="#">{t("plans")}</a>
          <a href="#">{t("contact")}</a>
        </div>
        <div className="contact-info">
          <h3>{t("footerContact")}</h3>
          <p>
            <i className="bi bi-telephone"></i> {t("footerPhone")}: +966-55-011-1496
          </p>
          <p>
            <i className="bi bi-envelope"></i> {t("footerEmail")}: moham@gmail.com
          </p>
          <p>
            <i className="bi bi-geo-alt"></i> {t("footerAddress")}: الرياض، السعودية
          </p>
        </div>
        <div className="newsletter">
          <h3>{t("footerNewsletter")}</h3>
          <div className="email-form">
            <input type="email" placeholder={t("footerEmail")} />
            <button>{t("footerNewsletter")}</button>
          </div>
        </div>
      </div>
      <div className="social-icons">
        <a href="#" className="social-link">
          <i className="bi bi-linkedin"></i>
        </a>
        <a href="#" className="social-link">
          <i className="bi bi-facebook"></i>
        </a>
        <a href="#" className="social-link">
          <i className="bi bi-instagram"></i>
        </a>
      </div>
      <div className="copyright">
        <p>{t("footerCopyright")}</p>
      </div>
    </footer>
  );
}

export default Footer;