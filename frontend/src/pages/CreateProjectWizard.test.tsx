import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("../api/useProjects", () => ({
  useCreateProject: () => ({ mutate: vi.fn(), isPending: false }),
  useLinkFreelancer: () => ({ mutateAsync: vi.fn() }),
  usePersistMilestones: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpsertContract: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useSignContract: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("../api/useAi", () => ({
  useAiMilestones: () => ({ mutate: vi.fn(), isPending: false }),
  useAiContract: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("../api/useEscrow", () => ({
  useDepositEscrow: () => ({ mutate: vi.fn(), isPending: false }),
}));

describe("CreateProjectWizard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders step 1 form", async () => {
    const { default: CreateProjectWizard } = await import("./CreateProjectWizard");
    render(
      <MemoryRouter>
        <CreateProjectWizard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Describe your project/i)).toBeInTheDocument();
    expect(screen.getByText(/Generate with AI/i)).toBeInTheDocument();
  });
});

