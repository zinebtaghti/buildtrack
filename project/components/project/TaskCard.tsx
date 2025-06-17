import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTasks } from '@/hooks/useTasks';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    projectId: string;
    projectName: string;
    dueDate: string;
    priority: string;
  };
}

export function TaskCard({ task }: TaskCardProps) {
  const router = useRouter();
  const { deleteTask } = useTasks(task.projectId);

  const handleEditTask = () => {
    router.push(`/project/${task.projectId}/tasks/${task.id}/edit`);
  };

  const handleDeleteTask = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(task.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete task. Please try again.');
            }
          },
        },
      ],
    );
  };

  const handlePress = () => {
    router.push(`/project/${task.projectId}/tasks/${task.id}`);
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.mainContent}>
          <Text style={styles.title}>{task.title}</Text>
          <Text style={styles.projectName}>{task.projectName}</Text>
          <View style={styles.details}>
            <View style={styles.priorityTag}>
              <Text style={styles.priorityText}>{task.priority}</Text>
            </View>
            <Text style={styles.dueDate}>
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleEditTask} style={styles.actionButton}>
            <MaterialIcons name="edit" size={20} color="#2196F3" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteTask} style={styles.actionButton}>
            <MaterialIcons name="delete" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mainContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginBottom: 4,
  },
  projectName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityTag: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
  },
  dueDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});