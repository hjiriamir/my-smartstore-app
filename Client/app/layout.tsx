'use client';

import './globals.css';
import { usePathname } from 'next/navigation';
import Header from '../components/header-footer/Header';
import Footer from '../components/header-footer/footer';
import TopBanner from '../components/back-office/TopBanner';

//import { metadata } from '../metadata';
import type { Metadata } from "next"
import { AuthProvider } from '../src/context/AuthContext';
import { ReactNode } from 'react'; // Import ReactNode for children type

/*export const metadata: Metadata = {
  title: "Planogramme App",
  description: "Application de gestion de planogrammes",
        
}*/
// Liste des routes où le Header et le Footer ne doivent pas être affichés
const noHeaderFooterRoutes = [
  '/Dashboard',
  '/DashboardEntreprise',
  '/ListeDemandes',
  '/Essai',
  '/AbonnementList',
  '/UserManagement',
  '/TopBanner',
  '/Planogram',
  '/FloorPlanEditor',
  '/AbonnementList',
  '/reset-password',
  '/Editor',
  '/floor-plan-editor',
  '/planogram-editor',
  '/clothing-rack',
  '/product-import',
  '/store-display',
  '/furniture-editor',
  '/furniture-library',
  '/categories',
  '/product-library',
  '/planogram-ia',
  '/management-page',
  '/category-management',
  '/magasin-management',
  '/zones-management',
  '/combined-management',
  '/display-data',
];

const topBannerRoutes = [
  '/Dashboard',
  '/Editor',
  '/planogram-editor',
  '/product-import',
  '/product-library',
  '/store-display',
  '/planogram-ia',
  '/floor-plan-editor',
  '/furniture-library',
  '/furniture-editor',
  '/management-page',
  '/category-management',
  '/magasin-management',
  '/zones-management',
  '/combined-management',
  '/display-data',
];

// Define props type for RootLayout
interface RootLayoutProps {
  children: ReactNode; // Explicitly type children as ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();

  const shouldShowHeaderFooter = !noHeaderFooterRoutes.some((route) =>
    pathname.startsWith(route)
  );

  return (
    <html lang="en">
      <body>
      <AuthProvider>
        {shouldShowHeaderFooter && <Header />}
        {topBannerRoutes.some((route) => pathname.startsWith(route)) && <TopBanner />}
        {children}
        {shouldShowHeaderFooter && <Footer />}
      </AuthProvider>

      </body>
    </html>
  );
}