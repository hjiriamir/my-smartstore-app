import React from 'react';
import './blog.css';
import { BiEnvelope, BiMap } from "react-icons/bi"
import { FaLinkedin, FaFacebook, FaInstagram } from "react-icons/fa"
import { FiPhone } from "react-icons/fi"
import { useTranslation } from "react-i18next"

const Blog: React.FC = () => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  return (
    <div dir={textDirection} style={{ textAlign: isRTL ? 'right' : 'left' }}>
      <main>
        <section className="hero">
          <div className="hero-content">
            <h1>{t("additionalPages.blog.news")}</h1>
            <p>{t("additionalPages.blog.newsDescription")}</p>
          </div>
        </section>

        <section className="sectors">
          <div className="sectors-grid">
            {[1, 2, 3].map((item) => (
              <div className="sector-card" key={item}>
                <img src={`/card${item}.PNG`} alt={`قطاع ${item}`} />
                <div className="info-row">
                  <h6>June 28, 2021</h6>
                  <h6>{t("additionalPages.blog.internet")}</h6>
                </div>
                <h3>{t("additionalPages.blog.cardTitle")}</h3>
                <p>{t("additionalPages.blog.cardDescription")}</p>
                <div className="author">
                  <img src="/photo_amir.jpg" alt="Author" />
                  <div className="author-info">
                    <strong>أمير حجيري</strong><br />
                    {t("additionalPages.blog.sales")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Blog;