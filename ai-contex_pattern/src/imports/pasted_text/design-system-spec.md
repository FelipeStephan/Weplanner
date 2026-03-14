You are a Senior Product Designer, Design System Architect and Frontend Engineer specialized in modern web applications.

Your task is to create a COMPLETE DESIGN SYSTEM based on:
• the technical documentation I will provide
• the visual style references
• the color palette
• the typography

The design system must be structured for implementation using:

- React
- TailwindCSS
- shadcn/ui
- Radix UI
- Component-based architecture
- Responsive layouts

The system should follow modern SaaS product standards similar to Linear, Notion, Vercel, Stripe Dashboard and modern task management platforms.

------------------------------------------------

PROJECT CONTEXT

This platform is a workflow management system for:

• Marketing Agencies
• Freelancers
• Clients
• Managers
• Collaborators

The platform allows:

• task management
• credit/asset balance management
• dashboards
• workflow automation
• reports
• notifications
• collaboration

Extract and analyze the technical document to understand:

• user roles
• core features
• UI requirements
• flows
• entities
• data relationships

The main user roles are:

Client  
Manager  
Collaborator

Main modules include:

• Authentication (Login / Signup / Password recovery)
• Dashboards
• Task management
• Asset/credits management
• Reports
• Notifications
• User settings

Use the technical document to guide the UI architecture.

------------------------------------------------

DESIGN STYLE REFERENCES

Follow the visual direction of the images provided.

The style should combine:

• modern SaaS dashboard UI
• vibrant color accents
• clean layouts
• strong cards
• bold typography
• modular UI blocks
• modern component spacing
• mobile-first responsiveness

Visual references include elements like:

• colorful KPI cards
• pill buttons
• modern widgets
• modular dashboards
• expressive color blocks

------------------------------------------------

TYPOGRAPHY

Primary Font:
SF Pro

Create the typography scale including:

• Display
• Heading 1–6
• Body
• Small text
• Labels
• UI helper text

Define:

• font sizes
• line heights
• weights
• responsive typography rules

------------------------------------------------

COLOR SYSTEM

Primary Brand Color: ORANGE

But the system must support a wider palette with complementary colors.

Create a full token system including:

Primary  
Secondary  
Accent  
Success  
Warning  
Danger  
Info  
Neutral

Define:

• color tokens
• background tokens
• surface tokens
• border tokens
• text tokens

Create a structure similar to Tailwind tokens.

Example:

color.primary.500  
color.success.400  
color.surface.100

------------------------------------------------

DESIGN TOKENS

Define all base tokens:

Spacing scale  
Border radius scale  
Shadow scale  
Opacity scale  
Z-index scale  
Motion duration tokens  

------------------------------------------------

LAYOUT SYSTEM

Create a layout framework including:

Container widths  
Grid system  
Spacing rules  
Section padding  
Responsive breakpoints

Use Tailwind-like breakpoints.

------------------------------------------------

CORE COMPONENTS

Design reusable UI components compatible with shadcn/ui and Radix primitives.

Include:

Buttons
• Primary
• Secondary
• Outline
• Ghost
• Icon button
• Loading state

Inputs
• Text input
• Textarea
• Select
• Checkbox
• Radio
• Switch
• File upload

Navigation
• Sidebar
• Topbar
• Breadcrumb
• Tabs

Cards
• Basic card
• KPI card
• Task card
• Notification card

Tables
• Data table
• Sortable table
• Filterable table

Feedback
• Toast notifications
• Alerts
• Modals
• Dialogs
• Popovers

Task management components
• Task card
• Task status badge
• Task timeline
• Task comment thread

Dashboard components
• KPI widgets
• Activity feed
• Charts container
• Stats panels

User components
• Avatar
• User menu
• Role badge

------------------------------------------------

STATE VARIANTS

Define component states:

Default  
Hover  
Active  
Focus  
Disabled  
Loading  
Error  
Success  

------------------------------------------------

ICONOGRAPHY

Define icon system compatible with:

Lucide icons or Radix icons.

Include usage rules.

------------------------------------------------

ACCESSIBILITY

Ensure accessibility compliance:

• WCAG contrast rules
• keyboard navigation
• ARIA attributes
• focus states

------------------------------------------------

RESPONSIVE DESIGN

Define behavior for:

Desktop  
Tablet  
Mobile

Include layout adaptation rules.

------------------------------------------------

OUTPUT FORMAT

Return the design system structured as:

1. Design Principles
2. Color System
3. Typography
4. Design Tokens
5. Layout System
6. Components Library
7. Interaction States
8. Accessibility Rules
9. Responsive Rules
10. Example UI patterns for:
   - Dashboard
   - Task management
   - Client view
   - Manager view
   - Collaborator view

If possible include:

• Tailwind utility references
• component structure suggestions
• React component architecture

The design system must be scalable and production-ready.