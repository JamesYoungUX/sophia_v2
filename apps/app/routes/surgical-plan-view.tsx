import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Textarea } from '@repo/ui/components/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@repo/ui/components/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@repo/ui/components/collapsible';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Circle, 
  ArrowLeft,
  User,
  Stethoscope,
  Plus,
  Trash2,
  Edit,
  Save,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Settings,
  FileText,
  Target,
  AlertCircle
} from 'lucide-react';

// Types for care plan template data
interface PlanTask {
  id: string;
  name: string;
  description: string;
  category: 'preparation' | 'medical' | 'administrative' | 'lifestyle' | 'education' | 'assessment';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration?: number; // in minutes
  daysFromStart: number;
  prerequisites: string[]; // task IDs that must be completed first
  completionCriteria: string[];
  isRequired: boolean;
  alertThreshold?: number; // days before due date to show alert
}

interface PlanComponent {
  id: string;
  name: string;
  description: string;
  type: 'phase' | 'milestone' | 'checkpoint';
  daysFromStart: number;
  tasks: PlanTask[];
  requirements: string[];
}

interface CarePlanTemplate {
  id: string;
  name: string;
  description: string;
  category: 'surgical' | 'medical' | 'rehabilitation' | 'preventive' | 'chronic-care' | 'emergency';
  priority: 'routine' | 'urgent' | 'critical';
  estimatedDuration: number; // total days
  version: string;
  createdBy: string;
  createdAt: string;
  lastModified: string;
  tags: string[];
  components: PlanComponent[];
  globalRequirements: string[];
  validationRules: ValidationRule[];
}

interface ValidationRule {
  id: string;
  field: string;
  rule: 'required' | 'min-length' | 'max-length' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

// Helper functions
const getPriorityColor = (priority: PlanTask['priority']) => {
  switch (priority) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-blue-100 text-blue-800 border-blue-200';
  }
};

const getCategoryIcon = (category: PlanTask['category']) => {
  switch (category) {
    case 'medical':
      return <Stethoscope className="h-4 w-4" />;
    case 'preparation':
      return <Calendar className="h-4 w-4" />;
    case 'administrative':
      return <User className="h-4 w-4" />;
    case 'lifestyle':
      return <Clock className="h-4 w-4" />;
    case 'education':
      return <FileText className="h-4 w-4" />;
    case 'assessment':
      return <Target className="h-4 w-4" />;
    default:
      return <Circle className="h-4 w-4" />;
  }
};

const getComponentTypeIcon = (type: PlanComponent['type']) => {
  switch (type) {
    case 'phase':
      return <Calendar className="h-4 w-4" />;
    case 'milestone':
      return <Target className="h-4 w-4" />;
    case 'checkpoint':
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <Circle className="h-4 w-4" />;
  }
};

const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Validation Functions
const validateTemplate = (template: CarePlanTemplate): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Basic field validation
  if (!template.name?.trim()) {
    errors.push({ field: 'name', message: 'Plan name is required' });
  }
  if (!template.description?.trim()) {
    warnings.push({ field: 'description', message: 'Plan description is recommended' });
  }
  if (template.components.length === 0) {
    errors.push({ field: 'components', message: 'At least one component is required' });
  }

  // Component validation
  template.components.forEach((component, index) => {
    if (!component.name?.trim()) {
      errors.push({ field: `components[${index}].name`, message: `Component ${index + 1} name is required` });
    }
    if (component.tasks.length === 0) {
      warnings.push({ field: `components[${index}].tasks`, message: `Component "${component.name}" has no tasks` });
    }

    // Task validation
    component.tasks.forEach((task, taskIndex) => {
      if (!task.name?.trim()) {
        errors.push({ field: `components[${index}].tasks[${taskIndex}].name`, message: `Task ${taskIndex + 1} in "${component.name}" needs a name` });
      }
      if (task.daysFromStart < 0) {
        errors.push({ field: `components[${index}].tasks[${taskIndex}].daysFromStart`, message: `Task "${task.name}" cannot have negative days from start` });
      }
      if (task.completionCriteria.length === 0) {
        warnings.push({ field: `components[${index}].tasks[${taskIndex}].completionCriteria`, message: `Task "${task.name}" has no completion criteria` });
      }
    });
  });

  // Check for circular dependencies
  const circularDeps = checkCircularDependencies(template);
  if (circularDeps.length > 0) {
    circularDeps.forEach(dep => {
      errors.push({ field: 'dependencies', message: `Circular dependency detected: ${dep}` });
    });
  }

  // Timeline validation
  const timelineIssues = validateTimeline(template);
  timelineIssues.forEach(issue => {
    warnings.push({ field: 'timeline', message: issue });
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: calculateValidationScore(template, errors, warnings)
  };
};

const checkCircularDependencies = (template: CarePlanTemplate): string[] => {
  const allTasks = template.components.flatMap(c => c.tasks);
  const taskMap = new Map(allTasks.map(t => [t.id, t]));
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const circularDeps: string[] = [];

  const dfs = (taskId: string, path: string[]): boolean => {
    if (recursionStack.has(taskId)) {
      const cycleStart = path.indexOf(taskId);
      const cycle = path.slice(cycleStart).concat(taskId);
      circularDeps.push(cycle.map(id => taskMap.get(id)?.name || id).join(' → '));
      return true;
    }

    if (visited.has(taskId)) return false;

    visited.add(taskId);
    recursionStack.add(taskId);
    const currentPath = [...path, taskId];

    const task = taskMap.get(taskId);
    if (task) {
      for (const prereqId of task.prerequisites) {
        if (dfs(prereqId, currentPath)) {
          recursionStack.delete(taskId);
          return true;
        }
      }
    }

    recursionStack.delete(taskId);
    return false;
  };

  allTasks.forEach(task => {
    if (!visited.has(task.id)) {
      dfs(task.id, []);
    }
  });

  return circularDeps;
};

const validateTimeline = (template: CarePlanTemplate): string[] => {
  const issues: string[] = [];
  const allTasks = template.components.flatMap(c => c.tasks);
  const taskMap = new Map(allTasks.map(t => [t.id, t]));

  allTasks.forEach(task => {
    task.prerequisites.forEach(prereqId => {
      const prereqTask = taskMap.get(prereqId);
      if (prereqTask && prereqTask.daysFromStart >= task.daysFromStart) {
        issues.push(`Task "${task.name}" is scheduled before its prerequisite "${prereqTask.name}"`);
      }
    });
  });

  return issues;
};

const calculateValidationScore = (template: CarePlanTemplate, errors: ValidationError[], warnings: ValidationError[]): number => {
  let score = 100;
  score -= errors.length * 10; // Each error reduces score by 10
  score -= warnings.length * 2; // Each warning reduces score by 2
  
  // Bonus points for completeness
  if (template.description?.trim()) score += 5;
  if (template.globalRequirements.length > 0) score += 5;
  if (template.components.every(c => c.tasks.length > 0)) score += 10;
  if (template.components.every(c => c.tasks.every(t => t.completionCriteria.length > 0))) score += 10;
  
  return Math.max(0, Math.min(100, score));
};

const getValidationSummary = (validation: ValidationResult): string => {
  if (validation.isValid) {
    return `✅ Plan is valid (Score: ${validation.score}/100)`;
  }
  
  const errorCount = validation.errors.length;
  const warningCount = validation.warnings.length;
  
  return `❌ ${errorCount} error${errorCount !== 1 ? 's' : ''}, ${warningCount} warning${warningCount !== 1 ? 's' : ''} (Score: ${validation.score}/100)`;
};

// Validation interfaces
interface ValidationError {
  field: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  score: number;
}

// Plan Header Form Component
function PlanHeaderForm({ 
  template, 
  onUpdate 
}: { 
  template: CarePlanTemplate; 
  onUpdate: (updates: Partial<CarePlanTemplate>) => void; 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Plan Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="plan-name">Plan Name</Label>
            <Input 
              id="plan-name"
              value={template.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Enter plan name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan-category">Category</Label>
            <Select value={template.category} onValueChange={(value) => onUpdate({ category: value as CarePlanTemplate['category'] })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="surgical">Surgical</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="rehabilitation">Rehabilitation</SelectItem>
                <SelectItem value="preventive">Preventive</SelectItem>
                <SelectItem value="chronic-care">Chronic Care</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="plan-description">Description</Label>
          <Textarea 
            id="plan-description"
            value={template.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Describe the purpose and scope of this care plan"
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="plan-priority">Priority Level</Label>
            <Select value={template.priority} onValueChange={(value) => onUpdate({ priority: value as CarePlanTemplate['priority'] })}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="routine">Routine</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan-duration">Duration (days)</Label>
            <Input 
              id="plan-duration"
              type="number"
              value={template.estimatedDuration}
              onChange={(e) => onUpdate({ estimatedDuration: parseInt(e.target.value) || 0 })}
              placeholder="Total days"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan-version">Version</Label>
            <Input 
              id="plan-version"
              value={template.version}
              onChange={(e) => onUpdate({ version: e.target.value })}
              placeholder="e.g., 1.0.0"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Component Management Interface
function ComponentManagement({ 
  template, 
  onUpdate 
}: { 
  template: CarePlanTemplate; 
  onUpdate: (updates: Partial<CarePlanTemplate>) => void; 
}) {
  const [isAddingComponent, setIsAddingComponent] = useState(false);
  const [editingComponent, setEditingComponent] = useState<string | null>(null);
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);
  const [newComponent, setNewComponent] = useState<Partial<PlanComponent>>({
    name: '',
    description: '',
    type: 'phase',
    daysFromStart: 0,
    tasks: [],
    requirements: []
  });
  const [editComponent, setEditComponent] = useState<Partial<PlanComponent>>({});

  const addComponent = () => {
    if (newComponent.name && newComponent.description) {
      const component: PlanComponent = {
        id: generateId(),
        name: newComponent.name,
        description: newComponent.description,
        type: newComponent.type || 'phase',
        daysFromStart: newComponent.daysFromStart || 0,
        tasks: [],
        requirements: newComponent.requirements || []
      };
      onUpdate({ 
        components: [...template.components, component] 
      });
      setNewComponent({ name: '', description: '', type: 'phase', daysFromStart: 0, tasks: [], requirements: [] });
      setIsAddingComponent(false);
    }
  };

  const removeComponent = (componentId: string) => {
    onUpdate({ 
      components: template.components.filter(c => c.id !== componentId) 
    });
  };

  const startEditComponent = (component: PlanComponent) => {
    setEditingComponent(component.id);
    setEditComponent(component);
  };

  const saveEditComponent = () => {
    if (editingComponent && editComponent.name && editComponent.description) {
      onUpdate({
        components: template.components.map(c => 
          c.id === editingComponent ? { ...c, ...editComponent } : c
        )
      });
      setEditingComponent(null);
      setEditComponent({});
    }
  };

  const cancelEditComponent = () => {
    setEditingComponent(null);
    setEditComponent({});
  };

  const handleDragStart = (e: React.DragEvent, componentId: string) => {
    setDraggedComponent(componentId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetComponentId: string) => {
    e.preventDefault();
    if (draggedComponent && draggedComponent !== targetComponentId) {
      const draggedIndex = template.components.findIndex(c => c.id === draggedComponent);
      const targetIndex = template.components.findIndex(c => c.id === targetComponentId);
      
      const newComponents = [...template.components];
      const [draggedItem] = newComponents.splice(draggedIndex, 1);
      newComponents.splice(targetIndex, 0, draggedItem);
      
      onUpdate({ components: newComponents });
    }
    setDraggedComponent(null);
  };

  const addRequirement = (componentId: string, requirement: string) => {
    if (requirement.trim()) {
      onUpdate({
        components: template.components.map(c => 
          c.id === componentId 
            ? { ...c, requirements: [...c.requirements, requirement.trim()] }
            : c
        )
      });
    }
  };

  const removeRequirement = (componentId: string, requirementIndex: number) => {
    onUpdate({
      components: template.components.map(c => 
        c.id === componentId 
          ? { ...c, requirements: c.requirements.filter((_, i) => i !== requirementIndex) }
          : c
      )
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Plan Components
          </div>
          <Button 
            onClick={() => setIsAddingComponent(true)} 
            size="sm"
            disabled={isAddingComponent}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Component
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAddingComponent && (
          <Card className="border-dashed">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Component Name</Label>
                  <Input 
                    value={newComponent.name || ''}
                    onChange={(e) => setNewComponent({ ...newComponent, name: e.target.value })}
                    placeholder="Enter component name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select 
                    value={newComponent.type} 
                    onValueChange={(value) => setNewComponent({ ...newComponent, type: value as PlanComponent['type'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phase">Phase</SelectItem>
                      <SelectItem value="milestone">Milestone</SelectItem>
                      <SelectItem value="checkpoint">Checkpoint</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={newComponent.description || ''}
                  onChange={(e) => setNewComponent({ ...newComponent, description: e.target.value })}
                  placeholder="Describe this component"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Days from Start</Label>
                <Input 
                  type="number"
                  value={newComponent.daysFromStart || 0}
                  onChange={(e) => setNewComponent({ ...newComponent, daysFromStart: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              
              {/* Requirements section for new component */}
              <div className="space-y-2">
                <Label>Requirements (Optional)</Label>
                <div className="space-y-2">
                  {(newComponent.requirements || []).map((req, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input 
                        value={req}
                        onChange={(e) => {
                          const updatedReqs = [...(newComponent.requirements || [])];
                          updatedReqs[index] = e.target.value;
                          setNewComponent({ ...newComponent, requirements: updatedReqs });
                        }}
                        placeholder="Enter requirement"
                        className="flex-1"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          const updatedReqs = (newComponent.requirements || []).filter((_, i) => i !== index);
                          setNewComponent({ ...newComponent, requirements: updatedReqs });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const currentReqs = newComponent.requirements || [];
                      setNewComponent({ ...newComponent, requirements: [...currentReqs, ''] });
                    }}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Requirement
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={addComponent} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Component
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddingComponent(false);
                    setNewComponent({ name: '', description: '', type: 'phase', daysFromStart: 0, tasks: [], requirements: [] });
                  }} 
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {template.components.map((component) => (
          <Card 
            key={component.id}
            className={`transition-all duration-200 ${
              draggedComponent === component.id ? 'opacity-50 scale-95' : 'hover:shadow-md'
            }`}
            draggable
            onDragStart={(e) => handleDragStart(e, component.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, component.id)}
          >
            <CardContent className="p-4">
              {editingComponent === component.id ? (
                // Edit mode
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Component Name</Label>
                      <Input 
                        value={editComponent.name || ''}
                        onChange={(e) => setEditComponent({ ...editComponent, name: e.target.value })}
                        placeholder="Enter component name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select 
                        value={editComponent.type} 
                        onValueChange={(value) => setEditComponent({ ...editComponent, type: value as PlanComponent['type'] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="phase">Phase</SelectItem>
                          <SelectItem value="milestone">Milestone</SelectItem>
                          <SelectItem value="checkpoint">Checkpoint</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      value={editComponent.description || ''}
                      onChange={(e) => setEditComponent({ ...editComponent, description: e.target.value })}
                      placeholder="Describe this component"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Days from Start</Label>
                    <Input 
                      type="number"
                      value={editComponent.daysFromStart || 0}
                      onChange={(e) => setEditComponent({ ...editComponent, daysFromStart: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveEditComponent} size="sm">
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={cancelEditComponent} 
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View mode
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1 cursor-grab active:cursor-grabbing">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="mt-1">
                        {getComponentTypeIcon(component.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{component.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{component.description}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {component.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Day {component.daysFromStart}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {component.tasks.length} tasks
                          </Badge>
                          {component.requirements.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {component.requirements.length} requirements
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => startEditComponent(component)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeComponent(component.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Requirements section */}
                  {component.requirements.length > 0 && (
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Requirements ({component.requirements.length})
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 mt-2">
                        {component.requirements.map((req, index) => (
                          <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded text-sm">
                            <span>{req}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeRequirement(component.id, index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {template.components.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No components added yet</p>
            <p className="text-sm">Add components to structure your care plan</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Task Management Interface
function TaskManagement({ 
  template, 
  onUpdate 
}: { 
  template: CarePlanTemplate; 
  onUpdate: (updates: Partial<CarePlanTemplate>) => void; 
}) {
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<{ componentId: string; taskId: string } | null>(null);
  const [draggedTask, setDraggedTask] = useState<{ componentId: string; taskId: string } | null>(null);
  const [newTask, setNewTask] = useState<Partial<PlanTask>>({
    name: '',
    description: '',
    category: 'medical',
    priority: 'medium',
    daysFromStart: 0,
    prerequisites: [],
    completionCriteria: [],
    isRequired: true,
    estimatedDuration: 30
  });
  const [editTask, setEditTask] = useState<Partial<PlanTask>>({});
  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [newCriteria, setNewCriteria] = useState('');

  const addTask = () => {
    if (newTask.name && newTask.description && selectedComponentId) {
      const task: PlanTask = {
        id: generateId(),
        name: newTask.name,
        description: newTask.description,
        category: newTask.category || 'medical',
        priority: newTask.priority || 'medium',
        daysFromStart: newTask.daysFromStart || 0,
        prerequisites: newTask.prerequisites || [],
        completionCriteria: newTask.completionCriteria || [],
        isRequired: newTask.isRequired || true,
        estimatedDuration: newTask.estimatedDuration
      };
      
      const updatedComponents = template.components.map(component => {
        if (component.id === selectedComponentId) {
          return { ...component, tasks: [...component.tasks, task] };
        }
        return component;
      });
      
      onUpdate({ components: updatedComponents });
      setNewTask({ name: '', description: '', category: 'medical', priority: 'medium', daysFromStart: 0, prerequisites: [], completionCriteria: [], isRequired: true, estimatedDuration: 30 });
      setIsAddingTask(false);
    }
  };

  const removeTask = (componentId: string, taskId: string) => {
    const updatedComponents = template.components.map(component => {
      if (component.id === componentId) {
        return { ...component, tasks: component.tasks.filter(t => t.id !== taskId) };
      }
      return component;
    });
    onUpdate({ components: updatedComponents });
  };

  const startEditTask = (componentId: string, taskId: string) => {
    const component = template.components.find(c => c.id === componentId);
    const task = component?.tasks.find(t => t.id === taskId);
    if (task) {
      setEditTask({ ...task });
      setEditingTask({ componentId, taskId });
    }
  };

  const saveEditTask = () => {
    if (editingTask && editTask.name && editTask.description) {
      const updatedComponents = template.components.map(component => {
        if (component.id === editingTask.componentId) {
          return {
            ...component,
            tasks: component.tasks.map(task => 
              task.id === editingTask.taskId ? { ...task, ...editTask } as PlanTask : task
            )
          };
        }
        return component;
      });
      
      onUpdate({ components: updatedComponents });
      setEditingTask(null);
      setEditTask({});
    }
  };

  const cancelEditTask = () => {
    setEditingTask(null);
    setEditTask({});
  };

  const handleDragStart = (componentId: string, taskId: string) => {
    setDraggedTask({ componentId, taskId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetComponentId: string, targetIndex: number) => {
    if (!draggedTask) return;
    
    const sourceComponent = template.components.find(c => c.id === draggedTask.componentId);
    const draggedTaskData = sourceComponent?.tasks.find(t => t.id === draggedTask.taskId);
    
    if (!draggedTaskData) return;
    
    const updatedComponents = template.components.map(component => {
      if (component.id === draggedTask.componentId) {
        // Remove from source
        return { ...component, tasks: component.tasks.filter(t => t.id !== draggedTask.taskId) };
      } else if (component.id === targetComponentId) {
        // Add to target
        const newTasks = [...component.tasks];
        newTasks.splice(targetIndex, 0, draggedTaskData);
        return { ...component, tasks: newTasks };
      }
      return component;
    });
    
    onUpdate({ components: updatedComponents });
    setDraggedTask(null);
  };

  const addPrerequisite = (taskId: string, prerequisite: string) => {
    if (!prerequisite.trim()) return;
    
    const updatedComponents = template.components.map(component => ({
      ...component,
      tasks: component.tasks.map(task => 
        task.id === taskId 
          ? { ...task, prerequisites: [...task.prerequisites, prerequisite] }
          : task
      )
    }));
    
    onUpdate({ components: updatedComponents });
  };

  const removePrerequisite = (taskId: string, index: number) => {
    const updatedComponents = template.components.map(component => ({
      ...component,
      tasks: component.tasks.map(task => 
        task.id === taskId 
          ? { ...task, prerequisites: task.prerequisites.filter((_, i) => i !== index) }
          : task
      )
    }));
    
    onUpdate({ components: updatedComponents });
  };

  const addCompletionCriteria = (taskId: string, criteria: string) => {
    if (!criteria.trim()) return;
    
    const updatedComponents = template.components.map(component => ({
      ...component,
      tasks: component.tasks.map(task => 
        task.id === taskId 
          ? { ...task, completionCriteria: [...task.completionCriteria, criteria] }
          : task
      )
    }));
    
    onUpdate({ components: updatedComponents });
  };

  const removeCompletionCriteria = (taskId: string, index: number) => {
    const updatedComponents = template.components.map(component => ({
      ...component,
      tasks: component.tasks.map(task => 
        task.id === taskId 
          ? { ...task, completionCriteria: task.completionCriteria.filter((_, i) => i !== index) }
          : task
      )
    }));
    
    onUpdate({ components: updatedComponents });
  };

  const getAllTasks = () => {
    return template.components.flatMap(component => 
      component.tasks.map(task => ({ ...task, componentName: component.name }))
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Task Management
          </div>
          {template.components.length > 0 && (
            <Button 
              onClick={() => setIsAddingTask(true)} 
              size="sm"
              disabled={isAddingTask}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {template.components.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No components available</p>
            <p className="text-sm">Add components first to create tasks</p>
          </div>
        ) : (
          <>
            {isAddingTask && (
              <Card className="border-dashed">
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-2">
                    <Label>Select Component</Label>
                    <Select 
                      value={selectedComponentId || ''} 
                      onValueChange={setSelectedComponentId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a component" />
                      </SelectTrigger>
                      <SelectContent>
                        {template.components.map(component => (
                          <SelectItem key={component.id} value={component.id}>
                            {component.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Task Name</Label>
                      <Input 
                        value={newTask.name || ''}
                        onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                        placeholder="Enter task name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select 
                        value={newTask.category} 
                        onValueChange={(value) => setNewTask({ ...newTask, category: value as PlanTask['category'] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="medical">Medical</SelectItem>
                          <SelectItem value="preparation">Preparation</SelectItem>
                          <SelectItem value="administrative">Administrative</SelectItem>
                          <SelectItem value="lifestyle">Lifestyle</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="assessment">Assessment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      value={newTask.description || ''}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Describe this task"
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select 
                        value={newTask.priority} 
                        onValueChange={(value) => setNewTask({ ...newTask, priority: value as PlanTask['priority'] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Days from Start</Label>
                      <Input 
                        type="number"
                        value={newTask.daysFromStart || 0}
                        onChange={(e) => setNewTask({ ...newTask, daysFromStart: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Duration (minutes)</Label>
                      <Input 
                        type="number"
                        value={newTask.estimatedDuration || 30}
                        onChange={(e) => setNewTask({ ...newTask, estimatedDuration: parseInt(e.target.value) || 30 })}
                        placeholder="30"
                      />
                    </div>
                  </div>
                  
                  {/* Prerequisites Section */}
                  <div className="space-y-2">
                    <Label>Prerequisites</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Select 
                          value={newPrerequisite} 
                          onValueChange={setNewPrerequisite}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select prerequisite task" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAllTasks().filter(t => t.id !== newTask.id).map(task => (
                              <SelectItem key={task.id} value={task.id}>
                                {task.name} ({task.componentName})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (newPrerequisite && !newTask.prerequisites?.includes(newPrerequisite)) {
                              setNewTask({ 
                                ...newTask, 
                                prerequisites: [...(newTask.prerequisites || []), newPrerequisite] 
                              });
                              setNewPrerequisite('');
                            }
                          }}
                          disabled={!newPrerequisite}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {newTask.prerequisites && newTask.prerequisites.length > 0 && (
                        <div className="space-y-1">
                          {newTask.prerequisites.map((prereqId, index) => {
                            const prereqTask = getAllTasks().find(t => t.id === prereqId);
                            return (
                              <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded text-sm">
                                <span>{prereqTask?.name || prereqId}</span>
                                <Button 
                                  type="button"
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => {
                                    setNewTask({
                                      ...newTask,
                                      prerequisites: newTask.prerequisites?.filter((_, i) => i !== index)
                                    });
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Completion Criteria Section */}
                  <div className="space-y-2">
                    <Label>Completion Criteria</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input 
                          value={newCriteria}
                          onChange={(e) => setNewCriteria(e.target.value)}
                          placeholder="Enter completion criteria"
                          className="flex-1"
                        />
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (newCriteria.trim() && !newTask.completionCriteria?.includes(newCriteria.trim())) {
                              setNewTask({ 
                                ...newTask, 
                                completionCriteria: [...(newTask.completionCriteria || []), newCriteria.trim()] 
                              });
                              setNewCriteria('');
                            }
                          }}
                          disabled={!newCriteria.trim()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {newTask.completionCriteria && newTask.completionCriteria.length > 0 && (
                        <div className="space-y-1">
                          {newTask.completionCriteria.map((criteria, index) => (
                            <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded text-sm">
                              <span>{criteria}</span>
                              <Button 
                                type="button"
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  setNewTask({
                                    ...newTask,
                                    completionCriteria: newTask.completionCriteria?.filter((_, i) => i !== index)
                                  });
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={addTask} size="sm" disabled={!selectedComponentId}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Task
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddingTask(false)} 
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {template.components.map((component) => (
              <Collapsible key={component.id}>
                <CollapsibleTrigger asChild>
                  <Card className="cursor-pointer hover:bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getComponentTypeIcon(component.type)}
                          <div>
                            <h4 className="font-medium">{component.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {component.tasks.length} tasks
                            </p>
                          </div>
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-4 space-y-2">
                    {component.tasks.map((task, index) => (
                      <Card 
                        key={task.id}
                        className={`${draggedTask?.taskId === task.id ? 'opacity-50' : ''} transition-opacity`}
                        draggable
                        onDragStart={() => handleDragStart(component.id, task.id)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(component.id, index)}
                      >
                        <CardContent className="p-3">
                          {editingTask?.taskId === task.id && editingTask?.componentId === component.id ? (
                            // Edit Mode
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <Label>Task Name</Label>
                                  <Input 
                                    value={editTask.name || ''}
                                    onChange={(e) => setEditTask({ ...editTask, name: e.target.value })}
                                    placeholder="Enter task name"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Category</Label>
                                  <Select 
                                    value={editTask.category} 
                                    onValueChange={(value) => setEditTask({ ...editTask, category: value as PlanTask['category'] })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="medical">Medical</SelectItem>
                                      <SelectItem value="preparation">Preparation</SelectItem>
                                      <SelectItem value="administrative">Administrative</SelectItem>
                                      <SelectItem value="lifestyle">Lifestyle</SelectItem>
                                      <SelectItem value="education">Education</SelectItem>
                                      <SelectItem value="assessment">Assessment</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea 
                                  value={editTask.description || ''}
                                  onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                                  placeholder="Describe this task"
                                  rows={2}
                                />
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="space-y-2">
                                  <Label>Priority</Label>
                                  <Select 
                                    value={editTask.priority} 
                                    onValueChange={(value) => setEditTask({ ...editTask, priority: value as PlanTask['priority'] })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="low">Low</SelectItem>
                                      <SelectItem value="medium">Medium</SelectItem>
                                      <SelectItem value="high">High</SelectItem>
                                      <SelectItem value="critical">Critical</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Days from Start</Label>
                                  <Input 
                                    type="number"
                                    value={editTask.daysFromStart || 0}
                                    onChange={(e) => setEditTask({ ...editTask, daysFromStart: parseInt(e.target.value) || 0 })}
                                    placeholder="0"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Duration (minutes)</Label>
                                  <Input 
                                    type="number"
                                    value={editTask.estimatedDuration || 30}
                                    onChange={(e) => setEditTask({ ...editTask, estimatedDuration: parseInt(e.target.value) || 30 })}
                                    placeholder="30"
                                  />
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button onClick={saveEditTask} size="sm">
                                  <Save className="h-4 w-4 mr-1" />
                                  Save
                                </Button>
                                <Button variant="outline" onClick={cancelEditTask} size="sm">
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // View Mode
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="mt-1 cursor-grab">
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="mt-1">
                                  {getCategoryIcon(task.category)}
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-medium text-sm mb-1">{task.name}</h5>
                                  <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                                  
                                  <div className="flex items-center gap-2 flex-wrap mb-2">
                                    <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                                      {task.priority}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      Day {task.daysFromStart}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {task.category}
                                    </Badge>
                                    {task.estimatedDuration && (
                                      <Badge variant="outline" className="text-xs">
                                        {task.estimatedDuration}min
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {/* Prerequisites */}
                                  {task.prerequisites.length > 0 && (
                                    <div className="mb-2">
                                      <p className="text-xs font-medium text-muted-foreground mb-1">Prerequisites:</p>
                                      <div className="space-y-1">
                                        {task.prerequisites.map((prereqId, prereqIndex) => {
                                          const prereqTask = getAllTasks().find(t => t.id === prereqId);
                                          return (
                                            <div key={prereqIndex} className="flex items-center justify-between bg-blue-50 p-1 rounded text-xs">
                                              <span>{prereqTask?.name || prereqId}</span>
                                              <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => removePrerequisite(task.id, prereqIndex)}
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Completion Criteria */}
                                  {task.completionCriteria.length > 0 && (
                                    <div className="mb-2">
                                      <p className="text-xs font-medium text-muted-foreground mb-1">Completion Criteria:</p>
                                      <div className="space-y-1">
                                        {task.completionCriteria.map((criteria, criteriaIndex) => (
                                          <div key={criteriaIndex} className="flex items-center justify-between bg-green-50 p-1 rounded text-xs">
                                            <span>{criteria}</span>
                                            <Button 
                                              variant="ghost" 
                                              size="sm" 
                                              onClick={() => removeCompletionCriteria(task.id, criteriaIndex)}
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => startEditTask(component.id, task.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => removeTask(component.id, task.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    {component.tasks.length === 0 && (
                      <div 
                        className="text-center py-4 text-muted-foreground text-sm border-2 border-dashed border-muted rounded-lg"
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(component.id, 0)}
                      >
                        No tasks in this component
                        <br />
                        <span className="text-xs">Drag tasks here or add new ones</span>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Requirements Specifications Component
function RequirementsSpecifications({ 
  template, 
  onUpdate 
}: { 
  template: CarePlanTemplate; 
  onUpdate: (updates: Partial<CarePlanTemplate>) => void; 
}) {
  const [newGlobalRequirement, setNewGlobalRequirement] = useState('');
  const [newValidationRule, setNewValidationRule] = useState({
    field: '',
    rule: 'required' as ValidationRule['rule'],
    value: '',
    message: ''
  });
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [editRule, setEditRule] = useState<ValidationRule | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Add global requirement
  const addGlobalRequirement = () => {
    if (newGlobalRequirement.trim()) {
      const updatedRequirements = [...template.globalRequirements, newGlobalRequirement.trim()];
      onUpdate({ globalRequirements: updatedRequirements });
      setNewGlobalRequirement('');
    }
  };

  // Remove global requirement
  const removeGlobalRequirement = (index: number) => {
    const updatedRequirements = template.globalRequirements.filter((_, i) => i !== index);
    onUpdate({ globalRequirements: updatedRequirements });
  };

  // Add validation rule
  const addValidationRule = () => {
    if (newValidationRule.field && newValidationRule.message) {
      const rule: ValidationRule = {
        id: generateId(),
        field: newValidationRule.field,
        rule: newValidationRule.rule,
        value: newValidationRule.value || undefined,
        message: newValidationRule.message
      };
      const updatedRules = [...template.validationRules, rule];
      onUpdate({ validationRules: updatedRules });
      setNewValidationRule({ field: '', rule: 'required', value: '', message: '' });
      setIsAddingRule(false);
    }
  };

  // Remove validation rule
  const removeValidationRule = (ruleId: string) => {
    const updatedRules = template.validationRules.filter(rule => rule.id !== ruleId);
    onUpdate({ validationRules: updatedRules });
  };

  // Start editing rule
  const startEditRule = (rule: ValidationRule) => {
    setEditingRule(rule.id);
    setEditRule({ ...rule });
  };

  // Save edited rule
  const saveEditRule = () => {
    if (editRule && editingRule) {
      const updatedRules = template.validationRules.map(rule => 
        rule.id === editingRule ? editRule : rule
      );
      onUpdate({ validationRules: updatedRules });
      setEditingRule(null);
      setEditRule(null);
    }
  };

  // Cancel editing rule
  const cancelEditRule = () => {
    setEditingRule(null);
    setEditRule(null);
  };

  // Run validation
  const runValidation = () => {
    const result = validateTemplate(template);
    setValidationResult(result);
  };

  return (
    <div className="space-y-6">
      {/* Global Requirements Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Global Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new global requirement */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter global requirement..."
              value={newGlobalRequirement}
              onChange={(e) => setNewGlobalRequirement(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addGlobalRequirement()}
            />
            <Button onClick={addGlobalRequirement} disabled={!newGlobalRequirement.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Display global requirements */}
          <div className="space-y-2">
            {template.globalRequirements.map((requirement, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="flex-1">{requirement}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeGlobalRequirement(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {template.globalRequirements.length === 0 && (
              <p className="text-gray-500 text-center py-4">No global requirements defined</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validation Rules Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Validation Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add validation rule button */}
          {!isAddingRule && (
            <Button onClick={() => setIsAddingRule(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Validation Rule
            </Button>
          )}

          {/* Add new validation rule form */}
          {isAddingRule && (
            <div className="p-4 border rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rule-field">Field</Label>
                  <Input
                    id="rule-field"
                    placeholder="e.g., name, description"
                    value={newValidationRule.field}
                    onChange={(e) => setNewValidationRule(prev => ({ ...prev, field: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="rule-type">Rule Type</Label>
                  <Select
                    value={newValidationRule.rule}
                    onValueChange={(value) => setNewValidationRule(prev => ({ ...prev, rule: value as ValidationRule['rule'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="required">Required</SelectItem>
                      <SelectItem value="min-length">Minimum Length</SelectItem>
                      <SelectItem value="max-length">Maximum Length</SelectItem>
                      <SelectItem value="pattern">Pattern</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {(newValidationRule.rule === 'min-length' || newValidationRule.rule === 'max-length' || newValidationRule.rule === 'pattern') && (
                <div>
                  <Label htmlFor="rule-value">Value</Label>
                  <Input
                    id="rule-value"
                    placeholder={newValidationRule.rule === 'pattern' ? 'Regular expression' : 'Number'}
                    value={newValidationRule.value}
                    onChange={(e) => setNewValidationRule(prev => ({ ...prev, value: e.target.value }))}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="rule-message">Error Message</Label>
                <Input
                  id="rule-message"
                  placeholder="Error message to display"
                  value={newValidationRule.message}
                  onChange={(e) => setNewValidationRule(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addValidationRule} disabled={!newValidationRule.field || !newValidationRule.message}>
                  Add Rule
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsAddingRule(false);
                  setNewValidationRule({ field: '', rule: 'required', value: '', message: '' });
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Display validation rules */}
          <div className="space-y-2">
            {template.validationRules.map((rule) => (
              <div key={rule.id} className="p-3 border rounded-lg">
                {editingRule === rule.id && editRule ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Field</Label>
                        <Input
                          value={editRule.field}
                          onChange={(e) => setEditRule(prev => prev ? { ...prev, field: e.target.value } : null)}
                        />
                      </div>
                      <div>
                        <Label>Rule Type</Label>
                        <Select
                          value={editRule.rule}
                          onValueChange={(value) => setEditRule(prev => prev ? { ...prev, rule: value as ValidationRule['rule'] } : null)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="required">Required</SelectItem>
                            <SelectItem value="min-length">Minimum Length</SelectItem>
                            <SelectItem value="max-length">Maximum Length</SelectItem>
                            <SelectItem value="pattern">Pattern</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {(editRule.rule === 'min-length' || editRule.rule === 'max-length' || editRule.rule === 'pattern') && (
                      <div>
                        <Label>Value</Label>
                        <Input
                          value={editRule.value || ''}
                          onChange={(e) => setEditRule(prev => prev ? { ...prev, value: e.target.value } : null)}
                        />
                      </div>
                    )}
                    <div>
                      <Label>Error Message</Label>
                      <Input
                        value={editRule.message}
                        onChange={(e) => setEditRule(prev => prev ? { ...prev, message: e.target.value } : null)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveEditRule} size="sm">
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button variant="outline" onClick={cancelEditRule} size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{rule.field}</Badge>
                        <Badge variant="secondary">{rule.rule}</Badge>
                        {rule.value && <Badge variant="outline">{rule.value}</Badge>}
                      </div>
                      <p className="text-sm text-gray-600">{rule.message}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditRule(rule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeValidationRule(rule.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {template.validationRules.length === 0 && (
              <p className="text-gray-500 text-center py-4">No validation rules defined</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Validation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Plan Validation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runValidation} className="w-full">
            Run Validation Check
          </Button>
          
          {validationResult && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${
                validationResult.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`font-medium ${
                  validationResult.isValid ? 'text-green-800' : 'text-red-800'
                }`}>
                  {getValidationSummary(validationResult)}
                </p>
              </div>
              
              {validationResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-800">Errors:</h4>
                  {validationResult.errors.map((error, index) => (
                    <div key={index} className="p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-700">
                        <span className="font-medium">{error.field}:</span> {error.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              
              {validationResult.warnings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-yellow-800">Warnings:</h4>
                  {validationResult.warnings.map((warning, index) => (
                    <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-700">
                        <span className="font-medium">{warning.field}:</span> {warning.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Sample care plan template data
const sampleCarePlanTemplate: CarePlanTemplate = {
  id: 'template-001',
  name: 'Total Knee Replacement Care Plan',
  description: 'Comprehensive care plan template for total knee replacement surgery including pre-operative, operative, and post-operative phases',
  category: 'surgical',
  priority: 'urgent',
  estimatedDuration: 90,
  version: '1.0.0',
  createdBy: 'Dr. Sarah Johnson',
  createdAt: '2024-01-15',
  lastModified: '2024-01-20',
  tags: ['surgery', 'orthopedic', 'knee-replacement'],
  components: [
    {
      id: 'comp-001',
      name: 'Pre-operative Phase',
      description: 'All tasks and assessments required before surgery',
      type: 'phase',
      daysFromStart: 0,
      tasks: [
        {
          id: 'task-001',
          name: 'Pre-operative Assessment',
          description: 'Complete comprehensive medical evaluation including blood work, EKG, and chest X-ray',
          category: 'medical',
          priority: 'high',
          daysFromStart: 7,
          prerequisites: [],
          completionCriteria: ['Blood work completed', 'EKG normal', 'Chest X-ray clear'],
          isRequired: true
        },
        {
          id: 'task-002',
          name: 'Anesthesia Consultation',
          description: 'Meet with anesthesiologist to discuss anesthesia options and medical history',
          category: 'medical',
          priority: 'high',
          daysFromStart: 14,
          prerequisites: ['task-001'],
          completionCriteria: ['Consultation completed', 'Anesthesia plan documented'],
          isRequired: true
        }
      ],
      requirements: ['Medical clearance', 'Insurance authorization']
    },
    {
      id: 'comp-002',
      name: 'Surgery Preparation',
      description: 'Final preparations in the days leading up to surgery',
      type: 'phase',
      daysFromStart: 21,
      tasks: [
        {
          id: 'task-003',
          name: 'Stop Blood Thinners',
          description: 'Discontinue all blood-thinning medications as directed by physician',
          category: 'medical',
          priority: 'critical',
          daysFromStart: 28,
          prerequisites: [],
          completionCriteria: ['Medications discontinued', 'Physician notified'],
          isRequired: true
        },
        {
          id: 'task-004',
          name: 'Pre-surgical Education',
          description: 'Attend pre-surgical education class to learn about the procedure and recovery',
          category: 'education',
          priority: 'medium',
          daysFromStart: 21,
          prerequisites: [],
          completionCriteria: ['Education class attended', 'Materials reviewed'],
          isRequired: true
        }
      ],
      requirements: ['Education completion', 'Medication adjustments']
    },
    {
      id: 'comp-003',
      name: 'Surgery Day',
      description: 'Tasks and procedures for the day of surgery',
      type: 'milestone',
      daysFromStart: 35,
      tasks: [
        {
          id: 'task-005',
          name: 'Arrive at Hospital',
          description: 'Arrive at hospital 2 hours before scheduled surgery time',
          category: 'administrative',
          priority: 'critical',
          daysFromStart: 35,
          prerequisites: [],
          completionCriteria: ['Arrived on time', 'Check-in completed'],
          isRequired: true
        }
      ],
      requirements: ['Transportation arranged', 'Fasting completed']
    }
  ],
  globalRequirements: ['Patient consent', 'Insurance approval', 'Medical clearance'],
  validationRules: [
    {
      id: 'rule-001',
      field: 'name',
      rule: 'required',
      message: 'Plan name is required'
    },
    {
      id: 'rule-002',
      field: 'components',
      rule: 'min-length',
      value: 1,
      message: 'At least one component is required'
    }
  ]
};

export default function CarePlanTemplateBuilder() {
  const { planData } = Route.useSearch();
  const [template, setTemplate] = useState<CarePlanTemplate>(sampleCarePlanTemplate);
  const [activeTab, setActiveTab] = useState<'config' | 'components' | 'tasks' | 'requirements' | 'preview'>('config');

  // Load plan data from search params if provided
  useEffect(() => {
    if (planData) {
      try {
        const parsedPlan = JSON.parse(planData);
        setTemplate(parsedPlan);
      } catch (error) {
        console.error('Failed to parse plan data:', error);
      }
    }
  }, [planData]);

  const updateTemplate = (updates: Partial<CarePlanTemplate>) => {
    setTemplate(prev => ({ ...prev, ...updates }));
  };

  const saveTemplate = () => {
    // Here you would typically save to your backend
    console.log('Saving template:', template);
    // Show success message
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 2xl:p-8 3xl:p-12 4xl:p-16 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Care Plan Template Builder</h1>
            <p className="text-muted-foreground">
              Create and customize care plan templates for different medical procedures
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button onClick={saveTemplate} size="sm">
            <Save className="h-4 w-4 mr-1" />
            Save Template
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b">
        {[
          { id: 'config', label: 'Configuration', icon: Settings },
          { id: 'components', label: 'Components', icon: Target },
          { id: 'tasks', label: 'Tasks', icon: CheckCircle },
          { id: 'requirements', label: 'Requirements', icon: AlertCircle },
          { id: 'preview', label: 'Preview', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'config' && (
          <PlanHeaderForm template={template} onUpdate={updateTemplate} />
        )}
        
        {activeTab === 'components' && (
          <ComponentManagement template={template} onUpdate={updateTemplate} />
        )}
        
        {activeTab === 'tasks' && (
          <TaskManagement template={template} onUpdate={updateTemplate} />
        )}
        
        {activeTab === 'requirements' && (
          <RequirementsSpecifications template={template} onUpdate={updateTemplate} />
        )}
        
        {activeTab === 'preview' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Template Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Template Name</p>
                    <p className="text-lg font-semibold">{template.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Duration</p>
                    <p className="text-lg font-semibold">{template.estimatedDuration} days</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                  <p className="text-sm">{template.description}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Components ({template.components.length})</p>
                  <div className="space-y-2">
                    {template.components.map(component => (
                      <div key={component.id} className="flex items-center gap-2 p-2 border rounded">
                        {getComponentTypeIcon(component.type)}
                        <span className="font-medium">{component.name}</span>
                        <Badge variant="outline" className="ml-auto">
                          {component.tasks.length} tasks
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

const searchSchema = z.object({
  planData: z.string().optional(),
});

export const Route = createFileRoute('/surgical-plan-view')({
  component: CarePlanTemplateBuilder,
  validateSearch: searchSchema,
});