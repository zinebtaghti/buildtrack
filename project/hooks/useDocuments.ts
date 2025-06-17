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
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuthContext } from '@/context/AuthContext';
import { uploadBase64ToCloudinary } from '@/config/cloudinary';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

// Document types
export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'other';
  fileUrl: string;
  thumbnailUrl?: string;
  size: number;
  projectId?: string;
  uploadedBy: string;
  uploadedAt: string;
  tags?: string[];
}

export function useDocuments() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);

  const fetchDocuments = async (projectId?: string) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let q = query(
        collection(db, 'documents'),
        orderBy('uploadedAt', 'desc')
      );
      
      if (projectId) {
        q = query(q, where('projectId', '==', projectId));
      }
      
      const querySnapshot = await getDocs(q);
      const docs: Document[] = [];
      
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() } as Document);
      });
      
      setDocuments(docs);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (projectId?: string) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true
      });

      if (!result.canceled) {
        const { uri, name, size, mimeType } = result.assets[0];

        // Sanitize file name and get extension
        const sanitizedName = name.replace(/[/\\?%*:|"<>]/g, '-');
        const fileExtension = sanitizedName.split('.').pop()?.toLowerCase() || '';
        
        // Create a simplified mime type that won't cause issues
        const simplifiedMimeType = fileExtension === 'pdf' ? 'application/pdf' : 'application/docx';

        // Create a unique public_id without extension
        const baseFileName = sanitizedName.replace(/\.[^/.]+$/, "");
        const timestamp = Date.now();
        const public_id = `${baseFileName}-${timestamp}`;

        console.log('Reading document as base64...');
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64
        });

        console.log('Uploading document to Cloudinary...');
        const uploadResult = await uploadBase64ToCloudinary(base64, {
          resourceType: 'raw',
          folder: 'documents',
          tags: ['document', projectId ? 'project' : 'general'],
          fileType: simplifiedMimeType,
          public_id: public_id
        });

        console.log('Document uploaded successfully, saving to Firestore...');

        // Create document data without undefined values
        const docData: any = {
          name: sanitizedName,
          type: fileExtension,
          fileUrl: uploadResult.secure_url,
          size,
          uploadedBy: user.uid,
          uploadedAt: Timestamp.now(),
          tags: projectId ? ['document', 'project'] : ['document', 'general']
        };

        // Only add projectId if it exists
        if (projectId) {
          docData.projectId = projectId;
        }

        console.log('Saving document data:', docData);
        await addDoc(collection(db, 'documents'), docData);
        await fetchDocuments(projectId);
        
        return {
          ...uploadResult,
          name: sanitizedName,
          size
        };
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error uploading document:', error);
      setError(error.message || 'Error uploading document');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);

      // Delete from Firestore
      await deleteDoc(doc(db, 'documents', documentId));
      
      // Update local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDocument = async (documentId: string, updates: Partial<Document>) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);

      // Update in Firestore
      const docRef = doc(db, 'documents', documentId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId ? { ...doc, ...updates } : doc
      ));
    } catch (err) {
      console.error('Error updating document:', err);
      setError('Failed to update document');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    updateDocument
  };
}