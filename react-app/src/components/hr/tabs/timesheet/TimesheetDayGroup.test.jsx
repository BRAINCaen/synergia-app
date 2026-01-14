// ==========================================
// Tests - TimesheetDayGroup Component
// ==========================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TimesheetDayGroup from './TimesheetDayGroup.jsx';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Calendar: () => <span data-testid="calendar-icon" />,
  UserCheck: () => <span data-testid="user-check-icon" />,
  UserX: () => <span data-testid="user-x-icon" />,
  X: () => <span data-testid="x-icon" />,
}));

describe('TimesheetDayGroup', () => {
  const today = new Date();
  const mockEntries = [
    {
      id: 'entry1',
      type: 'arrival',
      userId: 'user1',
      timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
    },
    {
      id: 'entry2',
      type: 'departure',
      userId: 'user1',
      timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 30),
    },
  ];

  const defaultProps = {
    dayKey: today.toDateString(),
    dayEntries: mockEntries,
    selectedUserId: 'all',
    getEmployeeName: vi.fn((userId) => userId === 'user1' ? 'Jean Dupont' : 'Inconnu'),
    deleteTimeEntry: vi.fn(),
    calculateDayTotal: vi.fn(() => '8h30'),
    formatHour: vi.fn((date) => date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })),
  };

  it('renders without crashing', () => {
    render(<TimesheetDayGroup {...defaultProps} />);
    expect(screen.getByText(/pointage/i)).toBeInTheDocument();
  });

  it('displays the day total', () => {
    render(<TimesheetDayGroup {...defaultProps} />);
    expect(screen.getByText('8h30')).toBeInTheDocument();
  });

  it('displays entries count', () => {
    render(<TimesheetDayGroup {...defaultProps} />);
    expect(screen.getByText('2 pointage(s)')).toBeInTheDocument();
  });

  it('displays arrival entries with correct icon', () => {
    render(<TimesheetDayGroup {...defaultProps} />);
    expect(screen.getByText('Arrivée')).toBeInTheDocument();
  });

  it('displays departure entries', () => {
    render(<TimesheetDayGroup {...defaultProps} />);
    expect(screen.getByText('Départ')).toBeInTheDocument();
  });

  it('shows employee names when selectedUserId is "all"', () => {
    render(<TimesheetDayGroup {...defaultProps} selectedUserId="all" />);
    expect(defaultProps.getEmployeeName).toHaveBeenCalledWith('user1');
    expect(screen.getAllByText('Jean Dupont').length).toBeGreaterThan(0);
  });

  it('hides employee names when a specific user is selected', () => {
    const getEmployeeName = vi.fn();
    render(<TimesheetDayGroup {...defaultProps} selectedUserId="user1" getEmployeeName={getEmployeeName} />);
    // getEmployeeName should not be called for display when a user is selected
    expect(screen.queryByText('Jean Dupont')).not.toBeInTheDocument();
  });

  it('calls deleteTimeEntry when delete button is clicked', () => {
    const deleteTimeEntry = vi.fn();
    render(<TimesheetDayGroup {...defaultProps} deleteTimeEntry={deleteTimeEntry} />);

    const deleteButtons = screen.getAllByTitle('Supprimer');
    fireEvent.click(deleteButtons[0]);

    expect(deleteTimeEntry).toHaveBeenCalledWith('entry1');
  });

  it('calls formatHour for each entry timestamp', () => {
    const formatHour = vi.fn(() => '09:00');
    render(<TimesheetDayGroup {...defaultProps} formatHour={formatHour} />);

    expect(formatHour).toHaveBeenCalledTimes(2);
  });

  it('calls calculateDayTotal with entries', () => {
    const calculateDayTotal = vi.fn(() => '8h30');
    render(<TimesheetDayGroup {...defaultProps} calculateDayTotal={calculateDayTotal} />);

    expect(calculateDayTotal).toHaveBeenCalledWith(mockEntries);
  });
});
