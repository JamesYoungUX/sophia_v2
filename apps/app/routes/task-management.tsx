import { createFileRoute } from '@tanstack/react-router';
import { TaskManagementRepository } from '../components/task-management-repository';

export const Route = createFileRoute('/task-management')(
  {
    component: TaskManagementPage,
  }
);

function TaskManagementPage() {
  return (
    <div className="container mx-auto py-6">
      <TaskManagementRepository />
    </div>
  );
}