import { createFileRoute, useParams } from '@tanstack/react-router';
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { Separator } from '@repo/ui/components/separator';
import { Label } from '@repo/ui/components/label';
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Tag,
  Users,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  X,
} from 'lucide-react';
import { api } from '../lib/trpc';
import { useNavigate } from '@tanstack/react-router';

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

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'deferred': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge className={`${getStatusColor(status)} border`}>
      {status.replace('_', ' ')}
    </Badge>
  );
}

// Priority badge component
function PriorityBadge({ priority }: { priority: string }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge className={`${getPriorityColor(priority)} border`}>
      {priority}
    </Badge>
  );
}

// Version status badge component
function VersionStatusBadge({ versionStatus }: { versionStatus: string }) {
  const getVersionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge className={`${getVersionStatusColor(versionStatus)} border`}>
      {versionStatus}
    </Badge>
  );
}

export const Route = createFileRoute('/task-management/$taskId')({
  component: TaskDetailsPage,
});

function TaskDetailsPage() {
  const { taskId } = Route.useParams();
  const navigate = useNavigate();
  
  if (DEBUG_LOG) console.log('TaskDetailsPage rendering with taskId:', taskId);
  
  // For now, we'll use mock data since the API integration would need to be set up
  // In a real implementation, you would use: const { data: task, isLoading, error } = api.task.getById.useQuery({ id: taskId });
  
  // Mock task data - in real implementation this would come from the API
  const mockTask = {
    id: taskId,
    taskId: `TASK-${taskId}`,
    name: 'Pre-operative Assessment',
    category: 'Assessment',
    instructionPatient: 'Complete pre-operative questionnaire and attend assessment appointment. Please arrive 30 minutes early and bring all current medications.',
    instructionClinician: 'Conduct comprehensive pre-operative assessment including medical history review, physical examination, and risk stratification.',
    timing: {
      offsetDays: -7,
      durationDays: 1,
      timeOfDay: '09:00',
      isFlexible: false,
    },
    conditions: {
      surgery_types: ['orthopedic', 'cardiac'],
      medications: ['anticoagulants'],
      comorbidities: ['diabetes'],
    },
    evidence: {
      source: 'Clinical Guidelines 2024',
      url: 'https://example.com/clinical-guidelines-2024',
      level: 'A',
      publicationDate: '2024-01-01',
      notes: 'Based on latest evidence-based practices for pre-operative care.',
    },
    status: 'scheduled',
    priority: 'high',
    versionStatus: 'active',
    version: '1.0.0',
    isTemplate: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-06-10'),
  };

  const handleBackToList = () => {
    navigate({ to: '/task-management' });
  };

  return (
    <>
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBackToList}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tasks
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{mockTask.name}</h1>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main task details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Task Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Task ID</Label>
                  <p className="font-mono text-sm mt-1">{mockTask.taskId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                  <p className="mt-1">{mockTask.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <StatusBadge status={mockTask.status} />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                  <div className="mt-1">
                    <PriorityBadge priority={mockTask.priority} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Patient Instructions</Label>
                <p className="mt-2 text-sm leading-relaxed">{mockTask.instructionPatient}</p>
              </div>
              <Separator />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Clinician Instructions</Label>
                <p className="mt-2 text-sm leading-relaxed">{mockTask.instructionClinician}</p>
              </div>
            </CardContent>
          </Card>

          {/* Timing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timing & Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Offset Days</Label>
                  <p className="mt-1">{mockTask.timing.offsetDays} days</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                  <p className="mt-1">{mockTask.timing.durationDays} day(s)</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Time of Day</Label>
                  <p className="mt-1">{mockTask.timing.timeOfDay || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Flexibility</Label>
                  <p className="mt-1">{mockTask.timing.isFlexible ? 'Flexible' : 'Strict'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Version Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Version Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Version</Label>
                <p className="mt-1 font-mono">{mockTask.version}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <VersionStatusBadge versionStatus={mockTask.versionStatus} />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Template</Label>
                <p className="mt-1">{mockTask.isTemplate ? 'Yes' : 'No'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockTask.conditions.surgery_types && mockTask.conditions.surgery_types.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Surgery Types</Label>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {mockTask.conditions.surgery_types.map((type, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {mockTask.conditions.medications && mockTask.conditions.medications.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Medications</Label>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {mockTask.conditions.medications.map((med, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {med}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {mockTask.conditions.comorbidities && mockTask.conditions.comorbidities.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Comorbidities</Label>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {mockTask.conditions.comorbidities.map((condition, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Evidence */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Evidence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Source</Label>
                <p className="mt-1 text-sm">{mockTask.evidence.source}</p>
              </div>
              {mockTask.evidence.level && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Evidence Level</Label>
                  <p className="mt-1 text-sm">{mockTask.evidence.level}</p>
                </div>
              )}
              {mockTask.evidence.publicationDate && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Publication Date</Label>
                  <p className="mt-1 text-sm">{formatDate(mockTask.evidence.publicationDate)}</p>
                </div>
              )}
              {mockTask.evidence.notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                  <p className="mt-1 text-sm leading-relaxed">{mockTask.evidence.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                <p className="mt-1 text-sm">{formatDate(mockTask.createdAt)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                <p className="mt-1 text-sm">{formatDate(mockTask.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}