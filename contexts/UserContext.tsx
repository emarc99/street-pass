import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, Database } from '@/lib/supabase';
import { useWallet } from './WalletContext';

type User = Database['public']['Tables']['users']['Row'];

interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  updateUsername: (username: string) => Promise<boolean>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
  updateUsername: async () => false,
});

export const useUser = () => useContext(UserContext);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { address, isConnected } = useWallet();

  const refreshUser = async () => {
    if (!address) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', address.toLowerCase())
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user:', error);
        setLoading(false);
        return;
      }

      if (!data) {
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              wallet_address: address.toLowerCase(),
              username: null,
              level: 1,
              total_points: 0,
            },
          ])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating user:', insertError);
        } else {
          setUser(newUser);
        }
      } else {
        setUser(data);
      }
    } catch (error) {
      console.error('Error in refreshUser:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUsername = async (username: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('users')
        .update({ username })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating username:', error);
        return false;
      }

      await refreshUser();
      return true;
    } catch (error) {
      console.error('Error in updateUsername:', error);
      return false;
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      refreshUser();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [address, isConnected]);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        refreshUser,
        updateUsername,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
