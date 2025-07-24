'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../src/context/AuthContext';

const publicRoutes = [
  '/',
  '/Forfaits', 
  '/services',
  '/blog',
  '/LoginSignup',
  '/AbonnementList',
  '/reset-password',
  '/ListeDemandes',
  '/about'
];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      // Si la route n'est pas publique, ne commence pas par /Forfaits/ et l'utilisateur n'est pas connecté
      if (!publicRoutes.includes(pathname) && !pathname.startsWith('/Forfaits/') && !user) {
        router.push('/LoginSignup');
      }
    }
  }, [user, loading, pathname, router]);

  // Si la route est publique, commence par /Forfaits/ ou si l'utilisateur est connecté, afficher les enfants
  if (publicRoutes.includes(pathname) || pathname.startsWith('/Forfaits/') || user) {
    return <>{children}</>;
  }

  // Si en cours de chargement, vous pouvez retourner un loader ou null
  if (loading) {
    return <div>Loading...</div>;
  }

  // Par défaut, ne rien afficher (la redirection sera gérée par useEffect)
  return null;
}