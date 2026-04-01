export type UserRole = "CLIENT" | "FREELANCER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  upiHandle?: string | null;
}

export type MilestoneStatus = "PENDING" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "FUNDS_RELEASED" | "DISPUTED";
export type ProjectStatus = "DRAFT" | "CONTRACT_REVIEW" | "FUNDED" | "IN_PROGRESS" | "COMPLETED" | "DISPUTED";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: MilestoneStatus;
  estimatedDays: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  totalBudget: number;
  status: ProjectStatus;
  clientId: string;
  freelancerId?: string | null;
  milestones?: Milestone[];
}
