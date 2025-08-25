export const orientations = [
    { value: "Nord", label: "Nord", degrees: 0 },
    { value: "Est", label: "Est", degrees: 90 },
    { value: "Sud", label: "Sud", degrees: 180 },
    { value: "Ouest", label: "Ouest", degrees: 270 },
  ]
  
  export const eclairageOptions = [
    { value: "LED", label: "LED" },
    { value: "Incandescence", label: "Incandescence" },
    { value: "Fluorescent", label: "Fluorescent" },
    { value: "Naturel", label: "Naturel" },
    { value: "Halogène", label: "Halogène" },
    { value: "Spot", label: "Spot" },
    { value: "Projecteur", label: "Projecteur" },
  ]
  
  export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  