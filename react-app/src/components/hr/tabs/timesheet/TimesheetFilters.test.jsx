// ==========================================
// Tests - TimesheetFilters Component
// ==========================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TimesheetFilters from './TimesheetFilters.jsx';

describe('TimesheetFilters', () => {
  const mockEmployees = [
    { id: 'emp1', firstName: 'Jean', lastName: 'Dupont' },
    { id: 'emp2', firstName: 'Marie', lastName: 'Martin' },
    { id: 'emp3', firstName: 'Pierre', lastName: 'Durand' },
  ];

  const defaultProps = {
    dateFilter: 'month',
    setDateFilter: vi.fn(),
    selectedUserId: 'all',
    setSelectedUserId: vi.fn(),
    employees: mockEmployees,
  };

  it('renders date filter with all options', () => {
    render(<TimesheetFilters {...defaultProps} />);

    expect(screen.getByText("Aujourd'hui")).toBeInTheDocument();
    expect(screen.getByText('7 derniers jours')).toBeInTheDocument();
    expect(screen.getByText('30 derniers jours')).toBeInTheDocument();
    expect(screen.getByText("Tout l'historique")).toBeInTheDocument();
  });

  it('renders employee filter with all employees', () => {
    render(<TimesheetFilters {...defaultProps} />);

    expect(screen.getByText('Tous les employés')).toBeInTheDocument();
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    expect(screen.getByText('Marie Martin')).toBeInTheDocument();
    expect(screen.getByText('Pierre Durand')).toBeInTheDocument();
  });

  it('calls setDateFilter when date filter changes', () => {
    const setDateFilter = vi.fn();
    render(<TimesheetFilters {...defaultProps} setDateFilter={setDateFilter} />);

    const dateSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(dateSelect, { target: { value: 'today' } });

    expect(setDateFilter).toHaveBeenCalledWith('today');
  });

  it('calls setSelectedUserId when employee filter changes', () => {
    const setSelectedUserId = vi.fn();
    render(<TimesheetFilters {...defaultProps} setSelectedUserId={setSelectedUserId} />);

    const employeeSelect = screen.getAllByRole('combobox')[1];
    fireEvent.change(employeeSelect, { target: { value: 'emp1' } });

    expect(setSelectedUserId).toHaveBeenCalledWith('emp1');
  });

  it('displays correct selected date filter value', () => {
    render(<TimesheetFilters {...defaultProps} dateFilter="week" />);

    const dateSelect = screen.getAllByRole('combobox')[0];
    expect(dateSelect.value).toBe('week');
  });

  it('displays correct selected employee value', () => {
    render(<TimesheetFilters {...defaultProps} selectedUserId="emp2" />);

    const employeeSelect = screen.getAllByRole('combobox')[1];
    expect(employeeSelect.value).toBe('emp2');
  });

  it('handles empty employees array', () => {
    render(<TimesheetFilters {...defaultProps} employees={[]} />);

    const employeeSelect = screen.getAllByRole('combobox')[1];
    expect(employeeSelect.options.length).toBe(1); // Only "Tous les employés"
  });
});
