// This file will contain the plans data with translation keys instead of hardcoded text
import { useTranslation } from "react-i18next"

// Define the plan structure with translation keys
export const plansData = [
  {
    id: "basic",
    titleKey: "basicPlan",
    price: "200",
    shortDescription:"shortBasicDescription",
    descriptionKey: "basicPlanDescription", 
    featuresKeys: [
      "productManagement",
      "invoiceManagement",
      "inventoryManagement",
      "salesManagement",
      "customerManagement",
      "supplierManagement",
      "instagramManagement",
      "visitPlanning",
    ],
  },
  {
    id: "advanced",
    titleKey: "advancedPlan",
    price: "500",
    shortDescription:"shortAdvancedDescription",
    descriptionKey: "advancedPlanDescription",
    featuresKeys: [
      "productManagement",
      "invoiceManagement",
      "inventoryManagement",
      "salesManagement",
      "customerManagement",
      "supplierManagement",
      "instagramManagement",
      "visitPlanning",
    ],
  },
  {
    id: "gold",
    titleKey: "goldPlan",
    price: "700",
    shortDescription:"shortGoldDescription",
    descriptionKey: "goldPlanDescriptipn",
    featuresKeys: [
      "productManagement",
      "invoiceManagement",
      "inventoryManagement",
      "salesManagement",
      "customerManagement",
      "supplierManagement",
      "instagramManagement",
      "visitPlanning",
    ],
  },
]

// Create a hook to get translated plans
export const usePlans = () => {
  const { t } = useTranslation()

  // Transform the plans data with translations
  const plans = plansData.map((plan) => ({
    id: plan.id,
    title: t(plan.titleKey),
    short:t(plan.shortDescription),
    price: plan.price,
    description: t(plan.descriptionKey),
    features: plan.featuresKeys.map((featureKey) => t(featureKey)),
  }))

  return plans
}

