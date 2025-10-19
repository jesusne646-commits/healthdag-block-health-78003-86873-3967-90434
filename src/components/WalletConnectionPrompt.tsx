import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

interface WalletConnectionPromptProps {
  open: boolean;
  onConnect: () => void;
  onSkip: () => void;
}

export const WalletConnectionPrompt = ({ open, onConnect, onSkip }: WalletConnectionPromptProps) => {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Wallet className="w-12 h-12 text-primary" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-xl">
            Connect Your MetaMask Wallet
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-3 text-base">
            <p className="font-semibold text-foreground">
              Secure your health data with blockchain encryption
            </p>
            <p>
              Connect your MetaMask wallet to enable encrypted features like:
            </p>
            <ul className="list-disc list-inside space-y-1 text-left">
              <li>Encrypted medical appointments</li>
              <li>Secure bill payments</li>
              <li>Protected medical records</li>
            </ul>
            <p className="text-sm text-muted-foreground pt-2">
              You can skip this step and connect later from your profile.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onSkip} className="w-full">
            Skip for Now
          </Button>
          <Button onClick={onConnect} className="w-full">
            Connect Wallet
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
