import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Calendar, Banknote } from 'lucide-react-native';
import { Project } from '@/types';

interface ProjectListItemProps {
  project: Project;
  onPress: () => void;
}

export function ProjectListItem({ project, onPress }: ProjectListItemProps) {
  // Format dates
  const startDate = project.timeline?.start ? 
    new Date(project.timeline.start.seconds * 1000).toLocaleDateString() : 
    new Date(project.startDate).toLocaleDateString();
  
  const endDate = project.timeline?.end ? 
    new Date(project.timeline.end.seconds * 1000).toLocaleDateString() :
    project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set';
  
  // Format budget with commas if it exists
  const formattedBudget = project.budget 
    ? project.budget.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    : 'Not set';
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning':
        return 'Planning';
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'on-hold':
        return 'On Hold';
      default:
        return status;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return [styles.statusBadge, styles.statusActive];
      case 'completed':
        return [styles.statusBadge, styles.statusCompleted];
      case 'on-hold':
        return [styles.statusBadge, styles.statusOnHold];
      default:
        return [styles.statusBadge];
    }
  };

  const getStatusTextStyle = (status: string) => {
    switch (status) {
      case 'active':
        return [styles.statusText, styles.statusTextActive];
      case 'completed':
        return [styles.statusText, styles.statusTextCompleted];
      case 'on-hold':
        return [styles.statusText, styles.statusTextOnHold];
      default:
        return [styles.statusText];
    }
  };
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.projectName}>{project.name}</Text>
          {project.client && (
            <Text style={styles.clientName}>{project.client.name}</Text>
          )}
        </View>
        <View style={getStatusStyle(project.status)}>
          <Text style={getStatusTextStyle(project.status)}>
            {getStatusLabel(project.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        {project.location && (
          <View style={styles.detailItem}>
            <MapPin size={16} color="#64748B" />
            <Text style={styles.detailText}>{project.location.address}</Text>
          </View>
        )}
        <View style={styles.detailItem}>
          <Calendar size={16} color="#64748B" />
          <Text style={styles.detailText}>{startDate} - {endDate}</Text>
        </View>
        <View style={styles.detailItem}>
          <Banknote size={16} color="#64748B" />
          <Text style={styles.detailText}>{formattedBudget}</Text>
        </View>
      </View>
      
      {typeof project.progress === 'number' && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${project.progress}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>{project.progress}%</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    backgroundColor: '#CBD5E1',
  },
  statusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  statusTextActive: {
    color: '#2E7D32',
  },
  statusTextCompleted: {
    color: '#1B5E20',
  },
  statusTextOnHold: {
    color: '#475569',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginRight: 8,
    minWidth: '45%',
  },
  detailText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#607D8B',
    marginLeft: 8,
  },
});