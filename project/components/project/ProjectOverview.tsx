import { View, Text, StyleSheet } from 'react-native';
import { MapPin, Calendar, Banknote, ClipboardList } from 'lucide-react-native';
import { Project } from '@/types';

interface ProjectOverviewProps {
  project: Project;
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
  // Format dates
  const startDate = new Date(project.startDate).toLocaleDateString();
  const endDate = project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set';
  
  // Format budget
  const formattedBudget = project.budget.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  // Calculate days remaining
  const today = new Date();
  const endDateTime = project.endDate ? new Date(project.endDate).getTime() : undefined;
  const daysRemaining = endDateTime ? Math.ceil((endDateTime - today.getTime()) / (1000 * 60 * 60 * 24)) : undefined;
  
  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{project.progress}%</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statBox}>
          <Text style={[
            styles.statValue,
            daysRemaining && daysRemaining < 0 ? styles.statOverdue : null
          ]}>
            {daysRemaining === undefined ? 'No due date' :
             daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : 
             daysRemaining === 0 ? 'Due today' : 
             `${daysRemaining} days left`}
          </Text>
          <Text style={styles.statLabel}>Timeline</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{project.team?.length || 0}</Text>
          <Text style={styles.statLabel}>Team Members</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Details</Text>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <MapPin size={20} color="#607D8B" />
            </View>
            <View>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{project.location?.address || 'Not set'}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Calendar size={20} color="#607D8B" />
            </View>
            <View>
              <Text style={styles.detailLabel}>Timeline</Text>
              <Text style={styles.detailValue}>{startDate} - {endDate}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Banknote size={20} color="#607D8B" />
            </View>
            <View>
              <Text style={styles.detailLabel}>Budget</Text>
              <Text style={styles.detailValue}>{formattedBudget}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <ClipboardList size={20} color="#607D8B" />
            </View>
            <View>
              <Text style={styles.detailLabel}>Client</Text>
              <Text style={styles.detailValue}>{project.client?.name || 'Not set'}</Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {project.description || 'No description provided.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
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
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#ECEFF1',
    marginHorizontal: 8,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#263238',
    marginBottom: 4,
    textAlign: 'center',
  },
  statOverdue: {
    color: '#E53935',
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#607D8B',
    textAlign: 'center',
  },
  section: {
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
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#263238',
    marginBottom: 16,
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 16,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#607D8B',
    marginBottom: 2,
  },
  detailValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#263238',
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#455A64',
    lineHeight: 22,
  },
});