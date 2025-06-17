import React, { useState } from 'react';
import { 
  View, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Text,
  Modal,
  Pressable,
  Platform,
  Dimensions
} from 'react-native';
import { Camera, ImagePlus, X, Edit2 } from 'lucide-react-native';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { useTheme } from '@/context/ThemeContext';

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  size?: number;
  folder?: string;
  tags?: string[];
  aspectRatio?: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  readonly?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  size = 120,
  folder,
  tags,
  aspectRatio = 1,
  maxWidth,
  maxHeight,
  quality,
  readonly = false,
}: ImageUploadProps) {
  const { loading, error, pickImage, takePhoto } = useMediaUpload();
  const [showOptions, setShowOptions] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { colors, isDarkMode } = useTheme();

  const handlePickImage = async () => {
    try {
      setShowOptions(false);
      const result = await pickImage({
        folder,
        tags,
        maxWidth,
        maxHeight,
        quality,
      });
      
      if (result?.url && onChange) {
        onChange(result.url);
      }
    } catch (err) {
      console.error('Failed to pick image:', err);
    }
  };

  const handleTakePhoto = async () => {
    try {
      setShowOptions(false);
      const result = await takePhoto({
        folder,
        tags,
        maxWidth,
        maxHeight,
        quality,
      });
      
      if (result?.url && onChange) {
        onChange(result.url);
      }
    } catch (err) {
      console.error('Failed to take photo:', err);
    }
  };

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
    },
    imageContainer: {
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: colors.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholder: {
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: `${colors.shadowColor}80`,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      color: colors.error,
      fontSize: 12,
      marginTop: 4,
      fontFamily: 'Inter-Regular',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: `${colors.shadowColor}80`,
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      padding: 16,
      maxWidth: Math.min(SCREEN_WIDTH, 500),
      width: '100%',
      alignSelf: 'center',
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDarkMode ? 0.3 : 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
    },
    closeButton: {
      padding: 4,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.inputBackground,
      marginBottom: 8,
    },
    lastOption: {
      marginBottom: Platform.OS === 'ios' ? 0 : 8,
    },
    optionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.buttonSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    optionContent: {
      flex: 1,
    },
    optionText: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      color: colors.text,
      marginBottom: 4,
    },
    optionSubtext: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
    },
    previewOverlay: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    previewHeader: {
      position: 'absolute',
      top: 40,
      right: 16,
      left: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 1,
    },
    previewButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${colors.shadowColor}80`,
      justifyContent: 'center',
      alignItems: 'center',
    },
    previewImage: {
      width: '100%',
      height: '100%',
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[
          styles.imageContainer, 
          { width: size, height: size / aspectRatio },
          !value && styles.placeholder
        ]}
        onPress={() => value ? setShowPreview(true) : !readonly && setShowOptions(true)}
        disabled={readonly && !value}
      >
        {value ? (
          <Image 
            source={{ uri: value }} 
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          !readonly && <ImagePlus size={24} color="#9CA3AF" />
        )}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FFF" />
          </View>
        )}
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Options Modal */}
      <Modal
        visible={showOptions}
        transparent
        onRequestClose={() => setShowOptions(false)}
        animationType="slide"
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowOptions(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Photo</Text>
              <TouchableOpacity 
                onPress={() => setShowOptions(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.option}
              onPress={handlePickImage}
            >
              <View style={styles.optionIcon}>
                <ImagePlus size={24} color="#0B5394" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionText}>Choose from Library</Text>
                <Text style={styles.optionSubtext}>Upload from your photo library</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.option, styles.lastOption]}
              onPress={handleTakePhoto}
            >
              <View style={styles.optionIcon}>
                <Camera size={24} color="#0B5394" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionText}>Take Photo</Text>
                <Text style={styles.optionSubtext}>Use your camera</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Preview Modal */}
      <Modal
        visible={showPreview}
        transparent
        onRequestClose={() => setShowPreview(false)}
        animationType="fade"
      >
        <View style={styles.previewOverlay}>
          <View style={styles.previewHeader}>
            <TouchableOpacity 
              style={styles.previewButton}
              onPress={() => setShowPreview(false)}
            >
              <X size={24} color="#FFF" />
            </TouchableOpacity>
            {!readonly && (
              <TouchableOpacity 
                style={styles.previewButton}
                onPress={() => {
                  setShowPreview(false);
                  setShowOptions(true);
                }}
              >
                <Edit2 size={24} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
          {value && (
            <Image 
              source={{ uri: value }} 
              style={styles.previewImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  imageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#E53935',
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxWidth: Math.min(SCREEN_WIDTH, 500),
    width: '100%',
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    marginBottom: 8,
  },
  lastOption: {
    marginBottom: Platform.OS === 'ios' ? 0 : 8,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#263238',
    marginBottom: 4,
  },
  optionSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#607D8B',
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewHeader: {
    position: 'absolute',
    top: 40,
    right: 16,
    left: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  previewButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
});