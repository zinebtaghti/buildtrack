import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react-native';
import { useTasks } from '@/hooks/useTasks';
import { useProject } from '@/hooks/useProject';
import { Header } from '@/components/ui/Header';
import { DatePicker } from '@/components/ui/DatePicker';
import { VoiceNote } from '@/components/project/VoiceNote';
import { useAuthContext } from '@/context/AuthContext';

export default function CreateTaskScreen() {
  const { id: projectId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthContext();
  const { project } = useProject(projectId as string);
  const { createTask, loading } = useTasks(projectId as string);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [error, setError] = useState<string | null>(null);
  const [voiceNote, setVoiceNote] = useState<{ url: string; duration: number } | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleCreateTask = async () => {
    if (!user) {
      setError('You must be logged in to create a task');
      return;
    }

    if (!projectId) {
      setError('Project ID is required');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate.toISOString(),
        priority,
        status: 'todo' as const,
        projectId: projectId as string,
        assignedTo: user.uid, // Assign to current user by default
        ...(voiceNote && { voiceNote }),
      };

      await createTask(taskData);
      router.back();
    } catch (error: any) {
      console.error('Task creation error:', error);
      setError(error.message || 'Failed to create task');
      Alert.alert(
        'Error',
        'Failed to create task. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleVoiceNoteComplete = (url: string) => {
    setVoiceNote({ url, duration: 0 }); // Duration will be set by the audio player
  };

  const handleVoiceNoteDelete = () => {
    setVoiceNote(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <Header
        leftIcon={<ArrowLeft size={24} color="#000" />}
        onLeftPress={() => router.back()}
        title="Create Task"
      />
      
      <ScrollView style={styles.container}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Task Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter task title"
              value={title}
              onChangeText={setTitle}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter task description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Due Date</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <CalendarIcon size={20} color="#607D8B" />
              <Text style={styles.dateText}>
                {dueDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
              <TouchableOpacity 
                style={[
                  styles.priorityButton,
                  priority === 'low' && styles.priorityButtonActive,
                  priority === 'low' && styles.priorityButtonLow
                ]}
                onPress={() => setPriority('low')}
              >
                <Text style={[
                  styles.priorityButtonText,
                  priority === 'low' && styles.priorityButtonTextActive
                ]}>Low</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.priorityButton,
                  priority === 'medium' && styles.priorityButtonActive,
                  priority === 'medium' && styles.priorityButtonMedium
                ]}
                onPress={() => setPriority('medium')}
              >
                <Text style={[
                  styles.priorityButtonText,
                  priority === 'medium' && styles.priorityButtonTextActive
                ]}>Medium</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.priorityButton,
                  priority === 'high' && styles.priorityButtonActive,
                  priority === 'high' && styles.priorityButtonHigh
                ]}
                onPress={() => setPriority('high')}
              >
                <Text style={[
                  styles.priorityButtonText,
                  priority === 'high' && styles.priorityButtonTextActive
                ]}>High</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Voice Note */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Voice Note</Text>
            <VoiceNote
              onRecordingComplete={handleVoiceNoteComplete}
              onDelete={voiceNote ? handleVoiceNoteDelete : undefined}
              existingAudioUrl={voiceNote?.url}
              folder={`projects/${projectId}/tasks`}
              tags={['task-voice-note']}
              onUploadStart={() => setUploading(true)}
              onUploadComplete={() => setUploading(false)}
              onUploadError={(error) => {
                setError(error);
                setUploading(false);
              }}
            />
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <AlertTriangle size={20} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, (loading || uploading) && styles.buttonDisabled]}
            onPress={handleCreateTask}
            disabled={loading || uploading}
          >
            <Text style={styles.buttonText}>
              {loading || uploading ? 'Creating...' : 'Create Task'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showDatePicker && (
        <DatePicker
          value={dueDate}
          onChange={(newDate: Date) => {
            setDueDate(newDate);
            setShowDatePicker(false);
          }}
          onClose={() => setShowDatePicker(false)}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#263238',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#263238',
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  priorityButtonActive: {
    borderColor: 'transparent',
  },
  priorityButtonLow: {
    backgroundColor: '#E8F5E9',
  },
  priorityButtonMedium: {
    backgroundColor: '#FFF8E1',
  },
  priorityButtonHigh: {
    backgroundColor: '#FFEBEE',
  },
  priorityButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#607D8B',
  },
  priorityButtonTextActive: {
    color: '#263238',
  },
  button: {
    backgroundColor: '#0B5394',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#fff',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#e53935',
    marginLeft: 8,
  },
});
