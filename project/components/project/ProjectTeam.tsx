import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Project } from '@/types';
import { Mail, Phone, Plus, UserPlus } from 'lucide-react-native';

interface ProjectTeamProps {
  project: Project;
}

export function ProjectTeam({ project }: ProjectTeamProps) {
  return (
    <View style={styles.container}>
      <View style={styles.teamHeader}>
        <Text style={styles.sectionTitle}>Project Team</Text>
        
        <TouchableOpacity style={styles.addButton}>
          <UserPlus size={16} color="#0B5394" />
          <Text style={styles.addButtonText}>Add Member</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.teamGrid}>
        {project.team && project.team.length > 0 ? (
          project.team.map(member => (
            <View key={member.id} style={styles.memberCard}>
              <Image 
                source={{ uri: member.avatar || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg' }} 
                style={styles.memberAvatar} 
              />
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberRole}>{member.role}</Text>
              
              <View style={styles.contactBar}>
                <TouchableOpacity style={styles.contactButton}>
                  <Mail size={16} color="#607D8B" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactButton}>
                  <Phone size={16} color="#607D8B" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyTeam}>
            <Text style={styles.emptyTeamText}>No team members assigned</Text>
            <TouchableOpacity style={styles.emptyAddButton}>
              <Plus size={16} color="#0B5394" />
              <Text style={styles.emptyAddButtonText}>Add Team Members</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <View style={styles.roles}>
        <Text style={styles.sectionTitle}>Required Roles</Text>
        
        <View style={styles.roleList}>
          <View style={styles.roleItem}>
            <View style={[styles.roleStatus, styles.roleStatusFilled]} />
            <Text style={styles.roleName}>Project Manager</Text>
            <TouchableOpacity style={styles.roleButton}>
              <Text style={styles.roleButtonText}>Filled</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.roleItem}>
            <View style={[styles.roleStatus, styles.roleStatusFilled]} />
            <Text style={styles.roleName}>Site Manager</Text>
            <TouchableOpacity style={styles.roleButton}>
              <Text style={styles.roleButtonText}>Filled</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.roleItem}>
            <View style={[styles.roleStatus, styles.roleStatusVacant]} />
            <Text style={styles.roleName}>Electrical Engineer</Text>
            <TouchableOpacity style={[styles.roleButton, styles.roleButtonVacant]}>
              <Text style={[styles.roleButtonText, styles.roleButtonTextVacant]}>Vacant</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.roleItem}>
            <View style={[styles.roleStatus, styles.roleStatusVacant]} />
            <Text style={styles.roleName}>Safety Inspector</Text>
            <TouchableOpacity style={[styles.roleButton, styles.roleButtonVacant]}>
              <Text style={[styles.roleButtonText, styles.roleButtonTextVacant]}>Vacant</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity style={styles.addRoleButton}>
          <Plus size={16} color="#0B5394" />
          <Text style={styles.addRoleText}>Add Role</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#263238',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#0B5394',
    marginLeft: 8,
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  memberCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  memberAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  memberName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#263238',
    textAlign: 'center',
    marginBottom: 4,
  },
  memberRole: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#607D8B',
    textAlign: 'center',
    marginBottom: 12,
  },
  contactBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  contactButton: {
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    marginHorizontal: 8,
  },
  emptyTeam: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  emptyTeamText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#607D8B',
    marginBottom: 16,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyAddButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#0B5394',
    marginLeft: 8,
  },
  roles: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  roleList: {
    marginTop: 16,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
  },
  roleStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
  },
  roleStatusFilled: {
    backgroundColor: '#4CAF50',
  },
  roleStatusVacant: {
    backgroundColor: '#F57C00',
  },
  roleName: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#263238',
    flex: 1,
  },
  roleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
  },
  roleButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#2E7D32',
  },
  roleButtonVacant: {
    backgroundColor: '#FFF3E0',
  },
  roleButtonTextVacant: {
    color: '#F57C00',
  },
  addRoleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  addRoleText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#0B5394',
    marginLeft: 8,
  },
});