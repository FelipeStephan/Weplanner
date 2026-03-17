# Credits System

## Credits concept

Every task has a `credits` value representing operational effort or workload.

Credits are used because task count alone is not enough to measure the weight of agency work.

Examples:

- social media post -> low credits
- landing page -> medium credits
- campaign production -> high credits

## Why credits exist

Credits are used for:

- workload measurement
- client consumption tracking
- productivity metrics
- operational analytics
- reporting

## Editing behavior

Credits do not automatically change during workflow loops.

Important rules:

- review and adjustment cycles do not automatically increase credits
- managers or account managers may manually update credits
- credit changes should be recorded in the activity log

## Credit consumption rule

Client credit consumption must exclude cancelled tasks.

Official rule:

- `completed` tasks consume client credits
- `archived` tasks consume client credits
- `cancelled` tasks do not consume client credits

Conceptual formula:

- `clientConsumedCredits = sum(task.credits where resolution != cancelled)`

## Business reasoning

This rule exists because:

- some tasks are created by mistake
- some requests are cancelled before meaningful execution
- clients may cancel a request before production begins

Archived tasks are different:

- they represent real work that existed in the operational flow
- they must still count toward client credit consumption

## Current implementation note

The credits rule is already defined as product architecture, and future reporting or client consumption modules must respect it.

Credits are already present in task data and visible in:

- board cards
- task creation/edit flows
- task detail modal
- reports calculations

## Credit reporting layer

The reports area includes a dedicated `Gestão de créditos` view.

Current responsibilities:

- show contracted, consumed, remaining, and deficit credit KPIs
- track burn rate (`créditos/dia`)
- estimate exhaustion horizon by client
- highlight non-billable cancelled credits
- expose risk signals for the current client portfolio

## Credit insights

The credit management dashboard now includes lightweight executive insights based on existing analytics data.

Current insight themes:

- client with highest chance of exhausting credits soon
- client with the most accelerated consumption in the selected period
- deficit alert when one or more clients exceed the contracted base

Fallback behavior:

- when there is no immediate exhaustion risk, the system shows a healthy-state insight
- when there is no deficit, the system shows a positive control message instead of a warning

## Presentation rule in reports

For reporting views, credit values should be shown as readable text instead of icon-only KPI treatments.

Current expectation:

- use labels such as `120 créditos`
- use rates such as `7.2 créditos/dia`
- reserve icon-based credit badges for task-card-like surfaces where compact visual scanning matters
