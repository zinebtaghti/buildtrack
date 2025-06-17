import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  File,
  Download,
  Share2,
  Trash
} from 'lucide-react-native';
import { Document } from '@/types';

interface DocumentItemProps {
  document: Document;
}

export function DocumentItem({ document }: DocumentItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const getDocumentIcon = () => {
    switch (document.type) {
      case 'blueprint':
        return <FileText size={24} color="#0B5394" />;
      case 'image':
      case 'photo':
        return <ImageIcon size={24} color="#F6941D" />;
      case 'spreadsheet':
        return <FileSpreadsheet size={24} color="#2E7D32" />;
      default:
        return <File size={24} color="#607D8B" />;
    }
  };
  
  const handleDownload = () => {
    // Handle document download
    console.log('Download document:', document.id);
  };
  
  const handleShare = () => {
    // Handle document sharing
    console.log('Share document:', document.id);
  };
  
  const handleDelete = () => {
    // Handle document delete
    console.log('Delete document:', document.id);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          {getDocumentIcon()}
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.documentName}>{document.name}</Text>
          <Text style={styles.documentDetails}>
            {document.size} • {formatDate(document.date)}
          </Text>
          {document.project && (
            <View style={styles.projectTag}>
              <Text style={styles.projectText}>{document.project}</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
          <Download size={20} color="#607D8B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Share2 size={20} color="#607D8B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
          <Trash size={20} color="#E53935" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailsContainer: {
    flex: 1,
  },
  documentName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#263238',
    marginBottom: 4,
  },
  documentDetails: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#607D8B',
    marginBottom: 4,
  },
  projectTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  projectText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#0B5394',
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
  },
});