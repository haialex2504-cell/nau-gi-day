import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSwitcher from '../LanguageSwitcher';
import { usePathname, useRouter } from 'next/navigation';
import { vi } from 'vitest';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
}));

describe('LanguageSwitcher', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });
  });

  it('renders correct label for VI locale', () => {
    (usePathname as any).mockReturnValue('/vi/home');
    render(<LanguageSwitcher lang="vi" />);
    expect(screen.getByText('🇻🇳 VI')).toBeDefined();
  });

  it('renders correct label for EN locale', () => {
    (usePathname as any).mockReturnValue('/en/home');
    render(<LanguageSwitcher lang="en" />);
    expect(screen.getByText('🇬🇧 EN')).toBeDefined();
  });

  it('switches to EN when current is VI', () => {
    (usePathname as any).mockReturnValue('/vi/about');
    render(<LanguageSwitcher lang="vi" />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockPush).toHaveBeenCalledWith('/en/about');
  });

  it('switches to VI when current is EN', () => {
    (usePathname as any).mockReturnValue('/en/recipes/123');
    render(<LanguageSwitcher lang="en" />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockPush).toHaveBeenCalledWith('/vi/recipes/123');
  });
});
