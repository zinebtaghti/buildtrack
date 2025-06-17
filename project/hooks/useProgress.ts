import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuthContext } from '@/context/AuthContext';

// Progress types
export interface ProgressUpdate {
  id: string;
  projectId: string;
  description: string;
  progress: number;
  images?: string[];
  audioNotes?: string[];
  createdBy: string;
  createdAt: string;
}

export type NewProgressUpdate = Omit<ProgressUpdate, 'id' | 'createdAt' | 'createdBy'>;

export function useProgress(projectId?: string) {
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  // Fetch progress updates
  const fetchProgressUpdates = async (projectId?: string) => {
    console.log('=== Fetch Progress Updates Debug ===');
    console.log('User:', user?.uid);
    console.log('Project ID:', projectId);

    if (!user) {
      console.log('No user found, skipping progress updates fetch');
      return;
    }

    if (!projectId) {
      console.log('No project ID provided');
      return;
    }

    console.log('Starting to fetch progress updates for project:', projectId);
    setLoading(true);
    setError(null);

    try {
      const progressRef = collection(db, 'progress');
      let q;

      if (projectId) {
        // Fetch updates for a specific project
        q = query(
          progressRef,
          where('projectId', '==', projectId),
          orderBy('createdAt', 'desc')
        );
        console.log('Query for specific project:', {
          collection: 'progress',
          where: { projectId },
          orderBy: 'createdAt'
        });
      } else {
        // Fetch all updates created by the user
        q = query(
          progressRef,
          where('createdBy', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        console.log('Query for user updates:', {
          collection: 'progress',
          where: { createdBy: user.uid },
          orderBy: 'createdAt'
        });
      }

      console.log('Executing query...');
      const querySnapshot = await getDocs(q);
      console.log('Query executed, got', querySnapshot.size, 'documents');

      if (querySnapshot.empty) {
        console.log('No documents found in the query');
      }

      const updates = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Document data:', {
          id: doc.id,
          projectId: data.projectId,
          createdBy: data.createdBy,
          createdAt: data.createdAt
        });
        return {
          id: doc.id,
          ...data
        };
      }) as ProgressUpdate[];

      console.log('Final progress updates list:', updates);
      setProgressUpdates(updates);
    } catch (err: any) {
      console.error('Detailed error fetching progress updates:', {
        error: err,
        errorMessage: err.message,
        errorCode: err.code,
        errorStack: err.stack
      });
      setError('Failed to fetch progress updates');
    } finally {
      setLoading(false);
    }
  };

  // Create new progress update
  const createProgressUpdate = async (updateData: Omit<ProgressUpdate, 'id' | 'createdAt' | 'createdBy'>) => {
    if (!user) throw new Error('User not authenticated');

    console.log('=== Creating Progress Update ===');
    console.log('Update Data:', updateData);
    console.log('User:', user.uid);

    setLoading(true);
    setError(null);

    try {
      const now = new Date().toISOString();
      const newUpdate = {
        ...updateData,
        createdAt: now,
        createdBy: user.uid,
        projectId: updateData.projectId // Ensure projectId is included
      };

      console.log('Saving to Firestore:', newUpdate);

      const progressRef = collection(db, 'progress');
      const docRef = await addDoc(progressRef, newUpdate);
      
      console.log('Document created with ID:', docRef.id);

      const createdUpdate = {
        id: docRef.id,
        ...newUpdate
      };

      console.log('Created update:', createdUpdate);

      setProgressUpdates(prev => [createdUpdate, ...prev]);
      return createdUpdate;
    } catch (err) {
      console.error('Error creating progress update:', {
        error: err,
        errorMessage: err.message,
        errorCode: err.code,
        errorStack: err.stack
      });
      setError('Failed to create progress update');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update progress update
  const updateProgressUpdate = async (updateId: string, updates: Partial<ProgressUpdate>) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      const updateRef = doc(db, 'progress', updateId);
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(updateRef, updateData);
      
      setProgressUpdates(prev => 
        prev.map(update => 
          update.id === updateId 
            ? { ...update, ...updateData }
            : update
        )
      );
    } catch (err) {
      console.error('Error updating progress update:', err);
      setError('Failed to update progress update');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete progress update
  const deleteProgressUpdate = async (updateId: string) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      await deleteDoc(doc(db, 'progress', updateId));
      setProgressUpdates(prev => prev.filter(update => update.id !== updateId));
    } catch (err) {
      console.error('Error deleting progress update:', err);
      setError('Failed to delete progress update');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch progress updates when user or projectId changes
  useEffect(() => {
    if (user) {
      fetchProgressUpdates(projectId);
    } else {
      setProgressUpdates([]);
    }
  }, [user, projectId]);

  return {
    progressUpdates,
    loading,
    error,
    createProgressUpdate,
    updateProgressUpdate,
    deleteProgressUpdate,
    refreshProgressUpdates: fetchProgressUpdates
  };
} 