import React, { createContext, useContext } from 'react';
import { useTeams, Team, TeamMember } from '@/hooks/useTeams';

interface TeamContextType {
  teams: Team[];
  loading: boolean;
  error: string | null;
  createTeam: (teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'members' | 'projects'>) => Promise<Team>;
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  addMember: (teamId: string, memberData: Omit<TeamMember, 'joinedAt'>) => Promise<TeamMember>;
  removeMember: (teamId: string, userId: string) => Promise<void>;
  updateMemberRole: (teamId: string, userId: string, newRole: 'admin' | 'member') => Promise<void>;
  addProject: (teamId: string, projectId: string) => Promise<void>;
  removeProject: (teamId: string, projectId: string) => Promise<void>;
  refreshTeams: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const teamData = useTeams();

  return (
    <TeamContext.Provider value={teamData}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeamContext = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeamContext must be used within a TeamProvider');
  }
  return context;
}; 