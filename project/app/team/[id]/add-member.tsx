import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTeamContext } from '@/context/TeamContext';
import { Header } from '@/components/ui/Header';
import { useMembers } from '@/hooks/useMembers';
import { Search, UserCheck, FilterX } from 'lucide-react-native';
import { TeamMember } from '@/hooks/useTeams';

export default function AddMemberScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { teams, addMember } = useTeamContext();
  const { members, loading: membersLoading, error: membersError } = useMembers();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [loading, setLoading] = useState(false);
  
  // Make sure we get the team and validate it exists
  const team = teams?.find(t => t.id === id);
  
  useEffect(() => {
    if (!team) {
      Alert.alert('Error', 'Team not found');
      router.back();
    }
  }, [team, router]);
  
  const filteredMembers = members?.filter(member => 
    !team?.members?.some(m => m.userId === member.id) && (
      member.name?.toLowerCase().includes(search.toLowerCase()) ||
      member.email?.toLowerCase().includes(search.toLowerCase())
    )
  ) || [];

  const handleAddMember = async (memberToAdd: { id: string; name?: string; email?: string; photoURL?: string; }) => {
    if (!memberToAdd?.id) {
      Alert.alert('Error', 'Invalid member data');
      return;
    }

    if (!team?.id) {
      Alert.alert('Error', 'Team not found');
      router.back();
      return;
    }    setLoading(true);
    try {
      // Clean member data before sending
      const memberData: Omit<TeamMember, 'joinedAt'> = {
        userId: memberToAdd.id,
        role,
        name: memberToAdd.name || 'Unknown',
        email: memberToAdd.email || ''
      };
      
      // Only add avatar if it exists
      if (memberToAdd.photoURL) {
        memberData.avatar = memberToAdd.photoURL;
      }
      
      await addMember(team.id, memberData);
      Alert.alert('Success', 'Member added successfully');
      router.back();
    } catch (error: unknown) {
      console.error('Error adding member:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add member';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!team) {
    return (
      <View style={styles.container}>
        <Header title="Add Member" showBack />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Add Member" showBack />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <Search style={styles.searchIcon} size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search members..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#666"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} style={styles.clearButton}>
                <FilterX size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.roleSelector}>
            <TouchableOpacity
              style={[styles.roleButton, role === 'member' && styles.roleButtonActive]}
              onPress={() => setRole('member')}
              disabled={loading}
            >
              <Text style={[styles.roleText, role === 'member' && styles.roleTextActive]}>Member</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === 'admin' && styles.roleButtonActive]}
              onPress={() => setRole('admin')}
              disabled={loading}
            >
              <Text style={[styles.roleText, role === 'admin' && styles.roleTextActive]}>Admin</Text>
            </TouchableOpacity>
          </View>
        </View>

        {membersLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : membersError ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{membersError}</Text>
          </View>
        ) : filteredMembers.length === 0 ? (
          <View style={styles.centered}>
            <Text>No members found</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            <FlatList
              data={filteredMembers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.memberItem}
                  onPress={() => handleAddMember(item)}
                  disabled={loading}
                >
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{item.name || 'Unknown'}</Text>
                    <Text style={styles.memberEmail}>{item.email}</Text>
                  </View>
                  {loading ? (
                    <ActivityIndicator size="small" color="#666" />
                  ) : (
                    <UserCheck size={20} color="#666" />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={styles.listContent}
            />
          </View>
        )}
      </View>
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
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listContainer: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  clearButton: {
    padding: 4,
  },
  roleSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
  },
  roleButton: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  roleButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  roleText: {
    fontSize: 16,
    color: '#666',
  },
  roleTextActive: {
    color: '#000',
    fontWeight: '500',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },  errorText: {
    color: '#ff3b30',
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
});