import Link from "next/link"
import { ArrowRight, BarChart3, ShoppingBag, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 mt-8 sm:mt-12">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-12 lg:py-16">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 sm:mb-4 lg:mb-6 px-2">
            Smart-Store Retail Platform
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 max-w-xs sm:max-w-2xl lg:max-w-3xl mx-auto px-4">
            Plateforme complète de gestion retail avec stratégies marketing avancées, piliers d'expérience magasin et
            étiquetage dynamique des prix
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
            <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-blue-200 transition-colors">
                <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" />
              </div>
              <CardTitle className="text-lg sm:text-xl lg:text-2xl text-slate-900 leading-tight">
                Marketing Strategy Display
              </CardTitle>
              <CardDescription className="text-slate-600 text-xs sm:text-sm px-2">
                Gestion des promotions, planogrammes digitaux et campagnes ciblées
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center px-4 sm:px-6">
              <ul className="text-xs sm:text-sm text-slate-600 mb-4 sm:mb-6 space-y-1 sm:space-y-2">
                <li>• Promotions & Offres dynamiques</li>
                <li>• Planogrammes digitaux</li>
                <li>• A/B Testing avancé</li>
                <li>• Intégration multicanale</li>
              </ul>
              <Link href="/marketing-strategy">
                <Button className="w-full group-hover:bg-blue-700 text-sm sm:text-base">
                  Accéder au module
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
            <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-green-200 transition-colors">
                <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-green-600" />
              </div>
              <CardTitle className="text-lg sm:text-xl lg:text-2xl text-slate-900 leading-tight">
                Shop Pillars
              </CardTitle>
              <CardDescription className="text-slate-600 text-xs sm:text-sm px-2">
                Piliers structurants de l'expérience magasin physique et digitale
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center px-4 sm:px-6">
              <ul className="text-xs sm:text-sm text-slate-600 mb-4 sm:mb-6 space-y-1 sm:space-y-2">
                <li>• Zonage intelligent</li>
                <li>• Branding visuel cohérent</li>
                <li>• Interactivité client</li>
                <li>• Analytics physiques</li>
              </ul>
              <Link href="/shop-pillars">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-sm sm:text-base">
                  Accéder au module
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg sm:col-span-2 lg:col-span-1">
            <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-purple-200 transition-colors">
                <Tag className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-600" />
              </div>
              <CardTitle className="text-lg sm:text-xl lg:text-2xl text-slate-900 leading-tight">
                Shelf Labels Pricing
              </CardTitle>
              <CardDescription className="text-slate-600 text-xs sm:text-sm px-2">
                Étiquetage dynamique des prix avec gestion intelligente des stocks
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center px-4 sm:px-6">
              <ul className="text-xs sm:text-sm text-slate-600 mb-4 sm:mb-6 space-y-1 sm:space-y-2">
                <li>• Prix dynamiques temps réel</li>
                <li>• Labels électroniques (ESL)</li>
                <li>• Intégration stocks</li>
                <li>• Conformité légale</li>
              </ul>
              <Link href="/shelf-labels">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-sm sm:text-base">
                  Accéder au module
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mb-8 sm:mb-12 lg:mb-16 px-4">
          <Link href="/Dashboard">
            <Button
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 text-white px-6 sm:px-8 lg:px-12 py-4 sm:py-5 lg:py-6 text-sm sm:text-base lg:text-lg font-semibold rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-2 sm:gap-3">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 group-hover:rotate-12 transition-transform duration-300" />
                <span className="whitespace-nowrap">Accéder au Dashboard Principal</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300 -z-10"></div>
            </Button>
          </Link>
        </div>

        {/* Synergies Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-4 sm:mb-6 text-center">
            Synergies entre les modules
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">Connectivité</h3>
              <p className="text-xs sm:text-sm text-slate-600 px-2">Liens entre CRM et affichage promo personnalisé</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">Automation</h3>
              <p className="text-xs sm:text-sm text-slate-600 px-2">Mises à jour temps réel des prix et promotions</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">Analytics</h3>
              <p className="text-xs sm:text-sm text-slate-600 px-2">Mesure du ROI de chaque élément display</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
