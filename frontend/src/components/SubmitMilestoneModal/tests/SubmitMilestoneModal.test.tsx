import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { SubmitMilestoneModal } from "../SubmitMilestoneModal";

const defaultProps = {
  milestoneId: "milestone-123",
  milestoneTitle: "Design Mockups",
  milestoneAmount: "₹15,000",
  verificationCriteria: "Client reviews and approves the mockup designs",
  onSubmit: vi.fn().mockResolvedValue(undefined),
  onClose: vi.fn(),
  isLoading: false,
};

describe("SubmitMilestoneModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with correct verification criteria", () => {
    render(<SubmitMilestoneModal {...defaultProps} />);
    
    expect(screen.getByText("Client reviews and approves the mockup designs")).toBeInTheDocument();
  });

  it("renders milestone title and amount", () => {
    render(<SubmitMilestoneModal {...defaultProps} />);
    
    expect(screen.getByText("Design Mockups")).toBeInTheDocument();
    expect(screen.getByText("₹15,000")).toBeInTheDocument();
  });

  it("submit button is disabled when URL is empty", () => {
    render(<SubmitMilestoneModal {...defaultProps} />);
    
    const submitButton = screen.getByRole("button", { name: /Submit for Review/i });
    expect(submitButton).toBeDisabled();
  });

  it("submit button is enabled when valid URL is entered", async () => {
    render(<SubmitMilestoneModal {...defaultProps} />);
    
    const urlInput = screen.getByPlaceholderText(/https:\/\//i);
    fireEvent.change(urlInput, { target: { value: "https://drive.google.com/file/view/123" } });
    
    await waitFor(() => {
      const submitButton = screen.getByRole("button", { name: /Submit for Review/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  it("calls mutation with correct data on valid submit", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<SubmitMilestoneModal {...defaultProps} onSubmit={onSubmit} />);
    
    const urlInput = screen.getByPlaceholderText(/https:\/\//i);
    fireEvent.change(urlInput, { target: { value: "https://github.com/user/repo" } });
    
    const notesTextarea = screen.getByPlaceholderText(/notes/i);
    fireEvent.change(notesTextarea, { target: { value: "Added responsive breakpoints" } });
    
    const submitButton = screen.getByRole("button", { name: /Submit for Review/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        url: "https://github.com/user/repo",
        notes: "Added responsive breakpoints",
      });
    });
  });

  it("shows error for invalid URL", async () => {
    render(<SubmitMilestoneModal {...defaultProps} />);
    
    const urlInput = screen.getByPlaceholderText(/https:\/\//i);
    fireEvent.change(urlInput, { target: { value: "not-a-valid-url" } });
    
    const submitButton = screen.getByRole("button", { name: /Submit for Review/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/valid url/i)).toBeInTheDocument();
    });
  });

  it("displays warning banner about client notification", () => {
    render(<SubmitMilestoneModal {...defaultProps} />);
    
    expect(screen.getByText(/once submitted.*client will be notified/i)).toBeInTheDocument();
  });

  it("closes modal when cancel is clicked", () => {
    const onClose = vi.fn();
    render(<SubmitMilestoneModal {...defaultProps} onClose={onClose} />);
    
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it("displays loading state on submit button", () => {
    render(<SubmitMilestoneModal {...defaultProps} isLoading={true} />);
    
    const submitButton = screen.getByRole("button", { name: /submitting\.\.\./i });
    expect(submitButton).toBeDisabled();
  });
});
