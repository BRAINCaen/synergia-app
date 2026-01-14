// ==========================================
// Tests - LeaveStats Component
// ==========================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LeaveStats from './LeaveStats.jsx';

// Mock StatCard component
vi.mock('../../StatCard.jsx', () => ({
  default: ({ title, value, color }) => (
    <div data-testid={`stat-card-${color}`}>
      <span data-testid="stat-title">{title}</span>
      <span data-testid="stat-value">{value}</span>
    </div>
  )
}));

describe('LeaveStats', () => {
  const mockLeaveRequests = [
    { id: '1', status: 'pending', startDate: new Date() },
    { id: '2', status: 'pending', startDate: new Date() },
    { id: '3', status: 'approved', startDate: new Date() },
    { id: '4', status: 'approved', startDate: new Date() },
    { id: '5', status: 'approved', startDate: new Date() },
    { id: '6', status: 'rejected', startDate: new Date() },
  ];

  it('renders without crashing', () => {
    render(<LeaveStats leaveRequests={[]} />);
    expect(screen.getByTestId('stat-card-yellow')).toBeInTheDocument();
  });

  it('calculates pending requests correctly', () => {
    render(<LeaveStats leaveRequests={mockLeaveRequests} />);
    const yellowCard = screen.getByTestId('stat-card-yellow');
    expect(yellowCard).toHaveTextContent('2');
  });

  it('calculates approved requests correctly', () => {
    render(<LeaveStats leaveRequests={mockLeaveRequests} />);
    const greenCard = screen.getByTestId('stat-card-green');
    expect(greenCard).toHaveTextContent('3');
  });

  it('shows total requests count', () => {
    render(<LeaveStats leaveRequests={mockLeaveRequests} />);
    const purpleCard = screen.getByTestId('stat-card-purple');
    expect(purpleCard).toHaveTextContent('6');
  });

  it('handles empty requests array', () => {
    render(<LeaveStats leaveRequests={[]} />);
    const yellowCard = screen.getByTestId('stat-card-yellow');
    const greenCard = screen.getByTestId('stat-card-green');
    const purpleCard = screen.getByTestId('stat-card-purple');

    expect(yellowCard).toHaveTextContent('0');
    expect(greenCard).toHaveTextContent('0');
    expect(purpleCard).toHaveTextContent('0');
  });

  it('handles requests with toDate method (Firestore timestamps)', () => {
    const firestoreRequests = [
      { id: '1', status: 'pending', startDate: { toDate: () => new Date() } },
      { id: '2', status: 'approved', startDate: { toDate: () => new Date() } },
    ];

    render(<LeaveStats leaveRequests={firestoreRequests} />);
    const blueCard = screen.getByTestId('stat-card-blue');
    expect(blueCard).toHaveTextContent('2'); // Both should be this month
  });
});
