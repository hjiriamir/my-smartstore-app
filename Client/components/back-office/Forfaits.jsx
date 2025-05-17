"use client"
import { useRouter } from "next/navigation"
import "./forfaits.css"
import "bootstrap-icons/font/bootstrap-icons.css"
import "../multilingue/i18n.js"
import { useTranslation } from "react-i18next"
import { usePlans } from "./data/planse"

function Forfaits() {
  const router = useRouter()
  const { t, i18n } = useTranslation()
  const plans = usePlans() // Use the custom hook to get translated plans

  // Determine text direction based on language
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"
  const textAlign = isRTL ? "right" : "left"

  return (
    <div dir={textDirection}>
      <main>
        <section className="forfaits-hero" style={{ textAlign }}>
          <h1>{t("plans")}</h1>
          <p>{t("plansDescription")}</p>
        </section>

        <section className="pricing">
          {plans.map((plan) => (
            <div className="price-card" key={plan.id} style={{ textAlign }}>
              <div className="price flex items-center justify-end gap-2 text-black">
              <span className="text-6xl font-bold"> {plan.price} </span>
              <span className="text-4xl font-bold">{t("unite")}</span>/
                <span className="text-sm text-gray-500">{t("mois")}</span>
                
                
              </div>

              <h2 className="text-xl font-bold">{t(plan.title)}</h2>
              <p>{t(plan.short)}</p>
              <ul>
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              <button onClick={() => router.push(`/Forfaits/${plan.id}`)}>{t("buyPlan")}</button>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}

export default Forfaits

