import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
    "dashboard.buyBdag": "Buy BDAG",
    "dashboard.buyBdag.desc": "Purchase BDAG with your preferred payment method",
    
    // Buy BDAG
    "buyBdag.title": "Buy BDAG Tokens",
    "buyBdag.subtitle": "Purchase BDAG tokens using your preferred payment method",
    "buyBdag.exchangeRate": "Exchange Rate",
    "buyBdag.youPay": "You Pay",
    "buyBdag.youGet": "You Get",
    "buyBdag.processingFee": "Processing Fee",
    "buyBdag.total": "Total",
    "buyBdag.purchase": "Purchase Now",
    "buyBdag.history": "Purchase History",
    "buyBdag.method.card": "Credit/Debit Card",
    "buyBdag.method.card.desc": "Instant delivery • 3.5% fee",
    "buyBdag.method.bank": "Bank Transfer",
    "buyBdag.method.bank.desc": "Lower fees (1%) • 1-3 business days",
    "buyBdag.method.mobile": "Mobile Money",
    "buyBdag.method.mobile.desc": "M-Pesa, Airtel Money • 2% fee",
    "buyBdag.status.pending": "Pending",
    "buyBdag.status.processing": "Processing",
    "buyBdag.status.completed": "Completed",
    "buyBdag.status.failed": "Failed",
    
    // Faucet
    "faucet.title": "Free Test BDAG",
    "faucet.subtitle": "Claim free test tokens to try the platform",
    "faucet.claim": "Claim Free BDAG",
    "faucet.claimed": "Claimed Successfully!",
    "faucet.cooldown": "Next claim available in",
    "faucet.amount": "50 test BDAG",
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
    "dashboard.buyBdag": "Sayi BDAG",
    "dashboard.buyBdag.desc": "Sayi BDAG ta hanyar da kuka fi so",
    
    // Buy BDAG
    "buyBdag.title": "Sayi BDAG Tokens",
    "buyBdag.subtitle": "Sayi BDAG tokens ta hanyar da kuka fi so",
    "buyBdag.exchangeRate": "Darajar Musanya",
    "buyBdag.youPay": "Za ku biya",
    "buyBdag.youGet": "Za ku samu",
    "buyBdag.processingFee": "Kuɗin Aiki",
    "buyBdag.total": "Jimla",
    "buyBdag.purchase": "Saya Yanzu",
    "buyBdag.history": "Tarihin Sayayya",
    "buyBdag.method.card": "Katin Basira/Dinari",
    "buyBdag.method.card.desc": "Kai tsaye • 3.5% kuɗi",
    "buyBdag.method.bank": "Canja Banki",
    "buyBdag.method.bank.desc": "Ƙarancin kuɗi (1%) • 1-3 kwanaki",
    "buyBdag.method.mobile": "Kuɗin Wayar Hannu",
    "buyBdag.method.mobile.desc": "M-Pesa, Airtel Money • 2% kuɗi",
    "buyBdag.status.pending": "Ana Jira",
    "buyBdag.status.processing": "Ana Aiki",
    "buyBdag.status.completed": "An Gama",
    "buyBdag.status.failed": "Ya Kasa",
    
    // Faucet
    "faucet.title": "BDAG Kyauta",
    "faucet.subtitle": "Karɓi tokens kyauta don gwada dandamali",
    "faucet.claim": "Karɓi BDAG Kyauta",
    "faucet.claimed": "An Karɓa Nasara!",
    "faucet.cooldown": "Karɓa na gaba yana samuwa a",
    "faucet.amount": "50 BDAG na gwaji",
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
    "dashboard.buyBdag": "Zụta BDAG",
    "dashboard.buyBdag.desc": "Zụta BDAG site n'ụzọ ịchọrọ",
    
    // Buy BDAG
    "buyBdag.title": "Zụta BDAG Tokens",
    "buyBdag.subtitle": "Zụta BDAG tokens site n'ụzọ ịchọrọ",
    "buyBdag.exchangeRate": "Ọnụego Mgbanwe",
    "buyBdag.youPay": "Ị ga-akwụ",
    "buyBdag.youGet": "Ị ga-enweta",
    "buyBdag.processingFee": "Ụgwọ Nhazi",
    "buyBdag.total": "Mkpokọta",
    "buyBdag.purchase": "Zụta Ugbu a",
    "buyBdag.history": "Akụkọ Ịzụta",
    "buyBdag.method.card": "Kaadị Kredit/Debit",
    "buyBdag.method.card.desc": "Nnyefe ozugbo • 3.5% ụgwọ",
    "buyBdag.method.bank": "Mbufe Ụlọ Akụ",
    "buyBdag.method.bank.desc": "Ụgwọ dị ala (1%) • 1-3 ụbọchị",
    "buyBdag.method.mobile": "Ego Ekwe ntị",
    "buyBdag.method.mobile.desc": "M-Pesa, Airtel Money • 2% ụgwọ",
    "buyBdag.status.pending": "Na-eche",
    "buyBdag.status.processing": "Na-ahazi",
    "buyBdag.status.completed": "Emechara",
    "buyBdag.status.failed": "Adaala",
    
    // Faucet
    "faucet.title": "BDAG Efu",
    "faucet.subtitle": "Nweta tokens efu iji nwalee ikpo okwu",
    "faucet.claim": "Nweta BDAG Efu",
    "faucet.claimed": "Nwetara ya nke ọma!",
    "faucet.cooldown": "Ọzọ ga-adị na",
    "faucet.amount": "50 BDAG nnwale",
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
    "dashboard.buyBdag": "Ra BDAG",
    "dashboard.buyBdag.desc": "Ra BDAG pẹ̀lú ọ̀nà ìsanwó tí o fẹ́",
    
    // Buy BDAG
    "buyBdag.title": "Ra Àwọn BDAG Tokens",
    "buyBdag.subtitle": "Ra àwọn BDAG tokens nípasẹ̀ ọ̀nà ìsanwó tí o fẹ́",
    "buyBdag.exchangeRate": "Òṣùwọ̀n Pàṣípààrọ̀",
    "buyBdag.youPay": "Ìwọ yóò san",
    "buyBdag.youGet": "Ìwọ yóò gbà",
    "buyBdag.processingFee": "Owó Ìṣiṣẹ́",
    "buyBdag.total": "Àpapọ̀",
    "buyBdag.purchase": "Ra Báyìí",
    "buyBdag.history": "Ìtàn Ìrà",
    "buyBdag.method.card": "Káàdì Kirẹditi/Dẹ́bìtì",
    "buyBdag.method.card.desc": "Ìfifiránṣẹ́ lẹ́sẹ̀kẹsẹ̀ • 3.5% owó",
    "buyBdag.method.bank": "Gbígbé Owó Ilé-ìfowópamọ́",
    "buyBdag.method.bank.desc": "Owó kékeré (1%) • 1-3 ọjọ́",
    "buyBdag.method.mobile": "Owó Fóònù Aláìbọ̀",
    "buyBdag.method.mobile.desc": "M-Pesa, Airtel Money • 2% owó",
    "buyBdag.status.pending": "Ń dúró",
    "buyBdag.status.processing": "Ń ṣiṣẹ́",
    "buyBdag.status.completed": "Ti parí",
    "buyBdag.status.failed": "Kùnà",
    
    // Faucet
    "faucet.title": "BDAG Ọ̀fẹ́",
    "faucet.subtitle": "Gba àwọn tokens ọ̀fẹ́ láti gbìyànjú pẹpẹ",
    "faucet.claim": "Gba BDAG Ọ̀fẹ́",
    "faucet.claimed": "A ti gba rẹ̀ ní àṣeyọrí!",
    "faucet.cooldown": "Ìgbà míràn wà ní",
    "faucet.amount": "50 BDAG ìdánwò",
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
