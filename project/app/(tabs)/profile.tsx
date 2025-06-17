import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Switch, 
  Alert, 
  TextInput, 
  ActivityIndicator,
  Platform
} from 'react-native';
import { useAuthContext } from '@/context/AuthContext';
import { Header } from '@/components/ui/Header';
import { 
  CircleUser as UserCircle, 
  Bell, 
  Moon, 
  LogOut, 
  Camera, 
  Shield,
  Key
} from 'lucide-react-native';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useTheme } from '@/context/ThemeContext';
import { SettingItem } from '@/components/ui/SettingItem';

export default function ProfileScreen() {
  const { user, logout } = useAuthContext();
  const { settings, updateSettings } = useUserSettings();
  const { colors, isDarkMode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.displayName || '');
  const [editedRole, setEditedRole] = useState(user?.role || '');
  const [loading, setLoading] = useState(false);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
    },
    profileHeader: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 24,
      marginBottom: 16,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDarkMode ? 0.3 : 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    imageContainer: {
      position: 'relative',
      marginBottom: 16,
    },
    cameraButton: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 8,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDarkMode ? 0.3 : 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    userName: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      marginBottom: 4,
    },
    userRole: {
      fontSize: 16,
      color: colors.textSecondary,
      fontFamily: 'Inter-Regular',
      marginBottom: 16,
    },
    editProfileButton: {
      backgroundColor: colors.buttonSecondary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    editProfileText: {
      color: colors.primary,
      fontSize: 14,
      fontFamily: 'Inter-Medium',
    },
    editForm: {
      width: '100%',
      marginTop: 16,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.text,
    },
    editActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 8,
    },
    editButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      minWidth: 80,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: colors.inputBackground,
      marginRight: 8,
    },
    cancelButtonText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontFamily: 'Inter-Medium',
    },
    saveButton: {
      backgroundColor: colors.primary,
    },
    saveButtonText: {
      color: colors.surface,
      fontSize: 14,
      fontFamily: 'Inter-Medium',
    },
    section: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDarkMode ? 0.3 : 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 16,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDarkMode ? '#331111' : '#FFEBEE',
      padding: 16,
      borderRadius: 12,
      marginBottom: 32,
    },
    logoutText: {
      color: colors.error,
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      marginLeft: 8,
    },
  }), [colors, isDarkMode]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            try {
              setLoading(true);
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleProfileImageUpdate = async (imageUrl: string) => {
    try {
      setLoading(true);
      if (!user || !auth.currentUser) return;

      await updateProfile(auth.currentUser, { photoURL: imageUrl });
      await updateDoc(doc(db, 'users', user.uid), { photoURL: imageUrl });
    } catch (error) {
      console.error('Error updating profile image:', error);
      Alert.alert('Error', 'Failed to update profile image');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      if (!user || !auth.currentUser) return;

      await updateProfile(auth.currentUser, { displayName: editedName });
      await updateDoc(doc(db, 'users', user.uid), {
        name: editedName,
        role: editedRole
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Profile" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={styles.imageContainer}>
            <ImageUpload
              value={user?.photoURL || ''}
              onChange={handleProfileImageUpdate}
              size={120}
              folder="profiles"
              tags={['profile', user?.uid || '']}
              aspectRatio={1}
              maxWidth={500}
              maxHeight={500}
              quality={0.8}
            />
            <View style={styles.cameraButton}>
              <Camera size={16} color={colors.primary} />
            </View>
          </View>
          
          {isEditing ? (
            <View style={styles.editForm}>
              <TextInput
                style={styles.input}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Enter your name"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
              />
              <TextInput
                style={styles.input}
                value={editedRole}
                onChangeText={setEditedRole}
                placeholder="Enter your role"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
              />
              <View style={styles.editActions}>
                <TouchableOpacity 
                  style={[styles.editButton, styles.cancelButton]}
                  onPress={() => setIsEditing(false)}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.editButton, styles.saveButton]}
                  onPress={handleSaveProfile}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.surface} size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.userName}>{user?.displayName || 'User Name'}</Text>
              <Text style={styles.userRole}>{user?.role || 'Project Manager'}</Text>
              
              <TouchableOpacity 
                style={styles.editProfileButton}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <SettingItem
            icon={<UserCircle size={24} color={colors.primary} />}
            title="Personal Information"
            subtitle="Update your personal details"
            onPress={() => setIsEditing(true)}
          />
          
          <SettingItem
            icon={<Bell size={24} color="#F6941D" />}
            title="Notifications"
            subtitle="Configure notification settings"
            rightElement={
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={async (value) => {
                  try {
                    await updateSettings({ notificationsEnabled: value });
                  } catch (error) {
                    Alert.alert('Error', 'Failed to update notification settings');
                  }
                }}
                trackColor={{ false: colors.border, true: `${colors.primary}40` }}
                thumbColor={settings.notificationsEnabled ? colors.primary : colors.textSecondary}
              />
            }
            color="#F6941D"
          />
          
          <SettingItem
            icon={<Moon size={24} color={colors.textSecondary} />}
            title="Dark Mode"
            subtitle="Switch between light and dark themes"
            rightElement={
              <Switch
                value={settings.darkModeEnabled}
                onValueChange={async (value) => {
                  try {
                    await updateSettings({ darkModeEnabled: value });
                  } catch (error) {
                    Alert.alert('Error', 'Failed to update theme settings');
                  }
                }}
                trackColor={{ false: colors.border, true: `${colors.primary}40` }}
                thumbColor={settings.darkModeEnabled ? colors.primary : colors.textSecondary}
              />
            }
            color={colors.textSecondary}
          />

          <SettingItem
            icon={<Shield size={24} color="#4CAF50" />}
            title="Privacy & Security"
            subtitle="Manage your privacy settings"
            onPress={() => {}}
            color="#4CAF50"
          />

          <SettingItem
            icon={<Key size={24} color="#FF9800" />}
            title="Change Password"
            subtitle="Update your password"
            onPress={() => {}}
            color="#FF9800"
          />
        </View>

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.error} size="small" />
          ) : (
            <>
              <LogOut size={20} color={colors.error} />
              <Text style={styles.logoutText}>Logout</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#263238',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#90A4AE',
    fontFamily: 'Inter-Regular',
  },
});