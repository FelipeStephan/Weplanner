# Implementation Examples

Real-world examples for common UI patterns in the workflow management platform.

---

## Table of Contents

1. [Dashboard Pages](#dashboard-pages)
2. [Task Management](#task-management)
3. [Forms & Modals](#forms--modals)
4. [Data Display](#data-display)
5. [User Interactions](#user-interactions)
6. [Responsive Layouts](#responsive-layouts)

---

## Dashboard Pages

### Manager Dashboard

```tsx
import { KPICard } from './components/dashboard/KPICard';
import { TaskCard } from './components/tasks/TaskCard';
import { Button } from './components/ui/button';
import { 
  CheckSquare, 
  Users, 
  TrendingUp, 
  Zap,
  Plus,
  Filter,
  Search
} from 'lucide-react';

export function ManagerDashboard() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Page Header */}
      <div className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-[#171717]">Dashboard</h1>
            <Button className="bg-[#ff5623] hover:bg-[#c2410c]">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
          <p className="text-[#525252]">
            Welcome back! Here's your team's progress.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* KPI Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Active Tasks"
            value="24"
            change="+12%"
            trend="up"
            color="primary"
            icon={CheckSquare}
          />
          <KPICard
            title="Completed This Week"
            value="156"
            change="+8%"
            trend="up"
            color="success"
            icon={TrendingUp}
          />
          <KPICard
            title="Team Members"
            value="12"
            change="+2"
            trend="up"
            color="info"
            icon={Users}
          />
          <KPICard
            title="Credits Remaining"
            value="2,450"
            change="-15%"
            trend="down"
            color="secondary"
            icon={Zap}
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tasks Section */}
            <div className="bg-white rounded-lg border border-[#e5e5e5] p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#171717]">
                  Active Tasks
                </h2>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <TaskCard
                  title="Design new landing page"
                  description="Create responsive landing page for Q2 campaign"
                  status="in-progress"
                  assignee={{ name: "John Doe" }}
                  dueDate="Mar 15"
                  commentsCount={5}
                  attachmentsCount={3}
                  priority="high"
                />
                <TaskCard
                  title="Review marketing materials"
                  status="review"
                  assignee={{ name: "Jane Smith" }}
                  dueDate="Mar 14"
                  commentsCount={2}
                  priority="medium"
                />
                <TaskCard
                  title="Update documentation"
                  status="todo"
                  assignee={{ name: "Mike Johnson" }}
                  dueDate="Mar 18"
                  priority="low"
                />
              </div>
            </div>

            {/* Team Performance */}
            <div className="bg-white rounded-lg border border-[#e5e5e5] p-6">
              <h2 className="text-xl font-semibold text-[#171717] mb-6">
                Team Performance
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-3xl font-bold text-[#171717]">94%</p>
                  <p className="text-sm text-[#737373]">Tasks Completed</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#171717]">4.2h</p>
                  <p className="text-sm text-[#737373]">Avg Response Time</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#171717]">18</p>
                  <p className="text-sm text-[#737373]">Projects Active</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#171717]">98%</p>
                  <p className="text-sm text-[#737373]">Client Satisfaction</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Activity Feed */}
            <div className="bg-white rounded-lg border border-[#e5e5e5] p-6">
              <h3 className="text-lg font-semibold text-[#171717] mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {/* Activity items */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#ff5623]/10 rounded-full flex items-center justify-center">
                    <CheckSquare className="h-4 w-4 text-[#ff5623]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#171717]">
                      <span className="font-medium">John Doe</span> completed{' '}
                      <span className="font-medium">Landing Page Design</span>
                    </p>
                    <p className="text-xs text-[#737373] mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#987dfe]/10 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-[#987dfe]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#171717]">
                      <span className="font-medium">Jane Smith</span> joined{' '}
                      <span className="font-medium">Marketing Team</span>
                    </p>
                    <p className="text-xs text-[#737373] mt-1">4 hours ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-[#e5e5e5] p-6">
              <h3 className="text-lg font-semibold text-[#171717] mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Invite Team Member
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
```

---

### Client Dashboard

```tsx
export function ClientDashboard() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#171717] mb-2">
            Welcome back, Client Name
          </h1>
          <p className="text-[#525252]">Here's an overview of your projects</p>
        </div>

        {/* Credits Card */}
        <div className="bg-gradient-to-br from-[#ff5623] to-[#c2410c] rounded-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Available Credits</p>
              <p className="text-5xl font-bold mb-2">2,450</p>
              <p className="text-white/90 text-sm">
                Valid until December 31, 2026
              </p>
            </div>
            <Button className="bg-white text-[#ff5623] hover:bg-white/90">
              Purchase More
            </Button>
          </div>
        </div>

        {/* Projects Grid */}
        <div>
          <h2 className="text-2xl font-semibold text-[#171717] mb-6">
            Active Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Project Card */}
            <div className="bg-white rounded-lg border border-[#e5e5e5] p-6 hover:border-[#d4d4d4] hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-[#171717] mb-1">
                    Website Redesign
                  </h3>
                  <p className="text-sm text-[#737373]">12 tasks • 3 active</p>
                </div>
                <span className="bg-[#019364]/10 text-[#15803d] text-xs font-medium px-2.5 py-1 rounded-full">
                  On Track
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-[#737373]">Progress</span>
                  <span className="font-medium text-[#171717]">75%</span>
                </div>
                <div className="w-full bg-[#e5e5e5] rounded-full h-2">
                  <div 
                    className="bg-[#019364] h-2 rounded-full" 
                    style={{ width: '75%' }}
                  />
                </div>
              </div>

              <Button variant="outline" className="w-full">
                View Project
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
```

---

## Task Management

### Kanban Board

```tsx
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { TaskCard } from './components/tasks/TaskCard';

export function KanbanBoard() {
  const columns = [
    {
      id: 'todo',
      title: 'To Do',
      tasks: [/* tasks */]
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      tasks: [/* tasks */]
    },
    {
      id: 'review',
      title: 'Review',
      tasks: [/* tasks */]
    },
    {
      id: 'completed',
      title: 'Completed',
      tasks: [/* tasks */]
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#171717]">Task Board</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="bg-[#f5f5f5] rounded-lg p-4">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#171717]">
                {column.title}
              </h3>
              <span className="bg-[#e5e5e5] text-[#525252] text-xs font-medium px-2 py-1 rounded-full">
                {column.tasks.length}
              </span>
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              {column.tasks.map((task) => (
                <TaskCard key={task.id} {...task} />
              ))}
            </div>

            {/* Add Task Button */}
            <Button 
              variant="ghost" 
              className="w-full mt-3 text-[#737373] hover:text-[#ff5623]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### Task Detail Modal

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './components/ui/dialog';
import { StatusBadge } from './components/tasks/StatusBadge';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Calendar, Paperclip, MessageCircle } from 'lucide-react';

export function TaskDetailModal({ task, open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">
                {task.title}
              </DialogTitle>
              <div className="flex items-center gap-3">
                <StatusBadge status={task.status} />
                <span className="text-sm text-[#737373]">
                  Created Mar 10, 2026
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content Tabs */}
        <Tabs defaultValue="details" className="mt-6">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments">
              Comments <span className="ml-1 text-xs">(5)</span>
            </TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            {/* Description */}
            <div>
              <h4 className="font-medium text-[#171717] mb-2">Description</h4>
              <p className="text-[#525252]">{task.description}</p>
            </div>

            {/* Meta Info Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-[#171717] mb-2">Assignee</h4>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{task.assignee.name}</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-[#171717] mb-2">Due Date</h4>
                <div className="flex items-center gap-2 text-sm text-[#525252]">
                  <Calendar className="h-4 w-4" />
                  {task.dueDate}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-[#171717] mb-2">Priority</h4>
                <span className={`
                  text-sm px-2.5 py-1 rounded-full
                  ${task.priority === 'high' ? 'bg-[#f32c2c]/10 text-[#be1f1f]' : ''}
                  ${task.priority === 'medium' ? 'bg-[#feba31]/10 text-[#a16207]' : ''}
                  ${task.priority === 'low' ? 'bg-[#a3a3a3]/10 text-[#525252]' : ''}
                `}>
                  {task.priority}
                </span>
              </div>

              <div>
                <h4 className="font-medium text-[#171717] mb-2">Attachments</h4>
                <div className="flex items-center gap-2 text-sm text-[#525252]">
                  <Paperclip className="h-4 w-4" />
                  3 files
                </div>
              </div>
            </div>

            {/* Attachments */}
            {task.attachments && (
              <div>
                <h4 className="font-medium text-[#171717] mb-3">Attachments</h4>
                <div className="space-y-2">
                  {task.attachments.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-[#fafafa] rounded-lg border border-[#e5e5e5]"
                    >
                      <div className="flex items-center gap-3">
                        <Paperclip className="h-4 w-4 text-[#737373]" />
                        <div>
                          <p className="text-sm font-medium text-[#171717]">
                            {file.name}
                          </p>
                          <p className="text-xs text-[#737373]">
                            {file.size} • {file.date}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            {/* Comment Thread */}
            <div className="space-y-4">
              {task.comments?.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{comment.author[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-[#fafafa] rounded-lg p-3">
                      <p className="font-medium text-sm text-[#171717] mb-1">
                        {comment.author}
                      </p>
                      <p className="text-sm text-[#525252]">
                        {comment.content}
                      </p>
                    </div>
                    <p className="text-xs text-[#737373] mt-1">
                      {comment.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Comment */}
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>ME</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <textarea
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#ff5623]"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <Button size="sm" className="bg-[#ff5623] hover:bg-[#c2410c]">
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            {/* Activity Timeline */}
            <div className="space-y-4">
              {task.activity?.map((event, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 bg-[#ff5623] rounded-full" />
                    {index < task.activity.length - 1 && (
                      <div className="w-0.5 h-full bg-[#e5e5e5] mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm text-[#171717]">{event.description}</p>
                    <p className="text-xs text-[#737373] mt-1">
                      {event.user} • {event.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Forms & Modals

### Create Task Form

```tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select';
import { toast } from 'sonner';

export function CreateTaskForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      // API call here
      toast.success('Task created successfully');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Task Title <span className="text-[#f32c2c]">*</span>
        </Label>
        <Input
          id="title"
          {...register('title', { required: 'Title is required' })}
          placeholder="Enter task title"
          className={errors.title ? 'border-[#f32c2c]' : ''}
        />
        {errors.title && (
          <p className="text-sm text-[#f32c2c]">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Add task description"
          rows={4}
        />
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assignee */}
        <div className="space-y-2">
          <Label htmlFor="assignee">Assignee</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select team member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user1">John Doe</SelectItem>
              <SelectItem value="user2">Jane Smith</SelectItem>
              <SelectItem value="user3">Mike Johnson</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Due Date */}
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            {...register('dueDate')}
          />
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select defaultValue="todo">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e5e5e5]">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" className="bg-[#ff5623] hover:bg-[#c2410c]">
          Create Task
        </Button>
      </div>
    </form>
  );
}
```

---

## Data Display

### Data Table with Sorting and Filtering

```tsx
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './components/ui/table';
import { StatusBadge } from './components/tasks/StatusBadge';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { ArrowUpDown, Search, Filter } from 'lucide-react';

export function TasksTable() {
  const [search, setSearch] = useState('');
  const [sortColumn, setSortColumn] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#e5e5e5]">
      {/* Table Header */}
      <div className="p-4 border-b border-[#e5e5e5]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#171717]">All Tasks</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a3a3a3]" />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#fafafa]">
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('title')}
                  className="hover:bg-transparent"
                >
                  Task
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('status')}
                  className="hover:bg-transparent"
                >
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} className="hover:bg-[#fafafa]">
                <TableCell className="font-medium">
                  {task.title}
                </TableCell>
                <TableCell>
                  <StatusBadge status={task.status} />
                </TableCell>
                <TableCell>{task.assignee}</TableCell>
                <TableCell className="text-[#737373]">
                  {task.dueDate}
                </TableCell>
                <TableCell>
                  <span className={`
                    text-xs px-2.5 py-1 rounded-full
                    ${task.priority === 'high' ? 'bg-[#f32c2c]/10 text-[#be1f1f]' : ''}
                    ${task.priority === 'medium' ? 'bg-[#feba31]/10 text-[#a16207]' : ''}
                    ${task.priority === 'low' ? 'bg-[#a3a3a3]/10 text-[#525252]' : ''}
                  `}>
                    {task.priority}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-[#e5e5e5] flex items-center justify-between">
        <p className="text-sm text-[#737373]">
          Showing <span className="font-medium">1-10</span> of{' '}
          <span className="font-medium">47</span> tasks
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

These implementation examples demonstrate real-world usage of the design system components in common scenarios. Each example follows best practices for:

- Responsive design
- Accessibility
- Component composition
- State management
- User interaction patterns
