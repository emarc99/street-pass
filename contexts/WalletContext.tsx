import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import { ethers } from 'ethers';

interface WalletContextType {
  address: string | null;
  provider: ethers.providers.Web3Provider | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  balance: string | null;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  provider: null,
  isConnected: false,
  isConnecting: false,
  connect: async () => {},
  disconnect: () => {},
  balance: null,
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);

  const isConnected = !!address;

  const connect = async () => {
    if (Platform.OS === 'web') {
      setIsConnecting(true);
      try {
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          const web3Provider = new ethers.providers.Web3Provider((window as any).ethereum);

          await (window as any).ethereum.request({ method: 'eth_requestAccounts' });

          const signer = web3Provider.getSigner();
          const userAddress = await signer.getAddress();

          const scrollChainId = 534352;
          const currentChainId = await web3Provider.getNetwork().then(n => n.chainId);

          if (currentChainId !== scrollChainId) {
            try {
              await (window as any).ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${scrollChainId.toString(16)}` }],
              });
            } catch (switchError: any) {
              if (switchError.code === 4902) {
                await (window as any).ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: `0x${scrollChainId.toString(16)}`,
                      chainName: 'Scroll',
                      nativeCurrency: {
                        name: 'Ether',
                        symbol: 'ETH',
                        decimals: 18,
                      },
                      rpcUrls: ['https://rpc.scroll.io'],
                      blockExplorerUrls: ['https://scrollscan.com'],
                    },
                  ],
                });
              }
            }
          }

          setProvider(web3Provider);
          setAddress(userAddress);

          const userBalance = await web3Provider.getBalance(userAddress);
          setBalance(ethers.utils.formatEther(userBalance));
        } else {
          alert('Please install MetaMask or another Web3 wallet');
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert('Wallet connection is only available on web platform for now');
    }
  };

  const disconnect = () => {
    setAddress(null);
    setProvider(null);
    setBalance(null);
  };

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAddress(accounts[0]);
        }
      });

      (window as any).ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        provider,
        isConnected,
        isConnecting,
        connect,
        disconnect,
        balance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
