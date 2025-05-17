"use client"; // Add this at the very top of the file

import React, { useState, useEffect } from 'react';
import '../back-office/Dashboard.css';
import { Search, Bell, Plus } from 'lucide-react';
import { useTranslation } from "react-i18next";
import i18n from "../multilingue/i18n";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const TopBanner = () => {
  const { t } = useTranslation();
  const pathname = usePathname();
  
  const languages = [
    { code: 'sa', flag: '/sa.png', alt: 'Saudi Arabia Flag', i18nCode: 'ar' },
    { code: 'us', flag: '/us.png', alt: 'United States Flag', i18nCode: 'en' },
    { code: 'fr', flag: '/fr.png', alt: 'France Flag', i18nCode: 'fr' }
  ];

  const defaultLanguageIndex = languages.findIndex(lang => lang.i18nCode === 'en');
  const [selectedLanguageIndex, setSelectedLanguageIndex] = useState(defaultLanguageIndex);

  useEffect(() => {
    i18n.changeLanguage(languages[selectedLanguageIndex].i18nCode);
  }, []);

  const handleLanguageClick = (index) => {
    const selectedLanguage = languages[index];
    i18n.changeLanguage(selectedLanguage.i18nCode);
    setSelectedLanguageIndex(index);
    console.log("Selected language:", selectedLanguage.i18nCode);
  };

  const mainRoutes = [
    {
      href: "/Dashboard",
      label: "Dashboard",
      active: pathname === "/Dashboard",
    },
    {
      href: "/store-display",
      label: "Shop Display",
      active:
        pathname === "/store-display" ||
        pathname === "/clothing-rack" ||
        pathname === "/furniture-library" ||
        pathname === "/furniture-editor",
    },
    {
      href: "/floor-planner",
      label: "Floor Planning",
      active: pathname === "/floor-planner" || pathname === "/planogram-editor",
    },
    {
      href: "/categories",
      label: "Category Management",
      active: pathname === "/categories",
    },
    {
      href: "/analytics",
      label: "Sales Summary",
      active: pathname === "/analytics",
    },
  ];

  return (
    <div className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Logo and Language Selector */}
        <div className="banner-left flex items-center mr-10">
          <Link href="/" className="flex items-center">
            <h1>
              <span className="text-xl font-bold text-blue-600">Smart</span>
              <span className="text-xl font-bold text-gray-800">Store</span>
            </h1>
          </Link>
          <div className="lang_toggle ml-4">
            {languages.map((lang, index) => (
              <img
                key={lang.code}
                src={lang.flag}
                alt={lang.alt}
                className={selectedLanguageIndex === index ? 'selected' : ''}
                onClick={() => handleLanguageClick(index)}
                style={{
                  width: '28px',
                  height: '18px',
                  objectFit: 'cover',
                  borderRadius: '3px',
                  display: 'block',
                  cursor: 'pointer',
                  margin: '5px',
                  border: selectedLanguageIndex === index ? '2px solid blue' : 'none',
                  opacity: selectedLanguageIndex === index ? 1 : 0.7,
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {mainRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-all duration-200 whitespace-nowrap relative",
                route.active 
                  ? "text-blue-600 before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-blue-600 before:-mb-[17px]" 
                  : "text-gray-600 hover:text-blue-600"
              )}
            >
              {route.label}
            </Link>
          ))}
        </nav>

        {/* Right side controls */}
        <div className="ml-auto flex items-center space-x-4">
          {/* Search */}
          <div className="search-box hidden lg:flex items-center relative">
            <Search className="search-icon h-4 w-4 absolute left-3 text-gray-400" />
            <input 
              type="text" 
              placeholder={t("search")} 
              className="h-9 w-56 rounded-full bg-gray-100 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </Button>

          {/* Quick Actions */}
          <Button 
            variant="default" 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200 rounded-lg shadow-sm hover:shadow"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Create Order
          </Button>

          {/* User Profile */}
          <div className="flex items-center space-x-2 ml-4">
            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center ring-2 ring-blue-50">
              <span className="text-xs font-semibold text-blue-700">JD</span>
            </div>
            <span className="text-sm font-medium text-gray-700 hidden md:inline">John Doe</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBanner;