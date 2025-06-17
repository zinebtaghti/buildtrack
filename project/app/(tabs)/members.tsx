import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Search, FilterX, Plus, UserPlus, Phone, Mail, Building2 } from 'lucide-react-native';
import { Header } from '@/components/ui/Header';
import { useRouter } from 'expo-router';
import { useMembers } from '@/hooks/useMembers';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
  projects?: string[];
  lastActive?: string;
  status?: 'active' | 'inactive';
}

export default function MembersScreen() {
  const { members, loading, error } = useMembers();
  const [search, setSearch] = useState('');
  const router = useRouter();
  
  const filteredMembers = members?.filter(member => 
    member.name.toLowerCase().includes(search.toLowerCase()) ||
    member.role.toLowerCase().includes(search.toLowerCase())
  ) || [];
  
  const handleAddMember = () => {
    router.push('/team/create');
  };
  
  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Membres" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0B5394" />
          <Text style={styles.loadingText}>Chargement des membres...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header title="Membres" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erreur: {error}</Text>
        </View>
      </View>
    );
  }
  
  const renderMemberCard = ({ item }: { item: Member }) => (
    <TouchableOpacity 
      style={styles.memberCard}
      onPress={() => router.push(`/member/${item.id}` as any)}
    >
      <View style={styles.memberHeader}>
        <View style={[styles.avatarContainer, { backgroundColor: '#E1E9F2' }]}>
          <Image 
            source={{ 
              uri: item.avatar || 'https://res.cloudinary.com/drbnnp7by/image/upload/v1/defaults/avatar-placeholder.jpg'
            }} 
            style={styles.avatar}
            onError={(e) => console.log('Error loading image:', e.nativeEvent.error)}
          />
        </View>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{item.name || 'Sans nom'}</Text>
          <Text style={styles.memberRole}>{item.role || 'Membre'}</Text>
          {item.projects && item.projects.length > 0 && (
            <View style={styles.projectsInfo}>
              <Building2 size={14} color="#607D8B" />
              <Text style={styles.projectCount}>
                {item.projects.length} projet{item.projects.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.contactInfo}>
        {item.email && (
          <View style={styles.contactRow}>
            <Mail size={16} color="#607D8B" />
            <Text style={styles.contactText}>{item.email}</Text>
          </View>
        )}
        {item.phone && (
          <View style={styles.contactRow}>
            <Phone size={16} color="#607D8B" />
            <Text style={styles.contactText}>{item.phone}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Membres" />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#90A4AE" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher des membres"
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
        data={filteredMembers}
        keyExtractor={item => item.id}
        renderItem={renderMemberCard}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {search ? 'Aucun membre trouvé' : 'Aucun membre ajouté'}
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddMember}
            >
              <UserPlus size={16} color="#fff" />
              <Text style={styles.addButtonText}>Ajouter un membre</Text>
            </TouchableOpacity>
          </View>
        }
      />
      
      <TouchableOpacity
        style={styles.fabButton}
        onPress={handleAddMember}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#607D8B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#263238',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  memberHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  memberInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  memberName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#263238',
    marginBottom: 4,
  },
  memberRole: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#607D8B',
    marginBottom: 4,
  },
  projectsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectCount: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#607D8B',
    marginLeft: 4,
  },
  contactInfo: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#607D8B',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#607D8B',
    textAlign: 'center',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B5394',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  fabButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0B5394',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});