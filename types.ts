
export enum ComponentStatus {
  CONFIGURED = 'CONFIGURED',
  NOT_CONFIGURED = 'NOT_CONFIGURED',
  LOCKED = 'LOCKED',
}

export enum ChangeType {
  NONE = 'NONE',
  VERSION_CHANGE = 'VERSION_CHANGE',
  INGREDIENT_CHANGE = 'INGREDIENT_CHANGE',
  CUSTOM_UPLOAD = 'CUSTOM_UPLOAD',
}

export interface Version {
  id: string;
  versionString: string;
  releaseDate: string;
  releasedBy: string;
  isNewer?: boolean;
  description?: string; // Optional description for custom uploads
}

export interface Ingredient {
  id: string;
  name: string;
  projectFeed: string;
  siliconFamily: string;
  releaseCount: number;
  versions: Version[];
}

export interface ComponentTypeData {
  id: string;
  label: string;
  category: 'KEY_INGREDIENTS' | 'STANDARD' | 'LOCKED';
  status: ComponentStatus;
  source: 'Baseline' | 'User'; // Added source field
  currentIngredientId: string | null;
  currentVersionId: string | null;
  
  // Staged changes (what the user is modifying in the modal)
  stagedIngredientId: string | null;
  stagedVersionId: string | null;
  changeType: ChangeType;
  
  // For revert functionality
  originalIngredientId: string | null;
  originalVersionId: string | null;
  
  // View settings
  isPinned?: boolean;
  order?: number;
}

export interface WorkflowStep {
  id: string;
  label: string;
  stage: 'Build' | 'Test' | 'Deploy';
  status: 'Not started' | 'Running' | 'Complete' | 'Failed';
}

export interface AppState {
  types: ComponentTypeData[];
  ingredients: Ingredient[]; // Database of all available ingredients
  steps: WorkflowStep[];
  stepOverrides: Record<string, Record<string, string>>; // stepId -> knobName -> value
}

// --- KNOB MANAGEMENT TYPES ---

export interface KnobOption {
  text: string;
  value: string;
}

export interface KnobMeta {
  knobName: string;
  type: 'numeric' | 'oneof' | 'checkbox' | 'string';
  prompt: string;
  description: string;
  categoryPath: string;
  dependencies: string;
  defaultValue: string;
  currentValue: string;
  size: string;
  offset: string;
  varstoreIndex: string;
  varstoreName: string;
  min: string | null;
  max: string | null;
  step: string | null;
  options: KnobOption[] | null;
}

export interface KnobOverride {
  knobName: string;
  value: string;
}
