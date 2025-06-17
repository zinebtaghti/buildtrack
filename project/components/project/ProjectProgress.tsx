import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Project } from '@/types';
import { Camera, Mic, CircleCheck as CheckCircle, Plus, Upload, ChevronRight, Clock, Trash2 } from 'lucide-react-native';
import { useProgress, ProgressUpdate } from '@/hooks/useProgress';
import { useAuthContext } from '@/context/AuthContext';
import { VoiceNote } from './VoiceNote';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useProjects } from '@/hooks/useProjects';

interface ProjectProgressProps {
  project: Project;
}

interface NewUpdate {
  description: string;
  progress: number;
  images: string[];
  audioNotes: string[];
}

// Sub-components for better organization
function ProgressOverview({ progress, status }: { progress: number; status: string }) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return styles.statuscompleted;
      case 'on-hold':
        return styles['status-on-hold'];
      default:
        return styles.statusactive;
    }
  };

  return (
    <View style={styles.overviewCard}>
      <Text style={styles.overviewTitle}>Project Progress</Text>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progress || 0}%` },
              status === 'completed' ? styles.progressCompleted :
              status === 'on-hold' ? styles.progressPaused :
              styles.progressActive
            ]} 
          />
        </View>
        <Text style={styles.progressPercentage}>{progress || 0}%</Text>
      </View>
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, getStatusStyle(status)]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>
    </View>
  );
}

function UpdateForm({
  newUpdate,
  onUpdateChange,
  onCancel,
  onSubmit,
  onTakePhoto,
  onPickImage,
  onVoiceNoteComplete,
  onVoiceNoteDelete
}: {
  newUpdate: NewUpdate;
  onUpdateChange: (update: NewUpdate) => void;
  onCancel: () => void;
  onSubmit: () => void;
  onTakePhoto: () => void;
  onPickImage: () => void;
  onVoiceNoteComplete: (url: string) => void;
  onVoiceNoteDelete: () => void;
}) {
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const handleProgressChange = (increment: boolean) => {
    onUpdateChange({
      ...newUpdate,
      progress: Math.max(0, Math.min(100, newUpdate.progress + (increment ? 5 : -5)))
    });
  };

  return (
    <View style={styles.updateForm}>
      <TextInput
        style={styles.input}
        placeholder="What's the latest progress?"
        value={newUpdate.description}
        onChangeText={(text) => onUpdateChange({ ...newUpdate, description: text })}
        multiline
        numberOfLines={3}
      />

      <View style={styles.progressControls}>
        <Text style={styles.progressLabel}>Progress: {newUpdate.progress}%</Text>
        <View style={styles.progressButtons}>
          <TouchableOpacity 
            style={styles.progressButton}
            onPress={() => handleProgressChange(false)}
            disabled={newUpdate.progress <= 0}
          >
            <Text style={styles.progressButtonText}>-5%</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.progressButton}
            onPress={() => handleProgressChange(true)}
            disabled={newUpdate.progress >= 100}
          >
            <Text style={styles.progressButtonText}>+5%</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mediaButtons}>
        <TouchableOpacity 
          style={styles.mediaButton}
          onPress={() => setShowImageOptions(true)}
        >
          <Camera size={20} color="#2196F3" />
          <Text style={styles.mediaButtonText}>Add Photo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.mediaButton}
          onPress={() => setIsRecording(true)}
        >
          <Mic size={20} color="#2196F3" />
          <Text style={styles.mediaButtonText}>Voice Note</Text>
        </TouchableOpacity>
      </View>

      {showImageOptions && (
        <View style={styles.imageOptions}>
          <TouchableOpacity
            style={styles.imageOptionButton}
            onPress={() => {
              onTakePhoto();
              setShowImageOptions(false);
            }}
          >
            <Camera size={20} color="#2196F3" />
            <Text style={styles.imageOptionText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.imageOptionButton}
            onPress={() => {
              onPickImage();
              setShowImageOptions(false);
            }}
          >
            <Upload size={20} color="#2196F3" />
            <Text style={styles.imageOptionText}>Upload Photo</Text>
          </TouchableOpacity>
        </View>
      )}

      {isRecording && (
        <VoiceNote
          onRecordingComplete={(url) => {
            onVoiceNoteComplete(url);
            setIsRecording(false);
          }}
          onDelete={onVoiceNoteDelete}
        />
      )}

      {newUpdate.audioNotes.map((audioUrl, idx) => (
        <VoiceNote
          key={idx}
          existingAudioUrl={audioUrl}
          onRecordingComplete={(url) => {
            onUpdateChange({
              ...newUpdate,
              audioNotes: newUpdate.audioNotes.map((note, i) => i === idx ? url : note)
            });
          }}
          onDelete={() => {
            onUpdateChange({
              ...newUpdate,
              audioNotes: newUpdate.audioNotes.filter((_, i) => i !== idx)
            });
          }}
        />
      ))}

      <View style={styles.formActions}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={onSubmit}
        >
          <Text style={styles.submitButtonText}>Post Update</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ProjectProgressUpdatesList({ updates, currentUserId, onDeleteUpdate }: { 
  updates: ProgressUpdate[]; 
  currentUserId?: string;
  onDeleteUpdate: (updateId: string) => void;
}) {
  return (
    <View style={styles.updatesList}>
      {updates?.map((update) => (
        <View key={update.id} style={styles.updateCard}>
          <View style={styles.updateHeader}>
            <View style={styles.updateMeta}>
              <Text style={styles.updateAuthor}>
                {update.createdBy === currentUserId ? 'You' : 'Team member'}
              </Text>
              <View style={styles.updateTime}>
                <Clock size={14} color="#6B7280" />
                <Text style={styles.updateTimeText}>
                  {new Date(update.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <View style={styles.updateActions}>
              <Text style={styles.progressTag}>{update.progress}%</Text>
              {update.createdBy === currentUserId && (
                <TouchableOpacity 
                  onPress={() => onDeleteUpdate(update.id)}
                  style={styles.deleteButton}
                >
                  <Trash2 size={18} color="#DC2626" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <Text style={styles.updateDescription}>{update.description}</Text>

          {update.audioNotes?.map((audioUrl, idx) => (
            <VoiceNote
              key={idx}
              existingAudioUrl={audioUrl}
              onRecordingComplete={() => {}}
              onDelete={() => {}}
            />
          ))}

          {update.images && update.images.length > 0 && (
            <View style={styles.updateImages}>
              {update.images.map((image, idx) => (
                <ImageUpload
                  key={idx}
                  value={image}
                  size={100}
                  readonly
                />
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

export function ProjectProgress({ project }: ProjectProgressProps) {
  const { user } = useAuthContext();
  const { progressUpdates, loading, error, createProgressUpdate, refreshProgressUpdates, deleteProgressUpdate } = useProgress(project.id);
  const { updateProject } = useProjects();
  const { pickImage, takePhoto } = useMediaUpload();
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);
  const [newUpdate, setNewUpdate] = useState<NewUpdate>({
    description: '',
    progress: typeof project.progress === 'number' ? project.progress : 0,
    images: [],
    audioNotes: []
  });

  useEffect(() => {
    refreshProgressUpdates(project.id);
  }, [project.id]);

  const handleAddUpdate = async () => {
    if (!newUpdate.description.trim()) {
      Alert.alert('Error', 'Please enter a description for the update');
      return;
    }

    try {
      await createProgressUpdate({
        projectId: project.id,
        description: newUpdate.description,
        progress: typeof newUpdate.progress === 'number' ? newUpdate.progress : 0,
        images: newUpdate.images,
        audioNotes: newUpdate.audioNotes
      });

      await updateProject(project.id, {
        progress: newUpdate.progress
      });

      setNewUpdate({
        description: '',
        progress: typeof project.progress === 'number' ? project.progress : 0,
        images: [],
        audioNotes: []
      });
      setIsAddingUpdate(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to create progress update');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await takePhoto({
        folder: `projects/${project.id}/progress/images`,
        tags: ['progress', 'image', project.id],
        quality: 0.8
      });
      
      if (result?.url) {
        setNewUpdate(prev => ({
          ...prev,
          images: [...prev.images, result.url]
        }));
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await pickImage({
        folder: `projects/${project.id}/progress/images`,
        tags: ['progress', 'image', project.id],
        quality: 0.8
      });
      
      if (result?.url) {
        setNewUpdate(prev => ({
          ...prev,
          images: [...prev.images, result.url]
        }));
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleDeleteUpdate = async (updateId: string) => {
    Alert.alert(
      'Delete Progress Update',
      'Are you sure you want to delete this update?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProgressUpdate(updateId);
              await refreshProgressUpdates(project.id);
            } catch (err) {
              Alert.alert('Error', 'Failed to delete progress update');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading progress...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => refreshProgressUpdates(project.id)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ProgressOverview 
        progress={project.progress || 0} 
        status={project.status} 
      />

      {!isAddingUpdate && (
        <TouchableOpacity 
          style={styles.addUpdateButton}
          onPress={() => setIsAddingUpdate(true)}
        >
          <Plus size={20} color="#2196F3" />
          <Text style={styles.addUpdateText}>Add Progress Update</Text>
        </TouchableOpacity>
      )}

      {isAddingUpdate && (
        <UpdateForm
          newUpdate={newUpdate}
          onUpdateChange={setNewUpdate}
          onCancel={() => setIsAddingUpdate(false)}
          onSubmit={handleAddUpdate}
          onTakePhoto={handleTakePhoto}
          onPickImage={handlePickImage}
          onVoiceNoteComplete={(url) => setNewUpdate(prev => ({
            ...prev,
            audioNotes: [...prev.audioNotes, url]
          }))}
          onVoiceNoteDelete={() => setNewUpdate(prev => ({
            ...prev,
            audioNotes: prev.audioNotes.slice(0, -1)
          }))}
        />
      )}

      <ProjectProgressUpdatesList 
        updates={progressUpdates || []} 
        currentUserId={user?.uid}
        onDeleteUpdate={handleDeleteUpdate}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter-Regular'
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    fontFamily: 'Inter-Regular',
    marginBottom: 12
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EF4444',
    borderRadius: 8
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Medium'
  },
  overviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3
  },
  overviewTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 4
  },
  progressActive: {
    backgroundColor: '#2196F3'
  },
  progressCompleted: {
    backgroundColor: '#10B981'
  },
  progressPaused: {
    backgroundColor: '#F59E0B'
  },
  progressPercentage: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    minWidth: 45
  },
  statusContainer: {
    flexDirection: 'row'
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusactive: {
    backgroundColor: '#EFF6FF'
  },
  statuscompleted: {
    backgroundColor: '#ECFDF5'
  },
  'status-on-hold': {
    backgroundColor: '#FEF3C7'
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize'
  },
  addUpdateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    margin: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed'
  },
  addUpdateText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#2196F3'
  },
  updateForm: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 8
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    textAlignVertical: 'top'
  },
  progressControls: {
    marginBottom: 16
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8
  },
  progressButtons: {
    flexDirection: 'row',
    gap: 8
  },
  progressButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6'
  },
  progressButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151'
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#EFF6FF'
  },
  mediaButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2196F3'
  },
  imageOptions: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: -8,
    marginBottom: 16,
    padding: 8,
    gap: 8
  },
  imageOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6'
  },
  imageOptionText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151'
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6'
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4B5563'
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2196F3'
  },
  submitButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#fff'
  },
  updatesList: {
    padding: 16,
    paddingTop: 0
  },
  updateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  updateMeta: {
    flex: 1
  },
  updateAuthor: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginBottom: 4
  },
  updateTime: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  updateTimeText: {
    marginLeft: 4,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280'
  },
  progressTag: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2196F3',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12
  },
  updateDescription: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12
  },
  updateImages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    marginLeft: 12
  }
});