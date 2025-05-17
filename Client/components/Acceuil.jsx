import React from 'react';
import './Acceuil.css';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useRouter } from 'next/navigation';
import './multilingue/i18n.js';
import { useTranslation } from 'react-i18next';

const Acceuil = () => {
  const { t, i18n } = useTranslation(); // Ajoutez i18n pour accéder à la langue actuelle
  const router = useRouter();

  // Déterminez la direction en fonction de la langue
  const isRTL = i18n.language === 'ar'; // RTL pour l'arabe, sinon LTR
  const textDirection = isRTL ? 'rtl' : 'ltr';

  return (
    <div dir={textDirection}> {/* Appliquez la direction ici */}
      <section className="hero">
        <h1>{t("greeting")}</h1>
        <p>
          {t("FirstaboutCompany")}
        </p>
        <section className="features1">
          <div className="feature-card1">
            <div className="feature-icon1">
              <img src="/moon.png" alt="Icon" />
            </div>
            <h3>{t("quickPlanning")}</h3>
            <p>{t("quickPlanningText")}</p>
          </div>

          <div className="feature-card1">
            <div className="feature-icon1">
              <img src="/analysis.png" alt="Icon" />
            </div>
            <h3>{t("smartAnalysis")}</h3>
            <p>{t("smartAnalysisText")}</p>
          </div>
          <div className="feature-card1">
            <div className="feature-icon1">⭐</div>
            <h3>{t("rewardsSystem")}</h3>
            <p>{t("rewardsSystemText")}</p>
          </div>
        </section>
      </section>

      <section className="vision">
        <div className="vision-content">
          <h1> {t("about")}</h1>
          <p>
            {t("aboutCompany")}
          </p>
          <h2>{t("more")}</h2>
          <div className="mesbouttons">
            <div className="contact-us">{t("plans")}</div>
            <div className="contact-us" style={{ backgroundColor: 'white', color: '#00a69c', marginRight: '20px', borderColor: '#00a69c' }}>{t("contact")}</div>
          </div>
        </div>
        <div className="vision-image">
          <img src="/societe.PNG" alt="Vision Image" />
        </div>
      </section>

      <section className="services">
        <h2>{t("services")}</h2>
        <p className="section-subtitle">{t("servicesOverview")}</p>
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">📄</div>
            <h3>{t("invoiceManagement")}</h3>
            <p>{t("testimonialText")}</p>
          </div>
          <div className="service-card">
            <div className="service-icon">📦</div>
            <h3>{t("inventoryManagement")}</h3>
            <p>{t("testimonialText")}</p>
          </div>
          <div className="service-card">
            <div className="service-icon">📁</div>
            <h3>{t("categoryManagement")}</h3>
            <p>{t("testimonialText")}</p>
          </div>
          <div className="service-card">
            <div className="service-icon">🛍️</div>
            <h3>{t("productManagement")}</h3>
            <p>{t("testimonialText")}</p>
          </div>
        </div>
        <div className="contact-us" style={{ marginTop: '50px' }}>{t("seeAll")}</div>
      </section>

      <section className="sectors">
        <h1>{t("sectorsAvailable")}</h1>
        <p className="section-subtitle">{t("sectorsAvailableDescription")}</p>
        <div className="sectors-grid">
          <div className="sector-card">
            <img src="/sect3.PNG" alt={t("pharmaceuticalSector")} />
            <h3>{t("pharmaceuticalSector")}</h3>
            <p>{t("pharmaceuticalSectorText")}</p>
          </div>

          <div className="sector-card">
            <img src="/sect2.PNG" alt={t("goodsDistributionSector")} />
            <h3>{t("goodsDistributionSector")}</h3>
            <p>{t("goodsDistributionSectorText")}</p>
          </div>
          <div className="sector-card">
            <img src="/sect1.PNG" alt={t("maintenanceSector")} />
            <h3>{t("maintenanceSector")}</h3>
            <p>{t("maintenanceSectorText")}</p>
          </div>
        </div>
      </section>

      <section className="testimonial-section">
        <div className="testimonial-card">
          <div className="testimonial-content">
            <div className="rating">★★★★★</div>
            <p className="testimonial-text">{t("testimonialText")}</p>
            <div className="testimonial-author">
              <img src="/photo_amir.jpg" alt="Profile" className="author-img" />
              <div className="author-details">
                <h4>محمد أشرف</h4>
                <p>مسؤول مبيعات</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="latest-news-section">
        <h2 className="section-title">{t("latestNews")}</h2>

        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={3}
          navigation
          pagination={{ clickable: true }}
        >
          <SwiperSlide>
            <div className="news-card">
              <img src="/news1.jpg" alt="Laptop Image" className="news-image" />
              <p className="news-text">
                {t("testimonialText")}
              </p>
              <div className="news-footer">
                <span className="news-date">
                  <i className="icon-calendar">📅</i> 1/1/2025
                </span>
              </div>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="news-card">
              <img src="/news2.jpg" alt="Person Image" className="news-image" />
              <p className="news-text">
                {t("testimonialText")}
              </p>
              <div className="news-footer">
                <span className="news-date">
                  <i className="icon-calendar">📅</i> 1/1/2025
                </span>
              </div>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="news-card">
              <img src="/news3.jpg" alt="AI Image" className="news-image" />
              <p className="news-text">
                {t("testimonialText")}
              </p>
              <div className="news-footer">
                <span className="news-date">
                  <i className="icon-calendar">📅</i> 1/1/2025
                </span>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>

        <div className="contact-us" style={{ marginTop: "40px" }}>{t("seeAll")}</div>
      </section>
    </div>
  );
}

export default Acceuil;