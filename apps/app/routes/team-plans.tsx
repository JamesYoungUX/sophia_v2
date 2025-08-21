import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Users, Calendar, FileText, Plus } from "lucide-react";

export const Route = createFileRoute("/team-plans")(
  {
    component: () => <TeamPlansPage />,
  }
);

function TeamPlansPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 2xl:p-8 3xl:p-12 4xl:p-16 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Plans</h1>
          <p className="text-muted-foreground">
            Manage and coordinate care plans across your team members.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Plan
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Plans
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 from last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Team Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Across all plans
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Due This Week
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Plans requiring review
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <Badge variant="secondary">92%</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Team Plans</CardTitle>
            <CardDescription>
              Plans assigned to your team members
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Diabetes Management Protocol
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Assigned to: Dr. Smith, Nurse Johnson
                  </p>
                </div>
                <div className="ml-auto font-medium">
                  <Badge variant="outline">In Progress</Badge>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Post-Surgery Recovery Plan
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Assigned to: Dr. Wilson, PT Davis
                  </p>
                </div>
                <div className="ml-auto font-medium">
                  <Badge variant="secondary">Review</Badge>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Cardiac Rehabilitation
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Assigned to: Dr. Brown, Nurse Lee
                  </p>
                </div>
                <div className="ml-auto font-medium">
                  <Badge>Active</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Team Activity</CardTitle>
            <CardDescription>
              Recent updates from team members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Dr. Smith updated plan
                  </p>
                  <p className="text-sm text-muted-foreground">
                    2 hours ago
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Nurse Johnson completed review
                  </p>
                  <p className="text-sm text-muted-foreground">
                    4 hours ago
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Dr. Wilson added notes
                  </p>
                  <p className="text-sm text-muted-foreground">
                    6 hours ago
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}