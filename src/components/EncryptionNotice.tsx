import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Shield, Loader2 } from "lucide-react";

interface EncryptionNoticeProps {
  open: boolean;
  title: string;
  description: string;
}

export const EncryptionNotice = ({ open, title, description }: EncryptionNoticeProps) => {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20"></div>
              <div className="relative p-4 bg-primary/10 rounded-full">
                <Shield className="w-12 h-12 text-primary animate-pulse" />
              </div>
            </div>
          </div>
          <AlertDialogTitle className="text-center text-xl">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-3 text-base">
            <p className="font-semibold text-foreground">
              {description}
            </p>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Waiting for confirmation...</span>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};
