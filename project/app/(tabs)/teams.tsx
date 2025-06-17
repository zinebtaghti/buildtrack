import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTeamContext } from '@/context/TeamContext';
import { Header } from '@/components/ui/Header';
import { Search, Plus, FilterX, Users, Settings } from 'lucide-react-native';
import { Team, TeamMember } from '@/hooks/useTeams';
import { getAssetUrl } from '@/config/cloudinary';

const MAX_AVATARS = 3;
const DEFAULT_AVATAR = 'https://res.cloudinary.com/drbnnp7by/image/upload/v1/defaults/avatar-placeholder.jpg';

export default function TeamsScreen() {
  const { teams, loading } = useTeamContext();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filteredTeams = teams?.filter(team => 
    team.name.toLowerCase().includes(search.toLowerCase()) ||
    team.description?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const renderTeamItem = ({ item }: { item: Team }) => (
    <TouchableOpacity 
      style={styles.teamCard}
      onPress={() => router.push(`/team/${item.id}`)}
    >
      <View style={styles.teamHeader}>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{item.name}</Text>
          <Text style={styles.teamDescription} numberOfLines={2}>
            {item.description || 'No description'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push(`/team/${item.id}`)}>
          <Settings size={20} color="#90A4AE" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.memberPreview}>
        <View style={styles.avatarStack}>
          {item.members.slice(0, MAX_AVATARS).map((member: TeamMember, index: number) => (
            <Image
              key={member.userId}
              source={{ 
                uri: member.avatar ? 
                  getAssetUrl(member.avatar, {
                    width: 64,
                    height: 64,
                    crop: 'fill',
                    quality: 'auto'
                  }) : 
                  DEFAULT_AVATAR 
              }}
              style={[
                styles.avatarImage,
                { marginLeft: index > 0 ? -15 : 0 }
              ]}
            />
          ))}
          {item.members.length > MAX_AVATARS && (
            <View style={[styles.avatarImage, styles.avatarMore, { marginLeft: -15 }]}>
              <Text style={styles.avatarMoreText}>+{item.members.length - MAX_AVATARS}</Text>
            </View>
          )}
        </View>
        <View style={styles.teamStats}>
          <View style={styles.statItem}>
            <Users size={16} color="#90A4AE" />
            <Text style={styles.statText}>{item.members.length} members</Text>
          </View>
          {item.projects.length > 0 && (
            <View style={styles.statItem}>
              <Text style={styles.statText}>{item.projects.length} projects</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Teams" />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#90A4AE" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search teams"
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
      
      <FlatList
        data={filteredTeams}
        renderItem={renderTeamItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Loading teams...' : 'No teams found'}
            </Text>
            {!loading && (
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push('/team/create')}
              >
                <Plus size={16} color="#fff" />
                <Text style={styles.createButtonText}>Create Team</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
      
      {!loading && filteredTeams.length > 0 && (
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => router.push('/team/create')}
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
    backgroundColor: '#fff',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Inter-Regular',
  },
  listContent: {
    padding: 16,
  },
  teamCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  teamInfo: {
    flex: 1,
    marginRight: 12,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  teamDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Inter-Regular',
  },
  memberPreview: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarMore: {
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMoreText: {
    fontSize: 12,
    color: '#0B5394',
    fontFamily: 'Inter-Medium',
  },
  teamStats: {
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
    fontFamily: 'Inter-Regular',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B5394',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
    fontFamily: 'Inter-Medium',
  },
  fabButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#0B5394',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});