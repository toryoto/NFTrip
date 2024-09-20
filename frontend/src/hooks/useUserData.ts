import { useState, useEffect } from 'react';
import { useAuth } from '../app/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface UserData {
  total_nfts: number;
}

export function useUserData() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setUserData(null);
      setLoading(false);
    }
  }, [user]);

  const fetchUserData = async () => {
    setLoading(true);
		// API化してもいいかも
    try {
      const { data, error } = await supabase
        .from('users')
        .select('total_nfts')
        .eq('id', user!.id)
        .single();

      if (error) throw error;

      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = () => {
    if (user) {
      fetchUserData();
    }
  };

  return { userData, loading, refreshUserData };
}