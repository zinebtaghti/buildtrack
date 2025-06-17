import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, getDoc, doc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { Member } from '@/types';
import { getAssetUrl } from '@/config/cloudinary';

// Hook for fetching team members
export const useMembers = () => {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      
      try {
        const db = getFirestore();
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('name'));
        const querySnapshot = await getDocs(q);
        
        const storage = getStorage();
        const fetchedMembers: Member[] = [];
        
        for (const userDoc of querySnapshot.docs) {
          const data = userDoc.data();
          let avatarUrl;
          
          if (data.photoURL) {
            try {
              // Si c'est une URL Firebase Storage
              if (data.photoURL.startsWith('gs://')) {
                const storageRef = ref(storage, data.photoURL);
                avatarUrl = await getDownloadURL(storageRef);
              } 
              // Si c'est déjà une URL HTTP
              else {
                avatarUrl = data.photoURL;
              }
            } catch (error) {
              console.error('Error fetching avatar URL:', error);
              avatarUrl = undefined;
            }
          }

          fetchedMembers.push({
            id: userDoc.id,
            name: data.name || 'Unknown',
            role: data.role || 'Member',
            email: data.email || '',
            phone: data.phone || '',
            avatar: avatarUrl,
            projects: data.projects || [],
          });
        }
        
        setMembers(fetchedMembers);
        setError(null);
      } catch (err) {
        console.error("Error fetching members:", err);
        setError('Failed to load team members');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  return { members, loading, error };
};