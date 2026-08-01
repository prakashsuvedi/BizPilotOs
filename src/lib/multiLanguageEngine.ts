// MarketForge AI - Central Multi-Language Engine (Phase 5)
// Fully encapsulates standard in-app translation indexes, RTL modes, translation managers, and AI suggestions.

export interface TranslationDictionary {
  welcome: string;
  dashboard: string;
  createTenant: string;
  activeWorkspaces: string;
  settings: string;
  commerce: string;
  security: string;
  systemStatus: string;
  operationsCenter: string;
  liveLatency: string;
  databaseIntegrity: string;
  billingLedger: string;
  diagnostics: string;
  consistencyEngine: string;
  saveChanges: string;
  cancel: string;
  language: string;
  theme: string;
  autodiagnostics: string;
  rollbackHistory: string;
  runAudit: string;
  repairNow: string;
  systemHealthy: string;
  cpanelDeployment: string;
}

export const LANGUAGES = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'ne', name: 'नेपाली (Nepali)', dir: 'ltr' },
  { code: 'hi', name: 'हिन्दी (Hindi)', dir: 'ltr' },
  { code: 'es', name: 'Español (Spanish)', dir: 'ltr' },
  { code: 'fr', name: 'Français (French)', dir: 'ltr' },
  { code: 'de', name: 'Deutsch (German)', dir: 'ltr' },
  { code: 'ar', name: 'العربية (Arabic)', dir: 'rtl' },
];

export const TRANSLATION_DICTIONARIES: Record<string, TranslationDictionary> = {
  en: {
    welcome: "Welcome to MarketForge OS",
    dashboard: "Enterprise Command Center",
    createTenant: "Provision New Tenant Space",
    activeWorkspaces: "Active Multi-Tenant Workspaces",
    settings: "Global Workspace Configurations",
    commerce: "Global Commerce & Localization",
    security: "System Security & Verification Fortress",
    systemStatus: "Dynamic Node Clusters Status",
    operationsCenter: "Autonomous Operations Control",
    liveLatency: "API Clusters Latency",
    databaseIntegrity: "Transactional Firestore Ledger Status",
    billingLedger: "Invoices & Localized Receipts Ledger",
    diagnostics: "Active Telemetry & Crash Diagnostics",
    consistencyEngine: "Enterprise Integrity Consistency Engine",
    saveChanges: "Commit and Save Configurations",
    cancel: "Cancel Operation",
    language: "Active Environment Language",
    theme: "UI Visual Theme Vibe",
    autodiagnostics: "Automated Self-Verification Audit",
    rollbackHistory: "Saga Transactional Rollback History",
    runAudit: "Run Forensic Database Audit",
    repairNow: "Auto-Repair Consistency Discrepancies",
    systemHealthy: "All Clusters Reporting Normal Healthy",
    cpanelDeployment: "cPanel Subdomain Provisioning Log"
  },
  ne: {
    welcome: "मार्केटफोर्ज ओएसमा स्वागत छ",
    dashboard: "एजेन्सी कमाण्ड सेन्टर",
    createTenant: "नयाँ ग्राहक स्पेस सिर्जना गर्नुहोस्",
    activeWorkspaces: "सक्रिय बहु-टेनेन्ट वर्कस्पेसहरू",
    settings: "ग्लोबल वर्कस्पेस सेटिंग्स",
    commerce: "ग्लोबल कमर्स र स्थानीयकरण",
    security: "सिस्टम सुरक्षा र प्रमाणिकरण किला",
    systemStatus: "डायनामिक नोड क्लस्टर स्थिति",
    operationsCenter: "स्वायत्त सञ्चालन नियन्त्रण",
    liveLatency: "एपीआई क्लस्टर लेटन्सी",
    databaseIntegrity: "ट्रान्जेक्शनल फायरस्टोर लेजर स्थिति",
    billingLedger: "बील र स्थानीय रसिदहरू",
    diagnostics: "सक्रिय टेलिमेट्री र क्र्यास निदान",
    consistencyEngine: "इन्टरप्राइज अखण्डता स्थिरता इन्जिन",
    saveChanges: "कन्फिगरेसनहरू बचत गर्नुहोस्",
    cancel: "रद्द गर्नुहोस्",
    language: "सक्रिय वातावरण भाषा",
    theme: "यूआई भिजुअल थीम",
    autodiagnostics: "स्वचालित आत्म-प्रमाणिकरण अडिट",
    rollbackHistory: "सागा लेनदेन रोलब्याक इतिहास",
    runAudit: "डेटाबेस फोरेंसिक अडिट गर्नुहोस्",
    repairNow: "असंगतिहरू स्वतः मर्मत गर्नुहोस्",
    systemHealthy: "सबै क्लस्टर सामान्य रिपोर्टिङ",
    cpanelDeployment: "cPanel सबडोमेन डिप्लोयमेन्ट लग"
  },
  hi: {
    welcome: "मार्केटफोर्ज ओएस में आपका स्वागत है",
    dashboard: "एजेंसी कमांड सेंटर",
    createTenant: "नया क्लाइंट स्पेस स्थापित करें",
    activeWorkspaces: "सक्रिय मल्टी-टेनेंट वर्कस्पेस",
    settings: "ग्लोबल वर्कस्पेस सेटिंग्स",
    commerce: "ग्लोबल कॉमर्स और स्थानीयकरण",
    security: "सिस्टम सुरक्षा और सत्यापन किला",
    systemStatus: "डायनेमिक नोड क्लस्टर स्थिति",
    operationsCenter: "स्वायत्त संचालन नियंत्रण",
    liveLatency: "एपीआई क्लस्टर लेटेंसी",
    databaseIntegrity: "ट्रांजैक्शनल फायरस्टोर बहीखाता स्थिति",
    billingLedger: "बिल और स्थानीय रसीदें",
    diagnostics: "सक्रिय टेलीमेट्री और क्रैश डायग्नोस्टिक्स",
    consistencyEngine: "एंटरप्राइज अखंडता स्थिरता इंजन",
    saveChanges: "कॉन्फ़िगरेशन सहेजें",
    cancel: "रद्द करें",
    language: "सक्रिय वातावरण भाषा",
    theme: "यूआई विजुअल थीम",
    autodiagnostics: "स्वचालित स्व-सत्यापन ऑडिट",
    rollbackHistory: "सागा लेनदेन रोलबैक इतिहास",
    runAudit: "डेटाबेस फोरेंसिक ऑडिट चलाएं",
    repairNow: "विसंगतियों को स्वतः ठीक करें",
    systemHealthy: "सभी क्लस्टर सामान्य रिपोर्टिंग कर रहे हैं",
    cpanelDeployment: "cPanel सबडोमेन परिनियोजन लॉग"
  },
  es: {
    welcome: "Bienvenido a MarketForge OS",
    dashboard: "Centro de Comando Empresarial",
    createTenant: "Aprovisionar Nuevo Espacio de Tenant",
    activeWorkspaces: "Espacios Multitenant Activos",
    settings: "Configuraciones Globales de Workspace",
    commerce: "Comercio Global y Localización",
    security: "Fortaleza de Seguridad y Verificación del Sistema",
    systemStatus: "Estado Dinámico de Clústeres de Nodos",
    operationsCenter: "Control de Operaciones Autónomas",
    liveLatency: "Latencia de Clústeres de API",
    databaseIntegrity: "Estado de Libro Transaccional Firestore",
    billingLedger: "Libro de Facturas y Recibos Localizados",
    diagnostics: "Telemetría Activa y Diagnóstico de Fallas",
    consistencyEngine: "Motor de Consistencia de Integridad Empresarial",
    saveChanges: "Guardar Configuraciones",
    cancel: "Cancelar Operación",
    language: "Idioma del Entorno Activo",
    theme: "Ambiente Visual de Interfaz",
    autodiagnostics: "Auditoría de Autoverificación Automatizada",
    rollbackHistory: "Historial de Reversión Transaccional de Saga",
    runAudit: "Ejecutar Auditoría Forense de Base de Datos",
    repairNow: "Auto-reparar Discrepancias de Consistencia",
    systemHealthy: "Todos los Clústeres Informan Saludable Normal",
    cpanelDeployment: "Registro de Aprovisionamiento de Subdominios cPanel"
  },
  fr: {
    welcome: "Bienvenue sur MarketForge OS",
    dashboard: "Centre de Commandement d'Entreprise",
    createTenant: "Provisionner un Nouvel Espace Client",
    activeWorkspaces: "Espaces Multi-Locataires Actifs",
    settings: "Configurations Globales du Workspace",
    commerce: "Commerce Global & Localisation",
    security: "Forteresse de Sécurité et de Vérification Système",
    systemStatus: "État des Clusters de Nœuds Dynamiques",
    operationsCenter: "Contrôle des Opérations Autonomes",
    liveLatency: "Latence des Clusters d'API",
    databaseIntegrity: "Statut du Registre Transactionnel Firestore",
    billingLedger: "Livre des Factures & Reçus Localisés",
    diagnostics: "Télémétrie Active & Diagnostics de Crash",
    consistencyEngine: "Moteur de Cohérence d'Intégrité d'Entreprise",
    saveChanges: "Enregistrer les Configurations",
    cancel: "Annuler l'Opération",
    language: "Langue de l'Environnement Active",
    theme: "Ambiance Visuelle de l'Interface",
    autodiagnostics: "Audit d'Auto-Vérification Automatisé",
    rollbackHistory: "Historique des Annulations de Transaction Saga",
    runAudit: "Exécuter l'Audit Judiciaire de la Base de Données",
    repairNow: "Auto-Réparer les Écarts de Cohérence",
    systemHealthy: "Tous les Clusters Signalent un État Sain Normal",
    cpanelDeployment: "Journal de Provisionnement des Sous-domaines cPanel"
  },
  de: {
    welcome: "Willkommen bei MarketForge OS",
    dashboard: "Unternehmens-Kommandozentrale",
    createTenant: "Neuen Mandanten-Bereich Bereitstellen",
    activeWorkspaces: "Aktive Mandanten-Arbeitsbereiche",
    settings: "Globale Arbeitsbereichs-Konfigurationen",
    commerce: "Globaler Handel & Lokalisierung",
    security: "Systemsicherheit & Verifizierungsfestung",
    systemStatus: "Dynamischer Status der Knotencluster",
    operationsCenter: "Autonome Betriebssteuerung",
    liveLatency: "API-Cluster-Latenz",
    databaseIntegrity: "Transaktionaler Firestore-Ledger-Status",
    billingLedger: "Rechnungen & Lokalisierte Quittungen",
    diagnostics: "Aktive Telemetrie & Absturzdiagnose",
    consistencyEngine: "Enterprise-Integritätskonsistenz-Engine",
    saveChanges: "Konfigurationen Speichern",
    cancel: "Vorgang Abbrechen",
    language: "Aktive Umgebungssprache",
    theme: "Visuelles UI-Thema",
    autodiagnostics: "Automatisierte Selbstverifizierungsprüfung",
    rollbackHistory: "Saga-Transaktions-Rollback-Verlauf",
    runAudit: "Forensische Datenbankprüfung Ausführen",
    repairNow: "Konsistenzabweichungen Automatisch Reparieren",
    systemHealthy: "Alle Cluster Melden Normalen Gesunden Zustand",
    cpanelDeployment: "cPanel Subdomain-Bereitstellungsprotokoll"
  },
  ar: {
    welcome: "مرحباً بكم في نظام MarketForge OS",
    dashboard: "مركز التحكم في المؤسسة",
    createTenant: "تخصيص مساحة مستأجر جديدة",
    activeWorkspaces: "مساحات العمل النشطة متعددة المستأجرين",
    settings: "تكوينات مساحة العمل العالمية",
    commerce: "التجارة العالمية والتوطين المحلي",
    security: "حصن أمن وتوثيق النظام",
    systemStatus: "حالة مجموعات العقد الديناميكية",
    operationsCenter: "التحكم الذاتي في العمليات",
    liveLatency: "زمن انتقال مجموعات واجهة برمجة التطبيقات",
    databaseIntegrity: "حالة دفتر الأستاذ العملياتي في Firestore",
    billingLedger: "دفتر الفواتير والإيصالات المحلية",
    diagnostics: "القياس عن بعد النشط وتشخيص الأعطال",
    consistencyEngine: "محرك تناسق سلامة المؤسسة",
    saveChanges: "حفظ التكوينات",
    cancel: "إلغاء العملية",
    language: "لغة البيئة النشطة",
    theme: "نمط الواجهة المرئي",
    autodiagnostics: "تدقيق التحقق الذاتي الآلي",
    rollbackHistory: "سجل تراجع المعاملات في ملحمة ساغا",
    runAudit: "إجراء التدقيق الجنائي لقاعدة البيانات",
    repairNow: "إصلاح تناقضات التناسق تلقائيًا",
    systemHealthy: "جميع المجموعات تبلغ عن حالة صحية طبيعية",
    cpanelDeployment: "سجل تهيئة النطاق الفرعي في cPanel"
  }
};

export function getTranslation(lang: string, key: keyof TranslationDictionary): string {
  const dictionary = TRANSLATION_DICTIONARIES[lang] || TRANSLATION_DICTIONARIES.en;
  return dictionary[key] || TRANSLATION_DICTIONARIES.en[key] || key;
}

export function simulateAiTranslation(text: string, targetLanguage: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return a simulated high-quality translated text suggestion
      if (targetLanguage === 'ne') {
        resolve(`[AI] अनुवादित: ${text} (नेपाली संस्करण)`);
      } else if (targetLanguage === 'hi') {
        resolve(`[AI] अनुवादित: ${text} (हिंदी संस्करण)`);
      } else if (targetLanguage === 'ar') {
        resolve(`[AI] ترجمة: ${text} (النسخة العربية)`);
      } else {
        resolve(`[AI Translated to ${targetLanguage}]: ${text}`);
      }
    }, 450);
  });
}
