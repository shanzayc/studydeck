import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth, updateNotificationPreferences } from '../firebase/config';

export function useNotifications() {
  const [user] = useAuthState(auth);
  const [notifications, setNotifications] = useState({
    studyReminders: true,
    weeklyReports: false,
    newFeatures: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.notifications) {
          setNotifications(data.notifications);
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  const savePreferences = async (newPrefs) => {
    if (!user) return;

    setLoading(true);
    try {
      setNotifications(newPrefs);
      await updateNotificationPreferences({ notifications: newPrefs });
    } catch (err) {
      console.error("Failed to update preferences:", err);
      setNotifications(notifications); // revert on error
    } finally {
      setLoading(false);
    }
  };

  return { notifications, setNotifications, savePreferences, loading };
}
