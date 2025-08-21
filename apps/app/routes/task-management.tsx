import { createFileRoute, Outlet } from '@tanstack/react-router';

const DEBUG_LOG = false;

export const Route = createFileRoute('/task-management')(
  {
    component: TaskManagementPage,
  }
);

function TaskManagementPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 2xl:p-8 3xl:p-12 4xl:p-16 w-full">
      <Outlet />
    </div>
  );
}