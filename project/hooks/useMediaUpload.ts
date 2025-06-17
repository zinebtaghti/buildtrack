import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { uploadToCloudinary, uploadBase64ToCloudinary } from '@/config/cloudinary';

interface UploadOptions {
  folder?: string;
  tags?: string[];
  quality?: number;
  resourceType?: 'image' | 'video' | 'raw';
  maxWidth?: number;
  maxHeight?: number;
  public_id?: string;
}

interface UploadResult {
  publicId: string;
  url: string;
  width?: number;
  height?: number;
  format: string;
  resourceType: string;
}

export function useMediaUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async (options: UploadOptions = {}) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: options.quality || 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled) {
        const { uri } = result.assets[0];
        console.log('Reading image as base64...');
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64
        });

        console.log('Uploading image to Cloudinary...');
        const uploadResult = await uploadBase64ToCloudinary(base64, {
          resourceType: 'image',
          folder: options.folder || 'images',
          tags: options.tags,
          fileType: 'image/jpeg'
        });

        return {
          publicId: uploadResult.public_id,
          url: uploadResult.secure_url,
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          resourceType: uploadResult.resource_type
        };
      }
    } catch (err) {
      setError('Failed to pick image');
      throw err;
    }
  };

  const takePhoto = async (options: UploadOptions = {}) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Camera permission not granted');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: options.quality || 0.8,
      });

      if (!result.canceled) {
        const { uri } = result.assets[0];
        console.log('Reading photo as base64...');
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64
        });

        console.log('Uploading photo to Cloudinary...');
        const uploadResult = await uploadBase64ToCloudinary(base64, {
          resourceType: 'image',
          folder: options.folder || 'images',
          tags: options.tags,
          fileType: 'image/jpeg'
        });

        return {
          publicId: uploadResult.public_id,
          url: uploadResult.secure_url,
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          resourceType: uploadResult.resource_type
        };
      }
    } catch (err) {
      setError('Failed to take photo');
      throw err;
    }
  };

  const pickDocument = async (options: UploadOptions = {}) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true
      });

      if (!result.canceled) {
        const { uri, mimeType } = result.assets[0];
        try {
          console.log('Reading file as base64...');
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64
          });
          
          console.log('File read successfully, uploading...');
          return await uploadBase64ToCloudinary(base64, {
            ...options,
            resourceType: 'raw',
            fileType: mimeType
          });
        } catch (error) {
          console.error('Error reading file:', error);
          throw error;
        }
      }
    } catch (err) {
      const error = err as Error;
      setError('Failed to pick document: ' + error.message);
      throw error;
    }
  };

  const uploadFile = async (uri: string, options: UploadOptions = {}): Promise<UploadResult> => {
    setLoading(true);
    setError(null);

    try {
      console.log('Starting file upload process for URI:', uri);
      console.log('Upload options:', options);

      // For mobile platforms, we need to handle file:// URIs
      const fileUri = uri.startsWith('file://') ? uri : `file://${uri}`;
      
      const response = await fetch(fileUri, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
        },
        cache: 'no-store', // Prevent caching issues
      }).catch(err => {
        const error = err as Error;
        console.error('Failed to fetch file:', {
          error,
          message: error.message,
          uri: fileUri
        });
        throw error;
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const blob = await response.blob().catch(err => {
        const error = err as Error;
        console.error('Failed to create blob:', {
          error,
          message: error.message
        });
        throw error;
      });
      
      // Ensure proper content type for PDFs and DOCs
      const mimeType = options.resourceType === 'raw' ? 
        (uri.endsWith('.pdf') ? 'application/pdf' : 
         uri.endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 
         blob.type) : 
        blob.type;

      // Create a new blob with the correct type
      const typedBlob = new Blob([await blob.arrayBuffer()], { type: mimeType });
      
      console.log('Blob created:', {
        size: typedBlob.size,
        type: typedBlob.type
      });

      const result = await uploadToCloudinary(typedBlob, {
        ...options,
        resourceType: options.resourceType || (
          typedBlob.type.startsWith('image/') ? 'image' :
          typedBlob.type.startsWith('video/') ? 'video' : 'raw'
        )
      });

      return {
        publicId: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        resourceType: result.resource_type
      };
    } catch (err) {
      const error = err as Error;
      console.error('Upload failed:', error);
      setError(error.message || 'Upload failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const uploadAudio = async (uri: string, options: UploadOptions = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Generate a URL-safe file name
      const timestamp = new Date().getTime();
      const randomString = Math.random().toString(36).substring(7);
      const safeFolder = (options.folder || 'audio').replace(/[\/\\]/g, '_');
      
      console.log('Reading audio as base64...');
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64
      });

      console.log('Uploading audio to Cloudinary...');
      const uploadResult = await uploadBase64ToCloudinary(base64, {
        ...options,
        resourceType: 'video', // Cloudinary uses video type for audio
        folder: safeFolder,
        public_id: `voice_note_${timestamp}_${randomString}`,
        fileType: 'audio/mp4'
      });

      console.log('Audio upload successful:', uploadResult);
      return uploadResult;
    } catch (err: any) {
      console.error('Audio upload error:', err);
      setError(err.message || 'Failed to upload audio');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    pickImage,
    takePhoto,
    pickDocument,
    uploadFile,
    uploadAudio,
    loading,
    error
  };
}