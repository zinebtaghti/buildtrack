import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, UserCircle2, Clock, Edit2, CheckCircle, AlertCircle, Trash } from 'lucide-react-native';
import { useTasks } from '@/hooks/useTasks';
import { useProject } from '@/hooks/useProject';
import { Header } from '@/components/ui/Header';
import { VoiceNote } from '@/components/project/VoiceNote';

export default function TaskDetailsScreen() {
  const { id: projectId, taskId } = useLocalSearchParams();
  const router = useRouter();
  const { project } = useProject(projectId as string);
  const { tasks, updateTask, deleteTask, loading } = useTasks(projectId as string);
  const [updating, setUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const task = tasks?.find(t => t.id === taskId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#2E7D32';
      case 'in-progress':
        return '#0B5394';
      case 'todo':
      default:
        return '#607D8B';
    }
  };

  const handleStatusChange = async (newStatus: 'todo' | 'in-progress' | 'completed') => {
    if (updating) return;
    setUpdating(true);
    try {
      await updateTask(taskId as string, { status: newStatus });
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTask = async () => {
    if (updating) return;
    setUpdating(true);
    try {
      await deleteTask(taskId as string);
      router.back();
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setUpdating(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!task) {
    return (
      <View style={styles.container}>
        <Header title="Task Details" showBack />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Task not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Task Details" showBack />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>{task.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(task.status) }]}>
              {task.status === 'todo' ? 'To Do' :
               task.status === 'in-progress' ? 'In Progress' :
               'Completed'}
            </Text>
          </View>
        </View>

        <View style={styles.statusButtons}>
          <TouchableOpacity 
            style={[
              styles.statusChangeButton,
              task.status === 'todo' && styles.statusChangeButtonActive,
              { backgroundColor: '#607D8B20' }
            ]}
            onPress={() => handleStatusChange('todo')}
            disabled={updating}
          >
            <AlertCircle size={20} color="#607D8B" />
            <Text style={[styles.statusChangeButtonText, { color: '#607D8B' }]}>To Do</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.statusChangeButton,
              task.status === 'in-progress' && styles.statusChangeButtonActive,
              { backgroundColor: '#0B539420' }
            ]}
            onPress={() => handleStatusChange('in-progress')}
            disabled={updating}
          >
            <Clock size={20} color="#0B5394" />
            <Text style={[styles.statusChangeButtonText, { color: '#0B5394' }]}>In Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.statusChangeButton,
              task.status === 'completed' && styles.statusChangeButtonActive,
              { backgroundColor: '#2E7D3220' }
            ]}
            onPress={() => handleStatusChange('completed')}
            disabled={updating}
          >
            <CheckCircle size={20} color="#2E7D32" />
            <Text style={[styles.statusChangeButtonText, { color: '#2E7D32' }]}>Completed</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.detailRow}>
            <Calendar size={20} color="#607D8B" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Due Date</Text>
              <Text style={styles.detailText}>{new Date(task.dueDate || '').toLocaleDateString()}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <UserCircle2 size={20} color="#607D8B" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Assigned To</Text>
              <Text style={styles.detailText}>{task.assignedTo || 'Unassigned'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Clock size={20} color="#607D8B" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Created</Text>
              <Text style={styles.detailText}>{new Date(task.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {task.description || 'No description provided'}
          </Text>
        </View>

        {/* Voice Note */}
        {task.voiceNote && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Voice Note</Text>
            <VoiceNote
              existingAudioUrl={task.voiceNote.url}
              onRecordingComplete={() => {}}
            />
          </View>
        )}

        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => router.push(`/project/${projectId}/tasks/${taskId}/edit`)}
        >
          <Edit2 size={20} color="#fff" />
          <Text style={styles.editButtonText}>Edit Task</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => setShowDeleteConfirm(true)}
          disabled={updating}
        >
          <Trash size={20} color="#fff" />
          <Text style={styles.deleteButtonText}>Delete Task</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Delete Task</Text>
            <Text style={styles.confirmText}>
              Are you sure you want to delete this task? This action cannot be undone.
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity 
                style={[styles.confirmButton, styles.cancelButton]} 
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmButton, styles.deleteConfirmButton]} 
                onPress={handleDeleteTask}
              >
                <Text style={[styles.buttonText, styles.deleteConfirmButtonText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#e53935',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    color: '#263238',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#607D8B',
  },
  detailText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#263238',
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#263238',
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#455A64',
    lineHeight: 24,
  },
  statusButtons: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  statusChangeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  statusChangeButtonActive: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusChangeButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B5394',
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 24,
    marginHorizontal: 16,
  },
  editButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#fff',
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e53935',
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  deleteButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#fff',
    marginLeft: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 400,
    margin: 20,
  },
  confirmTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#263238',
    marginBottom: 12,
  },
  confirmText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#455A64',
    marginBottom: 24,
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 12,
  },
  buttonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#ECEFF1',
  },
  cancelButtonText: {
    color: '#607D8B',
  },
  deleteConfirmButton: {
    backgroundColor: '#e53935',
  },
  deleteConfirmButtonText: {
    color: '#fff',
  },
});
