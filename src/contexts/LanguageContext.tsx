import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "ha" | "ig" | "yo";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.records": "Medical Records",
    "nav.appointments": "Book Appointment",
    "nav.bills": "Medical Bills",
    "nav.donations": "Donate to Patients",
    "nav.emergency": "Emergency Access",
    "nav.wallet": "My Wallet",
    "nav.insurance": "Insurance",
    "nav.compliance": "Security & Compliance",
    "nav.back": "Back",
    "nav.signOut": "Sign Out",
    
    // Dashboard
    "dashboard.welcome": "Welcome back!",
    "dashboard.subtitle": "Manage your healthcare from one secure, beautiful dashboard",
    "dashboard.donate": "Donate to Patients",
    "dashboard.donate.desc": "Support verified patients in need",
    "dashboard.bookAppointment": "Book Appointment",
    "dashboard.bookAppointment.desc": "Search and book with hospitals",
    "dashboard.payBill": "Pay Medical Bill",
    "dashboard.payBill.desc": "Pay with BDAG tokens",
    "dashboard.records": "Medical Records",
    "dashboard.records.desc": "View encrypted health data",
    "dashboard.emergency": "Emergency Access",
    "dashboard.emergency.desc": "QR code & critical info",
    "dashboard.wallet": "My Wallet",
    "dashboard.wallet.desc": "BDAG balance, send/receive tokens",
    "dashboard.insurance": "BlockDAG Health Insurance",
    "dashboard.insurance.desc": "BlockDAG coverage & claims",
    "dashboard.compliance": "Security & Compliance",
    "dashboard.compliance.desc": "NIST & ISO standards alignment",
  },
  ha: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.records": "Bayanan Lafiya",
    "nav.appointments": "Yi Alƙawarin",
    "nav.bills": "Kuɗin Magani",
    "nav.donations": "Ba da Gudummawa",
    "nav.emergency": "Gaggawa",
    "nav.wallet": "Wallet na",
    "nav.insurance": "Inshorar",
    "nav.compliance": "Tsaro & Bin Ƙa'ida",
    "nav.back": "Koma",
    "nav.signOut": "Fita",
    
    // Dashboard
    "dashboard.welcome": "Barka da zuwa!",
    "dashboard.subtitle": "Sarrafa lafiyar ku daga dashboard guda ɗaya mai aminci",
    "dashboard.donate": "Ba da Gudummawa ga Marasa Lafiya",
    "dashboard.donate.desc": "Taimaka wa marasa lafiya da aka tabbatar",
    "dashboard.bookAppointment": "Yi Alƙawarin",
    "dashboard.bookAppointment.desc": "Bincika kuma yi alƙawari da asibitoci",
    "dashboard.payBill": "Biya Kuɗin Magani",
    "dashboard.payBill.desc": "Biya da BDAG tokens",
    "dashboard.records": "Bayanan Lafiya",
    "dashboard.records.desc": "Duba bayanan lafiya masu ɓoyewa",
    "dashboard.emergency": "Gaggawa",
    "dashboard.emergency.desc": "QR code & bayanan gaggawa",
    "dashboard.wallet": "Wallet na",
    "dashboard.wallet.desc": "Ma'auni na BDAG, aika/karɓa tokens",
    "dashboard.insurance": "Inshorar Lafiya na BlockDAG",
    "dashboard.insurance.desc": "Ɗaukar nauyi da da'awar BlockDAG",
    "dashboard.compliance": "Tsaro & Bin Ƙa'ida",
    "dashboard.compliance.desc": "Daidaitawa da ƙa'idodin NIST & ISO",
  },
  ig: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.records": "Ndekọ Ahụike",
    "nav.appointments": "Debe Oge",
    "nav.bills": "Ụgwọ Ọgwụ",
    "nav.donations": "Nye Onyinye",
    "nav.emergency": "Ihe Mberede",
    "nav.wallet": "Akpa Ego m",
    "nav.insurance": "Inshọransị",
    "nav.compliance": "Nchekwa & Nrube isi",
    "nav.back": "Laghachi azụ",
    "nav.signOut": "Pụọ",
    
    // Dashboard
    "dashboard.welcome": "Nnọọ ọzọ!",
    "dashboard.subtitle": "Jikwaa nlekọta ahụike gị site n'otu dashboard dị mma ma dị nchebe",
    "dashboard.donate": "Nye Ndị Ọrịa Onyinye",
    "dashboard.donate.desc": "Kwado ndị ọrịa a kwadoro",
    "dashboard.bookAppointment": "Debe Oge",
    "dashboard.bookAppointment.desc": "Chọọ ma debe oge na ụlọ ọgwụ",
    "dashboard.payBill": "Kwụọ Ụgwọ Ọgwụ",
    "dashboard.payBill.desc": "Kwụọ ụgwọ na BDAG tokens",
    "dashboard.records": "Ndekọ Ahụike",
    "dashboard.records.desc": "Lee data ahụike ezoro ezo",
    "dashboard.emergency": "Ihe Mberede",
    "dashboard.emergency.desc": "QR code & ozi dị mkpa",
    "dashboard.wallet": "Akpa Ego m",
    "dashboard.wallet.desc": "Ego BDAG, zipu/nata tokens",
    "dashboard.insurance": "Inshọransị Ahụike BlockDAG",
    "dashboard.insurance.desc": "Mkpuchi na nkwupụta BlockDAG",
    "dashboard.compliance": "Nchekwa & Nrube isi",
    "dashboard.compliance.desc": "Nkwado ụkpụrụ NIST & ISO",
  },
  yo: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.records": "Ìwé Ìlera",
    "nav.appointments": "Ṣe Àdéhùn",
    "nav.bills": "Owó Oogun",
    "nav.donations": "Fún ni Ẹ̀bùn",
    "nav.emergency": "Ìpáńilára",
    "nav.wallet": "Àpò Mi",
    "nav.insurance": "Ìdánilóore",
    "nav.compliance": "Ààbò & Ìbámu",
    "nav.back": "Padà",
    "nav.signOut": "Jade",
    
    // Dashboard
    "dashboard.welcome": "Káàbọ̀ padà!",
    "dashboard.subtitle": "Ṣàkóso ìlera rẹ láti orí dashboard kan tó wà láìléwu",
    "dashboard.donate": "Fún Àwọn Aláisàn Ẹ̀bùn",
    "dashboard.donate.desc": "Ṣe ìrànwọ́ fún àwọn aláisàn tí a ti fọwọ́sí",
    "dashboard.bookAppointment": "Ṣe Àdéhùn",
    "dashboard.bookAppointment.desc": "Wá kí o sì ṣe àdéhùn pẹ̀lú àwọn ilé-ìwòsàn",
    "dashboard.payBill": "San Owó Oogun",
    "dashboard.payBill.desc": "San pẹ̀lú BDAG tokens",
    "dashboard.records": "Ìwé Ìlera",
    "dashboard.records.desc": "Wo data ìlera tí a ti pa mọ́",
    "dashboard.emergency": "Ìpáńilára",
    "dashboard.emergency.desc": "QR code & ìròyìn pàtàkì",
    "dashboard.wallet": "Àpò Mi",
    "dashboard.wallet.desc": "Ìdogba BDAG, fi ránṣẹ́/gba tokens",
    "dashboard.insurance": "Ìdánilóore Ìlera BlockDAG",
    "dashboard.insurance.desc": "Ìbòòjì àti àwọn ìbéèrè BlockDAG",
    "dashboard.compliance": "Ààbò & Ìbámu",
    "dashboard.compliance.desc": "Ìbámu pẹ̀lú àwọn ìlànà NIST & ISO",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language") as Language;
    return saved || "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
