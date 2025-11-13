import { createContext, useContext } from "react";
import type { ReactNode } from "react";

interface ProjectsContextType {
  refreshProjects: () => void;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export function useProjectsContext() {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error("useProjectsContext must be used within ProjectsProvider");
  }
  return context;
}

interface ProjectsProviderProps {
  children: ReactNode;
  refreshProjects: () => void;
}

export function ProjectsProvider({ children, refreshProjects }: ProjectsProviderProps) {
  return (
    <ProjectsContext.Provider value={{ refreshProjects }}>
      {children}
    </ProjectsContext.Provider>
  );
}

