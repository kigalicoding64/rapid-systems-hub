# RAPID SYSTEMS — architecture and schema plan

## Experiences
- Public website (built): `/`, `/about`, `/services`, `/services/$slug`, `/industries`, `/solutions`, `/projects`, `/our-process`, `/contact`, `/request-quote`, `/track`, `/track/$token`.
- Client portal (`/client/*`) and operations platform (`/app/*`): planned, behind authentication, each with its own shell.

## Schema in place (Phase 1)
- `company_settings` — single editable row, public read.
- `service_requests` — guest/registered requests; DB-assigned reference `RS-YYYY-NNNNN`; hashed tracking token.
- `request_status_events` — status history (trigger-written), `client_visible` flag.
- `request_attachments` — files in private bucket `request-attachments`.
- `contact_enquiries` — contact form messages.
- `portfolio_projects` — admin-managed, public only when published.

## Planned schema (Phases 2–7)
- Identity: `profiles`, `user_roles` (enum: super_admin, director, operations_manager, sales, project_manager, engineer, technician, finance_officer, client), `has_role()` security-definer checks, `organization_members`.
- CRM: `organizations`, `contacts`, `leads` (pipeline stages), `lead_activities`.
- Requests: `service_requests.organization_id`, `assigned_officer_id`, `request_notes` (internal vs client-visible), request claim flow for guests.
- Assessments: `assessments`, `assessment_checklist_items`, `assessment_photos`.
- Commercial: `quotations`, `quotation_items`, `quotation_versions` (immutable snapshots), `quotation_approvals`, configurable `tax_rates`, `currencies`.
- Delivery: `projects`, `project_members`, `milestones` (weighted), `tasks`, `task_assignments`, `task_comments`, `task_evidence`, `project_updates`, `risks`, `issues`, `change_requests`.
- Operations: `inventory_items`, `stock_movements`, `suppliers`, `purchase_requests`, `purchase_orders`, `deliveries`.
- Finance: `invoices`, `invoice_items`, `payments`, `expenses`.
- Maintenance: `maintenance_contracts`, `installed_equipment`, `maintenance_schedules`, `service_tickets`.
- Shared: `messages`, `notifications`, `documents` (private storage, signed URLs), `audit_logs`.
