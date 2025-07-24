"use client"
import "./Acceuil.css"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import { useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import Image from "next/image"

const Accueil = () => {
  const { t, i18n } = useTranslation()
  const router = useRouter()

  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  return (
    <div dir={textDirection} className="w-full">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">{t("greeting")}</h1>
          <p className="hero-subtitle">{t("FirstaboutCompany")}</p>

          {/* Features Cards */}
          <div className="features-grid">
            <div className="feature-card-modern">
              <div className="feature-icon-container">
                <Image src="/moon.png" alt="Quick Planning" width={60} height={60} className="feature-icon-img" />
              </div>
              <h3 className="feature-title">{t("quickPlanning")}</h3>
              <p className="feature-text">{t("quickPlanningText")}</p>
            </div>

            <div className="feature-card-modern">
              <div className="feature-icon-container">
                <Image src="/analysis.png" alt="Smart Analysis" width={60} height={60} className="feature-icon-img" />
              </div>
              <h3 className="feature-title">{t("smartAnalysis")}</h3>
              <p className="feature-text">{t("smartAnalysisText")}</p>
            </div>

            <div className="feature-card-modern feature-card-full">
              <div className="feature-icon-container">
                <span className="feature-emoji">⭐</span>
              </div>
              <h3 className="feature-title">{t("rewardsSystem")}</h3>
              <p className="feature-text">{t("rewardsSystemText")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="vision-section">
        <div className="vision-container">
          <div className="vision-content-modern">
            <h1 className="vision-title">{t("about")}</h1>
            <p className="vision-text">{t("aboutCompany")}</p>
            <h2 className="vision-subtitle">{t("more")}</h2>
            <div className="vision-buttons">
              <button className="btn-primary">{t("plans")}</button>
              <button className="btn-secondary">{t("contact")}</button>
            </div>
          </div>
          <div className="vision-image-container">
            <Image src="/societe.PNG" alt="Vision" width={600} height={400} className="vision-image-modern" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="services-container">
          <h2 className="services-title">{t("services")}</h2>
          <p className="services-subtitle">{t("servicesOverview")}</p>

          <div className="services-grid-modern">
            <div className="service-card-modern">
              <div className="service-icon-modern">📄</div>
              <h3 className="service-title">{t("invoiceManagement")}</h3>
              <p className="service-text">{t("testimonialText")}</p>
            </div>

            <div className="service-card-modern">
              <div className="service-icon-modern">📦</div>
              <h3 className="service-title">{t("inventoryManagement")}</h3>
              <p className="service-text">{t("testimonialText")}</p>
            </div>

            <div className="service-card-modern">
              <div className="service-icon-modern">📁</div>
              <h3 className="service-title">{t("categoryManagement")}</h3>
              <p className="service-text">{t("testimonialText")}</p>
            </div>

            <div className="service-card-modern">
              <div className="service-icon-modern">🛍️</div>
              <h3 className="service-title">{t("productManagement")}</h3>
              <p className="service-text">{t("testimonialText")}</p>
            </div>
          </div>

          <button className="btn-services">{t("seeAll")}</button>
        </div>
      </section>

      {/* Sectors Section */}
      <section className="sectors-section">
        <div className="sectors-container">
          <h1 className="sectors-title">{t("sectorsAvailable")}</h1>
          <p className="sectors-subtitle">{t("sectorsAvailableDescription")}</p>

          <div className="sectors-grid-modern">
            <div className="sector-card-modern">
              <Image
                src="/sect3.PNG"
                alt={t("pharmaceuticalSector")}
                width={400}
                height={250}
                className="sector-image"
              />
              <div className="sector-content">
                <h3 className="sector-title">{t("pharmaceuticalSector")}</h3>
                <p className="sector-text">{t("pharmaceuticalSectorText")}</p>
              </div>
            </div>

            <div className="sector-card-modern">
              <Image
                src="/sect2.PNG"
                alt={t("goodsDistributionSector")}
                width={400}
                height={250}
                className="sector-image"
              />
              <div className="sector-content">
                <h3 className="sector-title">{t("goodsDistributionSector")}</h3>
                <p className="sector-text">{t("goodsDistributionSectorText")}</p>
              </div>
            </div>

            <div className="sector-card-modern">
              <Image src="/sect1.PNG" alt={t("maintenanceSector")} width={400} height={250} className="sector-image" />
              <div className="sector-content">
                <h3 className="sector-title">{t("maintenanceSector")}</h3>
                <p className="sector-text">{t("maintenanceSectorText")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="testimonial-section-modern">
        <div className="testimonial-overlay"></div>
        <div className="testimonial-container">
          <div className="testimonial-card-modern">
            <div className="testimonial-content-modern">
              <div className="rating-modern">★★★★★</div>
              <p className="testimonial-text-modern">{t("testimonialText")}</p>
              <div className="testimonial-author-modern">
                <Image src="/photo_amir.jpg" alt="Profile" width={60} height={60} className="author-img-modern" />
                <div className="author-details-modern">
                  <h4>محمد أشرف</h4>
                  <p>مسؤول مبيعات</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="news-section">
        <div className="news-container">
          <h2 className="news-title">{t("latestNews")}</h2>

          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              640: { slidesPerView: 1, spaceBetween: 20 },
              768: { slidesPerView: 2, spaceBetween: 30 },
              1024: { slidesPerView: 3, spaceBetween: 40 },
            }}
            className="news-swiper"
          >
            <SwiperSlide>
              <div className="news-card-modern">
                <Image src="/news1.jpg" alt="Laptop Image" width={400} height={250} className="news-image-modern" />
                <div className="news-content">
                  <p className="news-text-modern">{t("testimonialText")}</p>
                  <div className="news-footer-modern">
                    <span className="news-date-modern">
                      <span className="news-icon">📅</span>
                      1/1/2025
                    </span>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="news-card-modern">
                <Image src="/news2.jpg" alt="Person Image" width={400} height={250} className="news-image-modern" />
                <div className="news-content">
                  <p className="news-text-modern">{t("testimonialText")}</p>
                  <div className="news-footer-modern">
                    <span className="news-date-modern">
                      <span className="news-icon">📅</span>
                      1/1/2025
                    </span>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="news-card-modern">
                <Image src="/news3.jpg" alt="AI Image" width={400} height={250} className="news-image-modern" />
                <div className="news-content">
                  <p className="news-text-modern">{t("testimonialText")}</p>
                  <div className="news-footer-modern">
                    <span className="news-date-modern">
                      <span className="news-icon">📅</span>
                      1/1/2025
                    </span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>

          <div className="news-button-container">
            <button className="btn-news">{t("seeAll")}</button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Accueil
