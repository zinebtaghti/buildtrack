import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar as CalendarIcon, AlertTriangle } from 'lucide-react-native';
import { useTasks } from '@/hooks/useTasks';
import { useProject } from '@/hooks/useProject';
import { Header } from '@/components/ui/Header';
import { DatePicker } from '@/components/ui/DatePicker';

export default function EditTaskScreen() {
  const { id: projectId, taskId } = useLocalSearchParams();
  const router = useRouter();
  const { project } = useProject(projectId as string);
  const { tasks, updateTask, loading } = useTasks(projectId as string);
  const task = tasks?.find(t => t.id === taskId);

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState<Date>(task?.dueDate ? new Date(task.dueDate) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(task?.priority || 'medium');
  const [status, setStatus] = useState<'todo' | 'in-progress' | 'completed'>(task?.status || 'todo');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!task) {
      setError('Task not found');
      return;
    }

    setTitle(task.title);
    setDescription(task.description);
    setDueDate(new Date(task.dueDate || Date.now()));
    setPriority(task.priority);
    setStatus(task.status);
  }, [task]);

  if (!task) {
    return (
      <View style={styles.container}>
        <Header title="Edit Task" showBack />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Task not found</Text>
        </View>
      </View>
    );
  }

  const handleUpdateTask = async () => {
    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }

    try {
      await updateTask(taskId as string, {
        title,
        description,
        dueDate: dueDate.toISOString(),
        priority,
        status
      });
      
      router.back();
    } catch (err) {
      setError('Failed to update task. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Edit Task"
        showBack 
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {error && (
            <View style={styles.errorContainer}>
              <AlertTriangle size={18} color="#e53935" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Task Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter task title"
              value={title}
              onChangeText={setTitle}
              editable={!loading}
            />
          </View>

          <View style={styles.formGroup}>
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

          <View style={styles.formGroup}>
            <Text style={styles.label}>Due Date</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
              disabled={loading}
            >
              <CalendarIcon size={20} color="#607D8B" />
              <Text style={styles.dateText}>
                {dueDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusContainer}>
              <TouchableOpacity 
                style={[
                  styles.statusButton,
                  status === 'todo' && styles.statusButtonActive,
                  status === 'todo' && styles.statusButtonTodo
                ]}
                onPress={() => setStatus('todo')}
                disabled={loading}
              >
                <Text style={[
                  styles.statusButtonText,
                  status === 'todo' && styles.statusButtonTextActive
                ]}>To Do</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.statusButton,
                  status === 'in-progress' && styles.statusButtonActive,
                  status === 'in-progress' && styles.statusButtonInProgress
                ]}
                onPress={() => setStatus('in-progress')}
                disabled={loading}
              >
                <Text style={[
                  styles.statusButtonText,
                  status === 'in-progress' && styles.statusButtonTextActive
                ]}>In Progress</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.statusButton,
                  status === 'completed' && styles.statusButtonActive,
                  status === 'completed' && styles.statusButtonCompleted
                ]}
                onPress={() => setStatus('completed')}
                disabled={loading}
              >
                <Text style={[
                  styles.statusButtonText,
                  status === 'completed' && styles.statusButtonTextActive
                ]}>Completed</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
              <TouchableOpacity 
                style={[
                  styles.priorityButton,
                  priority === 'low' && styles.priorityButtonActive,
                  priority === 'low' && styles.priorityButtonLow
                ]}
                onPress={() => setPriority('low')}
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              >
                <Text style={[
                  styles.priorityButtonText,
                  priority === 'high' && styles.priorityButtonTextActive
                ]}>High</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleUpdateTask}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Updating Task...' : 'Update Task'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {showDatePicker && (
        <DatePicker
          value={dueDate}
          onChange={(newDate) => {
            setDueDate(newDate);
            setShowDatePicker(false);
          }}
          onClose={() => setShowDatePicker(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
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
  formGroup: {
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
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusButton: {
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
  statusButtonActive: {
    borderColor: 'transparent',
  },
  statusButtonTodo: {
    backgroundColor: '#607D8B20',
  },
  statusButtonInProgress: {
    backgroundColor: '#0B539420',
  },
  statusButtonCompleted: {
    backgroundColor: '#2E7D3220',
  },
  statusButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#263238',
  },
  statusButtonTextActive: {
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
  priorityButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#263238',
  },
  priorityButtonTextActive: {
    color: '#263238',
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
  submitButton: {
    backgroundColor: '#0B5394',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#fff',
  },
});
