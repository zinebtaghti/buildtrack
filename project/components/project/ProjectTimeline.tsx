import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Project } from '@/types';
import { Calendar, Clock, CheckCircle, Flag, Plus } from 'lucide-react-native';

interface ProjectTimelineProps {
  project: Project;
}

export function ProjectTimeline({ project }: ProjectTimelineProps) {
  // Dummy milestone data
  const milestones = [
    {
      id: '1',
      title: 'Project Initiation',
      date: new Date('2023-06-10'),
      completed: true,
      description: 'Initial planning and setup of project requirements.'
    },
    {
      id: '2',
      title: 'Site Preparation',
      date: new Date('2023-07-15'),
      completed: true,
      description: 'Clear the site and prepare for foundation work.'
    },
    {
      id: '3',
      title: 'Foundation Work',
      date: new Date('2023-08-20'),
      completed: project.progress >= 35,
      description: 'Complete all foundation and structural base work.'
    },
    {
      id: '4',
      title: 'Framing and Structure',
      date: new Date('2023-10-30'),
      completed: project.progress >= 50,
      description: 'Complete the main structural frame of the building.'
    },
    {
      id: '5',
      title: 'Roofing and Exterior',
      date: new Date('2024-01-15'),
      completed: project.progress >= 65,
      description: 'Install roof and complete exterior finishes.'
    },
    {
      id: '6',
      title: 'Interior Work',
      date: new Date('2024-04-10'),
      completed: project.progress >= 80,
      description: 'Complete all interior constructions and finishes.'
    },
    {
      id: '7',
      title: 'Final Inspection',
      date: new Date('2024-08-15'),
      completed: project.progress >= 95,
      description: 'Final inspection and approval from authorities.'
    },
    {
      id: '8',
      title: 'Project Completion',
      date: new Date('2024-09-30'),
      completed: project.progress === 100,
      description: 'Handover of the completed project to client.'
    }
  ];
  
  const calculateProgress = (milestones) => {
    if (!milestones.length) return 0;
    const completed = milestones.filter(m => m.completed).length;
    return Math.round((completed / milestones.length) * 100);
  };
  
  const getMilestoneStatus = (milestone) => {
    const today = new Date();
    if (milestone.completed) return 'completed';
    if (milestone.date < today) return 'overdue';
    
    // Calculate if the milestone is upcoming (within 30 days)
    const daysUntil = Math.ceil((milestone.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 30) return 'upcoming';
    
    return 'future';
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>Timeline Progress</Text>
        <Text style={styles.progressPercentage}>
          {calculateProgress(milestones)}% ({milestones.filter(m => m.completed).length}/{milestones.length} milestones)
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${calculateProgress(milestones)}%` }
            ]} 
          />
        </View>
      </View>
      
      <View style={styles.timelineLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.completedDot]} />
          <Text style={styles.legendText}>Completed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.overdueDot]} />
          <Text style={styles.legendText}>Overdue</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.upcomingDot]} />
          <Text style={styles.legendText}>Upcoming</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.futureDot]} />
          <Text style={styles.legendText}>Future</Text>
        </View>
      </View>
      
      <ScrollView style={styles.timelineContainer}>
        {milestones.map((milestone, index) => {
          const status = getMilestoneStatus(milestone);
          
          return (
            <View key={milestone.id} style={styles.milestoneContainer}>
              <View style={styles.timelineLeft}>
                <View 
                  style={[
                    styles.timelineDot,
                    status === 'completed' ? styles.completedDot :
                    status === 'overdue' ? styles.overdueDot :
                    status === 'upcoming' ? styles.upcomingDot :
                    styles.futureDot
                  ]}
                />
                {index < milestones.length - 1 && (
                  <View 
                    style={[
                      styles.timelineLine,
                      milestone.completed ? styles.completedLine : styles.futureLine
                    ]}
                  />
                )}
              </View>
              
              <View style={styles.milestoneContent}>
                <View style={styles.milestoneHeader}>
                  <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                  {status === 'completed' && <CheckCircle size={16} color="#2E7D32" />}
                </View>
                
                <View style={styles.milestoneDetails}>
                  <View style={styles.milestoneDetail}>
                    <Calendar size={14} color="#607D8B" />
                    <Text style={styles.milestoneDate}>
                      {milestone.date.toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <View style={styles.milestoneDetail}>
                    <Clock size={14} color="#607D8B" />
                    <Text 
                      style={[
                        styles.milestoneStatus,
                        status === 'completed' ? styles.statusCompleted :
                        status === 'overdue' ? styles.statusOverdue :
                        status === 'upcoming' ? styles.statusUpcoming :
                        styles.statusFuture
                      ]}
                    >
                      {status === 'completed' ? 'Completed' :
                       status === 'overdue' ? 'Overdue' :
                       status === 'upcoming' ? 'Upcoming' :
                       'Scheduled'}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.milestoneDescription}>{milestone.description}</Text>
              </View>
            </View>
          );
        })}
        
        <TouchableOpacity style={styles.addMilestoneButton}>
          <Plus size={16} color="#0B5394" />
          <Text style={styles.addMilestoneText}>Add Milestone</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  progressContainer: {
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
  progressTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#263238',
    marginBottom: 8,
  },
  progressPercentage: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#455A64',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ECEFF1',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0B5394',
    borderRadius: 4,
  },
  timelineLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#607D8B',
  },
  completedDot: {
    backgroundColor: '#2E7D32',
  },
  overdueDot: {
    backgroundColor: '#E53935',
  },
  upcomingDot: {
    backgroundColor: '#F57C00',
  },
  futureDot: {
    backgroundColor: '#90A4AE',
  },
  timelineContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  milestoneContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeft: {
    width: 20,
    alignItems: 'center',
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    marginBottom: -4,
  },
  completedLine: {
    backgroundColor: '#2E7D32',
  },
  futureLine: {
    backgroundColor: '#CFD8DC',
  },
  milestoneContent: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginLeft: 12,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  milestoneTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#263238',
  },
  milestoneDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  milestoneDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  milestoneDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#607D8B',
    marginLeft: 4,
  },
  milestoneStatus: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 4,
  },
  statusCompleted: {
    color: '#2E7D32',
  },
  statusOverdue: {
    color: '#E53935',
  },
  statusUpcoming: {
    color: '#F57C00',
  },
  statusFuture: {
    color: '#607D8B',
  },
  milestoneDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#455A64',
  },
  addMilestoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#0B5394',
    borderRadius: 8,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addMilestoneText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#0B5394',
    marginLeft: 8,
  },
});