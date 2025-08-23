import { requireAuth } from "@/lib/auth-guard";
import { trpc } from "@/lib/trpc";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";

import {
  createFileRoute,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import {
  ArrowUp,
  Building,
  Copy,
  Eye,
  FolderTree,
  Plus,
  Search,
  Shield,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

// Care Plan Card Component
function CarePlanCard({
  plan,
  onView,
  onClone,
  onPromote,
}: {
  plan: any;
  onView: (plan: any) => void;
  onClone: (plan: any) => void;
  onPromote?: (plan: any) => void;
}) {
  // Extract content information
  const content = plan.content || {};
  const phases = content.phases || [];
  const modifications =
    content.organizationModifications ||
    content.teamModifications ||
    content.personalModifications;

  // Show derivation info
  const getDerivationInfo = () => {
    if (plan.planLevel === "system") return "Sophia System Template";
    if (plan.planLevel === "organization") return "Derived from Sophia Plan";
    if (plan.planLevel === "team") return "Derived from Organization Plan";
    if (plan.planLevel === "personal") return "Derived from Team Plan";
    return "";
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-lg">{plan.title}</h3>
              <Badge
                variant={plan.status === "active" ? "default" : "secondary"}
              >
                {plan.status}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {plan.planLevel}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">{plan.description}</p>

            {/* Content Preview */}
            <div className="mb-3 p-3 bg-gray-50 rounded-md">
              <div className="text-sm font-medium text-gray-700 mb-1">
                Content Preview:
              </div>
              {phases.length > 0 && (
                <div className="text-xs text-gray-600 mb-1">
                  <strong>Phases:</strong> {phases.length} phase
                  {phases.length !== 1 ? "s" : ""}
                </div>
              )}
              {content.targetBP && (
                <div className="text-xs text-gray-600 mb-1">
                  <strong>Target BP:</strong> {content.targetBP}
                </div>
              )}
              {content.targetHbA1c && (
                <div className="text-xs text-gray-600 mb-1">
                  <strong>Target HbA1c:</strong> {content.targetHbA1c}
                </div>
              )}
              {modifications && (
                <div className="text-xs text-gray-600">
                  <strong>Modifications:</strong>{" "}
                  {modifications.modifications?.length || 0} change
                  {modifications.modifications?.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>

            {/* Derivation Info */}
            <div className="text-xs text-blue-600 mb-2">
              {getDerivationInfo()}
            </div>

            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>
                Created: {new Date(plan.createdAt).toLocaleDateString()}
              </span>
              <span>
                Updated: {new Date(plan.updatedAt).toLocaleDateString()}
              </span>
              <span>Version: {plan.versionNumber}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              title="View Plan"
              onClick={(e) => {
                e.stopPropagation();
                onView(plan);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              title="Clone Plan"
              onClick={(e) => {
                e.stopPropagation();
                onClone(plan);
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
            {/* Promotion button - only for personal plans */}
            {plan.planLevel === "personal" && onPromote && (
              <Button
                variant="ghost"
                size="sm"
                title="Promote to Team Plan"
                onClick={(e) => {
                  e.stopPropagation();
                  onPromote(plan);
                }}
                className="text-green-600 hover:text-green-700"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Care Plan List Component
function CarePlanList({
  title,
  description,
  icon: Icon,
  plans,
  onView,
  onClone,
  onPromote,
  onCreateNew,
}: {
  title: string;
  description: string;
  icon: any;
  plans: any[];
  onView: (plan: any) => void;
  onClone: (plan: any) => void;
  onPromote?: (plan: any) => void;
  onCreateNew?: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPlans = plans.filter(
    (plan) =>
      plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icon className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-gray-600">{description}</p>
          </div>
        </div>
        {onCreateNew && (
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Plan
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search plans..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Plans Grid */}
      {filteredPlans.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FolderTree className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No plans found
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? "Try adjusting your search terms."
                : "No plans available at this level."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlans.map((plan) => (
            <div key={plan.id} onClick={() => onView(plan)}>
              <CarePlanCard
                plan={plan}
                onView={onView}
                onClone={onClone}
                onPromote={onPromote}
              />
            </div>
          ))}
        </div>
      )}

      {/* Plan Count */}
      <div className="text-sm text-gray-500">
        {filteredPlans.length} plan{filteredPlans.length !== 1 ? "s" : ""} found
      </div>
    </div>
  );
}

function CarePlansPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [planLevel, setPlanLevel] = useState("sophia");

  // Read the level from URL search params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const level = urlParams.get("level");
    if (level && ["sophia", "organization", "team", "my"].includes(level)) {
      setPlanLevel(level);
    }
  }, [location.search]);

  // Fetch care plans data for different levels
  const { data: sophiaPlansData } = trpc.carePlan.sophiaPlans.useQuery({
    limit: 50,
    offset: 0,
  });

  const { data: organizationPlansData } =
    trpc.carePlan.organizationPlans.useQuery({
      limit: 50,
      offset: 0,
    });

  const { data: myPlansData } = trpc.carePlan.myPlans.useQuery({
    limit: 50,
    offset: 0,
  });

  const { data: teamPlansData } = trpc.carePlan.teamPlans.useQuery({
    limit: 50,
    offset: 0,
  });

  const sophiaPlans = sophiaPlansData?.plans || [];
  const organizationPlans = organizationPlansData?.plans || [];
  const teamPlans = teamPlansData?.plans || [];
  const myPlans = myPlansData?.plans || [];

  // Get the current plan level data
  const getCurrentPlans = () => {
    switch (planLevel) {
      case "sophia":
        return sophiaPlans;
      case "organization":
        return organizationPlans;
      case "team":
        return teamPlans;
      case "my":
        return myPlans;
      default:
        return sophiaPlans;
    }
  };

  const getCurrentPlanInfo = () => {
    switch (planLevel) {
      case "sophia":
        return {
          title: "Sophia Plans",
          description: "System default plans available to all users",
          icon: Shield,
        };
      case "organization":
        return {
          title: "Organization Plans",
          description: "Plans specific to your organization",
          icon: Building,
        };
      case "team":
        return {
          title: "Team Plans",
          description: "Plans specific to your team",
          icon: Users,
        };
      case "my":
        return {
          title: "My Plans",
          description: "Plans you've created or been assigned",
          icon: User,
        };
      default:
        return {
          title: "Sophia Plans",
          description: "System default plans available to all users",
          icon: Shield,
        };
    }
  };

  const handleViewPlan = (plan: any) => {
    // Convert plan to CarePlanTemplate format and pass as search param
    const planTemplate = {
      id: plan.id,
      name: plan.title,
      description: plan.description,
      category: plan.category || "general",
      priority: "medium" as const,
      estimatedDuration: 60,
      components: [],
      tasks: [],
      globalRequirements: [],
      validationRules: [],
      metadata: {
        createdBy: plan.createdBy,
        createdAt: plan.createdAt,
        lastModified: plan.updatedAt,
        version: plan.versionNumber?.toString() || "1.0.0",
        tags: plan.tags || [],
        isTemplate: plan.isTemplate || false,
      },
    };

    navigate({
      to: "/surgical-plan-view",
      search: { planData: JSON.stringify(planTemplate) },
    });
  };

  const handleClonePlan = (plan: any) => {
    // TODO: Implement plan cloning functionality
    console.log("Clone plan:", plan);
  };

  const handlePromotePlan = (plan: any) => {
    // TODO: Implement plan promotion from personal to team level
    console.log("Promote plan to team level:", plan);
  };

  const handleCreateNew = () => {
    // TODO: Implement create new plan functionality
    console.log("Create new plan");
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 2xl:p-8 3xl:p-12 4xl:p-16 w-full">
      {/* Main Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Care Plans</h1>
          <p className="text-gray-600 mt-1">
            Manage and access care plans at different levels
          </p>
        </div>
      </div>

      {/* Single Plan Level View */}
      <CarePlanList
        title={getCurrentPlanInfo().title}
        description={getCurrentPlanInfo().description}
        icon={getCurrentPlanInfo().icon}
        plans={getCurrentPlans()}
        onView={handleViewPlan}
        onClone={handleClonePlan}
        onPromote={planLevel === "my" ? handlePromotePlan : undefined}
        onCreateNew={planLevel !== "sophia" ? handleCreateNew : undefined}
      />
    </div>
  );
}

export const Route = createFileRoute("/care-plans")({
  beforeLoad: requireAuth,
  component: CarePlansPage,
});
