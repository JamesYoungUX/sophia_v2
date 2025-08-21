import React, { useState, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Badge } from '@repo/ui/components/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@repo/ui/components/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/select';
import { Textarea } from '@repo/ui/components/textarea';
import { Label } from '@repo/ui/components/label';
import { Separator } from '@repo/ui/components/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@repo/ui/components/breadcrumb';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@repo/ui/components/collapsible';
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  FileText,
  Edit,
  Trash2,
  Copy,
  Share,
  History,
  Tag,
  Users,
  Calendar,
  Eye,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  Play,
  Pause,
  X,
} from 'lucide-react';
import { api } from '../lib/trpc';

const DEBUG_LOG = false;

// Helper function to safely format dates
const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      if (DEBUG_LOG) console.warn('Invalid date encountered:', date);
      return 'Invalid Date';
    }
    return dateObj.toLocaleDateString();
  } catch (error) {
    if (DEBUG_LOG) console.error('Error formatting date:', error, date);
    return 'Error';
  }
};

// Types based on our task management system
interface TaskSpecification {
  id: string;
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
  createdAt: Date;
  updatedAt: Date;
}

interface TaskValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

interface TaskValidationResult {
  isValid: boolean;
  errors: TaskValidationError[];
  warnings: TaskValidationError[];
  score: number;
}

interface SearchFilters {
  query: string;
  status?: string;
  category?: string;
  priority?: string;
  versionStatus?: string;
  isTemplate?: boolean;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}

// Mock data for development
const mockTasks: TaskSpecification[] = [
  {
    id: '1',
    taskId: 'TASK-001',
    name: 'Pre-operative Assessment',
    category: 'Assessment',
    instructionPatient: 'Complete pre-operative questionnaire and attend assessment appointment',
    instructionClinician: 'Conduct comprehensive pre-operative assessment including medical history review',
    timing: {
      offsetDays: -7,
      durationDays: 1,
      timeOfDay: '09:00',
      isFlexible: false,
    },
    conditions: {
      surgery_types: ['orthopedic', 'cardiac'],
      medications: ['anticoagulants'],
    },
    evidence: {
      source: 'Clinical Guidelines 2024',
      level: 'A',
      publicationDate: '2024-01-01',
    },
    status: 'scheduled',
    priority: 'high',
    versionStatus: 'active',
    version: '1.0.0',
    isTemplate: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-06-10'),
  },
  {
    id: '2',
    taskId: 'TASK-002',
    name: 'Post-operative Medication Review',
    category: 'Medication',
    instructionPatient: 'Take prescribed medications as directed and report any side effects',
    instructionClinician: 'Review medication regimen and adjust dosages based on patient response',
    timing: {
      offsetDays: 1,
      durationDays: 1,
      timeOfDay: '10:00',
      isFlexible: true,
    },
    conditions: {
      surgery_types: ['cardiac'],
      comorbidities: ['diabetes', 'hypertension'],
    },
    status: 'pending',
    priority: 'medium',
    versionStatus: 'draft',
    version: '0.1.0',
    isTemplate: false,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-06-08'),
  },
];

// Status badge component
function StatusBadge({ status }: { status: TaskSpecification['status'] }) {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    scheduled: { color: 'bg-blue-100 text-blue-800', icon: Calendar },
    in_progress: { color: 'bg-green-100 text-green-800', icon: Play },
    completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { color: 'bg-red-100 text-red-800', icon: X },
    deferred: { color: 'bg-gray-100 text-gray-800', icon: Pause },
    failed: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {status.replace('_', ' ')}
    </Badge>
  );
}

// Priority badge component
function PriorityBadge({ priority }: { priority: TaskSpecification['priority'] }) {
  const priorityConfig = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };

  return (
    <Badge className={priorityConfig[priority]}>
      {priority}
    </Badge>
  );
}

// Version Status Badge Component
function VersionStatusBadge({ versionStatus }: { versionStatus: TaskSpecification['versionStatus'] }) {
  const variants = {
    draft: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
  };

  return (
    <Badge className={variants[versionStatus]}>
      {versionStatus.charAt(0).toUpperCase() + versionStatus.slice(1)}
    </Badge>
  );
}

// Search and filter component
interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    if (DEBUG_LOG) console.log('Filter change:', key, value);
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Search & Filter Tasks</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {isExpanded ? 'Hide Filters' : 'Show Filters'}
            {isExpanded ? <ChevronDown className="h-4 w-4 ml-2" /> : <ChevronRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tasks by name, ID, or instructions..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="flex-1"
          />
        </div>
        
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select value={filters.status || ''} onValueChange={(value) => handleFilterChange('status', value || undefined)}>
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
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
              
              <div>
                <Label htmlFor="category-filter">Category</Label>
                <Select value={filters.category || ''} onValueChange={(value) => handleFilterChange('category', value || undefined)}>
                  <SelectTrigger id="category-filter">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
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
                <Label htmlFor="priority-filter">Priority</Label>
                <Select value={filters.priority || ''} onValueChange={(value) => handleFilterChange('priority', value || undefined)}>
                  <SelectTrigger id="priority-filter">
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="version-status-filter">Version Status</Label>
                <Select value={filters.versionStatus || ''} onValueChange={(value) => handleFilterChange('versionStatus', value || undefined)}>
                  <SelectTrigger id="version-status-filter">
                    <SelectValue placeholder="All versions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All versions</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="template-filter">Type</Label>
                <Select 
                  value={filters.isTemplate === undefined ? '' : filters.isTemplate.toString()} 
                  onValueChange={(value) => handleFilterChange('isTemplate', value === '' ? undefined : value === 'true')}
                >
                  <SelectTrigger id="template-filter">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="true">Templates</SelectItem>
                    <SelectItem value="false">Instances</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

// Task list component
interface TaskListProps {
  tasks: TaskSpecification[];
  onTaskSelect: (task: TaskSpecification) => void;
  onTaskEdit: (task: TaskSpecification) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskDuplicate: (task: TaskSpecification) => void;
  onTaskValidate: (task: TaskSpecification) => void;
  onVersionHistory: (task: TaskSpecification) => void;
}

function TaskList({
  tasks,
  onTaskSelect,
  onTaskEdit,
  onTaskDelete,
  onTaskDuplicate,
  onTaskValidate,
  onVersionHistory,
}: TaskListProps) {
  if (DEBUG_LOG) console.log('Rendering task list with', tasks.length, 'tasks');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Task Specifications</CardTitle>
          <div className="flex items-center space-x-2">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Version Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} className="cursor-pointer hover:bg-gray-50" onClick={() => onTaskSelect(task)}>
                <TableCell className="font-mono text-sm">{task.taskId}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{task.name}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {task.instructionPatient}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{task.category}</Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={task.status} />
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={task.priority} />
                </TableCell>
                <TableCell>
                  <VersionStatusBadge versionStatus={task.versionStatus} />
                </TableCell>
                <TableCell>
                  <Badge variant={task.isTemplate ? 'default' : 'secondary'}>
                    {task.isTemplate ? 'Template' : 'Instance'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDate(task.updatedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskEdit(task);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskDuplicate(task);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskValidate(task);
                      }}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onVersionHistory(task);
                      }}
                    >
                      <History className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskDelete(task.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No tasks found matching your criteria.</p>
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create your first task
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Main component
export function TaskManagementRepository() {
  // All hooks must be called at the top level, before any conditional logic
  const { data: tasks = [], isLoading, error } = api.task.list.useQuery({});
  const [filters, setFilters] = useState<SearchFilters>({ query: '' });
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [validationResult, setValidationResult] = useState<TaskValidationResult | null>(null);

  // Filter tasks based on search criteria
  const filteredTasks = useMemo(() => {
    return tasks.filter((task: any) => {
      if (filters.query && !(
        task.name.toLowerCase().includes(filters.query.toLowerCase()) ||
        task.taskId?.toLowerCase().includes(filters.query.toLowerCase()) ||
        task.instructionPatient?.toLowerCase().includes(filters.query.toLowerCase()) ||
        task.instructionClinician?.toLowerCase().includes(filters.query.toLowerCase())
      )) {
        return false;
      }
      
      if (filters.status && task.status !== filters.status) return false;
      if (filters.category && task.category !== filters.category) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.versionStatus && task.versionStatus !== filters.versionStatus) return false;
      if (filters.isTemplate !== undefined && task.isTemplate !== filters.isTemplate) return false;
      
      return true;
    });
  }, [tasks, filters]);

  const handleTaskSelect = useCallback((task: any) => {
    if (DEBUG_LOG) console.log('Task selected:', task.taskId);
    setSelectedTask(task);
  }, []);

  const handleTaskEdit = useCallback((task: TaskSpecification) => {
    if (DEBUG_LOG) console.log('Edit task:', task.taskId);
    // TODO: Implement task editing
  }, []);

  const handleTaskDelete = useCallback((taskId: string) => {
    if (DEBUG_LOG) console.log('Delete task:', taskId);
    // TODO: Implement task deletion
  }, []);

  const handleTaskDuplicate = useCallback((task: TaskSpecification) => {
    if (DEBUG_LOG) console.log('Duplicate task:', task.taskId);
    // TODO: Implement task duplication
  }, []);

  const handleTaskValidate = useCallback((task: TaskSpecification) => {
    if (DEBUG_LOG) console.log('Validate task:', task.taskId);
    // Mock validation result
    const mockValidation: TaskValidationResult = {
      isValid: true,
      errors: [],
      warnings: [
        {
          field: 'timing.offsetDays',
          message: 'Consider adding buffer time for scheduling flexibility',
          code: 'TIMING_FLEXIBILITY',
          severity: 'warning',
        },
      ],
      score: 85,
    };
    setValidationResult(mockValidation);
  }, []);

  const handleVersionHistory = useCallback((task: TaskSpecification) => {
    if (DEBUG_LOG) console.log('View version history:', task.taskId);
    // TODO: Implement version history
  }, []);

  // Debug logging after all hooks are called
  if (DEBUG_LOG) {
    console.log('TaskManagementRepository: tasks data:', tasks);
    console.log('TaskManagementRepository: isLoading:', isLoading);
    console.log('TaskManagementRepository: error:', error);
    console.log('Rendering TaskManagementRepository with', filteredTasks.length, 'filtered tasks');
  }

  // Early returns for loading and error states come after all hooks
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Error loading tasks: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
          <p className="text-gray-600">Manage and organize task specifications for care plans</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Import Tasks
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Task Management</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <SearchFilters filters={filters} onFiltersChange={setFilters} />

      <TaskList
        tasks={filteredTasks as any[]}
        onTaskSelect={handleTaskSelect}
        onTaskEdit={handleTaskEdit}
        onTaskDelete={handleTaskDelete}
        onTaskDuplicate={handleTaskDuplicate}
        onTaskValidate={handleTaskValidate}
        onVersionHistory={handleVersionHistory}
      />

      {/* Task Details Dialog */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Task Details: {selectedTask.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Task ID</Label>
                  <p className="font-mono text-sm">{selectedTask.taskId}</p>
                </div>
                <div>
                  <Label>Category</Label>
                  <p>{selectedTask.category}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <StatusBadge status={selectedTask.status} />
                </div>
                <div>
                  <Label>Priority</Label>
                  <PriorityBadge priority={selectedTask.priority} />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div>
                  <Label>Patient Instructions</Label>
                  <p className="text-sm text-gray-700">{selectedTask.instructionPatient}</p>
                </div>
                <div>
                  <Label>Clinician Instructions</Label>
                  <p className="text-sm text-gray-700">{selectedTask.instructionClinician}</p>
                </div>
              </div>
              
              {selectedTask.timing && (
                <>
                  <Separator />
                  <div>
                    <Label>Timing</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label className="text-xs">Offset Days</Label>
                        <p className="text-sm">{selectedTask.timing.offsetDays || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-xs">Duration Days</Label>
                        <p className="text-sm">{selectedTask.timing.durationDays || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-xs">Time of Day</Label>
                        <p className="text-sm">{selectedTask.timing.timeOfDay || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-xs">Flexible</Label>
                        <p className="text-sm">{selectedTask.timing.isFlexible ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {selectedTask.conditions && (
                <>
                  <Separator />
                  <div>
                    <Label>Conditions</Label>
                    <div className="space-y-2 mt-2">
                      {selectedTask.conditions.medications && (
                        <div>
                          <Label className="text-xs">Medications</Label>
                          <div className="flex flex-wrap gap-1">
                            {selectedTask.conditions.medications.map((med: string, idx: number) => (
                              <Badge key={idx} variant="outline">{med}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedTask.conditions.surgery_types && (
                        <div>
                          <Label className="text-xs">Surgery Types</Label>
                          <div className="flex flex-wrap gap-1">
                            {selectedTask.conditions.surgery_types.map((type: string, idx: number) => (
                              <Badge key={idx} variant="outline">{type}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedTask.conditions.comorbidities && (
                        <div>
                          <Label className="text-xs">Comorbidities</Label>
                          <div className="flex flex-wrap gap-1">
                            {selectedTask.conditions.comorbidities.map((condition: string, idx: number) => (
                              <Badge key={idx} variant="outline">{condition}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
              
              {selectedTask.evidence && (
                <>
                  <Separator />
                  <div>
                    <Label>Evidence</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label className="text-xs">Source</Label>
                        <p className="text-sm">{selectedTask.evidence.source || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-xs">Level</Label>
                        <p className="text-sm">{selectedTask.evidence.level || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-xs">Publication Date</Label>
                        <p className="text-sm">{selectedTask.evidence.publicationDate || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-xs">URL</Label>
                        <p className="text-sm">{selectedTask.evidence.url || 'N/A'}</p>
                      </div>
                    </div>
                    {selectedTask.evidence.notes && (
                      <div className="mt-2">
                        <Label className="text-xs">Notes</Label>
                        <p className="text-sm text-gray-700">{selectedTask.evidence.notes}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Validation Result Dialog */}
      {validationResult && (
        <Dialog open={!!validationResult} onOpenChange={() => setValidationResult(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Task Validation Result</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {validationResult.isValid ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {validationResult.isValid ? 'Valid' : 'Invalid'}
                  </span>
                </div>
                <Badge variant="outline">Score: {validationResult.score}/100</Badge>
              </div>
              
              {validationResult.errors.length > 0 && (
                <div>
                  <Label className="text-red-600">Errors</Label>
                  <div className="space-y-2 mt-2">
                    {validationResult.errors.map((error: TaskValidationError, idx: number) => (
                      <div key={idx} className="p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm font-medium text-red-800">{error.field}</p>
                        <p className="text-sm text-red-600">{error.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {validationResult.warnings.length > 0 && (
                <div>
                  <Label className="text-yellow-600">Warnings</Label>
                  <div className="space-y-2 mt-2">
                    {validationResult.warnings.map((warning: TaskValidationError, idx: number) => (
                      <div key={idx} className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm font-medium text-yellow-800">{warning.field}</p>
                        <p className="text-sm text-yellow-600">{warning.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default TaskManagementRepository;