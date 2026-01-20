import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DashboardShell from '../components/DashboardShell';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { SwissEphemerisService } from '../lib/SwissEphemerisService';

// Mock Firebase modules completely to avoid initialization errors
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  getApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: 'test-uid' },
    onAuthStateChanged: jest.fn((cb) => cb({ uid: 'test-uid' })),
  })),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn(),
  serverTimestamp: jest.fn(),
}));

// Mock the internal firebase file
jest.mock('../lib/firebase', () => ({
  db: {},
  auth: {
    currentUser: { uid: 'test-uid' }
  }
}));

// Mock contexts
jest.mock('../context/SettingsContext');
jest.mock('../context/AuthContext');

// Mock services
jest.mock('../lib/SwissEphemerisService', () => ({
  SwissEphemerisService: {
    calculateChart: jest.fn()
  }
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, onClick, ...props }: any) => <button onClick={onClick} {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock all sub-components to speed up tests and avoid side effects
jest.mock('../components/NatalCompass', () => () => <div data-testid="natal-compass">Natal Compass Component</div>);
jest.mock('../components/NumerologyView', () => () => <div data-testid="numerology-view">Numerology View</div>);
jest.mock('../components/ChatInterface', () => () => <div data-testid="chat-interface">Chat Interface</div>);
jest.mock('../components/TransitFeed', () => () => <div data-testid="transit-feed">Transit Feed</div>);
jest.mock('../components/RitualVision', () => () => <div data-testid="ritual-vision">Ritual Vision</div>);
jest.mock('../components/AdminView', () => () => <div data-testid="admin-view">Admin View</div>);
jest.mock('../components/CosmicCalibration', () => () => <div data-testid="cosmic-calibration">Cosmic Calibration</div>);
jest.mock('../components/WelcomeModal', () => () => <div data-testid="welcome-modal">Welcome Modal</div>);
jest.mock('../components/onboarding/OnboardingExperience', () => () => <div data-testid="onboarding">Onboarding</div>);
jest.mock('../components/NumerologyDetailModal', () => () => <div data-testid="numerology-modal">Numerology Modal</div>);
jest.mock('../components/RitualControlPanel', () => () => <div data-testid="ritual-panel">Ritual Control Panel - Perform a</div>);
jest.mock('../components/CosmicInsightPanel', () => () => <div data-testid="insight-panel">Cosmic Insight Panel</div>);
jest.mock('../components/SynastryView', () => () => <div data-testid="synastry-view">Synastry View Component</div>);
jest.mock('../components/TarotDeck', () => () => <div data-testid="tarot-deck">Tarot Deck</div>);
jest.mock('../components/TarotSpread', () => () => <div data-testid="tarot-spread">Tarot Spread</div>);
jest.mock('../components/TarotExplorer', () => () => <div data-testid="tarot-explorer">Tarot Explorer</div>);
jest.mock('../components/GrimoireView', () => () => <div data-testid="grimoire-view">Grimoire View</div>);
jest.mock('../components/AtmosphereController', () => () => <div data-testid="atmosphere">Atmosphere</div>);
jest.mock('../components/GrimoireCodex', () => () => <div data-testid="grimoire-codex">Grimoire Codex</div>);
jest.mock('../components/CelebrityMatchView', () => () => <div data-testid="celebrity-view">Celebrity View</div>);

describe('DashboardShell', () => {
  const mockPreferences = {
    name: 'Test Initiate',
    level: 1,
    xp: 0,
    hasCompletedOnboarding: true,
    hasSeenWelcome: true,
    birthDate: '1990-01-01',
    birthLocation: { lat: 0, lng: 0, city: 'Test' }
  };

  const mockUpdatePreferences = jest.fn();

  beforeEach(() => {
    (useSettings as jest.Mock).mockReturnValue({
      preferences: mockPreferences,
      updatePreferences: mockUpdatePreferences
    });
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: 'test-uid' }
    });
    (SwissEphemerisService.calculateChart as jest.Mock).mockResolvedValue({
      planets: [{ name: 'Sun', sign: 'Aries' }, { name: 'Moon', sign: 'Taurus' }],
      ascendant: { sign: 'Leo' }
    });
  });

  it('renders the sidebar and navigation items', () => {
    render(<DashboardShell />);
    expect(screen.getByText('CELESTIA')).toBeInTheDocument();
    // There are multiple "Natal Compass" texts (nav, header, mocked component)
    const compassItems = screen.getAllByText('Natal Compass', { exact: false });
    expect(compassItems.length).toBeGreaterThan(0);
    expect(screen.getAllByText('Synastry', { exact: false }).length).toBeGreaterThan(0);
  });

  it('switches views when clicking sidebar items', async () => {
    render(<DashboardShell />);
    
    // Find the button in the nav specifically
    const synastryButton = screen.getAllByText('Synastry')[0].closest('button');
    if (synastryButton) fireEvent.click(synastryButton);
    
    // Check if Synastry View mocked component is rendered
    expect(screen.getByTestId('synastry-view')).toBeInTheDocument();
  });

  it('shows the "Mystical Seal" when clicking a locked item', () => {
    render(<DashboardShell />);
    
    const ritualsButton = screen.getByText('Rituals').closest('button');
    if (ritualsButton) fireEvent.click(ritualsButton);
    
    expect(screen.getByText('Mystical Seal Active')).toBeInTheDocument();
  });

  it('allows access to items if level is sufficient', () => {
    (useSettings as jest.Mock).mockReturnValue({
      preferences: { ...mockPreferences, level: 10 },
      updatePreferences: mockUpdatePreferences
    });

    render(<DashboardShell />);
    
    const ritualsButton = screen.getByText('Rituals').closest('button');
    if (ritualsButton) fireEvent.click(ritualsButton);
    
    expect(screen.queryByText('Mystical Seal Active')).not.toBeInTheDocument();
    expect(screen.getByTestId('ritual-panel')).toBeInTheDocument();
  });

  it('collapses sidebar when clicking toggle', () => {
    render(<DashboardShell />);
    
    // The toggle button is the one with chevron
    const toggleButton = screen.getByRole('button', { name: '' }); // The one with chevron has no name
    fireEvent.click(toggleButton);
    
    expect(screen.queryByText('CELESTIA')).not.toBeInTheDocument();
  });
});
