import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useSignature = () => {
  const [isWaitingForSignature, setIsWaitingForSignature] = useState(false);
  const { toast } = useToast();

  const requestSignature = async (message: string): Promise<string | null> => {
    console.log("=== SIGNATURE REQUEST STARTED ===");
    console.log("Message:", message);
    
    // Check if MetaMask is installed
    if (!window.ethereum) {
      console.error("MetaMask not found");
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask extension to use encrypted features",
        variant: "destructive",
      });
      return null;
    }

    console.log("MetaMask detected, requesting signature...");

    try {
      setIsWaitingForSignature(true);
      console.log("Signature modal should now be visible");
      
      // Small delay to ensure UI updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Request accounts first
      console.log("Requesting accounts...");
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      }).catch((err: any) => {
        console.error("Error requesting accounts:", err);
        throw err;
      });

      console.log("Accounts received:", accounts);

      if (!accounts || accounts.length === 0) {
        console.error("No accounts found");
        toast({
          title: "No Account Connected",
          description: "Please connect your MetaMask wallet first",
          variant: "destructive",
        });
        return null;
      }

      console.log("Requesting signature from account:", accounts[0]);

      // Request signature with message
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, accounts[0]],
      }).catch((err: any) => {
        console.error("Error requesting signature:", err);
        throw err;
      });

      console.log("Signature received successfully:", signature.substring(0, 20) + "...");

      toast({
        title: "Signature Confirmed",
        description: "Your identity has been verified",
      });

      return signature;
    } catch (error: any) {
      console.error("=== SIGNATURE ERROR ===");
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Full error:", error);
      
      if (error.code === 4001) {
        toast({
          title: "Signature Rejected",
          description: "You rejected the signature request in MetaMask",
          variant: "destructive",
        });
      } else if (error.code === -32002) {
        toast({
          title: "Request Pending",
          description: "Please check MetaMask - a request is already pending",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signature Failed",
          description: error.message || "Failed to get signature from MetaMask",
          variant: "destructive",
        });
      }
      
      return null;
    } finally {
      // Ensure modal stays visible for at least a moment before closing
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log("Closing signature modal");
      setIsWaitingForSignature(false);
      console.log("=== SIGNATURE REQUEST ENDED ===");
    }
  };

  return {
    requestSignature,
    isWaitingForSignature,
  };
};
