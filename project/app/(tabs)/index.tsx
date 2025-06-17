import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Plus, 
  Bell, 
  Building2, 
  ArrowUpRight,
  Users,
  FileText,
  Calendar,
  Banknote
} from 'lucide-react-native';
import { useProjects } from '@/hooks/useProjects';
import { useAuthContext } from '@/context/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { Header } from '@/components/ui/Header';
import { ProjectCard } from '@/components/project/ProjectCard';
import { TaskCard } from '@/components/project/TaskCard';
import { StatCard } from '@/components/ui/StatCard';

export default function DashboardScreen() {
  const { user } = useAuthContext();
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks();
  const router = useRouter();
  const [activeProjects, setActiveProjects] = useState(0);
  const [totalTeamMembers, setTotalTeamMembers] = useState(0);
  
  useEffect(() => {
    if (projects) {
      setActiveProjects(projects.filter(p => p.status === 'active').length);
      // Calculate total team members across all projects
      const uniqueMembers = new Set();
      projects.forEach(project => {
        project.team?.forEach(member => uniqueMembers.add(member.userId));
      });
      setTotalTeamMembers(uniqueMembers.size);
    }
  }, [projects]);
  
  const recentProjects = projects?.slice(0, 3) || [];
  
  // Get upcoming tasks (ordered by due date)
  const upcomingTasks = tasks
    ?.filter(task => task.dueDate && new Date(task.dueDate) > new Date())
    ?.sort((a, b) => new Date(a.dueDate || '').getTime() - new Date(b.dueDate || '').getTime())
    ?.slice(0, 3)
    ?.map(task => ({
      id: task.id,
      title: task.title,
      project: projects?.find(p => p.id === task.projectId)?.name || 'Unknown Project',
      dueDate: new Date(task.dueDate || ''),
      priority: task.priority
    })) || [];
  
  return (
    <View style={styles.container}>
      <Header title="Dashboard" showNotification />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeText}>Hello, {user?.displayName || 'User'}</Text>
            <Text style={styles.welcomeSubtext}>Track your construction projects</Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/project/create')}
          >
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <StatCard 
            title="Active Projects"
            value={activeProjects}
            icon={<Building2 size={24} color="#0B5394" />}
            backgroundColor="#E3F2FD"
            textColor="#0B5394"
          />
          <StatCard 
            title="Team Members"
            value={totalTeamMembers}
            icon={<Users size={24} color="#2E7D32" />}
            backgroundColor="#E8F5E9"
            textColor="#2E7D32"
          />
        </View>
        
        {/* Recent Projects Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Projects</Text>
          <TouchableOpacity onPress={() => router.push('/projects')}>
            <View style={styles.viewAllContainer}>
              <Text style={styles.viewAllText}>View All</Text>
              <ArrowUpRight size={16} color="#0B5394" />
            </View>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.projectsScrollContent}
        >
          {projectsLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading projects...</Text>
            </View>
          ) : recentProjects.length > 0 ? (
            recentProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))
          ) : (
            <TouchableOpacity 
              style={styles.emptyProjectCard}
              onPress={() => router.push('/project/create')}
            >
              <Plus size={24} color="#607D8B" />
              <Text style={styles.emptyProjectText}>Create your first project</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
        
        
        {/* Quick Access Section */}
        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Quick Access</Text>
        <View style={styles.quickAccessContainer}>
          <TouchableOpacity 
            style={styles.quickAccessItem}
            onPress={() => router.push('/teams')}
          >
            <View style={[styles.quickAccessIcon, { backgroundColor: '#E8F5E9' }]}>
              <Users size={24} color="#2E7D32" />
            </View>
            <Text style={styles.quickAccessText}>Teams</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAccessItem}
            onPress={() => router.push('/documents')}
          >
            <View style={[styles.quickAccessIcon, { backgroundColor: '#FFF3E0' }]}>
              <FileText size={24} color="#F6941D" />
            </View>
            <Text style={styles.quickAccessText}>Documents</Text>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#263238',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#607D8B',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0B5394',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#263238',
  },
  viewAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#0B5394',
    marginRight: 4,
  },
  projectsScrollContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  loadingContainer: {
    width: 280,
    height: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#607D8B',
  },
  emptyProjectCard: {
    width: 280,
    height: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  emptyProjectText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#607D8B',
    marginTop: 8,
  },
  tasksContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  quickAccessContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  quickAccessItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickAccessIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quickAccessText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#263238',
  },
});