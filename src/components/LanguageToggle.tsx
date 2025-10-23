import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";

const languages = [
  { code: "en" as const, name: "English", flag: "🇬🇧" },
  { code: "ha" as const, name: "Hausa", flag: "🇳🇬" },
  { code: "ig" as const, name: "Igbo", flag: "🇳🇬" },
  { code: "yo" as const, name: "Yoruba", flag: "🇳🇬" },
];

export const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  const currentLanguage = languages.find((lang) => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative hover:scale-105 transition-all duration-300"
        >
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`cursor-pointer ${
              language === lang.code ? "bg-primary/10" : ""
            }`}
          >
            <span className="mr-2 text-lg">{lang.flag}</span>
            <span className="flex-1">{lang.name}</span>
            {language === lang.code && (
              <span className="text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
