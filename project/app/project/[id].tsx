import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useProject } from '@/hooks/useProject';
import { useProjects } from '@/hooks/useProjects';
import { Header } from '@/components/ui/Header';
import { ProjectOverview } from '@/components/project/ProjectOverview';
import { ProjectBudget } from '@/components/project/ProjectBudget';
import { ProjectTeam } from '@/components/project/ProjectTeam';
import { ProjectProgress } from '@/components/project/ProjectProgress';
import { ProjectTask } from '@/components/project/ProjectTask';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react-native';

export default function ProjectDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { project, loading, error } = useProject(id as string);
  const { deleteProject } = useProjects();
  const [activeTab, setActiveTab] = useState('overview');
  const [showMenu, setShowMenu] = useState(false);
  
  const handleEdit = () => {
    setShowMenu(false);
    router.push(`/project/${id}/edit`);
  };

  const handleDelete = () => {
    setShowMenu(false);
    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project? This action cannot be undone.',
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
              await deleteProject(id as string);
              router.back();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete project');
            }
          }
        }
      ]
    );
  };

  const renderMenu = () => (
    <View style={styles.menuContainer}>
      <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
        <Edit2 size={20} color="#0B5394" />
        <Text style={styles.menuItemText}>Edit Project</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.menuItem, styles.deleteMenuItem]} onPress={handleDelete}>
        <Trash2 size={20} color="#E53935" />
        <Text style={[styles.menuItemText, styles.deleteMenuItemText]}>Delete Project</Text>
      </TouchableOpacity>
    </View>
  );
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading project details...</Text>
      </View>
    );
  }
  
  if (error || !project) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load project details</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Header 
        title={project.name} 
        showBack 
        showMenu
        onMenuPress={() => setShowMenu(!showMenu)}
      />
      
      {showMenu && renderMenu()}
      
      <View style={styles.statusBadge}>
        <View style={[
          styles.statusIndicator, 
          project.status === 'active' ? styles.statusActive : 
          project.status === 'completed' ? styles.statusCompleted : 
          styles.statusDelayed
        ]} />
        <Text style={styles.statusText}>
          {project.status === 'active' ? 'Active' : 
           project.status === 'completed' ? 'Completed' : 
           'Delayed'}
        </Text>
      </View>
      
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
              Overview
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'progress' && styles.activeTab]}
            onPress={() => setActiveTab('progress')}
          >
            <Text style={[styles.tabText, activeTab === 'progress' && styles.activeTabText]}>
              Progress
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'tasks' && styles.activeTab]}
            onPress={() => setActiveTab('tasks')}
          >
            <Text style={[styles.tabText, activeTab === 'tasks' && styles.activeTabText]}>
              Tasks
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'budget' && styles.activeTab]}
            onPress={() => setActiveTab('budget')}
          >
            <Text style={[styles.tabText, activeTab === 'budget' && styles.activeTabText]}>
              Budget
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'team' && styles.activeTab]}
            onPress={() => setActiveTab('team')}
          >
            <Text style={[styles.tabText, activeTab === 'team' && styles.activeTabText]}>
              Team
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      <ScrollView 
        style={styles.contentContainer}
        contentContainerStyle={styles.contentScrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'overview' && <ProjectOverview project={project} />}
        {activeTab === 'progress' && <ProjectProgress project={project} />}
        {activeTab === 'tasks' && <ProjectTask project={project} />}
        {activeTab === 'budget' && <ProjectBudget project={project} />}
        {activeTab === 'team' && <ProjectTeam project={project} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F6F8',
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#607D8B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F6F8',
    padding: 20,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#E53935',
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#0B5394',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#fff',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusActive: {
    backgroundColor: '#4CAF50',
  },
  statusCompleted: {
    backgroundColor: '#2E7D32',
  },
  statusDelayed: {
    backgroundColor: '#F57C00',
  },
  statusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#263238',
  },
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
  },
  tabsScrollContent: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0B5394',
  },
  tabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#607D8B',
  },
  activeTabText: {
    color: '#0B5394',
  },
  contentContainer: {
    flex: 1,
  },
  contentScrollContainer: {
    paddingBottom: 24,
  },
  menuContainer: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 6,
  },
  menuItemText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#0B5394',
    marginLeft: 8,
  },
  deleteMenuItem: {
    marginTop: 4,
  },
  deleteMenuItemText: {
    color: '#E53935',
  },
});