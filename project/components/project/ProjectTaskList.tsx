import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Plus, Search, FilterX, CheckCircle, Clock, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react-native';
import { Project } from '@/types';
import { useTasks } from '@/hooks/useTasks';
import { TaskCard } from './TaskCard';

interface ProjectTaskListProps {
  project: Project;
}

export function ProjectTaskList({ project }: ProjectTaskListProps) {
  const { tasks, loading } = useTasks(project.id);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'status'>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleAddTask = () => {
    router.push(`/project/${project.id}/tasks/create`);
  };

  // Calculate status counts for filter badges
  const getStatusCounts = () => {
    if (!tasks) return { todo: 0, inProgress: 0, completed: 0 };
    return tasks.reduce((counts, task) => {
      if (task.status === 'todo') counts.todo++;
      else if (task.status === 'in-progress') counts.inProgress++;
      else if (task.status === 'completed') counts.completed++;
      return counts;
    }, { todo: 0, inProgress: 0, completed: 0 });
  };

  // Calculate priority counts for filter badges
  const getPriorityCounts = () => {
    if (!tasks) return { low: 0, medium: 0, high: 0 };
    return tasks.reduce((counts, task) => {
      if (task.priority === 'low') counts.low++;
      else if (task.priority === 'medium') counts.medium++;
      else if (task.priority === 'high') counts.high++;
      return counts;
    }, { low: 0, medium: 0, high: 0 });
  };

  const statusCounts = getStatusCounts();
  const priorityCounts = getPriorityCounts();

  const filteredAndSortedTasks = tasks
    ?.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
                          task.description.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        const dateA = new Date(a.dueDate || '').getTime();
        const dateB = new Date(b.dueDate || '').getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'priority') {
        const priorityOrder = { low: 1, medium: 2, high: 3 };
        const orderA = priorityOrder[a.priority];
        const orderB = priorityOrder[b.priority];
        return sortDirection === 'asc' ? orderA - orderB : orderB - orderA;
      } else {
        const statusOrder = { 'todo': 1, 'in-progress': 2, 'completed': 3 };
        const orderA = statusOrder[a.status];
        const orderB = statusOrder[b.status];
        return sortDirection === 'asc' ? orderA - orderB : orderB - orderA;
      }
    }) || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Project Tasks</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddTask}
        >
          <Plus size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Task</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#607D8B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            value={search}
            onChangeText={setSearch}
          />
          {search !== '' && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <FilterX size={20} color="#607D8B" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        <View style={styles.filterSection}>
          {/* Status filters */}
          <TouchableOpacity 
            style={[styles.filterButton, statusFilter === 'all' && styles.filterButtonActive]}
            onPress={() => setStatusFilter('all')}
          >
            <Text style={[styles.filterText, statusFilter === 'all' && styles.filterTextActive]}>
              All Tasks
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterButton, statusFilter === 'todo' && styles.filterButtonActive]}
            onPress={() => setStatusFilter('todo')}
          >
            <AlertCircle size={16} color={statusFilter === 'todo' ? '#0B5394' : '#607D8B'} />
            <Text style={[styles.filterText, statusFilter === 'todo' && styles.filterTextActive]}>
              To Do ({statusCounts.todo})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterButton, statusFilter === 'in-progress' && styles.filterButtonActive]}
            onPress={() => setStatusFilter('in-progress')}
          >
            <Clock size={16} color={statusFilter === 'in-progress' ? '#0B5394' : '#607D8B'} />
            <Text style={[styles.filterText, statusFilter === 'in-progress' && styles.filterTextActive]}>
              In Progress ({statusCounts.inProgress})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterButton, statusFilter === 'completed' && styles.filterButtonActive]}
            onPress={() => setStatusFilter('completed')}
          >
            <CheckCircle size={16} color={statusFilter === 'completed' ? '#2E7D32' : '#607D8B'} />
            <Text style={[styles.filterText, statusFilter === 'completed' && styles.filterTextActive]}>
              Completed ({statusCounts.completed})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Priority filters */}
        <View style={styles.filterSection}>
          <TouchableOpacity 
            style={[styles.filterButton, priorityFilter === 'all' && styles.filterButtonActive]}
            onPress={() => setPriorityFilter('all')}
          >
            <Text style={[styles.filterText, priorityFilter === 'all' && styles.filterTextActive]}>
              All Priorities
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterButton, priorityFilter === 'high' && styles.filterButtonActive]}
            onPress={() => setPriorityFilter('high')}
          >
            <Text style={[styles.filterText, priorityFilter === 'high' && styles.filterTextActive]}>
              High ({priorityCounts.high})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterButton, priorityFilter === 'medium' && styles.filterButtonActive]}
            onPress={() => setPriorityFilter('medium')}
          >
            <Text style={[styles.filterText, priorityFilter === 'medium' && styles.filterTextActive]}>
              Medium ({priorityCounts.medium})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterButton, priorityFilter === 'low' && styles.filterButtonActive]}
            onPress={() => setPriorityFilter('low')}
          >
            <Text style={[styles.filterText, priorityFilter === 'low' && styles.filterTextActive]}>
              Low ({priorityCounts.low})
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sort options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => {
            if (sortBy === 'dueDate') {
              setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
            } else {
              setSortBy('dueDate');
              setSortDirection('asc');
            }
          }}
        >
          <Text style={[styles.sortButtonText, sortBy === 'dueDate' && styles.sortButtonTextActive]}>Due Date</Text>
          {sortBy === 'dueDate' && (
            sortDirection === 'asc' ? <ArrowUp size={16} color="#0B5394" /> : <ArrowDown size={16} color="#0B5394" />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => {
            if (sortBy === 'priority') {
              setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
            } else {
              setSortBy('priority');
              setSortDirection('asc');
            }
          }}
        >
          <Text style={[styles.sortButtonText, sortBy === 'priority' && styles.sortButtonTextActive]}>Priority</Text>
          {sortBy === 'priority' && (
            sortDirection === 'asc' ? <ArrowUp size={16} color="#0B5394" /> : <ArrowDown size={16} color="#0B5394" />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => {
            if (sortBy === 'status') {
              setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
            } else {
              setSortBy('status');
              setSortDirection('asc');
            }
          }}
        >
          <Text style={[styles.sortButtonText, sortBy === 'status' && styles.sortButtonTextActive]}>Status</Text>
          {sortBy === 'status' && (
            sortDirection === 'asc' ? <ArrowUp size={16} color="#0B5394" /> : <ArrowDown size={16} color="#0B5394" />
          )}
        </TouchableOpacity>
      </View>

      {/* Task list */}
      {loading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : filteredAndSortedTasks.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No tasks found</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddTask}
          >
            <Plus size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add Your First Task</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredAndSortedTasks}
          renderItem={({ item: task }) => (
            <TouchableOpacity 
              onPress={() => router.push(`/project/${project.id}/tasks/${task.id}`)}
            >
              <TaskCard 
                task={{
                  id: task.id,
                  title: task.title,
                  project: project.name,
                  projectId: project.id,
                  dueDate: new Date(task.dueDate || ''),
                  priority: task.priority
                }}
              />
            </TouchableOpacity>
          )}
          keyExtractor={task => task.id}
          contentContainerStyle={styles.taskList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#263238',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B5394',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#fff',
    marginLeft: 8,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#263238',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterSection: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#E3F2FD',
  },
  filterText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#607D8B',
    marginLeft: 4,
  },
  filterTextActive: {
    color: '#0B5394',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sortLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#607D8B',
    marginRight: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  sortButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#607D8B',
    marginRight: 4,
  },
  sortButtonTextActive: {
    color: '#0B5394',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
    marginBottom: 16,
    textAlign: 'center',
  },
  taskList: {
    paddingBottom: 16,
  },
});
