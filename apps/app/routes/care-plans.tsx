import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@repo/ui/components/dialog';
import { RadioGroup, RadioGroupItem } from '@repo/ui/components/radio-group';
import { Label } from '@repo/ui/components/label';
import { Input } from '@repo/ui/components/input';
import { 
  Eye, 
  Edit, 
  MoreHorizontal, 
  FolderTree, 
  History, 
  Shield, 
  Activity,
  Plus,
  Search,
  Filter,
  Copy,
  Building,
  Users,
  User,
} from 'lucide-react';
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { requireAuth } from "@/lib/auth-guard";
import { CarePlanRepository } from '../components/care-plan-repository';
import { CarePlanVersionControl } from '../components/care-plan-version-control';
import { CarePlanPermissions } from '../components/care-plan-permissions';
import { CarePlanAuditTrail } from '../components/care-plan-audit-trail';

// Placeholder data for demonstration
const blueprintPlans = [
  {
    id: '1',
    name: "Total Knee Arthroplasty (Preoperative)",
    procedure: "Total Knee Arthroplasty (TKA)",
    phase: "Preoperative",
    owner: "Sophia",
    lastUpdated: "06/10/2024",
    status: 'active' as const,
  },
  {
    id: '2',
    name: "Coronary Artery Bypass Graft (Postoperative)",
    procedure: "Coronary Artery Bypass Graft (CABG)",
    phase: "Postoperative",
    owner: "Sophia",
    lastUpdated: "06/08/2024",
    status: 'active' as const,
  },
  {
    id: '3',
    name: "Laparoscopic Cholecystectomy (Preoperative)",
    procedure: "Laparoscopic Cholecystectomy",
    phase: "Preoperative",
    owner: "Sophia",
    lastUpdated: "05/28/2024",
    status: 'draft' as const,
  },
];

const organizationPlans = [
  {
    id: '4',
    name: "Total Knee Arthroplasty (Preoperative)",
    procedure: "Total Knee Arthroplasty (TKA)",
    phase: "Preoperative",
    owner: "Midwest Health",
    lastUpdated: "06/11/2024",
    status: 'active' as const,
  },
  {
    id: '5',
    name: "Coronary Artery Bypass Graft (Postoperative)",
    procedure: "Coronary Artery Bypass Graft (CABG)",
    phase: "Postoperative",
    owner: "Midwest Health",
    lastUpdated: "06/09/2024",
    status: 'active' as const,
  },
  {
    id: '6',
    name: "Laparoscopic Cholecystectomy (Preoperative)",
    procedure: "Laparoscopic Cholecystectomy",
    phase: "Preoperative",
    owner: "Midwest Health",
    lastUpdated: "05/30/2024",
    status: 'draft' as const,
  },
];

// Clone Plan Dialog Component
interface ClonePlanDialogProps {
  plan: typeof blueprintPlans[0] | null;
  open: boolean;
  onClose: () => void;
  onClone: (planData: any) => void;
}

function ClonePlanDialog({ plan, open, onClose, onClone }: ClonePlanDialogProps) {
  const [cloneData, setCloneData] = useState({
    name: '',
    destinationType: 'personal',
  });

  // Update form when plan changes
  React.useEffect(() => {
    if (plan) {
      setCloneData({
        name: `${plan.name} (Copy)`,
        destinationType: 'personal',
      });
    }
  }, [plan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (plan) {
      onClone({
        ...plan,
        id: `clone-${Date.now()}`,
        name: cloneData.name,
        destinationType: cloneData.destinationType,
        owner: cloneData.destinationType === 'organization' ? 'Midwest Health' : 
               cloneData.destinationType === 'team' ? 'Care Team' : 'Personal',
        lastUpdated: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
        status: 'draft' as const,
      });
      onClose();
    }
  };

  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Copy size={20} />
            <span>Clone Care Plan</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm text-gray-700">Original Plan</h4>
            <p className="text-sm">{plan.name}</p>
            <p className="text-xs text-gray-500">{plan.procedure} • {plan.phase}</p>
          </div>

          <div>
            <Label htmlFor="planName">New Plan Name</Label>
            <Input
              id="planName"
              value={cloneData.name}
              onChange={(e) => setCloneData({ ...cloneData, name: e.target.value })}
              placeholder="Enter plan name"
              required
            />
          </div>
          
          <div>
            <Label>Save to</Label>
            <RadioGroup 
              value={cloneData.destinationType} 
              onValueChange={(value) => setCloneData({ ...cloneData, destinationType: value })}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="personal" id="personal" />
                <Label htmlFor="personal" className="flex items-center space-x-2 cursor-pointer">
                  <User size={16} />
                  <span>My Plans (Personal)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="team" id="team" />
                <Label htmlFor="team" className="flex items-center space-x-2 cursor-pointer">
                  <Users size={16} />
                  <span>Team Plans</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="organization" id="organization" />
                <Label htmlFor="organization" className="flex items-center space-x-2 cursor-pointer">
                  <Building size={16} />
                  <span>Organization Plans</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Clone Plan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}



function CarePlanTable({ title, plans, onClonePlan, onViewPlan }: { title: string; plans: typeof blueprintPlans; onClonePlan: (plan: typeof blueprintPlans[0]) => void; onViewPlan: (plan: typeof blueprintPlans[0]) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="font-semibold">{plan.name}</h3>
                  <Badge
                    variant={plan.status === 'active' ? 'default' : 'secondary'}
                  >
                    {plan.status}
                  </Badge>
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  <span>{plan.procedure}</span> • <span>{plan.phase}</span> •{' '}
                  <span>Owner: {plan.owner}</span> •{' '}
                  <span>Updated: {plan.lastUpdated}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" title="View Plan" onClick={() => onViewPlan(plan)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  title="Clone Plan"
                  onClick={() => onClonePlan(plan)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="More Options">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Button variant="outline">View All Plans</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Stats Component
function QuickStats() {
  const stats = [
    { label: 'Total Plans', value: '247', icon: FolderTree, color: 'text-blue-600' },
    { label: 'Active Plans', value: '189', icon: Eye, color: 'text-green-600' },
    { label: 'Draft Plans', value: '34', icon: Edit, color: 'text-yellow-600' },
    { label: 'Recent Updates', value: '12', icon: History, color: 'text-purple-600' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <IconComponent size={24} className={stat.color} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function CarePlansPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof blueprintPlans[0] | null>(null);
  const [clonedPlans, setClonedPlans] = useState<typeof blueprintPlans>([]);
  
  const sophiaPlans = blueprintPlans;
  const midwestPlans = organizationPlans;

  const handleClonePlan = (plan: typeof blueprintPlans[0]) => {
    setSelectedPlan(plan);
    setCloneDialogOpen(true);
  };

  const handleCloneSubmit = (clonedPlan: any) => {
    setClonedPlans(prev => [...prev, clonedPlan]);
    // Here you would typically make an API call to save the cloned plan
    console.log('Plan cloned:', clonedPlan);
  };

  const handleCloseDialog = () => {
    setCloneDialogOpen(false);
    setSelectedPlan(null);
  };

  const handleViewPlan = (plan: typeof blueprintPlans[0]) => {
    // Convert plan to CarePlanTemplate format and pass as search param
    const planTemplate = {
      id: plan.id,
      name: plan.name,
      description: `${plan.procedure} care plan`,
      category: plan.procedure.toLowerCase().replace(/\s+/g, '-'),
      priority: 'medium' as const,
      estimatedDuration: 60,
      components: [],
      tasks: [],
      globalRequirements: [],
      validationRules: [],
      metadata: {
        createdBy: plan.owner,
        createdAt: new Date().toISOString(),
        lastModified: plan.lastUpdated,
        version: '1.0.0',
        tags: [plan.procedure, plan.phase],
        isTemplate: true
      }
    };
    
    navigate({ 
      to: '/surgical-plan-view',
      search: { planData: JSON.stringify(planTemplate) }
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 2xl:p-8 3xl:p-12 4xl:p-16 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Care Plan Repository</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive care plan management with version control, permissions, and audit trails
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Search size={16} className="mr-2" />
            Search
          </Button>
          <Button variant="outline">
            <Filter size={16} className="mr-2" />
            Filter
          </Button>
          <Button>
            <Plus size={16} className="mr-2" />
            Create New Plan
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <FolderTree size={16} />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="repository" className="flex items-center space-x-2">
            <FolderTree size={16} />
            <span>Repository</span>
          </TabsTrigger>
          <TabsTrigger value="versions" className="flex items-center space-x-2">
            <History size={16} />
            <span>Versions</span>
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center space-x-2">
            <Shield size={16} />
            <span>Permissions</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center space-x-2">
            <Activity size={16} />
            <span>Audit Trail</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CarePlanTable title="Sophia Blueprints" plans={sophiaPlans} onClonePlan={handleClonePlan} onViewPlan={handleViewPlan} />
            <CarePlanTable title="Midwest Health Plans" plans={midwestPlans} onClonePlan={handleClonePlan} onViewPlan={handleViewPlan} />
          </div>
          
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity size={20} />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    action: 'Updated',
                    plan: 'Total Knee Arthroplasty Protocol',
                    user: 'Dr. Johnson',
                    time: '2 hours ago',
                    type: 'update',
                  },
                  {
                    action: 'Created',
                    plan: 'Cardiac Rehabilitation v2.0',
                    user: 'Dr. Smith',
                    time: '4 hours ago',
                    type: 'create',
                  },
                  {
                    action: 'Reviewed',
                    plan: 'Diabetes Management Protocol',
                    user: 'Dr. Davis',
                    time: '6 hours ago',
                    type: 'view',
                  },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'create' ? 'bg-green-500' :
                        activity.type === 'update' ? 'bg-blue-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <span className="font-medium">{activity.action}</span>
                        <span className="text-gray-600 ml-1">{activity.plan}</span>
                        <div className="text-sm text-gray-500">
                          by {activity.user} • {activity.time}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repository">
          <CarePlanRepository />
        </TabsContent>

        <TabsContent value="versions">
          <CarePlanVersionControl carePlanId="1" />
        </TabsContent>

        <TabsContent value="permissions">
          <CarePlanPermissions />
        </TabsContent>

        <TabsContent value="audit">
          <CarePlanAuditTrail />
        </TabsContent>
      </Tabs>
        
        <ClonePlanDialog
          open={cloneDialogOpen}
          plan={selectedPlan}
          onClone={handleCloneSubmit}
          onClose={handleCloseDialog}
        />
      </div>
    );
  }

export const Route = createFileRoute("/care-plans")({
  beforeLoad: requireAuth,
  component: CarePlansPage,
});
