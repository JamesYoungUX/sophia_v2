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
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/select';
import { Checkbox } from '@repo/ui/components/checkbox';
import { Separator } from '@repo/ui/components/separator';
import { Textarea } from '@repo/ui/components/textarea';
import {
  Shield,
  Users,
  User,
  UserPlus,
  Settings,
  Eye,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Crown,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  MoreHorizontal,
} from 'lucide-react';

const DEBUG_LOG = true;

// Types for permissions
type PermissionLevel = 'view' | 'edit' | 'admin' | 'owner';
type ResourceType = 'care_plan' | 'category' | 'version' | 'metadata';

interface Permission {
  id: string;
  resourceType: ResourceType;
  resourceId: string;
  level: PermissionLevel;
  grantedAt: Date;
  grantedBy: string;
  expiresAt?: Date;
  conditions?: string[];
}

interface UserPermission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  permissions: Permission[];
  isActive: boolean;
  lastAccess?: Date;
  avatar?: string;
}

interface UserGroup {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  memberCount: number;
  createdAt: Date;
  createdBy: string;
  isSystemGroup: boolean;
}

interface PermissionTemplate {
  id: string;
  name: string;
  description: string;
  permissions: Omit<Permission, 'id' | 'grantedAt' | 'grantedBy'>[];
  isDefault: boolean;
}

// Mock data
const mockUserPermissions: UserPermission[] = [
  {
    id: '1',
    userId: 'user-123',
    userName: 'Dr. Sarah Johnson',
    userEmail: 'sarah.johnson@hospital.com',
    userRole: 'Senior Physician',
    isActive: true,
    lastAccess: new Date('2024-06-10T14:30:00'),
    avatar: 'SJ',
    permissions: [
      {
        id: 'p1',
        resourceType: 'care_plan',
        resourceId: '*',
        level: 'admin',
        grantedAt: new Date('2024-01-15'),
        grantedBy: 'system',
      },
    ],
  },
  {
    id: '2',
    userId: 'user-456',
    userName: 'Nurse Emily Davis',
    userEmail: 'emily.davis@hospital.com',
    userRole: 'Registered Nurse',
    isActive: true,
    lastAccess: new Date('2024-06-10T12:15:00'),
    avatar: 'ED',
    permissions: [
      {
        id: 'p2',
        resourceType: 'care_plan',
        resourceId: 'category-1',
        level: 'edit',
        grantedAt: new Date('2024-02-01'),
        grantedBy: 'user-123',
      },
    ],
  },
  {
    id: '3',
    userId: 'user-789',
    userName: 'Dr. Michael Chen',
    userEmail: 'michael.chen@hospital.com',
    userRole: 'Resident',
    isActive: false,
    lastAccess: new Date('2024-05-20T09:45:00'),
    avatar: 'MC',
    permissions: [
      {
        id: 'p3',
        resourceType: 'care_plan',
        resourceId: 'category-2',
        level: 'view',
        grantedAt: new Date('2024-03-01'),
        grantedBy: 'user-123',
        expiresAt: new Date('2024-12-31'),
      },
    ],
  },
];

const mockUserGroups: UserGroup[] = [
  {
    id: 'group-1',
    name: 'Orthopedic Team',
    description: 'Orthopedic surgeons and specialists',
    memberCount: 12,
    createdAt: new Date('2024-01-15'),
    createdBy: 'user-123',
    isSystemGroup: false,
    permissions: [
      {
        id: 'gp1',
        resourceType: 'care_plan',
        resourceId: 'category-orthopedic',
        level: 'edit',
        grantedAt: new Date('2024-01-15'),
        grantedBy: 'user-123',
      },
    ],
  },
  {
    id: 'group-2',
    name: 'Nursing Staff',
    description: 'All registered nurses and nursing assistants',
    memberCount: 45,
    createdAt: new Date('2024-01-15'),
    createdBy: 'system',
    isSystemGroup: true,
    permissions: [
      {
        id: 'gp2',
        resourceType: 'care_plan',
        resourceId: '*',
        level: 'view',
        grantedAt: new Date('2024-01-15'),
        grantedBy: 'system',
      },
    ],
  },
];

const mockPermissionTemplates: PermissionTemplate[] = [
  {
    id: 'template-1',
    name: 'Care Plan Editor',
    description: 'Can view and edit care plans in assigned categories',
    isDefault: false,
    permissions: [
      {
        resourceType: 'care_plan',
        resourceId: '*',
        level: 'edit',
      },
      {
        resourceType: 'version',
        resourceId: '*',
        level: 'view',
      },
    ],
  },
  {
    id: 'template-2',
    name: 'Read Only Access',
    description: 'View-only access to care plans and metadata',
    isDefault: true,
    permissions: [
      {
        resourceType: 'care_plan',
        resourceId: '*',
        level: 'view',
      },
      {
        resourceType: 'metadata',
        resourceId: '*',
        level: 'view',
      },
    ],
  },
];

// Permission Level Badge Component
function PermissionLevelBadge({ level }: { level: PermissionLevel }) {
  const getConfig = (level: PermissionLevel) => {
    switch (level) {
      case 'owner':
        return { color: 'bg-purple-100 text-purple-800', icon: Crown };
      case 'admin':
        return { color: 'bg-red-100 text-red-800', icon: Shield };
      case 'edit':
        return { color: 'bg-blue-100 text-blue-800', icon: Edit };
      case 'view':
        return { color: 'bg-green-100 text-green-800', icon: Eye };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Eye };
    }
  };

  const config = getConfig(level);
  const IconComponent = config.icon;

  return (
    <Badge className={config.color}>
      <IconComponent size={12} className="mr-1" />
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </Badge>
  );
}

// User Permissions Table Component
interface UserPermissionsTableProps {
  userPermissions: UserPermission[];
  onEditUser: (user: UserPermission) => void;
  onRemoveUser: (userId: string) => void;
  onToggleUserStatus: (userId: string) => void;
}

function UserPermissionsTable({
  userPermissions,
  onEditUser,
  onRemoveUser,
  onToggleUserStatus,
}: UserPermissionsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredUsers = userPermissions.filter(user => {
    const matchesSearch = user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.userRole === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getHighestPermissionLevel = (permissions: Permission[]): PermissionLevel => {
    const levels: PermissionLevel[] = ['view', 'edit', 'admin', 'owner'];
    let highest: PermissionLevel = 'view';
    
    permissions.forEach(permission => {
      const currentIndex = levels.indexOf(permission.level);
      const highestIndex = levels.indexOf(highest);
      if (currentIndex > highestIndex) {
        highest = permission.level;
      }
    });
    
    return highest;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="Senior Physician">Senior Physician</SelectItem>
            <SelectItem value="Registered Nurse">Registered Nurse</SelectItem>
            <SelectItem value="Resident">Resident</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Access</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => {
              const highestLevel = getHighestPermissionLevel(user.permissions);
              
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-800">
                        {user.avatar}
                      </div>
                      <div>
                        <div className="font-medium">{user.userName}</div>
                        <div className="text-sm text-gray-500">{user.userEmail}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{user.userRole}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <PermissionLevelBadge level={highestLevel} />
                      <span className="text-sm text-gray-500">
                        ({user.permissions.length} permission{user.permissions.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {user.isActive ? (
                        <>
                          <CheckCircle size={16} className="text-green-600" />
                          <span className="text-green-700">Active</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={16} className="text-red-600" />
                          <span className="text-red-700">Inactive</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.lastAccess ? (
                      <span className="text-sm text-gray-600">
                        {user.lastAccess.toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditUser(user)}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleUserStatus(user.userId)}
                      >
                        {user.isActive ? <Lock size={14} /> : <Unlock size={14} />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveUser(user.userId)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
      
      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No users found matching the current filters.
        </div>
      )}
    </div>
  );
}

// User Groups Component
interface UserGroupsProps {
  userGroups: UserGroup[];
  onEditGroup: (group: UserGroup) => void;
  onDeleteGroup: (groupId: string) => void;
}

function UserGroups({ userGroups, onEditGroup, onDeleteGroup }: UserGroupsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {userGroups.map((group) => (
        <Card key={group.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Users size={18} />
                  <span>{group.name}</span>
                  {group.isSystemGroup && (
                    <Badge variant="outline" className="text-xs">
                      System
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">{group.description}</p>
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal size={16} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Members:</span>
                <Badge variant="secondary">{group.memberCount}</Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Permissions:</span>
                <Badge variant="secondary">{group.permissions.length}</Badge>
              </div>
              
              <div className="text-xs text-gray-500">
                Created {group.createdAt.toLocaleDateString()}
              </div>
              
              <Separator />
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onEditGroup(group)}
                >
                  <Edit size={14} className="mr-1" />
                  Edit
                </Button>
                {!group.isSystemGroup && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteGroup(group.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Add User Dialog Component
interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  onAddUser: (userData: any) => void;
  permissionTemplates: PermissionTemplate[];
}

function AddUserDialog({ open, onClose, onAddUser, permissionTemplates }: AddUserDialogProps) {
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    template: '',
    customPermissions: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (DEBUG_LOG) console.log('Add user:', formData);
    onAddUser(formData);
    onClose();
    setFormData({ email: '', role: '', template: '', customPermissions: [] });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus size={20} />
            <span>Add User</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@hospital.com"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Senior Physician">Senior Physician</SelectItem>
                <SelectItem value="Registered Nurse">Registered Nurse</SelectItem>
                <SelectItem value="Resident">Resident</SelectItem>
                <SelectItem value="Administrator">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="template">Permission Template</Label>
            <Select value={formData.template} onValueChange={(value) => setFormData({ ...formData, template: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {permissionTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                    {template.isDefault && ' (Default)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add User
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Main Permissions Management Component
export function CarePlanPermissions() {
  const [activeTab, setActiveTab] = useState<'users' | 'groups' | 'templates'>('users');
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserPermission | null>(null);

  const handleEditUser = useCallback((user: UserPermission) => {
    if (DEBUG_LOG) console.log('Edit user:', user);
    setSelectedUser(user);
    // TODO: Open edit user dialog
  }, []);

  const handleRemoveUser = useCallback((userId: string) => {
    if (DEBUG_LOG) console.log('Remove user:', userId);
    // TODO: Implement user removal
  }, []);

  const handleToggleUserStatus = useCallback((userId: string) => {
    if (DEBUG_LOG) console.log('Toggle user status:', userId);
    // TODO: Implement user status toggle
  }, []);

  const handleAddUser = useCallback((userData: any) => {
    if (DEBUG_LOG) console.log('Add user:', userData);
    // TODO: Implement user addition
  }, []);

  const handleEditGroup = useCallback((group: UserGroup) => {
    if (DEBUG_LOG) console.log('Edit group:', group);
    // TODO: Implement group editing
  }, []);

  const handleDeleteGroup = useCallback((groupId: string) => {
    if (DEBUG_LOG) console.log('Delete group:', groupId);
    // TODO: Implement group deletion
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield size={24} />
          <h2 className="text-2xl font-bold">Permissions Management</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Settings size={16} className="mr-2" />
            Settings
          </Button>
          <Button onClick={() => setShowAddUser(true)}>
            <UserPlus size={16} className="mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'users', label: 'Users', icon: User },
            { id: 'groups', label: 'Groups', icon: Users },
            { id: 'templates', label: 'Templates', icon: Settings },
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'users' && (
          <UserPermissionsTable
            userPermissions={mockUserPermissions}
            onEditUser={handleEditUser}
            onRemoveUser={handleRemoveUser}
            onToggleUserStatus={handleToggleUserStatus}
          />
        )}
        
        {activeTab === 'groups' && (
          <UserGroups
            userGroups={mockUserGroups}
            onEditGroup={handleEditGroup}
            onDeleteGroup={handleDeleteGroup}
          />
        )}
        
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockPermissionTemplates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{template.name}</span>
                      {template.isDefault && (
                        <Badge variant="outline">Default</Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        Permissions: {template.permissions.length}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {template.permissions.map((permission, index) => (
                          <PermissionLevelBadge key={index} level={permission.level} />
                        ))}
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit size={14} className="mr-1" />
                          Edit
                        </Button>
                        {!template.isDefault && (
                          <Button variant="outline" size="sm" className="text-red-600">
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add User Dialog */}
      <AddUserDialog
        open={showAddUser}
        onClose={() => setShowAddUser(false)}
        onAddUser={handleAddUser}
        permissionTemplates={mockPermissionTemplates}
      />
    </div>
  );
}

export default CarePlanPermissions;