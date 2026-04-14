import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ShareModal from '../ShareModal';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@/app/[lang]/components/LangContext', () => ({
  useLang: vi.fn(() => ({
    lang: 'vi',
    dict: {
      share: {
        nativeTitle: 'Chia sẻ {name}',
        nativeText: 'Xem công thức {name} ngay!',
        recipePreviewLabel: 'Công thức',
        instagramAlert: 'Hãy dán link vào Instagram bio!',
      },
      common: {
        copyLink: 'Sao chép liên kết',
        more: 'Thêm',
        close: 'Đóng',
      },
    },
  })),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  recipeName: 'Phở bò',
  recipeImage: '/images/pho.jpg',
  recipeId: 'pho-123',
  onCopySuccess: vi.fn(),
};

function renderModal(props = {}) {
  return render(<ShareModal {...defaultProps} {...props} />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ShareModal – Giao diện Chia Sẻ', () => {
  let originalOpen: typeof window.open;
  let originalClipboard: Clipboard;

  beforeEach(() => {
    vi.clearAllMocks();
    originalOpen = window.open;
    window.open = vi.fn();
    originalClipboard = navigator.clipboard;

    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    window.open = originalOpen;
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true,
    });
    document.body.style.overflow = '';
  });

  // ── Render Logic ─────────────────────────────────────────────────────────

  describe('điều kiện hiển thị', () => {
    it('should return null when isOpen is false', () => {
      const { container } = renderModal({ isOpen: false });
      expect(container.firstChild).toBeNull();
    });

    it('should render the modal content when isOpen is true', () => {
      renderModal({ isOpen: true });
      expect(screen.getByText('Phở bò')).toBeDefined();
    });

    it('should display the recipe name in the preview card', () => {
      renderModal();
      expect(screen.getByText('Phở bò')).toBeDefined();
    });

    it('should render the close button', () => {
      renderModal();
      expect(screen.getByText('Đóng')).toBeDefined();
    });

    it('should render all social network buttons', () => {
      renderModal();
      expect(screen.getByText('Facebook')).toBeDefined();
      // 'Zalo' xuất hiện 2 lần trong DOM (icon text + label span)
      expect(screen.getAllByText('Zalo').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Telegram')).toBeDefined();
      expect(screen.getByText('Pinterest')).toBeDefined();
      expect(screen.getByText('Instagram')).toBeDefined();
    });
  });

  // ── Body Overflow ─────────────────────────────────────────────────────────

  describe('body overflow lock', () => {
    it('should set body overflow to hidden when opened', () => {
      renderModal({ isOpen: true });
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should reset body overflow when closed', () => {
      const { rerender } = renderModal({ isOpen: true });
      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <ShareModal {...defaultProps} isOpen={false} />
      );
      expect(document.body.style.overflow).toBe('');
    });
  });

  // ── Close Behaviour ───────────────────────────────────────────────────────

  describe('đóng modal', () => {
    it('should call onClose when clicking the close button', () => {
      const onClose = vi.fn();
      renderModal({ onClose });

      fireEvent.click(screen.getByText('Đóng'));

      expect(onClose).toHaveBeenCalledOnce();
    });

    it('should call onClose when clicking the backdrop overlay', () => {
      const onClose = vi.fn();
      renderModal({ onClose });

      // Backdrop is the first fixed overlay div
      const backdrop = document.querySelector('.fixed.inset-0') as HTMLElement;
      if (backdrop) fireEvent.click(backdrop);

      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  // ── Copy to Clipboard ─────────────────────────────────────────────────────

  describe('sao chép liên kết', () => {
    it('should call navigator.clipboard.writeText with the current URL', async () => {
      renderModal();

      fireEvent.click(screen.getByText('Sao chép liên kết'));

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          window.location.href
        );
      });
    });

    it('should call onCopySuccess after copying', async () => {
      const onCopySuccess = vi.fn();
      renderModal({ onCopySuccess });

      fireEvent.click(screen.getByText('Sao chép liên kết'));

      await waitFor(() => {
        expect(onCopySuccess).toHaveBeenCalledOnce();
      });
    });

    it('should call onClose after copying', async () => {
      const onClose = vi.fn();
      renderModal({ onClose });

      fireEvent.click(screen.getByText('Sao chép liên kết'));

      await waitFor(() => {
        expect(onClose).toHaveBeenCalledOnce();
      });
    });
  });

  // ── Social Share Buttons ──────────────────────────────────────────────────

  describe('chia sẻ lên mạng xã hội', () => {
    it('should open Facebook share URL in a new window', () => {
      renderModal();

      // Label span is direct child of the clickable div
      fireEvent.click(screen.getByText('Facebook').parentElement!);

      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('facebook.com/sharer'),
        '_blank',
        expect.any(String)
      );
    });

    it('should open Zalo share URL in a new window', () => {
      renderModal();

      // Two 'Zalo' texts: one inside the icon div, one in the label span
      // The label span's parent is the clickable container div
      const zaloLabels = screen.getAllByText('Zalo');
      const zaloLabel = zaloLabels[zaloLabels.length - 1];
      fireEvent.click(zaloLabel.parentElement!);

      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('zalo.me'),
        '_blank'
      );
    });

    it('should open Telegram share URL in a new window', () => {
      renderModal();

      fireEvent.click(screen.getByText('Telegram').parentElement!);

      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('t.me/share/url'),
        '_blank'
      );
    });

    it('should include recipe name encoded in Telegram URL', () => {
      renderModal();

      fireEvent.click(screen.getByText('Telegram').parentElement!);

      const openCall = (window.open as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(openCall[0]).toContain(encodeURIComponent('Phở bò'));
    });

    it('should call onClose after sharing on Facebook', () => {
      const onClose = vi.fn();
      renderModal({ onClose });

      fireEvent.click(screen.getByText('Facebook').parentElement!);

      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  // ── Native Share ──────────────────────────────────────────────────────────

  describe('native share API', () => {
    it('should call navigator.share when it is available', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'share', {
        value: mockShare,
        writable: true,
        configurable: true,
      });

      renderModal();

      fireEvent.click(screen.getByText('Thêm').parentElement!);

      await waitFor(() => {
        expect(mockShare).toHaveBeenCalledWith(
          expect.objectContaining({ url: window.location.href })
        );
      });
    });

    it('should fall back to copyToClipboard when navigator.share is unavailable', async () => {
      Object.defineProperty(navigator, 'share', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      renderModal();

      fireEvent.click(screen.getByText('Thêm').parentElement!);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledOnce();
      });
    });
  });
});
