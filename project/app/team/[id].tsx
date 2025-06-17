import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTeamContext } from '@/context/TeamContext';
import { Header } from '@/components/ui/Header';
import { Users, Settings, Plus, Trash2 } from 'lucide-react-native';

export default function TeamDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { teams, updateTeam, deleteTeam, removeMember, updateMemberRole } = useTeamContext();
  const [loading, setLoading] = useState(false);

  const team = teams.find(t => t.id === id);

  if (!team) {
    return (
      <View style={styles.container}>
        <Header title="Team Details" showBack />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Team not found</Text>
        </View>
      </View>
    );
  }

  const handleDeleteTeam = async () => {
    Alert.alert(
      'Delete Team',
      'Are you sure you want to delete this team? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteTeam(team.id);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete team');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRemoveMember = async (userId: string) => {
    Alert.alert(
      'Remove Member',
      'Are you sure you want to remove this member from the team?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await removeMember(team.id, userId);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove member');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleUpdateMemberRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    setLoading(true);
    try {
      await updateMemberRole(team.id, userId, newRole);
    } catch (error) {
      Alert.alert('Error', 'Failed to update member role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Team Details" 
        showBack 
        onBackPress={() => router.back()}
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Information</Text>
          <View style={styles.infoCard}>
            <Text style={styles.teamName}>{team.name}</Text>
            <Text style={styles.teamDescription}>{team.description}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Users size={16} color="#90A4AE" />
                <Text style={styles.statText}>{team.members.length} members</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statText}>{team.projects.length} projects</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Team Members</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push(`/team/${team.id}/add-member`)}
            >
              <Plus size={16} color="#0B5394" />
              <Text style={styles.addButtonText}>Add Member</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.membersList}>
            {team.members.map((member) => (
              <View key={member.userId} style={styles.memberCard}>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name || 'Unknown User'}</Text>
                  <Text style={styles.memberRole}>{member.role}</Text>
                </View>
                <View style={styles.memberActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleUpdateMemberRole(member.userId, member.role)}
                    disabled={loading}
                  >
                    <Settings size={16} color="#90A4AE" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleRemoveMember(member.userId)}
                    disabled={loading}
                  >
                    <Trash2 size={16} color="#FF5252" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.deleteTeamButton, loading && styles.deleteTeamButtonDisabled]}
          onPress={handleDeleteTeam}
          disabled={loading}
        >
          <Trash2 size={16} color="#fff" />
          <Text style={styles.deleteTeamButtonText}>Delete Team</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },
  teamName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  teamDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  membersList: {
    gap: 12,
  },
  memberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 14,
    color: '#666',
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButton: {
    marginLeft: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  addButtonText: {
    color: '#0B5394',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  deleteTeamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF5252',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  deleteTeamButtonDisabled: {
    opacity: 0.7,
  },
  deleteTeamButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
}); 