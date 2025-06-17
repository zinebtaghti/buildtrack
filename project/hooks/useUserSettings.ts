import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuthContext } from '@/context/AuthContext';

export interface UserSettings {
  notificationsEnabled: boolean;
  darkModeEnabled: boolean;
  language: string;
  timezone: string;
}

export function useUserSettings() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    notificationsEnabled: true,
    darkModeEnabled: false,
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();

      if (userData?.settings) {
        setSettings(userData.settings);
      }
    } catch (err) {
      console.error('Error fetching user settings:', err);
      setError('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;

    try {
      // Mise à jour immédiate de l'état local
      setSettings(current => ({ ...current, ...newSettings }));

      // Mise à jour en arrière-plan dans Firebase
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        settings: {
          ...settings,
          ...newSettings,
        },
      });
    } catch (err) {
      // En cas d'erreur, on revient à l'état précédent
      console.error('Error updating user settings:', err);
      setError('Failed to update settings');
      setSettings(settings);
      throw err;
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
    refreshSettings: fetchSettings,
  };
}