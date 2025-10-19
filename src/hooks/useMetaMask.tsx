import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface MetaMaskState {
  account: string | null;
  chainId: string | null;
  balance: string | null;
  isConnected: boolean;
  isMetaMaskInstalled: boolean;
}

const BLOCKDAG_TESTNET = {
  chainId: "0x413", // 1043 in hex
  chainName: "BlockDAG Testnet",
  nativeCurrency: {
    name: "BDAG",
    symbol: "BDAG",
    decimals: 18,
  },
  rpcUrls: ["https://relay.awakening.bdagscan.com"],
  blockExplorerUrls: ["https://awakening.bdagscan.com"],
};

export const useMetaMask = () => {
  const { toast } = useToast();
  const [state, setState] = useState<MetaMaskState>({
    account: null,
    chainId: null,
    balance: null,
    isConnected: false,
    isMetaMaskInstalled: typeof window !== "undefined" && typeof window.ethereum !== "undefined",
  });

  const getBalance = useCallback(async (account: string) => {
    if (!window.ethereum) return null;
    try {
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [account, "latest"],
      });
      // Convert from wei to BDAG
      const balanceInBDAG = parseInt(balance, 16) / 1e18;
      return balanceInBDAG.toFixed(4);
    } catch (error) {
      console.error("Error fetching balance:", error);
      return null;
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to use blockchain features",
        variant: "destructive",
      });
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      
      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      const balance = await getBalance(accounts[0]);

      setState({
        account: accounts[0],
        chainId,
        balance,
        isConnected: true,
        isMetaMaskInstalled: true,
      });

      toast({
        title: "Wallet Connected",
        description: `Connected to ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`,
      });
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    }
  }, [toast, getBalance]);

  const disconnectWallet = useCallback(() => {
    setState({
      account: null,
      chainId: null,
      balance: null,
      isConnected: false,
      isMetaMaskInstalled: state.isMetaMaskInstalled,
    });
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  }, [toast, state.isMetaMaskInstalled]);

  const addBlockDAGNetwork = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [BLOCKDAG_TESTNET],
      });
      
      toast({
        title: "Network Added",
        description: "BlockDAG Testnet has been added to MetaMask",
      });
    } catch (error: any) {
      console.error("Error adding network:", error);
      toast({
        title: "Failed to Add Network",
        description: error.message || "Could not add BlockDAG Testnet",
        variant: "destructive",
      });
    }
  }, [toast]);

  const switchToBlockDAG = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BLOCKDAG_TESTNET.chainId }],
      });
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        await addBlockDAGNetwork();
      } else {
        console.error("Error switching network:", error);
        toast({
          title: "Failed to Switch Network",
          description: error.message || "Could not switch to BlockDAG Testnet",
          variant: "destructive",
        });
      }
    }
  }, [addBlockDAGNetwork, toast]);

  const sendTransaction = useCallback(async (to: string, amount: string) => {
    if (!window.ethereum || !state.account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return null;
    }

    try {
      // Convert amount to wei (assuming amount is in BDAG)
      const amountInWei = "0x" + (parseFloat(amount) * 1e18).toString(16);

      const transactionHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [{
          from: state.account,
          to,
          value: amountInWei,
        }],
      });

      toast({
        title: "Transaction Sent",
        description: "Your transaction has been submitted to the blockchain",
      });

      return transactionHash;
    } catch (error: any) {
      console.error("Error sending transaction:", error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to send transaction",
        variant: "destructive",
      });
      return null;
    }
  }, [state.account, toast]);

  const refreshBalance = useCallback(async () => {
    if (state.account) {
      const balance = await getBalance(state.account);
      setState(prev => ({ ...prev, balance }));
    }
  }, [state.account, getBalance]);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setState(prev => ({ ...prev, account: accounts[0] }));
        getBalance(accounts[0]).then(balance => {
          setState(prev => ({ ...prev, balance }));
        });
      }
    };

    const handleChainChanged = (chainId: string) => {
      setState(prev => ({ ...prev, chainId }));
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [disconnectWallet, getBalance]);

  const isOnBlockDAGNetwork = state.chainId === BLOCKDAG_TESTNET.chainId;

  return {
    ...state,
    isOnBlockDAGNetwork,
    connectWallet,
    disconnectWallet,
    addBlockDAGNetwork,
    switchToBlockDAG,
    sendTransaction,
    refreshBalance,
  };
};

// Extend window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
