-- Digigrantha Production Performance Optimization Indexes
-- Verified non-destructive additive indexes generated via Prisma Migrate Diff

CREATE INDEX IF NOT EXISTS "AuthToken_userId_purpose_idx" ON "AuthToken"("userId", "purpose");
CREATE INDEX IF NOT EXISTS "Brief_status_createdAt_idx" ON "Brief"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "CallRequest_projectId_createdAt_idx" ON "CallRequest"("projectId", "createdAt");
CREATE INDEX IF NOT EXISTS "CareerApplication_status_createdAt_idx" ON "CareerApplication"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "CareerApplication_type_idx" ON "CareerApplication"("type");
CREATE INDEX IF NOT EXISTS "CaseStudy_featured_displayOrder_idx" ON "CaseStudy"("featured", "displayOrder");
CREATE INDEX IF NOT EXISTS "CaseStudy_status_idx" ON "CaseStudy"("status");
CREATE INDEX IF NOT EXISTS "Message_projectId_ticketId_createdAt_idx" ON "Message"("projectId", "ticketId", "createdAt");
CREATE INDEX IF NOT EXISTS "Project_clientId_status_idx" ON "Project"("clientId", "status");
CREATE INDEX IF NOT EXISTS "Project_status_phase_idx" ON "Project"("status", "phase");
CREATE INDEX IF NOT EXISTS "ProjectDeveloper_developerId_idx" ON "ProjectDeveloper"("developerId");
CREATE INDEX IF NOT EXISTS "ProjectInvoice_status_dueDate_idx" ON "ProjectInvoice"("status", "dueDate");
CREATE INDEX IF NOT EXISTS "ProjectMilestone_projectId_order_idx" ON "ProjectMilestone"("projectId", "order");
CREATE INDEX IF NOT EXISTS "ProjectQuotation_status_createdAt_idx" ON "ProjectQuotation"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "ProjectUpdate_projectId_createdAt_idx" ON "ProjectUpdate"("projectId", "createdAt");
CREATE INDEX IF NOT EXISTS "TeamMember_displayOrder_idx" ON "TeamMember"("displayOrder");
CREATE INDEX IF NOT EXISTS "Ticket_projectId_status_updatedAt_idx" ON "Ticket"("projectId", "status", "updatedAt");

