import { createFileRoute } from '@tanstack/react-router';
import { TaskManagementRepository } from '../components/task-management-repository';

export const Route = createFileRoute('/task-management/')(
  {
    component: TaskManagementIndexPage,
  }
);

function TaskManagementIndexPage() {
  return <TaskManagementRepository />;
}