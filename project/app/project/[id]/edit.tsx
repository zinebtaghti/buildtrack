import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useProject } from '@/hooks/useProject';
import { useProjects, Project } from '@/hooks/useProjects';
import { Header } from '@/components/ui/Header';
import { MemberSelector } from '@/components/project/MemberSelector';

export default function EditProjectScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { project, loading, error } = useProject(id as string);
  const { updateProject } = useProjects();
  
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    description: '',
    client: '',
    location: '',
    startDate: '',
    endDate: '',
    budget: 0,
    status: 'active',
    team: [],
  });
  
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        client: project.client,
        location: project.location,
        startDate: project.startDate,
        endDate: project.endDate,
        budget: project.budget,
        status: project.status,
        team: project.team,
      });
    }
  }, [project]);
  
  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.client || !formData.location) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
      
      await updateProject(id as string, formData);
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Failed to update project');
    }
  };
  
  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Edit Project" showBack />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading project details...</Text>
        </View>
      </View>
    );
  }
  
  if (error || !project) {
    return (
      <View style={styles.container}>
        <Header title="Edit Project" showBack />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load project details</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Header title="Edit Project" showBack />
      
      <ScrollView 
        style={styles.contentContainer}
        contentContainerStyle={styles.contentScrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formGroup}>
          <Text style={styles.label}>Project Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Enter project name"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Enter project description"
            multiline
            numberOfLines={4}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Client *</Text>
          <TextInput
            style={styles.input}
            value={formData.client}
            onChangeText={(text) => setFormData({ ...formData, client: text })}
            placeholder="Enter client name"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            value={formData.location}
            onChangeText={(text) => setFormData({ ...formData, location: text })}
            placeholder="Enter project location"
          />
        </View>
        
        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Start Date</Text>
            <TextInput
              style={styles.input}
              value={formData.startDate}
              onChangeText={(text) => setFormData({ ...formData, startDate: text })}
              placeholder="YYYY-MM-DD"
            />
          </View>
          
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>End Date</Text>
            <TextInput
              style={styles.input}
              value={formData.endDate}
              onChangeText={(text) => setFormData({ ...formData, endDate: text })}
              placeholder="YYYY-MM-DD"
            />
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Budget</Text>
          <TextInput
            style={styles.input}
            value={formData.budget?.toString()}
            onChangeText={(text) => setFormData({ ...formData, budget: parseFloat(text) || 0 })}
            placeholder="Enter project budget"
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusContainer}>
            {['active', 'completed', 'on-hold'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusButton,
                  formData.status === status && styles.statusButtonActive
                ]}
                onPress={() => setFormData({ ...formData, status: status as Project['status'] })}
              >
                <Text style={[
                  styles.statusButtonText,
                  formData.status === status && styles.statusButtonTextActive
                ]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Team Members</Text>
          <MemberSelector
            selectedMembers={formData.team || []}
            onMembersChange={(members) => setFormData({ ...formData, team: members })}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
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
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#E53935',
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#0B5394',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#fff',
  },
  contentContainer: {
    flex: 1,
  },
  contentScrollContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#455A64',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#263238',
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  statusButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: '#0B5394',
  },
  statusButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#607D8B',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#0B5394',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  submitButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#fff',
  },
}); 