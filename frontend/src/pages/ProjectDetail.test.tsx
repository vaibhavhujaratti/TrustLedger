import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

const mockProject = {
  id: "project-123",
  title: "Test Project",
  description: "Test description",
  totalBudget: 50000,
  status: "ACTIVE",
  clientId: "client-1",
  freelancerId: "freelancer-1",
  milestones: [],
  escrowWallet: {
    totalDeposited: "50000",
    totalReleased: "25000",
    totalRefunded: "0",
  },
  client: { displayName: "Test Client", upiHandle: "test@upi" },
  freelancer: { displayName: "Test Freelancer", upiHandle: "freelancer@upi" },
};

const mockLedger = [
  {
    id: "entry-1",
    entryType: "DEPOSIT",
    amount: "50000",
    direction: "CREDIT",
    memo: "Escrow deposit",
    createdAt: "2024-01-15T10:30:00Z",
    actor: { displayName: "Test Client" },
  },
  {
    id: "entry-2",
    entryType: "RELEASE",
    amount: "25000",
    direction: "DEBIT",
    memo: "Milestone 1 released",
    createdAt: "2024-01-20T14:00:00Z",
    actor: { displayName: "Test Client" },
  },
];

vi.mock("../api/useProjects", () => ({
  useProject: vi.fn(() => ({ data: mockProject, isLoading: false })),
  useSignContract: vi.fn(() => ({ mutate: vi.fn() })),
}));

vi.mock("../api/useEscrow", () => ({
  useDepositEscrow: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useLedger: vi.fn(() => ({ data: mockLedger, isLoading: false })),
}));

vi.mock("../api/useMilestones", () => ({
  useApproveMilestone: vi.fn(() => ({ mutate: vi.fn() })),
  useReviewMilestone: vi.fn(() => ({ mutate: vi.fn() })),
  useSubmitMilestone: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

vi.mock("../api/useDisputes", () => ({
  useRaiseDispute: vi.fn(() => ({ mutateAsync: vi.fn() })),
}));

vi.mock("../stores/authStore", () => ({
  useAuthStore: vi.fn(() => ({ user: { role: "CLIENT", displayName: "Test Client" } })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe("ProjectDetail - Transaction History", () => {
  let ProjectDetail: React.ComponentType;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await import("./ProjectDetail");
    ProjectDetail = module.default;
  });

  it("renders ledger toggle button when ledger entries exist", () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <ProjectDetail />
      </Wrapper>
    );

    expect(screen.getByTestId("ledger-toggle")).toBeInTheDocument();
    expect(screen.getByText("Transaction History")).toBeInTheDocument();
  });

  it("is collapsed by default and does not show ledger entries", () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <ProjectDetail />
      </Wrapper>
    );

    expect(screen.queryByTestId("ledger-entries")).not.toBeInTheDocument();
  });

  it("shows ledger entries after clicking the toggle", async () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <ProjectDetail />
      </Wrapper>
    );

    const toggleButton = screen.getByTestId("ledger-toggle");
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByTestId("ledger-entries")).toBeInTheDocument();
    });
  });

  it("displays correct ledger entry data", async () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <ProjectDetail />
      </Wrapper>
    );

    const toggleButton = screen.getByTestId("ledger-toggle");
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText("DEPOSIT")).toBeInTheDocument();
      expect(screen.getByText("RELEASE")).toBeInTheDocument();
      expect(screen.getByText("Test Client")).toBeInTheDocument();
    });
  });

  it("collapses ledger entries when toggle is clicked again", async () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <ProjectDetail />
      </Wrapper>
    );

    const toggleButton = screen.getByTestId("ledger-toggle");
    
    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(screen.getByTestId("ledger-entries")).toBeInTheDocument();
    });

    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(screen.queryByTestId("ledger-entries")).not.toBeInTheDocument();
    });
  });

  it("shows ledger entries with correct type badges", async () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <ProjectDetail />
      </Wrapper>
    );

    const toggleButton = screen.getByTestId("ledger-toggle");
    fireEvent.click(toggleButton);

    await waitFor(() => {
      const depositBadge = screen.getByText("DEPOSIT");
      const releaseBadge = screen.getByText("RELEASE");
      expect(depositBadge).toBeInTheDocument();
      expect(releaseBadge).toBeInTheDocument();
    });
  });
});
