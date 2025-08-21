import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { User, Clock, CheckCircle, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/my-plans")(
  {
    component: () => <MyPlansPage />,
  }
);

function MyPlansPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 2xl:p-8 3xl:p-12 4xl:p-16 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Plans</h1>
          <p className="text-muted-foreground">
            View and manage care plans assigned specifically to you.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Clock className="mr-2 h-4 w-4" />
            View Schedule
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assigned Plans
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Due Today
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Plan review needed
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>My Active Plans</CardTitle>
            <CardDescription>
              Care plans currently assigned to you
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Hypertension Management
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Patient: John Doe • Due: Today
                  </p>
                </div>
                <div className="ml-auto font-medium">
                  <Badge variant="destructive">Due Today</Badge>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Diabetes Care Protocol
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Patient: Jane Smith • Due: Tomorrow
                  </p>
                </div>
                <div className="ml-auto font-medium">
                  <Badge variant="outline">In Progress</Badge>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Physical Therapy Plan
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Patient: Mike Johnson • Due: Friday
                  </p>
                </div>
                <div className="ml-auto font-medium">
                  <Badge>Active</Badge>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Medication Review
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Patient: Sarah Wilson • Due: Next Week
                  </p>
                </div>
                <div className="ml-auto font-medium">
                  <Badge variant="secondary">Scheduled</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your recent plan updates and actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Completed assessment
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Hypertension Management • 1 hour ago
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Updated care notes
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Diabetes Care Protocol • 3 hours ago
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Scheduled follow-up
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Physical Therapy Plan • Yesterday
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Reviewed medications
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Medication Review • 2 days ago
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