import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { MapPin, Calendar, Banknote, ChevronRight } from 'lucide-react-native';
import { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const handlePress = () => {
    router.push(`/project/${project.id}`);
  };
  
  // Format dates
  const startDate = new Date(project.startDate).toLocaleDateString();
  const endDate = project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set';
  
  // Format budget with commas
  const formattedBudget = project.budget.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.projectName}>{project.name}</Text>
          <Text style={styles.clientName}>{project.client?.name || 'No client'}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          project.status === 'active' ? styles.statusActive :
          project.status === 'completed' ? styles.statusCompleted :
          styles.statusOnHold
        ]}>
          <Text style={styles.statusText}>
            {project.status === 'active' ? 'Active' :
             project.status === 'completed' ? 'Completed' :
             'On Hold'}
          </Text>
        </View>
      </View>
      
      {typeof project.progress === 'number' && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${project.progress}%` },
                project.status === 'completed' ? styles.progressCompleted :
                project.status === 'on-hold' ? styles.progressDelayed :
                styles.progressActive
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{project.progress}% complete</Text>
        </View>
      )}
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <MapPin size={16} color="#607D8B" />
          <Text style={styles.detailText}>{project.location?.address || 'Location not set'}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Calendar size={16} color="#607D8B" />
          <Text style={styles.detailText}>{startDate} - {endDate}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Banknote size={16} color="#607D8B" />
          <Text style={styles.detailText}>{formattedBudget}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.viewButton} onPress={handlePress}>
        <Text style={styles.viewButtonText}>View Details</Text>
        <ChevronRight size={16} color="#0B5394" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#263238',
    marginBottom: 4,
  },
  clientName: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#607D8B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusActive: {
    backgroundColor: '#E8F5E9',
  },
  statusCompleted: {
    backgroundColor: '#C8E6C9',
  },
  statusOnHold: {
    backgroundColor: '#FFE0B2',
  },
  statusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#2E7D32',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#ECEFF1',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressActive: {
    backgroundColor: '#0B5394',
  },
  progressCompleted: {
    backgroundColor: '#2E7D32',
  },
  progressDelayed: {
    backgroundColor: '#F57C00',
  },
  progressText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#607D8B',
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#607D8B',
    marginLeft: 8,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#ECEFF1',
  },
  viewButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#0B5394',
    marginRight: 4,
  },
});