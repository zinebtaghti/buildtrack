import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuthContext } from '@/context/AuthContext';

// Team types
export interface TeamMember {
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string;
  name: string;
  email: string;
  avatar?: string | null;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  members: TeamMember[];
  projects: string[]; // Array of project IDs
  settings?: {
    allowMemberInvites: boolean;
    defaultRole: 'admin' | 'member';
  };
}

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  // Fetch teams
  const fetchTeams = async () => {
    if (!user) {
      console.log('No user found, skipping teams fetch');
      return;
    }

    console.log('Starting to fetch teams for user:', user.uid);
    setLoading(true);
    setError(null);

    try {
      const teamsRef = collection(db, 'teams');
      console.log('Created teams reference');

      // First get teams where user is the creator
      const createdTeamsQuery = query(
        teamsRef,
        where('createdBy', '==', user.uid)
      );
      console.log('Created creator teams query');

      // Then get teams where user is a member
      const memberTeamsQuery = query(
        teamsRef,
        where('members', 'array-contains', { userId: user.uid })
      );
      console.log('Created member teams query');

      console.log('Executing creator teams query...');
      const createdTeamsSnapshot = await getDocs(createdTeamsQuery);
      console.log('Creator teams query executed, got', createdTeamsSnapshot.size, 'documents');

      console.log('Executing member teams query...');
      const memberTeamsSnapshot = await getDocs(memberTeamsQuery);
      console.log('Member teams query executed, got', memberTeamsSnapshot.size, 'documents');

      const createdTeams = createdTeamsSnapshot.docs.map(doc => {
        console.log('Processing creator team document:', doc.id, doc.data());
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          members: data.members.map((member: any) => ({
            ...member,
            role: member.role as 'admin' | 'member'
          }))
        } as Team;
      });

      const memberTeams = memberTeamsSnapshot.docs.map(doc => {
        console.log('Processing member team document:', doc.id, doc.data());
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          members: data.members.map((member: any) => ({
            ...member,
            role: member.role as 'admin' | 'member'
          }))
        } as Team;
      });

      // Combine and remove duplicates
      const allTeams = [...createdTeams, ...memberTeams];
      const uniqueTeams = allTeams.filter((team, index, self) =>
        index === self.findIndex((t) => t.id === team.id)
      );

      console.log('Final teams list:', uniqueTeams);
      setTeams(uniqueTeams);
    } catch (err: any) {
      console.error('Detailed error fetching teams:', {
        error: err,
        errorMessage: err.message,
        errorCode: err.code,
        errorStack: err.stack
      });
      setError('Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  // Create new team
  const createTeam = async (teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'members' | 'projects'>) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      const now = new Date().toISOString();
      const newTeam: Omit<Team, 'id'> = {
        ...teamData,
        createdAt: now,
        updatedAt: now,
        createdBy: user.uid,
        members: [{
          userId: user.uid,
          role: 'admin',
          joinedAt: now,
          name: user.displayName || 'Unknown',
          email: user.email || '',
          avatar: user.photoURL
        }],
        projects: [],
        settings: {
          allowMemberInvites: true,
          defaultRole: 'member' as const
        }
      };

      const docRef = await addDoc(collection(db, 'teams'), newTeam);
      const createdTeam = {
        id: docRef.id,
        ...newTeam
      };

      setTeams(prev => [createdTeam, ...prev]);
      return createdTeam;
    } catch (err) {
      console.error('Error creating team:', err);
      setError('Failed to create team');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update team
  const updateTeam = async (teamId: string, updates: Partial<Team>) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      const teamRef = doc(db, 'teams', teamId);
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(teamRef, updateData);
      
      setTeams(prev => 
        prev.map(team => 
          team.id === teamId 
            ? { ...team, ...updateData }
            : team
        )
      );
    } catch (err) {
      console.error('Error updating team:', err);
      setError('Failed to update team');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete team
  const deleteTeam = async (teamId: string) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      await deleteDoc(doc(db, 'teams', teamId));
      setTeams(prev => prev.filter(team => team.id !== teamId));
    } catch (err) {
      console.error('Error deleting team:', err);
      setError('Failed to delete team');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add member to team
  const addMember = async (teamId: string, memberData: Omit<TeamMember, 'joinedAt'>) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      const teamRef = doc(db, 'teams', teamId);
      const now = new Date().toISOString();
      
      // Create a properly typed member object with required fields
      const newMember: TeamMember = {
        userId: memberData.userId,
        role: memberData.role,
        name: memberData.name || 'Unknown',
        email: memberData.email || '',
        avatar: memberData.avatar || null,
        joinedAt: now
      };

      await updateDoc(teamRef, {
        members: arrayUnion(newMember),
        updatedAt: now
      });

      setTeams(prev =>
        prev.map(team =>
          team.id === teamId
            ? {
                ...team,
                members: [...team.members, newMember],
                updatedAt: now
              }
            : team
        )
      );

      return newMember;
    } catch (err) {
      console.error('Error adding member:', err);
      setError('Failed to add member');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove member from team
  const removeMember = async (teamId: string, userId: string) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      // Get the team directly from our state first
      const team = teams.find(t => t.id === teamId);
      if (!team) {
        throw new Error('Team not found');
      }

      const memberToRemove = team.members.find(member => member.userId === userId);
      if (!memberToRemove) {
        throw new Error('Member not found in team');
      }

      // Prevent removing the last admin
      const admins = team.members.filter(m => m.role === 'admin');
      if (admins.length === 1 && admins[0].userId === userId) {
        throw new Error('Cannot remove the last admin');
      }

      const now = new Date().toISOString();
      const teamRef = doc(db, 'teams', teamId);

      // Update Firestore
      await updateDoc(teamRef, {
        members: arrayRemove(memberToRemove),
        updatedAt: now
      });

      // Update local state
      setTeams(prev =>
        prev.map(team =>
          team.id === teamId
            ? {
                ...team,
                members: team.members.filter(m => m.userId !== userId),
                updatedAt: now
              }
            : team
        )
      );
    } catch (err) {
      console.error('Error removing member:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove member';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update member role
  const updateMemberRole = async (teamId: string, userId: string, newRole: 'admin' | 'member') => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      const teamRef = doc(db, 'teams', teamId);
      const teamDoc = await getDocs(query(collection(db, 'teams'), where('id', '==', teamId)));
      
      if (teamDoc.empty) {
        throw new Error('Team not found');
      }

      const currentMembers = teamDoc.docs[0].data().members || [];
      const updatedMembers = currentMembers.map((member: TeamMember) =>
        member.userId === userId
          ? { ...member, role: newRole }
          : member
      );

      await updateDoc(teamRef, {
        members: updatedMembers,
        updatedAt: new Date().toISOString()
      });

      setTeams(prev =>
        prev.map(team =>
          team.id === teamId
            ? {
                ...team,
                members: updatedMembers,
                updatedAt: new Date().toISOString()
              }
            : team
        )
      );
    } catch (err) {
      console.error('Error updating member role:', err);
      setError('Failed to update member role');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add project to team
  const addProject = async (teamId: string, projectId: string) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      const teamRef = doc(db, 'teams', teamId);
      await updateDoc(teamRef, {
        projects: arrayUnion(projectId),
        updatedAt: new Date().toISOString()
      });

      setTeams(prev =>
        prev.map(team =>
          team.id === teamId
            ? {
                ...team,
                projects: [...team.projects, projectId],
                updatedAt: new Date().toISOString()
              }
            : team
        )
      );
    } catch (err) {
      console.error('Error adding project:', err);
      setError('Failed to add project');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove project from team
  const removeProject = async (teamId: string, projectId: string) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      const teamRef = doc(db, 'teams', teamId);
      await updateDoc(teamRef, {
        projects: arrayRemove(projectId),
        updatedAt: new Date().toISOString()
      });

      setTeams(prev =>
        prev.map(team =>
          team.id === teamId
            ? {
                ...team,
                projects: team.projects.filter(id => id !== projectId),
                updatedAt: new Date().toISOString()
              }
            : team
        )
      );
    } catch (err) {
      console.error('Error removing project:', err);
      setError('Failed to remove project');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch teams when user changes
  useEffect(() => {
    if (user) {
      fetchTeams();
    } else {
      setTeams([]);
    }
  }, [user]);

  return {
    teams,
    loading,
    error,
    createTeam,
    updateTeam,
    deleteTeam,
    addMember,
    removeMember,
    updateMemberRole,
    addProject,
    removeProject,
    refreshTeams: fetchTeams
  };
}