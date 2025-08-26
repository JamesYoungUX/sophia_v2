import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/auth-guard";
import React from "react";

// Mock care plans data - TODO: Replace with actual care plans from API
const mockCarePlans = [
  {
    id: "cp-1",
    title: "Hypertension Management",
    level: "sophia",
    lastChecked: "2024-08-15",
    updateFrequency: "monthly",
    monitoring: "active",
    findings: 12,
  },
  {
    id: "cp-2", 
    title: "Diabetes Type 2 Care",
    level: "sophia",
    lastChecked: "2024-08-10",
    updateFrequency: "weekly",
    monitoring: "active",
    findings: 23,
  },
  {
    id: "cp-3",
    title: "Heart Failure Management",
    level: "sophia",
    lastChecked: "2024-07-28",
    updateFrequency: "bi-weekly",
    monitoring: "active",
    findings: 8,
  },
  {
    id: "cp-4",
    title: "COPD Treatment Protocol",
    level: "sophia",
    lastChecked: "2024-08-01",
    updateFrequency: "quarterly",
    monitoring: "paused",
    findings: 3,
  },
  {
    id: "cp-5",
    title: "Post-Surgical Recovery",
    level: "organization",
    lastChecked: "2024-08-20",
    updateFrequency: "weekly",
    monitoring: "active",
    findings: 15,
  },
];

function GenesisSettingsPage() {
  const [carePlans, setCarePlans] = React.useState(mockCarePlans);
  const [selectedPlan, setSelectedPlan] = React.useState<string | null>(null);

  const handleFrequencyChange = (planId: string, frequency: string) => {
    setCarePlans(prev => 
      prev.map(plan => 
        plan.id === planId ? { ...plan, updateFrequency: frequency } : plan
      )
    );
    // TODO: Save to database
    console.log(`Updated ${planId} frequency to ${frequency}`);
  };

  const handleMonitoringToggle = (planId: string) => {
    setCarePlans(prev =>
      prev.map(plan =>
        plan.id === planId 
          ? { ...plan, monitoring: plan.monitoring === "active" ? "paused" : "active" }
          : plan
      )
    );
    // TODO: Save to database
    console.log(`Toggled monitoring for ${planId}`);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 2xl:p-8 3xl:p-12 4xl:p-16 w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Genesis Agent Settings</h1>
          <p className="text-muted-foreground">
            Configure literature monitoring frequency and preferences for each care plan
          </p>
        </div>
        <div className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
          MOCK DATA
        </div>
      </div>

      {/* Global Settings */}
      <div className="mb-6 p-4 bg-slate-50 rounded-lg border">
        <h2 className="font-semibold mb-3">Global Settings</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Default Update Frequency</label>
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="weekly">Weekly</option>
              <option value="bi-weekly">Bi-weekly</option>
              <option value="monthly" selected>Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Critical Alert Threshold</label>
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="A">Evidence Grade A only</option>
              <option value="B" selected>Evidence Grade B or higher</option>
              <option value="C">Evidence Grade C or higher</option>
            </select>
          </div>
        </div>
      </div>

      {/* Care Plan Settings */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Care Plan Monitoring Configuration</h2>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Care Plan</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Level</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Update Frequency</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Last Checked</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Findings</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Monitoring</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {carePlans.map((plan, i) => (
                <tr key={plan.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                  <td className="px-4 py-3 text-sm font-medium">{plan.title}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      plan.level === 'sophia' ? 'bg-purple-100 text-purple-700' :
                      plan.level === 'organization' ? 'bg-blue-100 text-blue-700' :
                      plan.level === 'team' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {plan.level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <select 
                      value={plan.updateFrequency}
                      onChange={(e) => handleFrequencyChange(plan.id, e.target.value)}
                      className="px-2 py-1 border rounded text-sm"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="bi-weekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{plan.lastChecked}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="font-medium">{plan.findings}</span> new
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => handleMonitoringToggle(plan.id)}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        plan.monitoring === 'active' 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } transition-colors`}
                    >
                      {plan.monitoring === 'active' ? '✓ Active' : '⏸ Paused'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedPlan(plan.id)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Configure
                      </button>
                      <button className="text-gray-600 hover:underline text-xs">
                        View Log
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advanced Settings for Selected Plan */}
      {selectedPlan && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold mb-3">
            Advanced Settings: {carePlans.find(p => p.id === selectedPlan)?.title}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block mb-1 font-medium">Literature Sources</label>
              <div className="space-y-1">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" checked /> PubMed
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" checked /> Cochrane Library
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" checked /> Clinical Guidelines
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" checked /> ClinicalTrials.gov
                </label>
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium">Notification Recipients</label>
              <div className="space-y-1">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" checked /> CMO
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" /> Clinical Directors
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" /> Care Plan Owners
                </label>
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
              Save Settings
            </button>
            <button 
              onClick={() => setSelectedPlan(null)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Monitoring Schedule Overview */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Next Scheduled Checks</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 border rounded-lg">
            <div className="text-sm font-medium mb-1">Next 24 Hours</div>
            <div className="text-2xl font-bold text-blue-600">3</div>
            <div className="text-xs text-muted-foreground">care plans</div>
          </div>
          <div className="p-3 border rounded-lg">
            <div className="text-sm font-medium mb-1">This Week</div>
            <div className="text-2xl font-bold text-green-600">12</div>
            <div className="text-xs text-muted-foreground">care plans</div>
          </div>
          <div className="p-3 border rounded-lg">
            <div className="text-sm font-medium mb-1">This Month</div>
            <div className="text-2xl font-bold text-purple-600">28</div>
            <div className="text-xs text-muted-foreground">care plans</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/genesis-settings")({
  beforeLoad: requireAuth,
  component: GenesisSettingsPage,
});