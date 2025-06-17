import { useState, useEffect } from 'react';
import { useProjects } from './useProjects';
import { Project } from '@/types';

// Hook for fetching a single project by ID
export const useProject = (id: string) => {
  const { projects, loading: projectsLoading } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (projectsLoading) {
        return; // Wait for projects to load
      }

      setLoading(true);
      
      try {
        // Find project in the loaded projects
        const foundProject = projects?.find(p => p.id === id) || null;
        
        if (!foundProject) {
          setError('Project not found');
        } else {
          setProject(foundProject);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        setError('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, projects, projectsLoading]);

  return { project, loading, error };
};