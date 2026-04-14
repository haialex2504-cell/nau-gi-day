import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RecipeActions from '../RecipeActions';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
}));

vi.mock('@/app/[lang]/components/LangContext', () => ({
  useLang: vi.fn(() => ({
    lang: 'vi',
    dict: {
      recipe: { copiedLink: 'Đã sao chép liên kết' },
    },
  })),
}));

vi.mock('@/app/[lang]/components/FavoriteButton', () => ({
  default: () => <button aria-label="favorite">♥</button>,
}));

vi.mock('@/app/[lang]/components/ShareModal', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? <div data-testid="share-modal"><button onClick={onClose}>Close</button></div> : null,
}));

vi.mock('@/app/[lang]/components/Toast', () => ({
  default: ({ isOpen, message }: { isOpen: boolean; message: string }) =>
    isOpen ? <div data-testid="toast">{message}</div> : null,
}));

const mockGetSession = vi.fn();

vi.mock('@/utils/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: mockGetSession,
    },
  })),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const defaultProps = {
  recipeId: 'recipe-123',
  recipeName: 'Bún bò Huế',
  recipeImage: '/images/bun-bo.jpg',
  isAuthor: false,
};

function renderActions(props = {}) {
  return render(<RecipeActions {...defaultProps} {...props} />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('RecipeActions – Smart Login Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('khi người dùng chưa đăng nhập (session = null)', () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({ data: { session: null } });
    });

    it('should redirect to login with returnUrl when clicking clone', async () => {
      renderActions();

      // Wait for session check to complete
      await waitFor(() => expect(mockGetSession).toHaveBeenCalledOnce());

      const cloneBtn = screen.getByTitle('Nhân bản công thức');
      fireEvent.click(cloneBtn);

      expect(mockPush).toHaveBeenCalledWith('/vi/login?returnUrl=/vi/recipe/recipe-123');
    });

    it('should NOT navigate to add-recipe when clicking clone while logged out', async () => {
      renderActions();
      await waitFor(() => expect(mockGetSession).toHaveBeenCalledOnce());

      fireEvent.click(screen.getByTitle('Nhân bản công thức'));

      expect(mockPush).not.toHaveBeenCalledWith(
        expect.stringContaining('add-recipe')
      );
    });
  });

  describe('khi người dùng đã đăng nhập (session tồn tại)', () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } },
      });
    });

    it('should navigate to add-recipe with cloneId when clicking clone', async () => {
      renderActions();
      await waitFor(() => expect(mockGetSession).toHaveBeenCalledOnce());

      fireEvent.click(screen.getByTitle('Nhân bản công thức'));

      expect(mockPush).toHaveBeenCalledWith('/vi/add-recipe?cloneId=recipe-123');
    });

    it('should NOT redirect to login page when clicking clone', async () => {
      renderActions();
      await waitFor(() => expect(mockGetSession).toHaveBeenCalledOnce());

      fireEvent.click(screen.getByTitle('Nhân bản công thức'));

      expect(mockPush).not.toHaveBeenCalledWith(
        expect.stringContaining('/login')
      );
    });
  });

  describe('nút Edit – chỉ hiển thị cho tác giả', () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({ data: { session: null } });
    });

    it('should NOT render edit button when isAuthor is false', async () => {
      renderActions({ isAuthor: false });
      await waitFor(() => expect(mockGetSession).toHaveBeenCalledOnce());

      expect(screen.queryByTitle('Sửa công thức')).toBeNull();
    });

    it('should render edit button when isAuthor is true', async () => {
      renderActions({ isAuthor: true });
      await waitFor(() => expect(mockGetSession).toHaveBeenCalledOnce());

      expect(screen.getByTitle('Sửa công thức')).toBeDefined();
    });

    it('should navigate to add-recipe with editId when author clicks edit', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } },
      });
      renderActions({ isAuthor: true });
      await waitFor(() => expect(mockGetSession).toHaveBeenCalledOnce());

      fireEvent.click(screen.getByTitle('Sửa công thức'));

      expect(mockPush).toHaveBeenCalledWith('/vi/add-recipe?editId=recipe-123');
    });
  });

  describe('nút Share – không yêu cầu đăng nhập', () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({ data: { session: null } });
    });

    it('should open ShareModal when clicking share button regardless of auth state', async () => {
      renderActions();
      await waitFor(() => expect(mockGetSession).toHaveBeenCalledOnce());

      // Modal chưa hiển thị
      expect(screen.queryByTestId('share-modal')).toBeNull();

      // Tìm share button qua text của icon span bên trong
      const shareIcon = screen.getByText('share');
      fireEvent.click(shareIcon.parentElement!);

      expect(screen.getByTestId('share-modal')).toBeDefined();
    });

    it('should close ShareModal when clicking close inside modal', async () => {
      renderActions();
      await waitFor(() => expect(mockGetSession).toHaveBeenCalledOnce());

      const shareIcon = screen.getByText('share');
      fireEvent.click(shareIcon.parentElement!);
      expect(screen.getByTestId('share-modal')).toBeDefined();

      fireEvent.click(screen.getByText('Close'));
      expect(screen.queryByTestId('share-modal')).toBeNull();
    });

    it('clone and share buttons are always rendered regardless of auth', async () => {
      renderActions();
      await waitFor(() => expect(mockGetSession).toHaveBeenCalledOnce());

      expect(screen.getByTitle('Nhân bản công thức')).toBeDefined();
      expect(screen.getByText('share')).toBeDefined();
    });
  });
});
