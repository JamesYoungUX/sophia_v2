import React, { useState, useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
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
import { Badge } from '@repo/ui/components/badge';
import {
  Search,
  Filter,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Play,
  Calendar,
  Plus,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/select';
import { Collapsible, CollapsibleContent } from '@repo/ui/components/collapsible';
import { api } from '../lib/trpc';
import { useNavigate } from '@tanstack/react-router';

const DEBUG_LOG = true;

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



interface SearchFilters {
  query: string;
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

// Version status badge component
function VersionStatusBadge({ versionStatus }: { versionStatus: TaskSpecification['versionStatus'] }) {
  const statusConfig = {
    draft: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    inactive: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
  };

  const config = statusConfig[versionStatus];
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {versionStatus}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              
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
}

function TaskList({
  tasks,
  onTaskSelect,
}: TaskListProps) {
  if (DEBUG_LOG) console.log('Rendering task list with', tasks.length, 'tasks');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Specifications</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Version Status</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Updated</TableHead>
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
                <TableCell>{task.category}</TableCell>
                <TableCell>{task.priority}</TableCell>
                <TableCell>
                  <VersionStatusBadge versionStatus={task.versionStatus} />
                </TableCell>
                <TableCell className="font-mono text-sm">{task.version}</TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDate(task.updatedAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No tasks found matching your criteria.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Main component
export function TaskManagementRepository() {
  // All hooks must be called at the top level, before any conditional logic
  const navigate = useNavigate();
  const { data: tasks = mockTasks, isLoading, error } = api.task.list.useQuery({}, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const [filters, setFilters] = useState<SearchFilters>({ query: '' });


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
      
      if (filters.category && task.category !== filters.category) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.versionStatus && task.versionStatus !== filters.versionStatus) return false;
      if (filters.isTemplate !== undefined && task.isTemplate !== filters.isTemplate) return false;
      
      return true;
    });
  }, [tasks, filters]);

  const handleTaskSelect = useCallback((task: any) => {
    if (DEBUG_LOG) console.log('Navigating to task details:', task.taskId);
    navigate({ to: `/task-management/${task.id}` });
  }, [navigate]);

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

  if (error && tasks.length === 0) {
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
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
          <p className="text-muted-foreground">
            Manage and organize task specifications for care plans
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      <SearchFilters filters={filters} onFiltersChange={setFilters} />

      <TaskList
        tasks={filteredTasks as any[]}
        onTaskSelect={handleTaskSelect}
      />
    </>
  );
}

export default TaskManagementRepository;