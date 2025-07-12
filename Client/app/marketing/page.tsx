import Link from "next/link"
import { ArrowRight, BarChart3, ShoppingBag, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 mt-12">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">Smart-Store Retail Platform</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Plateforme complète de gestion retail avec stratégies marketing avancées, piliers d'expérience magasin et
            étiquetage dynamique des prix
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-slate-900">Marketing Strategy Display</CardTitle>
              <CardDescription className="text-slate-600">
                Gestion des promotions, planogrammes digitaux et campagnes ciblées
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-slate-600 mb-6 space-y-2">
                <li>• Promotions & Offres dynamiques</li>
                <li>• Planogrammes digitaux</li>
                <li>• A/B Testing avancé</li>
                <li>• Intégration multicanale</li>
              </ul>
              <Link href="/marketing-strategy">
                <Button className="w-full group-hover:bg-blue-700">
                  Accéder au module
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <ShoppingBag className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-slate-900">Shop Pillars</CardTitle>
              <CardDescription className="text-slate-600">
                Piliers structurants de l'expérience magasin physique et digitale
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-slate-600 mb-6 space-y-2">
                <li>• Zonage intelligent</li>
                <li>• Branding visuel cohérent</li>
                <li>• Interactivité client</li>
                <li>• Analytics physiques</li>
              </ul>
              <Link href="/shop-pillars">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Accéder au module
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <Tag className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl text-slate-900">Shelf Labels Pricing</CardTitle>
              <CardDescription className="text-slate-600">
                Étiquetage dynamique des prix avec gestion intelligente des stocks
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-slate-600 mb-6 space-y-2">
                <li>• Prix dynamiques temps réel</li>
                <li>• Labels électroniques (ESL)</li>
                <li>• Intégration stocks</li>
                <li>• Conformité légale</li>
              </ul>
              <Link href="/shelf-labels">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Accéder au module
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center mb-16">
          <Link href="/Dashboard">
            <Button
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 text-white px-12 py-6 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-3">
                <BarChart3 className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                <span>Accéder au Dashboard Principal</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300 -z-10"></div>
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">Synergies entre les modules</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Connectivité</h3>
              <p className="text-sm text-slate-600">Liens entre CRM et affichage promo personnalisé</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Automation</h3>
              <p className="text-sm text-slate-600">Mises à jour temps réel des prix et promotions</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Analytics</h3>
              <p className="text-sm text-slate-600">Mesure du ROI de chaque élément display</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
