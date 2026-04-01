import React from "react";
import { Card, Button, Input, Textarea, Badge, Alert, ProgressBar, Avatar, Skeleton, Divider, EmptyState } from "../../components/ui";

const colorPalettes = {
  brand: { name: "Brand (Green)", colors: ["#ecfdf5", "#d1fae5", "#a7f3d0", "#6ee7b7", "#34d399", "#10b981", "#059669", "#047857", "#065f46", "#064e3b"] },
  primary: { name: "Primary (Blue)", colors: ["#eff6ff", "#dbeafe", "#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8", "#1e40af", "#1e3a8a"] },
  accent: { name: "Accent (Violet)", colors: ["#f5f3ff", "#ede9fe", "#ddd6fe", "#c4b5fd", "#a78bfa", "#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95"] },
  success: { name: "Success (Emerald)", colors: ["#ecfdf5", "#d1fae5", "#a7f3d0", "#6ee7b7", "#34d399", "#10b981", "#059669", "#047857", "#065f46", "#064e3b"] },
  warning: { name: "Warning (Amber)", colors: ["#fffbeb", "#fef3c7", "#fde68a", "#fcd34d", "#fbbf24", "#f59e0b", "#d97706", "#b45309", "#92400e", "#78350f"] },
  danger: { name: "Danger (Red)", colors: ["#fef2f2", "#fee2e2", "#fecaca", "#fca5a5", "#f87171", "#ef4444", "#dc2626", "#b91c1c", "#991b1b", "#7f1d1d"] },
};

export default function DesignSystem() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Trust-Bound Design System</h1>
          <p className="text-lg text-gray-600">A comprehensive design system for building consistent, beautiful interfaces.</p>
        </div>

        {/* Color Palette */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Color Palette</h2>
          <div className="space-y-8">
            {Object.entries(colorPalettes).map(([key, palette]) => (
              <div key={key}>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{palette.name}</h3>
                <div className="flex rounded-xl overflow-hidden shadow-sm">
                  {palette.colors.map((color, index) => (
                    <div
                      key={index}
                      className="flex-1 h-16 flex items-end justify-center pb-1"
                      style={{ backgroundColor: color }}
                    >
                      <span className="text-xs font-mono opacity-0 hover:opacity-100 transition-opacity" style={{ color: index > 5 ? "white" : "gray" }}>
                        {index * 100}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Typography</h2>
          <Card padding="lg">
            <div className="space-y-6">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Heading 1</span>
                <h1 className="heading-1">The quick brown fox</h1>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Heading 2</span>
                <h2 className="heading-2">The quick brown fox</h2>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Heading 3</span>
                <h3 className="heading-3">The quick brown fox</h3>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Heading 4</span>
                <h4 className="heading-4">The quick brown fox</h4>
              </div>
              <Divider />
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Body Large</span>
                <p className="body-lg">This is body large text for descriptions and paragraphs. It has a relaxed line height for comfortable reading.</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Body Base</span>
                <p className="body-base">This is body base text for standard content. Clear and readable for most use cases.</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Body Small</span>
                <p className="body-sm">This is body small text for secondary content and supporting information.</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Caption</span>
                <p className="caption">Uppercase caption text for labels and identifiers</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Buttons */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Buttons</h2>
          <Card padding="lg">
            <div className="space-y-8">
              {/* Variants */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-4">Variants</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="success">Success</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-4">Sizes</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="xs">Extra Small</Button>
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>

              {/* States */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-4">States</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <Button>Default</Button>
                  <Button disabled>Disabled</Button>
                  <Button loading>Loading</Button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Badges */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Badges</h2>
          <Card padding="lg">
            <div className="flex flex-wrap items-center gap-4">
              <Badge status="PENDING">PENDING</Badge>
              <Badge status="ACTIVE">ACTIVE</Badge>
              <Badge status="COMPLETED">COMPLETED</Badge>
              <Badge status="DISPUTED">DISPUTED</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="neutral">Neutral</Badge>
            </div>
          </Card>
        </section>

        {/* Form Elements */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Form Elements</h2>
          <Card padding="lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Default Input" placeholder="Enter text..." />
              <Input label="With Error" placeholder="Enter text..." error="This field is required" />
              <Input label="Disabled" placeholder="Cannot edit" disabled />
              <Input label="With Helper" placeholder="Enter text..." helperText="This is helper text" />
              <div className="md:col-span-2">
                <Textarea label="Textarea" placeholder="Enter a longer message..." rows={4} />
              </div>
            </div>
          </Card>
        </section>

        {/* Alerts */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Alerts</h2>
          <div className="space-y-4">
            <Alert variant="success" title="Success">
              Your project has been created successfully.
            </Alert>
            <Alert variant="warning" title="Warning">
              Please complete your profile before submitting.
            </Alert>
            <Alert variant="danger" title="Error">
              Unable to process your request. Please try again.
            </Alert>
            <Alert variant="info" title="Information">
              Your session will expire in 5 minutes.
            </Alert>
          </div>
        </section>

        {/* Progress Bars */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Progress Bars</h2>
          <Card padding="lg">
            <div className="space-y-6">
              <ProgressBar value={75} label="Default Progress" />
              <ProgressBar value={60} variant="success" label="Success Progress" />
              <ProgressBar value={45} variant="warning" label="Warning Progress" />
              <ProgressBar value={100} variant="success" label="Complete!" showValue />
            </div>
          </Card>
        </section>

        {/* Avatars */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Avatars</h2>
          <Card padding="lg">
            <div className="flex items-center gap-6">
              <Avatar name="John Doe" size="xs" />
              <Avatar name="Jane Smith" size="sm" />
              <Avatar name="Alex Johnson" size="md" />
              <Avatar name="Sam Wilson" size="lg" />
              <Avatar name="Chris Lee" size="xl" />
            </div>
          </Card>
        </section>

        {/* Skeleton Loaders */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Skeleton Loaders</h2>
          <Card padding="lg">
            <div className="flex items-center gap-6">
              <Skeleton variant="circular" width={48} height={48} />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" className="w-3/4" />
                <Skeleton variant="text" className="w-1/2" />
              </div>
            </div>
          </Card>
        </section>

        {/* Cards */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-2">Default Card</h3>
              <p className="text-sm text-gray-600">A simple card with default styling and shadow.</p>
            </Card>
            <Card variant="elevated">
              <h3 className="font-semibold text-gray-900 mb-2">Elevated Card</h3>
              <p className="text-sm text-gray-600">A card with increased shadow for emphasis.</p>
            </Card>
            <Card variant="flat">
              <h3 className="font-semibold text-gray-900 mb-2">Flat Card</h3>
              <p className="text-sm text-gray-600">A card with subtle background color.</p>
            </Card>
          </div>
        </section>

        {/* Empty State */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Empty State</h2>
          <Card>
            <EmptyState
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              }
              title="No projects yet"
              description="Create your first project to get started with Trust-Bound."
              action={<Button variant="primary">Create Project</Button>}
            />
          </Card>
        </section>

        {/* Divider */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Divider</h2>
          <Card padding="lg">
            <div className="space-y-4">
              <p className="text-gray-600">Content above the divider.</p>
              <Divider />
              <p className="text-gray-600">Content below the divider.</p>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
