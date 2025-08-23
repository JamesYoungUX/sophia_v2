import { trpc } from "@/lib/trpc";
import { Badge } from "@repo/ui/components/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/components/breadcrumb";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { Textarea } from "@repo/ui/components/textarea";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  Edit,
  FileText,
  Filter,
  Folder,
  FolderPlus,
  History,
  Loader2,
  Plus,
  Search,
  Tag,
  Users,
} from "lucide-react";
import { useCallback, useState } from "react";

const DEBUG_LOG = true;

// Types for care plan repository
interface CarePlanCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  path: string;
  level: number;
  sortOrder: number;
  isActive: boolean;
  children?: CarePlanCategory[];
  planCount?: number;
}

interface CarePlan {
  id: string;
  title: string;
  description?: string;
  status: "draft" | "active" | "archived" | "under_review";
  categoryId?: string;
  versionNumber: number;
  isTemplate: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  metadata?: Record<string, any>;
  content?: Record<string, any>; // Add content field for care plan structure
}

interface SearchFilters {
  query: string;
  status?: string;
  category?: string;
  tags?: string[];
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  author?: string;
}

// Mock categories for now (we'll implement this later)
const mockCategories: CarePlanCategory[] = [
  {
    id: "1",
    name: "Surgical Procedures",
    description: "Care plans for surgical interventions",
    path: "/surgical-procedures",
    level: 0,
    sortOrder: 1,
    isActive: true,
    planCount: 15,
    children: [
      {
        id: "1-1",
        name: "Orthopedic Surgery",
        parentId: "1",
        path: "/surgical-procedures/orthopedic",
        level: 1,
        sortOrder: 1,
        isActive: true,
        planCount: 8,
      },
      {
        id: "1-2",
        name: "Cardiac Surgery",
        parentId: "1",
        path: "/surgical-procedures/cardiac",
        level: 1,
        sortOrder: 2,
        isActive: true,
        planCount: 7,
      },
    ],
  },
  {
    id: "2",
    name: "Medical Management",
    description: "Non-surgical care plans",
    path: "/medical-management",
    level: 0,
    sortOrder: 2,
    isActive: true,
    planCount: 23,
    children: [
      {
        id: "2-1",
        name: "Chronic Disease Management",
        parentId: "2",
        path: "/medical-management/chronic-disease",
        level: 1,
        sortOrder: 1,
        isActive: true,
        planCount: 12,
      },
    ],
  },
];

// Category Tree Component
interface CategoryTreeProps {
  categories: CarePlanCategory[];
  selectedCategoryId?: string;
  onCategorySelect: (categoryId: string) => void;
  onCategoryCreate: (parentId?: string) => void;
  onCategoryEdit: (category: CarePlanCategory) => void;
  onCategoryDelete: (categoryId: string) => void;
}

function CategoryTree({
  categories,
  selectedCategoryId,
  onCategorySelect,
  onCategoryCreate,
  onCategoryEdit,
  onCategoryDelete,
}: CategoryTreeProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["1", "2"]),
  );

  const toggleExpanded = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  const renderCategory = (category: CarePlanCategory) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = category.children && category.children.length > 0;
    const isSelected = selectedCategoryId === category.id;

    return (
      <div key={category.id} className="mb-1">
        <div
          className={`flex items-center justify-between p-2 rounded-md hover:bg-gray-50 cursor-pointer ${
            isSelected ? "bg-blue-50 border border-blue-200" : ""
          }`}
          style={{ paddingLeft: `${category.level * 16 + 8}px` }}
        >
          <div
            className="flex items-center flex-1"
            onClick={() => onCategorySelect(category.id)}
          >
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(category.id);
                }}
                className="mr-1 p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}
            <Folder size={16} className="mr-2 text-blue-600" />
            <span className="text-sm font-medium">{category.name}</span>
            {category.planCount !== undefined && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {category.planCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onCategoryCreate(category.id);
              }}
            >
              <Plus size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onCategoryEdit(category);
              }}
            >
              <Edit size={14} />
            </Button>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div>{category.children?.map(renderCategory)}</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Categories</h3>
        <Button variant="outline" size="sm" onClick={() => onCategoryCreate()}>
          <FolderPlus size={16} className="mr-2" />
          New Category
        </Button>
      </div>
      {categories.map(renderCategory)}
    </div>
  );
}

// Search and Filter Component
interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  categories: CarePlanCategory[];
}

function SearchFilters({
  filters,
  onFiltersChange,
  categories,
}: SearchFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Search & Filter</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter size={16} className="mr-2" />
            {showAdvanced ? "Hide" : "Show"} Advanced
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search care plans..."
            value={filters.query}
            onChange={(e) => updateFilter("query", e.target.value)}
            className="pl-10"
          />
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => updateFilter("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category-filter">Category</Label>
              <Select
                value={filters.category}
                onValueChange={(value) => updateFilter("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="author-filter">Author</Label>
              <Input
                placeholder="Filter by author..."
                value={filters.author || ""}
                onChange={(e) => updateFilter("author", e.target.value)}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Care Plan List Component
interface CarePlanListProps {
  plans: CarePlan[];
  isLoading: boolean;
  onPlanSelect: (plan: CarePlan) => void;
  onPlanEdit: (plan: CarePlan) => void;
  onPlanDelete: (planId: string) => void;
  onPlanDuplicate: (plan: CarePlan) => void;
  onPlanShare: (plan: CarePlan) => void;
  onVersionHistory: (plan: CarePlan) => void;
}

function CarePlanList({
  plans,
  isLoading,
  onPlanSelect,
  onPlanEdit,
  onPlanDelete,
  onPlanDuplicate,
  onPlanShare,
  onVersionHistory,
}: CarePlanListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "under_review":
        return "bg-blue-100 text-blue-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading care plans...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Author</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow
                key={plan.id}
                className="cursor-pointer hover:bg-gray-50"
              >
                <TableCell onClick={() => onPlanSelect(plan)}>
                  <div className="flex items-center space-x-2">
                    <FileText size={16} className="text-blue-600" />
                    <div>
                      <div className="font-medium">{plan.title}</div>
                      {plan.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {plan.description}
                        </div>
                      )}
                    </div>
                    {plan.isTemplate && (
                      <Badge variant="outline" className="text-xs">
                        Template
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(plan.status)}>
                    {plan.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>v{plan.versionNumber}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {plan.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {plan.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{plan.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {new Date(plan.updatedAt).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{plan.updatedBy}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPlanEdit(plan)}
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPlanDuplicate(plan)}
                    >
                      <Copy size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onVersionHistory(plan)}
                    >
                      <History size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
          >
            <CardHeader onClick={() => onPlanSelect(plan)}>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <FileText size={16} className="text-blue-600 mt-1" />
                  <div>
                    <CardTitle className="text-base">{plan.title}</CardTitle>
                    {plan.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {plan.description}
                      </p>
                    )}
                  </div>
                </div>
                <Badge className={getStatusColor(plan.status)}>
                  {plan.status.replace("_", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Version: v{plan.versionNumber}</span>
                  <span>
                    Updated: {new Date(plan.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {plan.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-gray-500">
                  By {plan.updatedBy}
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPlanEdit(plan)}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPlanDuplicate(plan)}
                  >
                    <Copy size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onVersionHistory(plan)}
                  >
                    <History size={14} />
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Main Care Plan Repository Component
export function CarePlanRepository() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("1");
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: "",
    status: "all",
    category: "all",
    tags: [],
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  // Fetch care plans using tRPC
  const {
    data: carePlansData,
    isLoading,
    error,
  } = trpc.carePlan.list.useQuery({
    query: searchFilters.query,
    status: searchFilters.status === "all" ? undefined : searchFilters.status,
    category:
      searchFilters.category === "all" ? undefined : searchFilters.category,
    limit: 50,
    offset: 0,
  });

  const plans = carePlansData?.plans || [];
  const totalPlans = carePlansData?.pagination?.total || 0;

  if (DEBUG_LOG) {
    console.log("Care plans data:", carePlansData);
    console.log("Loading:", isLoading);
    console.log("Error:", error);
  }

  const handleCategorySelect = useCallback((categoryId: string) => {
    if (DEBUG_LOG) console.log("Category selected:", categoryId);
    setSelectedCategoryId(categoryId);
  }, []);

  const handleCategoryCreate = useCallback((parentId?: string) => {
    if (DEBUG_LOG) console.log("Create category with parent:", parentId);
    setShowCategoryDialog(true);
  }, []);

  const handleCategoryEdit = useCallback((category: CarePlanCategory) => {
    if (DEBUG_LOG) console.log("Edit category:", category);
    setShowCategoryDialog(true);
  }, []);

  const handleCategoryDelete = useCallback((categoryId: string) => {
    if (DEBUG_LOG) console.log("Delete category:", categoryId);
    // TODO: Implement category deletion
  }, []);

  const handlePlanSelect = useCallback((plan: CarePlan) => {
    if (DEBUG_LOG) console.log("Plan selected:", plan);
    // TODO: Navigate to plan detail view
  }, []);

  const handlePlanEdit = useCallback((plan: CarePlan) => {
    if (DEBUG_LOG) console.log("Edit plan:", plan);
    // TODO: Open plan editor
  }, []);

  const handlePlanDelete = useCallback((planId: string) => {
    if (DEBUG_LOG) console.log("Delete plan:", planId);
    // TODO: Implement plan deletion
  }, []);

  const handlePlanDuplicate = useCallback((plan: CarePlan) => {
    if (DEBUG_LOG) console.log("Duplicate plan:", plan);
    // TODO: Implement plan duplication
  }, []);

  const handlePlanShare = useCallback((plan: CarePlan) => {
    if (DEBUG_LOG) console.log("Share plan:", plan);
    // TODO: Implement plan sharing
  }, []);

  const handleVersionHistory = useCallback((plan: CarePlan) => {
    if (DEBUG_LOG) console.log("View version history:", plan);
    // TODO: Show version history dialog
  }, []);

  return (
    <div className="flex h-full">
      {/* Sidebar - Category Navigation */}
      <div className="w-80 border-r bg-gray-50 p-4 overflow-y-auto">
        <CategoryTree
          categories={mockCategories}
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={handleCategorySelect}
          onCategoryCreate={handleCategoryCreate}
          onCategoryEdit={handleCategoryEdit}
          onCategoryDelete={handleCategoryDelete}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Care Plan Repository</h1>
            <Breadcrumb className="mt-2">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Repository</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Surgical Procedures</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Download size={16} className="mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus size={16} className="mr-2" />
              New Care Plan
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <SearchFilters
          filters={searchFilters}
          onFiltersChange={setSearchFilters}
          categories={mockCategories}
        />

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            Showing {plans.length} of {totalPlans} care plans
            {searchFilters.query && ` for "${searchFilters.query}"`}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Users size={16} className="mr-2" />
              Permissions
            </Button>
            <Button variant="ghost" size="sm">
              <Tag size={16} className="mr-2" />
              Manage Tags
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="text-center py-12 border-red-200 bg-red-50">
            <CardContent>
              <div className="text-red-600 mb-4">
                <FileText size={48} className="mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Error Loading Care Plans
                </h3>
                <p className="text-red-500">{error.message}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Care Plan List */}
        {!error && (
          <CarePlanList
            plans={plans}
            isLoading={isLoading}
            onPlanSelect={handlePlanSelect}
            onPlanEdit={handlePlanEdit}
            onPlanDelete={handlePlanDelete}
            onPlanDuplicate={handlePlanDuplicate}
            onPlanShare={handlePlanShare}
            onVersionHistory={handleVersionHistory}
          />
        )}

        {/* Empty State */}
        {!isLoading && !error && plans.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No care plans found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchFilters.query
                  ? `No care plans match your search criteria.`
                  : `This category doesn't contain any care plans yet.`}
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus size={16} className="mr-2" />
                Create First Care Plan
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Care Plan Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Care Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Enter care plan title..." />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter care plan description..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select defaultValue="draft">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setShowCreateDialog(false)}>
                Create Care Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CarePlanRepository;
