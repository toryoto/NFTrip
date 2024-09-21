import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../app/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface UserData {
  total_nfts: number;
}

export function useUserData() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('total_nfts')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setUserData(null);
      setLoading(false);
    }
  }, [user, fetchUserData]);

  const updateUserData = async (newTotalNFTs: number) => {
    if (!user) return;

    try {
      console.log('newTotalNFTs:', newTotalNFTs);
      console.log('updateUserDataが呼ばれました');
      const { error } = await supabase
        .from('users')
        .update({ total_nfts: newTotalNFTs })
        .eq('id', user.id);

      if (error) throw error;

      setUserData(prevData => {
        const newData = { ...prevData, total_nfts: newTotalNFTs };
        return newData;
      });

    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  return { userData, loading, fetchUserData, updateUserData };
}