const cloudinaryConfig = {
  cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  uploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '',
};

// Helper function to construct Cloudinary URL
export const getAssetUrl = (publicId: string, options: {
  resourceType?: 'image' | 'video';
  width?: number;
  height?: number;
  crop?: 'fill' | 'thumb' | 'scale';
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png' | 'mp4' | 'webm';
} = {}) => {
  const { cloudName } = cloudinaryConfig;
  if (!cloudName) return '';

  const transformations = [];
  
  if (options.width || options.height) {
    transformations.push(`c_${options.crop || 'fill'}`);
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
  }
  
  if (options.quality) {
    transformations.push(`q_${options.quality}`);
  }
  
  if (options.format && options.format !== 'auto') {
    transformations.push(`f_${options.format}`);
  }
  
  const transformationString = transformations.length > 0 ? transformations.join(',') + '/' : '';
  const resourceType = options.resourceType || 'image';
  
  return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${transformationString}${publicId}`;
};

// Helper function to upload media to Cloudinary
export const uploadToCloudinary = async (file: File | Blob, options: {
  resourceType?: 'image' | 'video' | 'raw';
  folder?: string;
  tags?: string[];
} = {}) => {
  // Validate required configuration
  const { cloudName, uploadPreset } = cloudinaryConfig;
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
  }

  console.log('Preparing upload to Cloudinary...');
  console.log('Environment check:', {
    hasCloudName: !!cloudName,
    hasUploadPreset: !!uploadPreset,
    resourceType: options.resourceType
  });

  // Determine resource type based on file type
  let resourceType = options.resourceType;
  if (!resourceType) {
    if (file.type.startsWith('image/')) {
      resourceType = 'image';
    } else if (file.type.startsWith('video/')) {
      resourceType = 'video';
    } else {
      resourceType = 'raw';
    }
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  
  if (options.folder) {
    formData.append('folder', options.folder);
  }
  
  if (options.tags) {
    formData.append('tags', options.tags.join(','));
  }

  console.log('FormData prepared with:', {
    hasFile: !!file,
    fileType: file.type,
    fileSize: file.size,
    resourceType,
    uploadPreset,
    folder: options.folder,
    tags: options.tags
  });

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  console.log('Upload URL:', uploadUrl);

  // Retry logic with exponential backoff
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      console.log(`Upload attempt ${retryCount + 1}/${maxRetries}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // Increase timeout to 120 seconds for large files
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          // Let the browser set the Content-Type with boundary
        },
        body: formData,
        signal: controller.signal,
        mode: 'cors',
        credentials: 'omit', // Don't send credentials for cross-origin requests
        keepalive: true, // Keep the connection alive
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cloudinary upload failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // If it's a client error (4xx), don't retry
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        // For server errors (5xx), retry
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Upload successful:', {
        publicId: data.public_id,
        url: data.secure_url,
        resourceType: data.resource_type
      });
      
      return data;

    } catch (error) {
      console.error(`Upload attempt ${retryCount + 1} failed:`, error);
      
      retryCount++;
      
      // If this was the last retry or it's a non-retryable error, throw
      if (retryCount >= maxRetries || 
          (error instanceof Error && 
           (error.message.includes('Upload failed: 4') || 
            error.name === 'AbortError'))) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s...
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.log(`Retrying upload in ${delay}ms...`);
    }
  }
};

// Helper function to upload base64-encoded media to Cloudinary
export const uploadBase64ToCloudinary = async (base64Data: string, options: {
  resourceType?: 'image' | 'video' | 'raw';
  folder?: string;
  tags?: string[];
  fileType?: string;
  public_id?: string;
} = {}) => {
  const { cloudName, uploadPreset } = cloudinaryConfig;
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration is missing');
  }

  console.log('Preparing base64 upload to Cloudinary...');
  console.log('Environment check:', {
    hasCloudName: !!cloudName,
    hasUploadPreset: !!uploadPreset,
    resourceType: options.resourceType
  });

  const formData = new FormData();
  const mimeType = options.fileType || 'application/octet-stream';
  formData.append('file', `data:${mimeType};base64,${base64Data}`);
  formData.append('upload_preset', uploadPreset);
  
  if (options.folder) {
    formData.append('folder', options.folder);
  }
  
  if (options.tags) {
    formData.append('tags', options.tags.join(','));
  }

  if (options.public_id) {
    formData.append('public_id', options.public_id);
  }

  console.log('FormData prepared with:', {
    hasFile: true,
    fileType: mimeType,
    folder: options.folder,
    tags: options.tags,
    resourceType: options.resourceType || 'raw',
    public_id: options.public_id
  });

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${options.resourceType || 'raw'}/upload`;
  console.log('Upload URL:', uploadUrl);

  // Retry logic with exponential backoff
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      console.log(`Upload attempt ${retryCount + 1}/${maxRetries}`);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cloudinary upload failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Upload successful:', {
        publicId: data.public_id,
        url: data.secure_url,
        resourceType: data.resource_type
      });
      
      return data;
    } catch (error) {
      console.error(`Upload attempt ${retryCount + 1} failed:`, error);
      retryCount++;
      
      if (retryCount >= maxRetries) {
        throw error;
      }
      
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      console.log(`Retrying upload in ${delay}ms...`);
    }
  }
};