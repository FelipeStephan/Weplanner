# Component Library - Implementation Guide

This document provides detailed implementation guidelines for all components in the design system.

## Table of Contents
1. [Dashboard Components](#dashboard-components)
2. [Task Management Components](#task-management-components)
3. [Navigation Components](#navigation-components)
4. [Form Components](#form-components)
5. [Feedback Components](#feedback-components)
6. [User Components](#user-components)

---

## Dashboard Components

### KPI Card

**Location**: `/src/app/components/dashboard/KPICard.tsx`

**Purpose**: Display key performance indicators with vibrant gradients

**Props**:
```typescript
interface KPICardProps {
  title: string;              // KPI label
  value: string | number;     // Main metric value
  change?: string;            // Percentage change
  trend?: 'up' | 'down';      // Trend direction
  color?: 'primary' | 'success' | 'info' | 'secondary' | 'danger' | 'accent';
  icon?: LucideIcon;          // Optional icon
}
```

**Usage Example**:
```tsx
import { KPICard } from './components/dashboard/KPICard';
import { TrendingUp } from 'lucide-react';

<KPICard
  title="Revenue"
  value="$45,231"
  change="+20.1%"
  trend="up"
  color="primary"
  icon={TrendingUp}
/>
```

**Color Variants**:
- `primary`: Orange gradient (brand color)
- `success`: Green gradient (positive metrics)
- `info`: Purple gradient (information)
- `secondary`: Yellow gradient (secondary metrics)
- `danger`: Red gradient (alerts)
- `accent`: Pink gradient (featured items)

**Accessibility**:
- Color is not the only indicator of status
- Text labels provide context
- Sufficient contrast ratio on gradient backgrounds

---

### Stats Panel

**Implementation**:
```tsx
export function StatsPanel({ 
  title, 
  stats 
}: { 
  title: string; 
  stats: Array<{ label: string; value: string | number }> 
}) {
  return (
    <div className="bg-white rounded-lg border border-[#e5e5e5] p-6">
      <h3 className="text-lg font-semibold text-[#171717] mb-4">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <div key={i}>
            <p className="text-2xl font-bold text-[#171717]">{stat.value}</p>
            <p className="text-sm text-[#737373]">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### Activity Feed

**Implementation**:
```tsx
interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  avatar?: string;
}

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <div className="bg-white rounded-lg border border-[#e5e5e5] p-6">
      <h3 className="text-lg font-semibold text-[#171717] mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-[#f5f5f5] text-[#525252]">
                {activity.user[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm text-[#171717]">
                <span className="font-medium">{activity.user}</span>{' '}
                {activity.action}{' '}
                <span className="font-medium">{activity.target}</span>
              </p>
              <p className="text-xs text-[#737373] mt-1">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Task Management Components

### Task Card

**Location**: `/src/app/components/tasks/TaskCard.tsx`

**Purpose**: Display task information in a card format

**Props**:
```typescript
interface TaskCardProps {
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed' | 'blocked' | 'archived';
  assignee: {
    name: string;
    avatar?: string;
  };
  dueDate?: string;
  commentsCount?: number;
  attachmentsCount?: number;
  priority?: 'low' | 'medium' | 'high';
}
```

**Features**:
- Hover state with border and shadow
- Color-coded status badges
- Avatar with fallback initials
- Metadata icons (date, comments, attachments)
- Responsive layout

---

### Status Badge

**Location**: `/src/app/components/tasks/StatusBadge.tsx`

**Purpose**: Display task status with color coding

**Props**:
```typescript
interface StatusBadgeProps {
  status: 'todo' | 'in-progress' | 'review' | 'completed' | 'blocked' | 'archived';
}
```

**Status Colors**:
- **To Do**: Gray (`#a3a3a3`)
- **In Progress**: Purple (`#987dfe`)
- **Review**: Yellow (`#feba31`)
- **Completed**: Green (`#019364`)
- **Blocked**: Red (`#f32c2c`)
- **Archived**: Light gray (`#d4d4d4`)

**Usage**:
```tsx
<StatusBadge status="in-progress" />
```

---

### Task Kanban Board

**Implementation**:
```tsx
interface TaskColumn {
  id: string;
  title: string;
  tasks: Task[];
  status: TaskStatus;
}

export function TaskKanban({ columns }: { columns: TaskColumn[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => (
        <div key={column.id} className="bg-[#fafafa] rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#171717]">{column.title}</h3>
            <span className="bg-[#e5e5e5] text-[#525252] text-xs font-medium px-2 py-1 rounded-full">
              {column.tasks.length}
            </span>
          </div>
          <div className="space-y-3">
            {column.tasks.map((task) => (
              <TaskCard key={task.id} {...task} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

### Task Timeline

**Implementation**:
```tsx
interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  user: string;
  type: 'created' | 'updated' | 'commented' | 'completed';
}

export function TaskTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="space-y-6">
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-4">
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div className={`
              w-2 h-2 rounded-full
              ${event.type === 'completed' ? 'bg-[#019364]' : 'bg-[#ff5623]'}
            `} />
            {index < events.length - 1 && (
              <div className="w-0.5 h-full bg-[#e5e5e5] mt-2" />
            )}
          </div>
          {/* Event content */}
          <div className="flex-1 pb-6">
            <p className="font-medium text-[#171717]">{event.title}</p>
            {event.description && (
              <p className="text-sm text-[#525252] mt-1">{event.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2 text-xs text-[#737373]">
              <span>{event.user}</span>
              <span>•</span>
              <span>{event.timestamp}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## Navigation Components

### Sidebar

**Implementation**:
```tsx
import { NavLink } from 'react-router';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Settings,
  BarChart3 
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: Users, label: 'Team', path: '/team' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-[#e5e5e5] overflow-y-auto">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[#e5e5e5]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#ff5623] to-[#c2410c] rounded-lg" />
          <span className="font-bold text-lg">WorkFlow</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3
                  px-3 py-2.5
                  text-sm font-medium
                  rounded-lg
                  transition-colors duration-150
                  ${isActive 
                    ? 'bg-[#ff5623]/10 text-[#ff5623]' 
                    : 'text-[#525252] hover:bg-[#f5f5f5]'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
```

---

### Topbar

**Implementation**:
```tsx
import { Search, Bell, Settings } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';

export function Topbar() {
  return (
    <header className="sticky top-0 z-50 h-16 bg-white border-b border-[#e5e5e5]">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left: Breadcrumb or page title */}
        <div>
          <h1 className="text-xl font-semibold text-[#171717]">Dashboard</h1>
        </div>

        {/* Right: Search, notifications, user */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a3a3a3]" />
            <Input 
              placeholder="Search..." 
              className="pl-9 w-64 bg-[#f5f5f5] border-transparent"
            />
          </div>
          
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-[#ff5623] text-white">
              JD
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
```

---

### Breadcrumb

**Implementation**:
```tsx
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center gap-2">
            {item.path && !isLast ? (
              <Link 
                to={item.path}
                className="text-[#525252] hover:text-[#ff5623] transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-[#171717] font-medium' : 'text-[#525252]'}>
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight className="h-4 w-4 text-[#a3a3a3]" />}
          </div>
        );
      })}
    </nav>
  );
}
```

---

## Form Components

### Form Layout

**Implementation**:
```tsx
export function FormGroup({ 
  label, 
  error, 
  required,
  children 
}: { 
  label: string; 
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[#171717]">
        {label}
        {required && <span className="text-[#f32c2c] ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-[#f32c2c] flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  );
}
```

**Usage**:
```tsx
<FormGroup label="Email" required error={errors.email}>
  <Input type="email" placeholder="you@example.com" />
</FormGroup>
```

---

## Feedback Components

### Toast Notifications

**Using Sonner** (already installed):

```tsx
import { toast } from 'sonner';

// Success
toast.success('Task created successfully', {
  description: 'Your task has been added to the board',
});

// Error
toast.error('Failed to create task', {
  description: 'Please try again or contact support',
});

// Info
toast.info('New update available', {
  description: 'Version 2.0 is ready to install',
});

// Custom
toast('Custom notification', {
  description: 'This is a custom message',
  action: {
    label: 'Undo',
    onClick: () => console.log('Undo'),
  },
});
```

**Setup** (in layout):
```tsx
import { Toaster } from './components/ui/sonner';

export function Layout() {
  return (
    <>
      {/* Your app content */}
      <Toaster position="top-right" />
    </>
  );
}
```

---

### Alert Component

**Implementation**:
```tsx
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'danger';
  title: string;
  description?: string;
}

export function Alert({ type, title, description }: AlertProps) {
  const config = {
    info: {
      icon: Info,
      className: 'bg-[#987dfe]/10 border-[#987dfe]/20 text-[#7e22ce]',
    },
    success: {
      icon: CheckCircle,
      className: 'bg-[#019364]/10 border-[#019364]/20 text-[#15803d]',
    },
    warning: {
      icon: AlertTriangle,
      className: 'bg-[#feba31]/10 border-[#feba31]/20 text-[#a16207]',
    },
    danger: {
      icon: AlertCircle,
      className: 'bg-[#f32c2c]/10 border-[#f32c2c]/20 text-[#be1f1f]',
    },
  };

  const { icon: Icon, className } = config[type];

  return (
    <div className={`rounded-lg border p-4 flex items-start gap-3 ${className}`}>
      <Icon className="h-5 w-5 mt-0.5" />
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        {description && (
          <p className="text-sm mt-1 opacity-90">{description}</p>
        )}
      </div>
    </div>
  );
}
```

---

## User Components

### Role Badge

**Location**: `/src/app/components/shared/RoleBadge.tsx`

**Props**:
```typescript
interface RoleBadgeProps {
  role: 'client' | 'manager' | 'collaborator';
}
```

**Usage**:
```tsx
<RoleBadge role="manager" />
```

---

### User Menu

**Implementation**:
```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { User, Settings, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';

export function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-[#ff5623] text-white">
              JD
            </AvatarFallback>
          </Avatar>
          <div className="text-left hidden md:block">
            <p className="text-sm font-medium text-[#171717]">John Doe</p>
            <p className="text-xs text-[#737373]">Manager</p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-[#f32c2c]">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## Data Display Components

### Data Table

**Using shadcn/ui table component**:

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { StatusBadge } from './tasks/StatusBadge';

interface Task {
  id: string;
  title: string;
  status: string;
  assignee: string;
  dueDate: string;
}

export function TaskTable({ tasks }: { tasks: Task[] }) {
  return (
    <div className="bg-white rounded-lg border border-[#e5e5e5]">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#fafafa]">
            <TableHead>Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} className="hover:bg-[#fafafa]">
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>
                <StatusBadge status={task.status as any} />
              </TableCell>
              <TableCell>{task.assignee}</TableCell>
              <TableCell className="text-[#737373]">{task.dueDate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

---

## Layout Patterns

### Dashboard Layout

```tsx
import { Sidebar } from './components/navigation/Sidebar';
import { Topbar } from './components/navigation/Topbar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Sidebar />
      <div className="lg:pl-60">
        <Topbar />
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Auth Layout

```tsx
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
```

---

## Responsive Patterns

### Card Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### Two Column Layout

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">
    {/* Main content */}
  </div>
  <div>
    {/* Sidebar content */}
  </div>
</div>
```

### Stack on Mobile

```tsx
<div className="flex flex-col md:flex-row gap-4">
  <div className="flex-1">{/* Content */}</div>
  <div className="flex-1">{/* Content */}</div>
</div>
```

---

## Animation Guidelines

### Hover Transitions

```tsx
className="transition-all duration-150 hover:shadow-md hover:scale-105"
```

### Loading States

```tsx
import { Loader2 } from 'lucide-react';

<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Please wait
</Button>
```

### Page Transitions

```tsx
import { motion } from 'motion/react';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* Content */}
</motion.div>
```

---

## Best Practices

### Component Organization
- Keep components small and focused
- Use composition over complex props
- Extract reusable logic to custom hooks
- Maintain consistent naming conventions

### Styling
- Use design tokens from theme.css
- Prefer Tailwind utilities over custom CSS
- Keep responsive breakpoints consistent
- Use semantic color names

### Accessibility
- Include proper ARIA labels
- Ensure keyboard navigation works
- Maintain color contrast ratios
- Provide focus indicators

### Performance
- Lazy load heavy components
- Optimize images with proper sizing
- Use React.memo for expensive renders
- Debounce search inputs

---

## Implementation Checklist

- [ ] Set up base components from shadcn/ui
- [ ] Customize theme colors in theme.css
- [ ] Implement KPI cards
- [ ] Create task management components
- [ ] Build navigation components
- [ ] Add form components
- [ ] Implement feedback components
- [ ] Create layout templates
- [ ] Add responsive breakpoints
- [ ] Test accessibility
- [ ] Optimize performance
- [ ] Document custom components
