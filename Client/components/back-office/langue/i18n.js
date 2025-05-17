import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

i18n.use(LanguageDetector).use(initReactI18next).init({
    debug: true,
    lng: 'en', // Langue par défaut
    resources: {
        en: {
            translation: {
                greeting1: "GENERAL",
                search: "search"
            }
        },
        fr: {
            translation: {
                greeting1: "GENERALE",
                search: "recherche"


            }
        },
        ar: {
            translation: {
                greeting1: "عامة",
                search: "بحث"


            }
        }
    }
});

export default i18n;