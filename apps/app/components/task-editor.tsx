import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Badge } from '@repo/ui/components/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/select';
import { Textarea } from '@repo/ui/components/textarea';
import { Label } from '@repo/ui/components/label';
import { Separator } from '@repo/ui/components/separator';
import { Switch } from '@repo/ui/components/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/tabs';
import {
  Save,
  X,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';

const DEBUG_LOG = true;

// Types
interface TaskSpecification {
  id?: string;
  taskId: string;
  name: string;
  category: 'Medication' | 'Assessment' | 'Education' | 'Monitoring' | 'Procedure' | 'Documentation' | 'Communication' | 'Discharge' | 'Follow-up' | 'Other';
  instructionPatient: string;
  instructionClinician: string;
  timing?: {
    offsetDays?: number;
    durationDays?: number;
    timeOfDay?: string;
    isFlexible?: boolean;
  };
  conditions?: {
    medications?: string[];
    surgery_types?: string[];
    comorbidities?: string[];
  };
  evidence?: {
    source?: string;
    url?: string;
    level?: string;
    publicationDate?: string;
    notes?: string;
  };
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'deferred' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  versionStatus: 'draft' | 'active' | 'inactive';
  version: string;
  isTemplate: boolean;
}

interface TaskValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

interface TaskEditorProps {
  task?: TaskSpecification;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: TaskSpecification) => void;
  onValidate?: (task: TaskSpecification) => TaskValidationError[];
}

// Default task template
const createDefaultTask = (): TaskSpecification => ({
  taskId: '',
  name: '',
  category: 'Other',
  instructionPatient: '',
  instructionClinician: '',
  timing: {
    offsetDays: 0,
    durationDays: 1,
    timeOfDay: '',
    isFlexible: true,
  },
  conditions: {
    medications: [],
    surgery_types: [],
    comorbidities: [],
  },
  evidence: {
    source: '',
    url: '',
    level: '',
    publicationDate: '',
    notes: '',
  },
  status: 'pending',
  priority: 'medium',
  versionStatus: 'draft',
  version: '1.0.0',
  isTemplate: false,
});

// Validation function
const validateTask = (task: TaskSpecification): TaskValidationError[] => {
  const errors: TaskValidationError[] = [];

  if (!task.taskId.trim()) {
    errors.push({
      field: 'taskId',
      message: 'Task ID is required',
      code: 'REQUIRED_FIELD',
      severity: 'error',
    });
  }

  if (!task.name.trim()) {
    errors.push({
      field: 'name',
      message: 'Task name is required',
      code: 'REQUIRED_FIELD',
      severity: 'error',
    });
  }

  if (!task.instructionPatient.trim()) {
    errors.push({
      field: 'instructionPatient',
      message: 'Patient instruction is required',
      code: 'REQUIRED_FIELD',
      severity: 'error',
    });
  }

  if (!task.instructionClinician.trim()) {
    errors.push({
      field: 'instructionClinician',
      message: 'Clinician instruction is required',
      code: 'REQUIRED_FIELD',
      severity: 'error',
    });
  }

  if (task.timing?.offsetDays !== undefined && task.timing.offsetDays < -365) {
    errors.push({
      field: 'timing.offsetDays',
      message: 'Offset days cannot be more than 365 days in the past',
      code: 'INVALID_RANGE',
      severity: 'error',
    });
  }

  if (task.timing?.durationDays !== undefined && task.timing.durationDays <= 0) {
    errors.push({
      field: 'timing.durationDays',
      message: 'Duration must be greater than 0',
      code: 'INVALID_RANGE',
      severity: 'error',
    });
  }

  if (task.evidence?.url && !isValidUrl(task.evidence.url)) {
    errors.push({
      field: 'evidence.url',
      message: 'Please enter a valid URL',
      code: 'INVALID_FORMAT',
      severity: 'warning',
    });
  }

  return errors;
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Array input component for medications, surgery types, etc.
interface ArrayInputProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

function ArrayInput({ label, values, onChange, placeholder }: ArrayInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addValue = () => {
    if (inputValue.trim() && !values.includes(inputValue.trim())) {
      onChange([...values, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeValue = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addValue();
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex space-x-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button type="button" onClick={addValue} size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {values.map((value, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-1">
              {value}
              <button
                type="button"
                onClick={() => removeValue(index)}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// Main TaskEditor component
export function TaskEditor({ task, isOpen, onClose, onSave, onValidate }: TaskEditorProps) {
  const [formData, setFormData] = useState<TaskSpecification>(createDefaultTask());
  const [validationErrors, setValidationErrors] = useState<TaskValidationError[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form data when task prop changes
  useEffect(() => {
    if (task) {
      setFormData({ ...task });
    } else {
      setFormData(createDefaultTask());
    }
    setValidationErrors([]);
    setHasChanges(false);
  }, [task, isOpen]);

  // Update form data and track changes
  const updateFormData = (updates: Partial<TaskSpecification>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
    
    // Clear validation errors for updated fields
    const updatedFields = Object.keys(updates);
    setValidationErrors(prev => 
      prev.filter(error => !updatedFields.some(field => error.field.startsWith(field)))
    );
  };

  // Update nested objects
  const updateTiming = (updates: Partial<NonNullable<TaskSpecification['timing']>>) => {
    updateFormData({
      timing: { ...formData.timing, ...updates }
    });
  };

  const updateConditions = (updates: Partial<NonNullable<TaskSpecification['conditions']>>) => {
    updateFormData({
      conditions: { ...formData.conditions, ...updates }
    });
  };

  const updateEvidence = (updates: Partial<NonNullable<TaskSpecification['evidence']>>) => {
    updateFormData({
      evidence: { ...formData.evidence, ...updates }
    });
  };

  // Validate form
  const handleValidate = () => {
    const errors = onValidate ? onValidate(formData) : validateTask(formData);
    setValidationErrors(errors);
    return errors;
  };

  // Save task
  const handleSave = () => {
    const errors = handleValidate();
    const hasErrors = errors.some(error => error.severity === 'error');
    
    if (!hasErrors) {
      if (DEBUG_LOG) console.log('Saving task:', formData);
      onSave(formData);
      onClose();
    }
  };

  // Get field error
  const getFieldError = (fieldName: string) => {
    return validationErrors.find(error => error.field === fieldName);
  };

  // Check if field has error
  const hasFieldError = (fieldName: string) => {
    return validationErrors.some(error => error.field === fieldName && error.severity === 'error');
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {task ? `Edit Task: ${task.name}` : 'Create New Task'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="timing">Timing</TabsTrigger>
              <TabsTrigger value="conditions">Conditions</TabsTrigger>
              <TabsTrigger value="evidence">Evidence</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taskId">Task ID *</Label>
                  <Input
                    id="taskId"
                    value={formData.taskId}
                    onChange={(e) => updateFormData({ taskId: e.target.value })}
                    placeholder="e.g., TASK-001"
                    className={hasFieldError('taskId') ? 'border-red-500' : ''}
                  />
                  {getFieldError('taskId') && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError('taskId')?.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="name">Task Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    placeholder="e.g., Pre-operative Assessment"
                    className={hasFieldError('name') ? 'border-red-500' : ''}
                  />
                  {getFieldError('name') && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError('name')?.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value: any) => updateFormData({ category: value })}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Medication">Medication</SelectItem>
                      <SelectItem value="Assessment">Assessment</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Monitoring">Monitoring</SelectItem>
                      <SelectItem value="Procedure">Procedure</SelectItem>
                      <SelectItem value="Documentation">Documentation</SelectItem>
                      <SelectItem value="Communication">Communication</SelectItem>
                      <SelectItem value="Discharge">Discharge</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => updateFormData({ priority: value })}>
                    <SelectTrigger id="priority">
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
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => updateFormData({ status: value })}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="deferred">Deferred</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="versionStatus">Version Status</Label>
                  <Select value={formData.versionStatus} onValueChange={(value: any) => updateFormData({ versionStatus: value })}>
                    <SelectTrigger id="versionStatus">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => updateFormData({ version: e.target.value })}
                    placeholder="e.g., 1.0.0"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isTemplate"
                  checked={formData.isTemplate}
                  onCheckedChange={(checked) => updateFormData({ isTemplate: checked })}
                />
                <Label htmlFor="isTemplate">This is a template</Label>
              </div>

              <div>
                <Label htmlFor="instructionPatient">Patient Instructions *</Label>
                <Textarea
                  id="instructionPatient"
                  value={formData.instructionPatient}
                  onChange={(e) => updateFormData({ instructionPatient: e.target.value })}
                  placeholder="Instructions for the patient..."
                  rows={3}
                  className={hasFieldError('instructionPatient') ? 'border-red-500' : ''}
                />
                {getFieldError('instructionPatient') && (
                  <p className="text-sm text-red-500 mt-1">{getFieldError('instructionPatient')?.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="instructionClinician">Clinician Instructions *</Label>
                <Textarea
                  id="instructionClinician"
                  value={formData.instructionClinician}
                  onChange={(e) => updateFormData({ instructionClinician: e.target.value })}
                  placeholder="Instructions for the clinician..."
                  rows={3}
                  className={hasFieldError('instructionClinician') ? 'border-red-500' : ''}
                />
                {getFieldError('instructionClinician') && (
                  <p className="text-sm text-red-500 mt-1">{getFieldError('instructionClinician')?.message}</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="timing" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="offsetDays">Offset Days</Label>
                  <Input
                    id="offsetDays"
                    type="number"
                    value={formData.timing?.offsetDays || ''}
                    onChange={(e) => updateTiming({ offsetDays: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="0"
                    className={hasFieldError('timing.offsetDays') ? 'border-red-500' : ''}
                  />
                  <p className="text-xs text-gray-500 mt-1">Days before (negative) or after (positive) the reference date</p>
                  {getFieldError('timing.offsetDays') && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError('timing.offsetDays')?.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="durationDays">Duration (Days)</Label>
                  <Input
                    id="durationDays"
                    type="number"
                    min="1"
                    value={formData.timing?.durationDays || ''}
                    onChange={(e) => updateTiming({ durationDays: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="1"
                    className={hasFieldError('timing.durationDays') ? 'border-red-500' : ''}
                  />
                  {getFieldError('timing.durationDays') && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError('timing.durationDays')?.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="timeOfDay">Time of Day</Label>
                <Input
                  id="timeOfDay"
                  type="time"
                  value={formData.timing?.timeOfDay || ''}
                  onChange={(e) => updateTiming({ timeOfDay: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isFlexible"
                  checked={formData.timing?.isFlexible || false}
                  onCheckedChange={(checked) => updateTiming({ isFlexible: checked })}
                />
                <Label htmlFor="isFlexible">Flexible timing</Label>
              </div>
            </TabsContent>

            <TabsContent value="conditions" className="space-y-4">
              <ArrayInput
                label="Medications"
                values={formData.conditions?.medications || []}
                onChange={(medications) => updateConditions({ medications })}
                placeholder="Enter medication name"
              />
              
              <ArrayInput
                label="Surgery Types"
                values={formData.conditions?.surgery_types || []}
                onChange={(surgery_types) => updateConditions({ surgery_types })}
                placeholder="Enter surgery type"
              />
              
              <ArrayInput
                label="Comorbidities"
                values={formData.conditions?.comorbidities || []}
                onChange={(comorbidities) => updateConditions({ comorbidities })}
                placeholder="Enter comorbidity"
              />
            </TabsContent>

            <TabsContent value="evidence" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="source">Source</Label>
                  <Input
                    id="source"
                    value={formData.evidence?.source || ''}
                    onChange={(e) => updateEvidence({ source: e.target.value })}
                    placeholder="e.g., Clinical Guidelines 2024"
                  />
                </div>
                
                <div>
                  <Label htmlFor="level">Evidence Level</Label>
                  <Select 
                    value={formData.evidence?.level || ''} 
                    onValueChange={(value) => updateEvidence({ level: value })}
                  >
                    <SelectTrigger id="level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A - High quality</SelectItem>
                      <SelectItem value="B">B - Moderate quality</SelectItem>
                      <SelectItem value="C">C - Low quality</SelectItem>
                      <SelectItem value="D">D - Very low quality</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.evidence?.url || ''}
                    onChange={(e) => updateEvidence({ url: e.target.value })}
                    placeholder="https://..."
                    className={hasFieldError('evidence.url') ? 'border-red-500' : ''}
                  />
                  {getFieldError('evidence.url') && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError('evidence.url')?.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="publicationDate">Publication Date</Label>
                  <Input
                    id="publicationDate"
                    type="date"
                    value={formData.evidence?.publicationDate || ''}
                    onChange={(e) => updateEvidence({ publicationDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.evidence?.notes || ''}
                  onChange={(e) => updateEvidence({ notes: e.target.value })}
                  placeholder="Additional notes about the evidence..."
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Validation Summary */}
          {validationErrors.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Validation Issues
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {validationErrors.map((error, index) => (
                    <div key={index} className={`flex items-start gap-2 text-sm ${
                      error.severity === 'error' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {error.severity === 'error' ? (
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <span className="font-medium">{error.field}:</span> {error.message}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Button type="button" variant="outline" onClick={handleValidate}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Validate
              </Button>
              {hasChanges && (
                <Badge variant="outline" className="text-yellow-600">
                  Unsaved changes
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={validationErrors.some(error => error.severity === 'error')}
              >
                <Save className="h-4 w-4 mr-2" />
                {task ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TaskEditor;