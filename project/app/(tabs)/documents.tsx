import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useDocuments, Document } from '@/hooks/useDocuments';
import { Header } from '@/components/ui/Header';
import { FileText, Upload, Trash2, Download, Filter, Search } from 'lucide-react-native';
import { useAuthContext } from '@/context/AuthContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function DocumentsScreen() {
  const { documents, loading, error, fetchDocuments, uploadDocument, deleteDocument } = useDocuments();
  const { user } = useAuthContext();
  const [filter, setFilter] = useState<'all' | 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async () => {
    try {
      await uploadDocument();
    } catch (err) {
      console.error('Error uploading document:', err);
    }
  };

  const handleDelete = async (documentId: string) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocument(documentId);
            } catch (err) {
              console.error('Error deleting document:', err);
            }
          }
        }
      ]
    );
  };

  const handleDownload = async (document: Document) => {
    try {
      const fileUri = FileSystem.documentDirectory + document.name;
      const downloadResult = await FileSystem.downloadAsync(document.fileUrl, fileUri);
      
      if (downloadResult.status === 200) {
        await Sharing.shareAsync(downloadResult.uri);
      } else {
        throw new Error('Download failed');
      }
    } catch (err) {
      console.error('Error downloading document:', err);
      Alert.alert('Error', 'Failed to download document');
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesFilter = filter === 'all' || doc.type === filter;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading && documents.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0B5394" />
        <Text style={styles.loadingText}>Loading documents...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => fetchDocuments()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Documents" />
      
      <View style={styles.toolbar}>
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={handleUpload}
        >
          <Upload size={20} color="#fff" />
          <Text style={styles.uploadButtonText}>Upload</Text>
        </TouchableOpacity>
        
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'pdf' && styles.filterButtonActive]}
            onPress={() => setFilter('pdf')}
          >
            <Text style={[styles.filterButtonText, filter === 'pdf' && styles.filterButtonTextActive]}>
              PDF
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'docx' && styles.filterButtonActive]}
            onPress={() => setFilter('docx')}
          >
            <Text style={[styles.filterButtonText, filter === 'docx' && styles.filterButtonTextActive]}>
              DOCX
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'xls' && styles.filterButtonActive]}
            onPress={() => setFilter('xls')}
          >
            <Text style={[styles.filterButtonText, filter === 'xls' && styles.filterButtonTextActive]}>
              XLS
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredDocuments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FileText size={48} color="#90A4AE" />
            <Text style={styles.emptyText}>No documents found</Text>
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={handleUpload}
            >
              <Upload size={20} color="#fff" />
              <Text style={styles.uploadButtonText}>Upload Document</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredDocuments.map(document => (
            <View key={document.id} style={styles.documentCard}>
              <View style={styles.documentInfo}>
                <FileText size={24} color="#0B5394" />
                <View style={styles.documentDetails}>
                  <Text style={styles.documentName}>{document.name}</Text>
                  <Text style={styles.documentMeta}>
                    {new Date(document.uploadedAt).toLocaleDateString()} • {Math.round(document.size / 1024)} KB
                  </Text>
                </View>
              </View>
              
              <View style={styles.documentActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleDownload(document)}
                >
                  <Download size={20} color="#0B5394" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(document.id)}
                >
                  <Trash2 size={20} color="#E53935" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#607D8B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#E53935',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0B5394',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B5394',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 16,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  filterContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  filterButtonActive: {
    backgroundColor: '#E3F2FD',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#607D8B',
    fontFamily: 'Inter-Medium',
  },
  filterButtonTextActive: {
    color: '#0B5394',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#607D8B',
    marginTop: 12,
    marginBottom: 24,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  documentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    color: '#263238',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 14,
    color: '#607D8B',
    fontFamily: 'Inter-Regular',
  },
  documentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
});