'use client'

import * as React from 'react'
import { usePathname, useRouter  } from 'next/navigation'; // Remplace useLocation

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
