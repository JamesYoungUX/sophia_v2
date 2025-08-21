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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/dialog';
import { Textarea } from '@repo/ui/components/textarea';
import { Label } from '@repo/ui/components/label';
import { Separator } from '@repo/ui/components/separator';
import {
  History,
  GitBranch,
  GitCommit,
  Eye,
  Download,
  RotateCcw,
  GitCompare,
  User,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';

const DEBUG_LOG = true;

// Types for version control
interface CarePlanVersion {
  id: string;
  carePlanId: string;
  versionNumber: number;
  title: string;
  description?: string;
  changeLog?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  createdBy: string;
  createdByName: string;
  isCurrentVersion: boolean;
  contentHash: string;
  fileSize: number;
  tags: string[];
}

interface VersionComparison {
  oldVersion: CarePlanVersion;
  newVersion: CarePlanVersion;
  changes: {
    added: string[];
    removed: string[];
    modified: string[];
  };
}

// Mock data for demonstration
const mockVersions: CarePlanVersion[] = [
  {
    id: 'v3',
    carePlanId: '1',
    versionNumber: 3,
    title: 'Total Knee Arthroplasty (Preoperative) - Updated Protocol',
    description: 'Updated with latest evidence-based guidelines',
    changeLog: 'Added new preoperative assessment criteria and updated medication protocols based on 2024 guidelines.',
    status: 'published',
    createdAt: new Date('2024-06-10T14:30:00'),
    createdBy: 'user-123',
    createdByName: 'Dr. Johnson',
    isCurrentVersion: true,
    contentHash: 'sha256:abc123...',
    fileSize: 2048,
    tags: ['current', 'evidence-based'],
  },
  {
    id: 'v2',
    carePlanId: '1',
    versionNumber: 2,
    title: 'Total Knee Arthroplasty (Preoperative) - Revised',
    description: 'Revised based on clinical feedback',
    changeLog: 'Updated pain management protocols and added patient education materials.',
    status: 'archived',
    createdAt: new Date('2024-03-15T10:15:00'),
    createdBy: 'user-456',
    createdByName: 'Dr. Smith',
    isCurrentVersion: false,
    contentHash: 'sha256:def456...',
    fileSize: 1856,
    tags: ['archived'],
  },
  {
    id: 'v1',
    carePlanId: '1',
    versionNumber: 1,
    title: 'Total Knee Arthroplasty (Preoperative) - Initial',
    description: 'Initial version of the care plan',
    changeLog: 'Initial creation of the care plan based on standard protocols.',
    status: 'archived',
    createdAt: new Date('2024-01-15T09:00:00'),
    createdBy: 'user-456',
    createdByName: 'Dr. Smith',
    isCurrentVersion: false,
    contentHash: 'sha256:ghi789...',
    fileSize: 1654,
    tags: ['initial'],
  },
];

// Version History Component
interface VersionHistoryProps {
  versions: CarePlanVersion[];
  onVersionView: (version: CarePlanVersion) => void;
  onVersionRestore: (version: CarePlanVersion) => void;
  onVersionCompare: (oldVersion: CarePlanVersion, newVersion: CarePlanVersion) => void;
  onVersionDownload: (version: CarePlanVersion) => void;
}

function VersionHistory({
  versions,
  onVersionView,
  onVersionRestore,
  onVersionCompare,
  onVersionDownload,
}: VersionHistoryProps) {
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      } else if (prev.length < 2) {
        return [...prev, versionId];
      } else {
        return [prev[1], versionId];
      }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle size={16} className="text-green-600" />;
      case 'draft': return <Clock size={16} className="text-yellow-600" />;
      case 'archived': return <AlertCircle size={16} className="text-gray-600" />;
      default: return <FileText size={16} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canCompare = selectedVersions.length === 2;

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <History size={20} />
          <h3 className="text-lg font-semibold">Version History</h3>
          <Badge variant="secondary">{versions.length} versions</Badge>
        </div>
        <div className="flex items-center space-x-2">
          {canCompare && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const [v1, v2] = selectedVersions.map(id => versions.find(v => v.id === id)!);
                onVersionCompare(v1, v2);
              }}
            >
              <GitCompare size={16} className="mr-2" />
              Compare Selected
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Export History
          </Button>
        </div>
      </div>

      {/* Version Timeline */}
      <div className="space-y-3">
        {versions.map((version, index) => {
          const isSelected = selectedVersions.includes(version.id);
          const isLatest = index === 0;
          
          return (
            <Card
              key={version.id}
              className={`transition-all cursor-pointer ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
              }`}
              onClick={() => handleVersionSelect(version.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {/* Version Timeline Indicator */}
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        version.isCurrentVersion ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      {index < versions.length - 1 && (
                        <div className="w-0.5 h-8 bg-gray-200 mt-2" />
                      )}
                    </div>
                    
                    {/* Version Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <GitCommit size={16} className="text-gray-500" />
                        <span className="font-semibold">Version {version.versionNumber}</span>
                        <Badge className={getStatusColor(version.status)}>
                          {version.status}
                        </Badge>
                        {version.isCurrentVersion && (
                          <Badge variant="outline" className="text-green-700 border-green-300">
                            Current
                          </Badge>
                        )}
                        {isLatest && (
                          <Badge variant="outline" className="text-blue-700 border-blue-300">
                            Latest
                          </Badge>
                        )}
                      </div>
                      
                      <h4 className="font-medium text-gray-900 mb-1">{version.title}</h4>
                      
                      {version.description && (
                        <p className="text-sm text-gray-600 mb-2">{version.description}</p>
                      )}
                      
                      {version.changeLog && (
                        <div className="bg-gray-50 rounded p-2 mb-2">
                          <p className="text-xs text-gray-700">
                            <strong>Changes:</strong> {version.changeLog}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User size={12} />
                          <span>{version.createdByName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar size={12} />
                          <span>{version.createdAt.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText size={12} />
                          <span>{(version.fileSize / 1024).toFixed(1)} KB</span>
                        </div>
                      </div>
                      
                      {version.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {version.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onVersionView(version);
                      }}
                    >
                      <Eye size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onVersionDownload(version);
                      }}
                    >
                      <Download size={14} />
                    </Button>
                    {!version.isCurrentVersion && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onVersionRestore(version);
                        }}
                      >
                        <RotateCcw size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Selection Info */}
      {selectedVersions.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-800">
                {selectedVersions.length === 1
                  ? '1 version selected'
                  : `${selectedVersions.length} versions selected`}
                {selectedVersions.length === 2 && ' - Ready to compare'}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedVersions([])}
                className="text-blue-800 hover:bg-blue-100"
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Version Comparison Component
interface VersionComparisonProps {
  comparison: VersionComparison;
  onClose: () => void;
}

function VersionComparison({ comparison, onClose }: VersionComparisonProps) {
  const { oldVersion, newVersion, changes } = comparison;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <GitCompare size={20} />
            <span>
              Compare Versions: v{oldVersion.versionNumber} → v{newVersion.versionNumber}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Version Info Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <GitBranch size={16} />
                  <span>Version {oldVersion.versionNumber}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><strong>Title:</strong> {oldVersion.title}</div>
                <div><strong>Created:</strong> {oldVersion.createdAt.toLocaleString()}</div>
                <div><strong>Author:</strong> {oldVersion.createdByName}</div>
                <div><strong>Status:</strong> {oldVersion.status}</div>
                <div><strong>Size:</strong> {(oldVersion.fileSize / 1024).toFixed(1)} KB</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <GitBranch size={16} />
                  <span>Version {newVersion.versionNumber}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><strong>Title:</strong> {newVersion.title}</div>
                <div><strong>Created:</strong> {newVersion.createdAt.toLocaleString()}</div>
                <div><strong>Author:</strong> {newVersion.createdByName}</div>
                <div><strong>Status:</strong> {newVersion.status}</div>
                <div><strong>Size:</strong> {(newVersion.fileSize / 1024).toFixed(1)} KB</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Changes Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Changes Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="font-medium text-green-700 flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Added ({changes.added.length})</span>
                  </div>
                  <ul className="space-y-1 text-xs">
                    {changes.added.map((item, index) => (
                      <li key={index} className="text-green-700 bg-green-50 p-1 rounded">
                        + {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <div className="font-medium text-blue-700 flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Modified ({changes.modified.length})</span>
                  </div>
                  <ul className="space-y-1 text-xs">
                    {changes.modified.map((item, index) => (
                      <li key={index} className="text-blue-700 bg-blue-50 p-1 rounded">
                        ~ {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <div className="font-medium text-red-700 flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span>Removed ({changes.removed.length})</span>
                  </div>
                  <ul className="space-y-1 text-xs">
                    {changes.removed.map((item, index) => (
                      <li key={index} className="text-red-700 bg-red-50 p-1 rounded">
                        - {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Change Log Comparison */}
          {(oldVersion.changeLog || newVersion.changeLog) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Change Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-2">
                      Version {oldVersion.versionNumber}
                    </div>
                    <div className="text-sm bg-gray-50 p-3 rounded">
                      {oldVersion.changeLog || 'No change log available'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-2">
                      Version {newVersion.versionNumber}
                    </div>
                    <div className="text-sm bg-gray-50 p-3 rounded">
                      {newVersion.changeLog || 'No change log available'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button>
            Export Comparison
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main Version Control Component
export function CarePlanVersionControl({ carePlanId }: { carePlanId: string }) {
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState<VersionComparison | null>(null);

  const handleVersionView = useCallback((version: CarePlanVersion) => {
    if (DEBUG_LOG) console.log('View version:', version);
    // TODO: Open version viewer
  }, []);

  const handleVersionRestore = useCallback((version: CarePlanVersion) => {
    if (DEBUG_LOG) console.log('Restore version:', version);
    // TODO: Implement version restoration
  }, []);

  const handleVersionCompare = useCallback((oldVersion: CarePlanVersion, newVersion: CarePlanVersion) => {
    if (DEBUG_LOG) console.log('Compare versions:', oldVersion, newVersion);
    
    // Mock comparison data
    const mockComparison: VersionComparison = {
      oldVersion,
      newVersion,
      changes: {
        added: [
          'New preoperative assessment criteria',
          'Updated medication protocols',
          'Patient education materials section',
        ],
        modified: [
          'Pain management protocols updated',
          'Discharge criteria revised',
          'Follow-up schedule modified',
        ],
        removed: [
          'Outdated medication references',
          'Deprecated assessment tools',
        ],
      },
    };
    
    setComparisonData(mockComparison);
    setShowComparison(true);
  }, []);

  const handleVersionDownload = useCallback((version: CarePlanVersion) => {
    if (DEBUG_LOG) console.log('Download version:', version);
    // TODO: Implement version download
  }, []);

  return (
    <div className="space-y-6">
      <VersionHistory
        versions={mockVersions}
        onVersionView={handleVersionView}
        onVersionRestore={handleVersionRestore}
        onVersionCompare={handleVersionCompare}
        onVersionDownload={handleVersionDownload}
      />
      
      {showComparison && comparisonData && (
        <VersionComparison
          comparison={comparisonData}
          onClose={() => {
            setShowComparison(false);
            setComparisonData(null);
          }}
        />
      )}
    </div>
  );
}

export default CarePlanVersionControl;