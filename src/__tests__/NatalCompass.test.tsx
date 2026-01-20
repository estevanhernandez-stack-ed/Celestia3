import * as React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import NatalCompass from '../components/NatalCompass';
import { useSettings } from '../context/SettingsContext';
import '@testing-library/jest-dom';

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

// Mock services with proper aliases
jest.mock('@/lib/SwissEphemerisService', () => ({
  SwissEphemerisService: {
    calculateChart: jest.fn()
  }
}));

// Mock Astrology Icons
jest.mock('../components/AstrologyIcons', () => ({
  getPlanetIcon: jest.fn(() => ({ className }: any) => <div data-testid="planet-icon" className={className} />)
}));

// Mock contexts
jest.mock('../context/SettingsContext');
// Mock framer-motion with a simpler but effective mock
jest.mock('framer-motion', () => {
  return {
    motion: new Proxy({}, {
      get: (_, tag) => {
        const Component = React.forwardRef(({ children, ...props }: any, ref: any) => {
          const Tag = tag as string;
          // Filter out framer-motion specific props to avoid React warnings in console
          const { whileHover: _wh, whileTap: _wt, initial: _i, animate: _a, exit: _e, transition: _t, ...rest } = props;
          return React.createElement(Tag, { ...rest, ref }, children);
        });
        Component.displayName = `motion.${tag as string}`;
        return Component;
      }
    }),
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

// Mock R3F
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div data-testid="canvas">{children}</div>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Sparkles: (props: any) => <div data-testid="icon-sparkles" {...props} />,
  Info: (props: any) => <div data-testid="icon-info" {...props} />,
  X: (props: any) => <div data-testid="icon-close" {...props} />,
}));

// Mock sub-components
jest.mock('../components/PlanetOrb', () => ({
  PlanetSceneOrb: () => <div data-testid="planet-orb" />
}));

describe('NatalCompass', () => {
  const mockChart = {
    planets: [
      { name: 'Sun', sign: 'Leo', absoluteDegree: 135, house: 1, degree: 15 },
      { name: 'Moon', sign: 'Aries', absoluteDegree: 15, house: 9, degree: 15 }
    ],
    ascendant: { sign: 'Taurus', absoluteDegree: 45, degree: 15 },
    houses: [
        { number: 1, sign: 'Taurus', degree: 15 }
    ]
  };

  const mockPreferences = {
    name: 'Test Initiate',
    level: 1,
    xp: 0
  };

  const mockUpdatePreferences = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    (useSettings as jest.Mock).mockReturnValue({
      preferences: mockPreferences,
      updatePreferences: mockUpdatePreferences
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly with chart data', () => {
    render(<NatalCompass chart={mockChart as any} />);
    
    // Check for Zodiac signs using test-id
    expect(screen.getByTestId('zodiac-label-Leo')).toBeInTheDocument();
    expect(screen.getByTestId('zodiac-label-Aries')).toBeInTheDocument();
  });

  it('shows tooltip on planet hover', async () => {
    render(<NatalCompass chart={mockChart as any} />);
    
    // Find the hotspot for Sun
    const sunHotspot = screen.getByTestId('planet-hotspot-Sun');
    
    // Trigger hover
    fireEvent.mouseEnter(sunHotspot);
    fireEvent.mouseOver(sunHotspot);
    
    // Tooltip should appear
    // Use waitFor to ensure all conditional blocks have rendered
    await waitFor(() => {
      // Check for planet name (found in node label and detail overlay)
      expect(screen.getAllByText('Sun').length).toBeGreaterThan(0);
      // Check for sign (found in multiple places)
      expect(screen.getAllByText(/Leo/i).length).toBeGreaterThan(0);
      // Check for degree and house from mockChart (might match multiple positions)
      expect(screen.getAllByText(/15/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/House 1/i)).toBeInTheDocument();
    });
  });

  it('awards XP after 3 seconds of meditation (hover)', async () => {
    render(<NatalCompass chart={mockChart as any} />);
    
    const sunHotspot = screen.getByTestId('planet-hotspot-Sun');
    fireEvent.mouseEnter(sunHotspot);
    fireEvent.mouseOver(sunHotspot);
    
    // Fast-forward 3 seconds
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalled();
    });
  });

  it('toggles the legend', async () => {
    render(<NatalCompass chart={mockChart as any} />);
    
    const infoButton = screen.getByTestId('icon-info').parentElement!; 
    fireEvent.click(infoButton);
    
    const legendTitle = await screen.findByText(/Celestial Legend/i);
    expect(legendTitle).toBeInTheDocument();
    
    const closeButton = screen.getByTestId('icon-close').parentElement!;
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByText(/Celestial Legend/i)).not.toBeInTheDocument();
    });
  });
});
