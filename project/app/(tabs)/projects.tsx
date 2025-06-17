import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useProjects } from '@/hooks/useProjects';
import { Header } from '@/components/ui/Header';
import { ProjectListItem } from '@/components/project/ProjectListItem';
import { Search, Plus, FilterX, CircleCheck as CheckCircle, Clock, TriangleAlert as AlertTriangle } from 'lucide-react-native';

export default function ProjectsScreen() {
  const { projects, loading, error, isIndexBuilding } = useProjects();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const filteredProjects = projects?.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      (project.client?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];
  
  const getStatusCounts = () => {
    if (!projects) return { active: 0, completed: 0, onHold: 0 };
    
    return projects.reduce((counts, project) => {
      if (project.status === 'active') counts.active++;
      else if (project.status === 'completed') counts.completed++;
      else if (project.status === 'on-hold') counts.onHold++;
      return counts;
    }, { active: 0, completed: 0, onHold: 0 });
  };
  
  const statusCounts = getStatusCounts();

  if (isIndexBuilding) {
    return (
      <View style={styles.container}>
        <Header title="Projects" />
        <View style={styles.centerContainer}>
          <Text style={styles.indexBuildingText}>Setting up the database...</Text>
          <Text style={styles.indexBuildingSubText}>This may take a few minutes. Please refresh the page shortly.</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header title="Projects" />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Header title="Projects" />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#90A4AE" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search projects or clients"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <FilterX size={20} color="#90A4AE" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      
      {/* Status Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            statusFilter === 'all' && styles.filterButtonActive
          ]}
          onPress={() => setStatusFilter('all')}
        >
          <Text style={[
            styles.filterText,
            statusFilter === 'all' && styles.filterTextActive
          ]}>All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            statusFilter === 'active' && styles.filterButtonActive
          ]}
          onPress={() => setStatusFilter('active')}
        >
          <Clock size={16} color={statusFilter === 'active' ? '#0B5394' : '#607D8B'} />
          <Text style={[
            styles.filterText,
            statusFilter === 'active' && styles.filterTextActive
          ]}>Active ({statusCounts.active})</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            statusFilter === 'completed' && styles.filterButtonActive
          ]}
          onPress={() => setStatusFilter('completed')}
        >
          <CheckCircle size={16} color={statusFilter === 'completed' ? '#2E7D32' : '#607D8B'} />
          <Text style={[
            styles.filterText,
            statusFilter === 'completed' && styles.filterTextActive
          ]}>Completed ({statusCounts.completed})</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            statusFilter === 'on-hold' && styles.filterButtonActive
          ]}
          onPress={() => setStatusFilter('on-hold')}
        >
          <AlertTriangle size={16} color={statusFilter === 'on-hold' ? '#F57C00' : '#607D8B'} />
          <Text style={[
            styles.filterText,
            statusFilter === 'on-hold' && styles.filterTextActive
          ]}>On Hold ({statusCounts.onHold})</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredProjects}
        renderItem={({ item }) => (
          <ProjectListItem 
            project={item} 
            onPress={() => router.push(`/project/${item.id}`)} 
          />
        )
        }
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Loading projects...' : 'No projects found'}
            </Text>
            {!loading && (
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push('/project/create')}
              >
                <Plus size={16} color="#fff" />
                <Text style={styles.createButtonText}>Create Project</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
      
      {!loading && filteredProjects.length > 0 && (
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => router.push('/project/create')}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#263238',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#ECEFF1',
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#607D8B',
    marginBottom: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B5394',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#fff',
    marginLeft: 8,
  },
  fabButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0B5394',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  indexBuildingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  indexBuildingSubText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
});