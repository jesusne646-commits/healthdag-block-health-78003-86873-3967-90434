import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Shield, Loader2 } from "lucide-react";

interface EncryptionNoticeProps {
  open: boolean;
  title: string;
  description: string;
}

export const EncryptionNotice = ({ open, title, description }: EncryptionNoticeProps) => {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base space-y-3 pt-2">
            <p>
              {description}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="font-semibold">Waiting for wallet confirmation...</span>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};
