import type React from "react"
import "./aboutUs.css"
import { BiEnvelope, BiMap } from "react-icons/bi"
import { FaLinkedin, FaFacebook, FaInstagram } from "react-icons/fa"
import { FiPhone } from "react-icons/fi"
import { useTranslation } from "react-i18next"

const AboutUs: React.FC = () => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  return (
    <div className="about-us-container" dir={textDirection}>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>{t("additionalPages.about.quiNous")}</h1>
          <p>{t("additionalPages.about.quiNousDescription")}</p>
        </div>
      </section>

      {/* Vision Section */}
      <section className="vision">
        <div className="vision-content">
          <h2>{t("additionalPages.about.title")}</h2>
          <p>{t("additionalPages.about.titleDescription")}</p>
        </div>
        <div className="vision-image">
          <img src="/page2.PNG" alt="Vision" />
        </div>
      </section>

      {/* Goals Section */}
      <section className="vision1">
        <div className="vision-content1">
          <h1>{t("additionalPages.about.goals")}</h1>
          <ul>
            <li>{t("additionalPages.about.marketResponse")}</li>
            <li>{t("additionalPages.about.easyOperations")}</li>
            <li>{t("additionalPages.about.usersUplevel")}</li>
            <li>{t("additionalPages.about.productivite")}</li>
            <li>{t("additionalPages.about.continute")}</li>
          </ul>
        </div>
        <div className="vision-image1">
          <img src="/page3.PNG" alt="Goals" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stat-item">
          <h3>400+</h3>
          <p>{t("additionalPages.about.markMarket")}</p>
        </div>
        <div className="stat-item">
          <h3>100%</h3>
          <p>{t("additionalPages.about.success")}</p>
        </div>
        <div className="stat-item">
          <h3>300+</h3>
          <p>{t("additionalPages.about.company")}</p>
        </div>
        <div className="stat-item">
          <h3>100%</h3>
          <p>{t("additionalPages.about.confidence")}</p>
        </div>
      </section>
    </div>
  )
}

export default AboutUs