import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuthContext } from '@/context/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import { ArrowLeft, Calendar, Banknote, Users, MapPin, CircleCheck as CheckCircle, ArrowRight } from 'lucide-react-native';
import { DatePicker } from '@/components/ui/DatePicker';
import { MemberSelector } from '@/components/project/MemberSelector';
import { Member } from '@/types';
import { useMembers } from '@/hooks/useMembers';

export default function CreateProjectScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [client, setClient] = useState('');

  const { user } = useAuthContext();
  const { createProject, loading } = useProjects();
  const { members } = useMembers();

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a project name');
      return;
    }

    try {
      await createProject({
        name,
        description,
        budget: parseFloat(budget) || 0,
        location,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        team: selectedMembers,
        client,
        status: 'active',
      });
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create project');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Project</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Project Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter project name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter project description"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Budget</Text>
            <View style={styles.inputWithIcon}>
              <Banknote size={20} color="#6B7280" />
              <TextInput
                style={[styles.input, styles.inputIcon]}
                value={budget}
                onChangeText={setBudget}
                placeholder="Enter budget"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={20} color="#6B7280" />
              <TextInput
                style={[styles.input, styles.inputIcon]}
                value={location}
                onChangeText={setLocation}
                placeholder="Enter location"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Start Date</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Calendar size={20} color="#6B7280" />
              <Text style={styles.dateText}>
                {startDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>End Date</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Calendar size={20} color="#6B7280" />
              <Text style={styles.dateText}>
                {endDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Team Members</Text>
            <MemberSelector
              availableMembers={members}
              selectedMembers={selectedMembers}
              onMemberSelect={setSelectedMembers}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Client</Text>
            <TextInput
              style={styles.input}
              value={client}
              onChangeText={setClient}
              placeholder="Enter client name"
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCreate}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating...' : 'Create Project'}
            </Text>
            <ArrowRight size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showStartDatePicker && (
        <DatePicker
          value={startDate}
          onChange={(date) => {
            setStartDate(date);
            setShowStartDatePicker(false);
          }}
          onClose={() => setShowStartDatePicker(false)}
        />
      )}

      {showEndDatePicker && (
        <DatePicker
          value={endDate}
          onChange={(date) => {
            setEndDate(date);
            setShowEndDatePicker(false);
          }}
          onClose={() => setShowEndDatePicker(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingLeft: 12,
  },
  inputIcon: {
    flex: 1,
    borderWidth: 0,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
  },
  dateText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Inter-Regular',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginRight: 8,
  },
});