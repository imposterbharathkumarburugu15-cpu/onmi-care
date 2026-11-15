import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { PillVisualizer } from '../components/common/PillVisualizer';
import { CompetitorMatrix } from '../components/comparison/CompetitorMatrix';
import { useAppStore } from '../store/useAppStore';

describe('OmniCare Application & Component Suite', () => {
  beforeEach(() => {
    useAppStore.getState().resetToDefaults();
  });

  describe('PillVisualizer Component', () => {
    it('renders scalable SVG with round shape and imprint', () => {
      const visual = {
        shape: 'ROUND' as const,
        primaryColor: 'PINK' as const,
        imprint: 'L10',
        form: 'TABLET' as const,
        score: 'SINGLE_SCORE' as const,
      };

      const { container } = render(<PillVisualizer visual={visual} size="lg" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeDefined();
      expect(screen.getByText('L10')).toBeDefined();
      expect(container.querySelector('circle')).toBeDefined();
    });

    it('renders capsule with dividing line', () => {
      const visual = {
        shape: 'CAPSULE' as const,
        primaryColor: 'PURPLE' as const,
        imprint: 'OM20',
        form: 'CAPSULE' as const,
        score: 'NONE' as const,
      };

      const { container } = render(<PillVisualizer visual={visual} size="md" />);
      expect(screen.getByText('OM20')).toBeDefined();
      expect(container.querySelector('rect')).toBeDefined();
    });
  });

  describe('CompetitorMatrix Component', () => {
    it('renders comparison table against Medisafe, CareZone, Apple Health, PillPack', () => {
      render(<CompetitorMatrix />);
      expect(screen.getByText('OmniCare vs Existing Market Solutions')).toBeDefined();
      expect(screen.getByText('Medisafe')).toBeDefined();
      expect(screen.getByText('CareZone')).toBeDefined();
      expect(screen.getByText('Apple Health')).toBeDefined();
      expect(screen.getByText('PillPack')).toBeDefined();
      expect(screen.getByText('Shared Ecosystem & Role Delegation')).toBeDefined();
      expect(screen.getByText('WCAG 2.1 AAA Senior Accessibility')).toBeDefined();
    });
  });

  describe('Full App Integration', () => {
    it('renders header with OmniCare title and Senior Mode ON', () => {
      render(<App />);
      expect(screen.getByText('Omni')).toBeDefined();
      expect(screen.getByText('Senior Mode: ON')).toBeDefined();
      expect(screen.getByText('Elderly Dashboard')).toBeDefined();
      expect(screen.getByText('Medications & Safety')).toBeDefined();
      expect(screen.getByText('Doctor Appointments')).toBeDefined();
      expect(screen.getByText('Family Network')).toBeDefined();
      expect(screen.getByText('Competitor Benchmark')).toBeDefined();
    });

    it('renders senior dashboard with Eleanor Vance profile and Next Due dose', () => {
      render(<App />);
      expect(screen.getByText(/Eleanor Vance/i)).toBeDefined();
      expect(screen.getByText(/Adherence Streak/i)).toBeDefined();
      expect(screen.getByText("Today's Medication Schedule")).toBeDefined();
    });

    it('switches tabs to Competitor Benchmark view', () => {
      render(<App />);
      const benchmarkTab = screen.getByText('Competitor Benchmark');
      fireEvent.click(benchmarkTab);

      expect(screen.getByText('OmniCare vs Existing Market Solutions')).toBeDefined();
    });

    it('switches tabs to Doctor Appointments view', () => {
      render(<App />);
      const apptTab = screen.getByText('Doctor Appointments');
      fireEvent.click(apptTab);

      expect(screen.getByText('Doctor Appointments & Consultations')).toBeDefined();
      expect(screen.getByText('Dr. Evelyn Thorne, MD')).toBeDefined();
    });

    it('switches tabs to Family Network view', () => {
      render(<App />);
      const familyTab = screen.getByText('Family Network');
      fireEvent.click(familyTab);

      expect(screen.getByText('Family Circle & Caregiver Network')).toBeDefined();
      expect(screen.getByText('Overall Compliance')).toBeDefined();
      expect(screen.getByText('Live Adherence Activity Feed')).toBeDefined();
    });
  });
});
