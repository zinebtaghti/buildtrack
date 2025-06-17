import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, FlatList } from 'react-native';
import { useMembers } from '@/hooks/useMembers';
import { Search, X, UserPlus, User } from 'lucide-react-native';
import { Member } from '@/types';

interface MemberSelectorProps {
  selectedMembers: string[];
  onMemberSelect: (members: string[]) => void;
  availableMembers?: Member[] | null;
}

export function MemberSelector({ selectedMembers, onMemberSelect, availableMembers }: MemberSelectorProps) {
  const { members: allMembers, loading } = useMembers();
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  
  const members = availableMembers || allMembers;
  const filteredMembers = members?.filter(member => 
    !selectedMembers.includes(member.id) &&
    (member.name?.toLowerCase().includes(search.toLowerCase()) ||
     member.role?.toLowerCase().includes(search.toLowerCase()))
  ) || [];
  
  const selectedMemberDetails = members?.filter(member => 
    selectedMembers.includes(member.id)
  ) || [];
  
  const handleSelectMember = (member: Member) => {
    onMemberSelect([...selectedMembers, member.id]);
    setSearch('');
  };
  
  const handleRemoveMember = (memberId: string) => {
    onMemberSelect(selectedMembers.filter(id => id !== memberId));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const renderAvatar = (member: Member) => {
    if (member.avatar) {
      return (
        <View style={styles.avatarContainer}>
          <User size={24} color="#fff" />
        </View>
      );
    }
    return (
      <View style={styles.avatarContainer}>
        <Text style={styles.initialsText}>
          {member.name ? getInitials(member.name) : '??'}
        </Text>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.selectedContainer}>
        {selectedMemberDetails.map(member => (
          <View key={member.id} style={styles.selectedMember}>
            {renderAvatar(member)}
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberRole}>{member.role}</Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveMember(member.id)}
            >
              <X size={20} color="#DC2626" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <UserPlus size={24} color="#2196F3" />
          <Text style={styles.addButtonText}>Add Member</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.searchContainer}>
              <Search size={20} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search members..."
                value={search}
                onChangeText={setSearch}
                autoFocus
              />
            </View>

            <FlatList
              data={filteredMembers}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.memberItem}
                  onPress={() => {
                    handleSelectMember(item);
                    setModalVisible(false);
                  }}
                >
                  {renderAvatar(item)}
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{item.name}</Text>
                    <Text style={styles.memberRole}>{item.role}</Text>
                  </View>
                </TouchableOpacity>
              )}
              style={styles.memberList}
            />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  selectedContainer: {
    gap: 8,
  },
  selectedMember: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  memberInfo: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  memberRole: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  removeButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderStyle: 'dashed',
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#2196F3',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '90%',
    maxWidth: 400,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  memberList: {
    maxHeight: 300,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  closeButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
});