import React, { useState, useCallback } from 'react';
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
import { Button } from '@repo/ui/components/button';
import { Badge } from '@repo/ui/components/badge';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/dialog';
import { Separator } from '@repo/ui/components/separator';
import {
  Activity,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  UserPlus,
  UserMinus,
  Shield,
  Lock,
  Unlock,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  FileText,
  AlertTriangle,
  CheckCircle,
  Info,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

const DEBUG_LOG = true;

// Types for audit trail
type AuditAction = 
  | 'view' | 'create' | 'update' | 'delete' | 'download' | 'upload'
  | 'login' | 'logout' | 'permission_grant' | 'permission_revoke'
  | 'version_create' | 'version_restore' | 'export' | 'import';

type AuditResourceType = 
  | 'care_plan' | 'category' | 'version' | 'user' | 'group' 
  | 'permission' | 'system' | 'session';

type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';

interface AuditEntry {
  id: string;
  timestamp: Date;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId?: string;
  resourceName?: string;
  userId: string;
  userName: string;
  userRole: string;
  ipAddress: string;
  userAgent: string;
  severity: AuditSeverity;
  description: string;
  details?: Record<string, any>;
  sessionId: string;
  organizationId: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

interface AuditFilters {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  actions: AuditAction[];
  resourceTypes: AuditResourceType[];
  users: string[];
  severity: AuditSeverity[];
  success: boolean | null;
  searchTerm: string;
}

interface AuditStats {
  totalEntries: number;
  todayEntries: number;
  failedActions: number;
  uniqueUsers: number;
  topActions: { action: AuditAction; count: number }[];
  topUsers: { userId: string; userName: string; count: number }[];
}

// Mock data
const mockAuditEntries: AuditEntry[] = [
  {
    id: 'audit-1',
    timestamp: new Date('2024-06-10T14:30:00'),
    action: 'update',
    resourceType: 'care_plan',
    resourceId: 'plan-123',
    resourceName: 'Total Knee Arthroplasty Protocol',
    userId: 'user-123',
    userName: 'Dr. Sarah Johnson',
    userRole: 'Senior Physician',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    severity: 'medium',
    description: 'Updated care plan content and metadata',
    details: {
      changes: ['Updated medication protocols', 'Added new assessment criteria'],
      version: '3.0',
      previousVersion: '2.1',
    },
    sessionId: 'session-abc123',
    organizationId: 'org-1',
    success: true,
  },
  {
    id: 'audit-2',
    timestamp: new Date('2024-06-10T14:15:00'),
    action: 'view',
    resourceType: 'care_plan',
    resourceId: 'plan-456',
    resourceName: 'Cardiac Rehabilitation Program',
    userId: 'user-456',
    userName: 'Nurse Emily Davis',
    userRole: 'Registered Nurse',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    severity: 'low',
    description: 'Viewed care plan details',
    sessionId: 'session-def456',
    organizationId: 'org-1',
    success: true,
  },
  {
    id: 'audit-3',
    timestamp: new Date('2024-06-10T13:45:00'),
    action: 'permission_grant',
    resourceType: 'user',
    resourceId: 'user-789',
    resourceName: 'Dr. Michael Chen',
    userId: 'user-123',
    userName: 'Dr. Sarah Johnson',
    userRole: 'Senior Physician',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    severity: 'high',
    description: 'Granted edit permissions for orthopedic care plans',
    details: {
      permissionLevel: 'edit',
      resourceCategory: 'orthopedic',
      expiresAt: '2024-12-31T23:59:59Z',
    },
    sessionId: 'session-abc123',
    organizationId: 'org-1',
    success: true,
  },
  {
    id: 'audit-4',
    timestamp: new Date('2024-06-10T13:30:00'),
    action: 'login',
    resourceType: 'session',
    userId: 'user-789',
    userName: 'Dr. Michael Chen',
    userRole: 'Resident',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    severity: 'low',
    description: 'User logged in successfully',
    details: {
      loginMethod: 'password',
      deviceType: 'mobile',
    },
    sessionId: 'session-ghi789',
    organizationId: 'org-1',
    success: true,
  },
  {
    id: 'audit-5',
    timestamp: new Date('2024-06-10T12:15:00'),
    action: 'delete',
    resourceType: 'care_plan',
    resourceId: 'plan-old',
    resourceName: 'Deprecated Protocol v1.0',
    userId: 'user-123',
    userName: 'Dr. Sarah Johnson',
    userRole: 'Senior Physician',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    severity: 'high',
    description: 'Deleted deprecated care plan',
    details: {
      reason: 'Outdated protocol replaced by v3.0',
      backupCreated: true,
    },
    sessionId: 'session-abc123',
    organizationId: 'org-1',
    success: true,
  },
  {
    id: 'audit-6',
    timestamp: new Date('2024-06-10T11:45:00'),
    action: 'update',
    resourceType: 'care_plan',
    resourceId: 'plan-error',
    resourceName: 'Test Protocol',
    userId: 'user-456',
    userName: 'Nurse Emily Davis',
    userRole: 'Registered Nurse',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    severity: 'medium',
    description: 'Failed to update care plan due to insufficient permissions',
    errorMessage: 'Access denied: User does not have edit permissions for this resource',
    sessionId: 'session-def456',
    organizationId: 'org-1',
    success: false,
  },
];

const mockAuditStats: AuditStats = {
  totalEntries: 1247,
  todayEntries: 23,
  failedActions: 8,
  uniqueUsers: 15,
  topActions: [
    { action: 'view', count: 456 },
    { action: 'update', count: 234 },
    { action: 'create', count: 123 },
    { action: 'login', count: 89 },
    { action: 'download', count: 67 },
  ],
  topUsers: [
    { userId: 'user-123', userName: 'Dr. Sarah Johnson', count: 234 },
    { userId: 'user-456', userName: 'Nurse Emily Davis', count: 189 },
    { userId: 'user-789', userName: 'Dr. Michael Chen', count: 156 },
  ],
};

// Action Icon Component
function ActionIcon({ action }: { action: AuditAction }) {
  const getIcon = (action: AuditAction) => {
    switch (action) {
      case 'view': return Eye;
      case 'create': return FileText;
      case 'update': return Edit;
      case 'delete': return Trash2;
      case 'download': return Download;
      case 'upload': return Upload;
      case 'login': return Unlock;
      case 'logout': return Lock;
      case 'permission_grant': return Shield;
      case 'permission_revoke': return Shield;
      case 'version_create': return FileText;
      case 'version_restore': return RefreshCw;
      case 'export': return ExternalLink;
      case 'import': return Upload;
      default: return Activity;
    }
  };

  const IconComponent = getIcon(action);
  return <IconComponent size={16} />;
}

// Severity Badge Component
function SeverityBadge({ severity }: { severity: AuditSeverity }) {
  const getConfig = (severity: AuditSeverity) => {
    switch (severity) {
      case 'critical':
        return { color: 'bg-red-100 text-red-800', icon: AlertTriangle };
      case 'high':
        return { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle };
      case 'medium':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Info };
      case 'low':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Info };
    }
  };

  const config = getConfig(severity);
  const IconComponent = config.icon;

  return (
    <Badge className={config.color}>
      <IconComponent size={12} className="mr-1" />
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </Badge>
  );
}

// Audit Stats Component
function AuditStats({ stats }: { stats: AuditStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold">{stats.totalEntries.toLocaleString()}</p>
            </div>
            <Activity size={24} className="text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Activity</p>
              <p className="text-2xl font-bold">{stats.todayEntries}</p>
            </div>
            <Clock size={24} className="text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed Actions</p>
              <p className="text-2xl font-bold text-red-600">{stats.failedActions}</p>
            </div>
            <AlertTriangle size={24} className="text-red-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold">{stats.uniqueUsers}</p>
            </div>
            <User size={24} className="text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Audit Filters Component
interface AuditFiltersProps {
  filters: AuditFilters;
  onFiltersChange: (filters: AuditFilters) => void;
  onClearFilters: () => void;
}

function AuditFiltersComponent({ filters, onFiltersChange, onClearFilters }: AuditFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof AuditFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = 
    filters.searchTerm ||
    filters.actions.length > 0 ||
    filters.resourceTypes.length > 0 ||
    filters.users.length > 0 ||
    filters.severity.length > 0 ||
    filters.success !== null ||
    filters.dateRange.start ||
    filters.dateRange.end;

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Filter size={18} />
            <span>Filters</span>
            {hasActiveFilters && (
              <Badge variant="secondary">
                {[
                  filters.searchTerm && 'search',
                  filters.actions.length > 0 && `${filters.actions.length} actions`,
                  filters.resourceTypes.length > 0 && `${filters.resourceTypes.length} types`,
                  filters.users.length > 0 && `${filters.users.length} users`,
                  filters.severity.length > 0 && `${filters.severity.length} severity`,
                  filters.success !== null && 'status',
                  (filters.dateRange.start || filters.dateRange.end) && 'date range',
                ].filter(Boolean).join(', ')}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search descriptions..."
                  value={filters.searchTerm}
                  onChange={(e) => updateFilter('searchTerm', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Date Range */}
            <div>
              <Label>Date Range</Label>
              <div className="flex space-x-2">
                <Input
                  type="date"
                  value={filters.dateRange.start?.toISOString().split('T')[0] || ''}
                  onChange={(e) => updateFilter('dateRange', {
                    ...filters.dateRange,
                    start: e.target.value ? new Date(e.target.value) : null,
                  })}
                />
                <Input
                  type="date"
                  value={filters.dateRange.end?.toISOString().split('T')[0] || ''}
                  onChange={(e) => updateFilter('dateRange', {
                    ...filters.dateRange,
                    end: e.target.value ? new Date(e.target.value) : null,
                  })}
                />
              </div>
            </div>
            
            {/* Success Status */}
            <div>
              <Label>Status</Label>
              <Select
                value={filters.success === null ? 'all' : filters.success.toString()}
                onValueChange={(value) => updateFilter('success', value === 'all' ? null : value === 'true')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Success</SelectItem>
                  <SelectItem value="false">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// Audit Entry Details Dialog
interface AuditEntryDetailsProps {
  entry: AuditEntry | null;
  open: boolean;
  onClose: () => void;
}

function AuditEntryDetails({ entry, open, onClose }: AuditEntryDetailsProps) {
  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ActionIcon action={entry.action} />
            <span>Audit Entry Details</span>
            <SeverityBadge severity={entry.severity} />
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><strong>Action:</strong> {entry.action}</div>
                <div><strong>Resource Type:</strong> {entry.resourceType}</div>
                <div><strong>Timestamp:</strong> {entry.timestamp.toLocaleString()}</div>
                <div><strong>Success:</strong> {entry.success ? 'Yes' : 'No'}</div>
                <div><strong>User:</strong> {entry.userName}</div>
                <div><strong>Role:</strong> {entry.userRole}</div>
                <div><strong>IP Address:</strong> {entry.ipAddress}</div>
                <div><strong>Session ID:</strong> {entry.sessionId}</div>
              </div>
              
              {entry.resourceName && (
                <div><strong>Resource:</strong> {entry.resourceName}</div>
              )}
              
              <div><strong>Description:</strong> {entry.description}</div>
              
              {entry.errorMessage && (
                <div className="bg-red-50 p-2 rounded">
                  <strong className="text-red-800">Error:</strong>
                  <span className="text-red-700 ml-2">{entry.errorMessage}</span>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Technical Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><strong>User Agent:</strong> {entry.userAgent}</div>
              <div><strong>Organization ID:</strong> {entry.organizationId}</div>
              {entry.resourceId && (
                <div><strong>Resource ID:</strong> {entry.resourceId}</div>
              )}
            </CardContent>
          </Card>
          
          {/* Additional Details */}
          {entry.details && Object.keys(entry.details).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Additional Details</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                  {JSON.stringify(entry.details, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
          
          {/* Metadata */}
          {entry.metadata && Object.keys(entry.metadata).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                  {JSON.stringify(entry.metadata, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button>
            Export Entry
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main Audit Trail Component
export function CarePlanAuditTrail() {
  const [filters, setFilters] = useState<AuditFilters>({
    dateRange: { start: null, end: null },
    actions: [],
    resourceTypes: [],
    users: [],
    severity: [],
    success: null,
    searchTerm: '',
  });
  
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 20;

  // Filter entries based on current filters
  const filteredEntries = mockAuditEntries.filter(entry => {
    if (filters.searchTerm && !entry.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }
    if (filters.actions.length > 0 && !filters.actions.includes(entry.action)) {
      return false;
    }
    if (filters.resourceTypes.length > 0 && !filters.resourceTypes.includes(entry.resourceType)) {
      return false;
    }
    if (filters.severity.length > 0 && !filters.severity.includes(entry.severity)) {
      return false;
    }
    if (filters.success !== null && entry.success !== filters.success) {
      return false;
    }
    if (filters.dateRange.start && entry.timestamp < filters.dateRange.start) {
      return false;
    }
    if (filters.dateRange.end && entry.timestamp > filters.dateRange.end) {
      return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handleEntryClick = useCallback((entry: AuditEntry) => {
    if (DEBUG_LOG) console.log('View audit entry:', entry);
    setSelectedEntry(entry);
    setShowDetails(true);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      dateRange: { start: null, end: null },
      actions: [],
      resourceTypes: [],
      users: [],
      severity: [],
      success: null,
      searchTerm: '',
    });
    setCurrentPage(1);
  }, []);

  const handleExportAuditLog = useCallback(() => {
    if (DEBUG_LOG) console.log('Export audit log');
    // TODO: Implement audit log export
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity size={24} />
          <h2 className="text-2xl font-bold">Audit Trail</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExportAuditLog}>
            <Download size={16} className="mr-2" />
            Export Log
          </Button>
          <Button variant="outline">
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <AuditStats stats={mockAuditStats} />

      {/* Filters */}
      <AuditFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {paginatedEntries.length} of {filteredEntries.length} entries
          {filteredEntries.length !== mockAuditEntries.length && (
            <span> (filtered from {mockAuditEntries.length} total)</span>
          )}
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Audit Entries Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEntries.map((entry) => (
              <TableRow
                key={entry.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleEntryClick(entry)}
              >
                <TableCell>
                  <div className="text-sm">
                    <div>{entry.timestamp.toLocaleDateString()}</div>
                    <div className="text-gray-500">{entry.timestamp.toLocaleTimeString()}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <ActionIcon action={entry.action} />
                    <span className="capitalize">{entry.action.replace('_', ' ')}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">{entry.resourceType}</div>
                    {entry.resourceName && (
                      <div className="text-gray-500 truncate max-w-32">
                        {entry.resourceName}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">{entry.userName}</div>
                    <div className="text-gray-500">{entry.userRole}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <SeverityBadge severity={entry.severity} />
                </TableCell>
                <TableCell>
                  {entry.success ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle size={12} className="mr-1" />
                      Success
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">
                      <AlertTriangle size={12} className="mr-1" />
                      Failed
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm truncate max-w-64">
                    {entry.description}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredEntries.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No audit entries found matching the current filters.
        </div>
      )}

      {/* Entry Details Dialog */}
      <AuditEntryDetails
        entry={selectedEntry}
        open={showDetails}
        onClose={() => {
          setShowDetails(false);
          setSelectedEntry(null);
        }}
      />
    </div>
  );
}

export default CarePlanAuditTrail;