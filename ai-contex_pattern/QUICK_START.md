# Quick Start Guide

Get started building with the Workflow Management Design System in minutes.

## Overview

This design system provides a complete foundation for building modern SaaS workflow management applications with:
- ✅ React + TypeScript
- ✅ Tailwind CSS v4
- ✅ shadcn/ui + Radix UI
- ✅ Lucide icons
- ✅ Production-ready components

---

## Getting Started

### 1. Color System

The design system uses a vibrant color palette based on the provided Figma colors:

```tsx
// Primary - Orange (Brand)
className="bg-[#ff5623]"    // Brand color
className="bg-[#c2410c]"    // Darker variant

// Success - Green
className="bg-[#019364]"    // Success states
className="bg-[#64b477]"    // Light success

// Info - Purple
className="bg-[#987dfe]"    // Information
className="bg-[#5237e6]"    // Deep purple accent

// Warning - Yellow
className="bg-[#feba31]"    // Warnings

// Danger - Red
className="bg-[#f32c2c]"    // Errors
className="bg-[#be1f1f]"    // Dark red

// Accent - Pink
className="bg-[#ffbee9]"    // Featured items
className="bg-[#e992d7]"    // Dark pink

// Neutral
className="bg-[#fafafa]"    // Light background
className="bg-[#f5f5f5]"    // Subtle background
className="bg-[#101010]"    // Dark (near black)
```

### 2. Typography

SF Pro font with system fallbacks:

```tsx
// Headings
<h1 className="text-4xl font-bold">Heading 1</h1>
<h2 className="text-3xl font-semibold">Heading 2</h2>
<h3 className="text-2xl font-semibold">Heading 3</h3>

// Body text
<p className="text-base text-[#525252]">Regular body text</p>
<p className="text-sm text-[#737373]">Small text for captions</p>
<p className="text-xs text-[#737373]">Extra small helper text</p>
```

### 3. Spacing

8px baseline grid:

```tsx
// Padding
className="p-4"   // 16px
className="p-6"   // 24px
className="p-8"   // 32px

// Gaps
className="gap-4"  // 16px
className="gap-6"  // 24px
className="gap-8"  // 32px
```

### 4. Border Radius

```tsx
className="rounded-lg"    // 10px - Default for cards
className="rounded-xl"    // 12px - Large cards
className="rounded-full"  // Pills and avatars
```

---

## Quick Component Examples

### KPI Card

```tsx
import { KPICard } from './components/dashboard/KPICard';
import { TrendingUp } from 'lucide-react';

<KPICard
  title="Active Tasks"
  value="24"
  change="+12%"
  trend="up"
  color="primary"
  icon={TrendingUp}
/>
```

### Task Card

```tsx
import { TaskCard } from './components/tasks/TaskCard';

<TaskCard
  title="Design new feature"
  description="Create mockups for the dashboard"
  status="in-progress"
  assignee={{ name: "John Doe" }}
  dueDate="Mar 15"
  commentsCount={5}
  priority="high"
/>
```

### Status Badge

```tsx
import { StatusBadge } from './components/tasks/StatusBadge';

<StatusBadge status="in-progress" />
<StatusBadge status="completed" />
<StatusBadge status="blocked" />
```

### Role Badge

```tsx
import { RoleBadge } from './components/shared/RoleBadge';

<RoleBadge role="manager" />
<RoleBadge role="client" />
<RoleBadge role="collaborator" />
```

---

## Common Patterns

### Card with Header

```tsx
<div className="bg-white rounded-lg border border-[#e5e5e5] p-6">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-semibold text-[#171717]">Card Title</h2>
    <Button variant="ghost" size="sm">Action</Button>
  </div>
  <div>
    {/* Card content */}
  </div>
</div>
```

### Button Variants

```tsx
import { Button } from './components/ui/button';

// Primary
<Button className="bg-[#ff5623] hover:bg-[#c2410c]">
  Primary Action
</Button>

// Secondary
<Button variant="secondary">
  Secondary Action
</Button>

// Outline
<Button variant="outline">
  Outline Action
</Button>

// Ghost
<Button variant="ghost">
  Ghost Action
</Button>

// With icon
<Button className="bg-[#ff5623] hover:bg-[#c2410c]">
  <Plus className="h-4 w-4 mr-2" />
  Create New
</Button>
```

### Form Input

```tsx
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email"
    type="email" 
    placeholder="you@example.com"
    className="bg-[#f5f5f5] border-transparent"
  />
</div>
```

### Alert Message

```tsx
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
import { AlertCircle } from 'lucide-react';

<Alert className="bg-[#019364]/10 border-[#019364]/20 text-[#15803d]">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Success!</AlertTitle>
  <AlertDescription>
    Your task has been created successfully.
  </AlertDescription>
</Alert>
```

### Toast Notification

```tsx
import { toast } from 'sonner';

// Success
toast.success('Task created successfully');

// Error
toast.error('Failed to create task');

// With action
toast('Task updated', {
  action: {
    label: 'Undo',
    onClick: () => console.log('Undo'),
  },
});
```

---

## Layout Templates

### Dashboard Page

```tsx
export function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="bg-white border-b border-[#e5e5e5] px-6 py-4">
        <h1 className="text-2xl font-bold text-[#171717]">Dashboard</h1>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* KPI cards here */}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Main content */}
          </div>
          <div>
            {/* Sidebar */}
          </div>
        </div>
      </main>
    </div>
  );
}
```

### Two-Column Layout

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Main content - 2/3 width */}
  <div className="lg:col-span-2">
    <TaskList />
  </div>
  
  {/* Sidebar - 1/3 width */}
  <div>
    <ActivityFeed />
  </div>
</div>
```

### Card Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <Card key={item.id} {...item} />
  ))}
</div>
```

---

## Responsive Design

### Breakpoints

```tsx
// Mobile first approach
className="text-base"           // All screens
className="md:text-lg"          // Tablet (768px+)
className="lg:text-xl"          // Desktop (1024px+)
className="xl:text-2xl"         // Large desktop (1280px+)

// Common patterns
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
className="flex flex-col lg:flex-row gap-4"
className="hidden md:block"     // Hide on mobile
className="md:hidden"           // Show only on mobile
```

### Container Widths

```tsx
<div className="max-w-7xl mx-auto px-6">
  {/* Content */}
</div>
```

---

## Color Usage Guidelines

### Status Colors

```tsx
// Success states
className="bg-[#019364] text-white"              // Success button
className="bg-[#019364]/10 text-[#15803d]"       // Success alert

// Warning states
className="bg-[#feba31] text-white"              // Warning button
className="bg-[#feba31]/10 text-[#a16207]"       // Warning alert

// Error states
className="bg-[#f32c2c] text-white"              // Error button
className="bg-[#f32c2c]/10 text-[#be1f1f]"       // Error alert

// Info states
className="bg-[#987dfe] text-white"              // Info button
className="bg-[#987dfe]/10 text-[#7e22ce]"       // Info alert
```

### Text Colors

```tsx
className="text-[#171717]"    // Primary text
className="text-[#525252]"    // Secondary text
className="text-[#737373]"    // Tertiary text
className="text-[#a3a3a3]"    // Placeholder text
```

### Background Colors

```tsx
className="bg-white"          // Card background
className="bg-[#fafafa]"      // Page background
className="bg-[#f5f5f5]"      // Input background
className="bg-[#101010]"      // Dark background
```

### Border Colors

```tsx
className="border-[#e5e5e5]"  // Default border
className="border-[#d4d4d4]"  // Hover border
className="border-[#ff5623]"  // Brand border
```

---

## Icons

Using Lucide React:

```tsx
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  CheckSquare,
  Calendar,
  Users,
  Settings,
  Bell,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

// In buttons
<Button>
  <Plus className="h-4 w-4 mr-2" />
  Create
</Button>

// Standalone
<Search className="h-5 w-5 text-[#525252]" />

// In cards
<CheckSquare className="h-6 w-6 text-[#ff5623]" />
```

---

## Shadows

```tsx
// Card elevation
className="shadow-sm"           // Subtle
className="shadow-md"           // Medium
className="shadow-lg"           // Large

// Hover states
className="shadow-sm hover:shadow-md transition-shadow"
```

---

## Transitions

```tsx
// Standard transition
className="transition-colors duration-150"

// All properties
className="transition-all duration-250"

// With hover
className="transition-shadow duration-200 hover:shadow-lg"
```

---

## Accessibility

### Focus States

```tsx
className="
  focus:outline-none 
  focus:ring-2 
  focus:ring-[#ff5623] 
  focus:ring-offset-2
"
```

### ARIA Labels

```tsx
<button aria-label="Close dialog">
  <X className="h-4 w-4" />
</button>

<input aria-describedby="error-message" aria-invalid="true" />
```

---

## Common Utilities

### Truncate Text

```tsx
className="truncate"           // Single line
className="line-clamp-2"       // 2 lines
className="line-clamp-3"       // 3 lines
```

### Flex Layouts

```tsx
// Center
className="flex items-center justify-center"

// Space between
className="flex items-center justify-between"

// Column
className="flex flex-col gap-4"
```

### Grid Layouts

```tsx
className="grid grid-cols-2 gap-4"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
```

---

## Next Steps

1. ✅ Review the [full design system documentation](/DESIGN_SYSTEM.md)
2. ✅ Explore the [component library](/COMPONENT_LIBRARY.md)
3. ✅ Check out the showcase in `/src/app/App.tsx`
4. ✅ Customize colors in `/src/styles/theme.css`
5. ✅ Build your first page using the templates

---

## Support

For questions or issues:
- Review the design system documentation
- Check component examples in the showcase
- Refer to shadcn/ui documentation for base components
- Check Tailwind CSS v4 documentation for utilities

---

**Happy building! 🚀**
