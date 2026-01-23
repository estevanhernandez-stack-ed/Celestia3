import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WelcomeModal from '../components/WelcomeModal';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, onClick, ...props }: any) => <button onClick={onClick} {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Sparkles: () => <div data-testid="icon-sparkles" />,
  Compass: () => <div data-testid="icon-compass" />,
  Flame: () => <div data-testid="icon-flame" />,
  ArrowRight: () => <div data-testid="icon-arrow-right" />,
}));

describe('WelcomeModal', () => {
  it('renders correctly when open', () => {
    const handleClose = jest.fn();
    render(<WelcomeModal isOpen={true} onClose={handleClose} userName="Traveler" />);
    
    expect(screen.getByText('Welcome, Traveler')).toBeInTheDocument();
    expect(screen.getByText('Natal Compass')).toBeInTheDocument();
    expect(screen.getByText('The Oracle')).toBeInTheDocument();
    expect(screen.getByText('Rituals')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const handleClose = jest.fn();
    render(<WelcomeModal isOpen={false} onClose={handleClose} userName="Traveler" />);
    
    expect(screen.queryByText('Welcome, Traveler')).not.toBeInTheDocument();
  });

  it('calls onClose when button is clicked', () => {
    const handleClose = jest.fn();
    render(<WelcomeModal isOpen={true} onClose={handleClose} userName="Traveler" />);
    
    const button = screen.getByText('Begin Operations');
    fireEvent.click(button);
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
