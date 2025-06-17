import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Project } from '@/types';
import { TaskCard } from './TaskCard';
import { useTasks } from '@/hooks/useTasks';
import { useRouter } from 'expo-router';

interface ProjectTaskProps {
  project: Project;
}

export function ProjectTask({ project }: ProjectTaskProps) {
  const { tasks, loading } = useTasks(project.id);
  const router = useRouter();

  const handleAddTask = () => {
    router.push(`/project/${project.id}/tasks/create`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddTask}
        >
          <Text style={styles.addButtonText}>Add Task</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.section}>
          {loading ? (
            <View style={styles.centerContainer}>
              <Text style={styles.loadingText}>Loading tasks...</Text>
            </View>
          ) : tasks?.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No tasks found</Text>
            </View>
          ) : (
            tasks.map(task => (
              <TaskCard 
                key={task.id}
                task={{
                  id: task.id,
                  title: task.title,
                  projectId: project.id,
                  projectName: project.name,
                  dueDate: task.dueDate || new Date().toISOString(),
                  priority: task.priority || 'Normal'
                }}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
  },
  centerContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
  },
  addButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#607D8B',
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#607D8B',
    textAlign: 'center',
  },
});
