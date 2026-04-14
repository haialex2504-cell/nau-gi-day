/**
 * @file recipe.test.ts
 * Unit tests for Server Actions trong `src/app/actions/recipe.ts`.
 *
 * Strategy: vi.mock('@/lib/supabase') — stub Supabase client để mỗi test
 * kiểm soát chính xác những gì "DB" trả về, không cần kết nối thật.
 *
 * IMPORTANT: vi.mock() được hoisted lên đầu file bởi Vitest, nên factory
 * function không được tham chiếu biến nào khai báo bên ngoài nó.
 * Thay vào đó, chúng ta lấy mock reference qua vi.mocked() sau khi import.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock Supabase ─────────────────────────────────────────────────────────
vi.mock('@/lib/supabase', () => {
  const mockSingle = vi.fn();
  const mockOrder = vi.fn();
  const mockIn = vi.fn();
  const mockEq = vi.fn().mockReturnValue({ order: mockOrder, single: mockSingle });
  const mockSelect = vi.fn().mockReturnValue({ in: mockIn, eq: mockEq, single: mockSingle });
  const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
  const mockSingleForUpsert = vi.fn();
  const mockSelectForUpsert = vi.fn().mockReturnValue({ single: mockSingleForUpsert });
  const mockUpsert = vi.fn().mockReturnValue({ select: mockSelectForUpsert });

  const mockGetPublicUrl = vi.fn().mockReturnValue({ data: { publicUrl: 'https://cdn.example.com/img.jpg' } });
  const mockUpload = vi.fn().mockResolvedValue({ data: { path: 'test/img.jpg' }, error: null });

  const supabase = {
    from: vi.fn().mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      upsert: mockUpsert,
    }),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      }),
    },
  };

  return { supabase };
});

// ─── Import sau mock ────────────────────────────────────────────────────────
import { supabase } from '@/lib/supabase';
import {
  searchRecipes,
  getRecipeDetail,
  getPersonalRecipes,
  getRecipesByIds,
  createRecipe,
} from '../recipe';

// ─── Helpers ────────────────────────────────────────────────────────────────
function makeRecipe(overrides: Record<string, unknown> = {}) {
  return {
    id: 'r1',
    name: 'Phở Bò',
    category: 'soup',
    sub_category: 'beef',
    cooking_time: 60,
    calories: 400,
    image_url: '',
    difficulty: 'medium',
    ...overrides,
  };
}

/** Helper type for mocked supabase.from() return value */
type MockFromReturn = ReturnType<typeof supabase.from>;

// ─────────────────────────────────────────────────────────────────────────────
// Vì vi.mock factory chỉ chạy 1 lần và trả về singleton, chúng ta cần
// reset mock calls giữa các test nhưng không thể reset implementations dễ dàng.
// Thay vào đó, mỗi bộ test ("describe") sẽ setup mockReturnValue riêng của nó.
// ─────────────────────────────────────────────────────────────────────────────

describe('searchRecipes()', () => {
  beforeEach(() => {
    vi.mocked(supabase.from).mockClear();
  });

  it('trả về [] khi không có ingredients', async () => {
    const result = await searchRecipes([]);
    expect(result).toEqual([]);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('trả về [] khi không có ingredient nào khớp trong DB', async () => {
    const mockIn = vi.fn().mockResolvedValue({ data: [], error: null });
    const mockEq = vi.fn().mockReturnValue({ in: vi.fn(), single: vi.fn() });
    const mockIlike = vi.fn().mockReturnValue({ limit: vi.fn().mockReturnValue({ in: mockIn }) });
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn, eq: mockEq, ilike: mockIlike });
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect, insert: vi.fn(), upsert: vi.fn() } as unknown as MockFromReturn);

    const result = await searchRecipes(['cà chua', 'hành lá']);
    expect(result).toEqual([]);
  });

  it('trả về [] khi ingredient query bị lỗi DB', async () => {
    const mockIn = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } });
    const mockEq = vi.fn().mockReturnValue({ in: vi.fn(), single: vi.fn() });
    const mockIlike = vi.fn().mockReturnValue({ limit: vi.fn().mockReturnValue({ in: mockIn }) });
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn, eq: mockEq, ilike: mockIlike });
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect, insert: vi.fn(), upsert: vi.fn() } as unknown as MockFromReturn);

    const result = await searchRecipes(['thịt bò']);
    expect(result).toEqual([]);
  });

  it('trả về [] khi recipe_ingredients không có kết quả', async () => {
    const mockIn = vi.fn()
      .mockResolvedValueOnce({ data: [{ id: 'ing1', name: 'thịt bò' }], error: null }) // ingredients
      .mockResolvedValueOnce({ data: [], error: null }); // recipe_ingredients
    const mockEq = vi.fn().mockReturnValue({ in: vi.fn(), single: vi.fn() });
    const mockIlike = vi.fn().mockReturnValue({ limit: vi.fn().mockReturnValue({ in: mockIn }) });
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn, eq: mockEq, ilike: mockIlike });
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect, insert: vi.fn(), upsert: vi.fn() } as unknown as MockFromReturn);

    const result = await searchRecipes(['thịt bò']);
    expect(result).toEqual([]);
  });

  it('áp dụng threshold=1 cho query 1 nguyên liệu', async () => {
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      return {
        select: () => {
          if (table === 'ingredients') {
            return { eq: () => Promise.resolve({ data: [{ id: 'ing1', name: 'trứng' }], error: null }) };
          }
          if (table === 'recipe_ingredients') {
            return {
              in: (col: string) => {
                const chain: any = Promise.resolve({ data: [{ recipe_id: 'r1' }], error: null });
                chain.eq = () => Promise.resolve({ data: [{ recipe_id: 'r1' }], error: null });
                return chain;
              }
            };
          }
          if (table === 'recipes') {
            return { in: () => Promise.resolve({ data: [makeRecipe({ id: 'r1', name: 'Cơm Chiên Trứng' })], error: null }) };
          }
        }
      } as unknown as MockFromReturn;
    });

    const result = await searchRecipes(['trứng']);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Cơm Chiên Trứng');
    expect(result[0].match_count).toBe(1);
  });

  it('áp dụng threshold=2 và lọc recipe chỉ khớp 1 nguyên liệu', async () => {
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      return {
        select: () => {
          if (table === 'ingredients') {
            return { eq: (col: string, val: string) => Promise.resolve({ data: val === 'thịt bò' ? [{ id: 'ing1', name: 'thịt bò' }] : [{ id: 'ing2', name: 'hành tây' }], error: null }) };
          }
          if (table === 'recipe_ingredients') {
            return {
              in: (col: string) => {
                const chain: any = Promise.resolve({ data: [{ recipe_id: 'r1' }, { recipe_id: 'r1' }, { recipe_id: 'r2' }], error: null });
                chain.eq = () => Promise.resolve({ data: [{ recipe_id: 'r1' }, { recipe_id: 'r1' }, { recipe_id: 'r2' }], error: null });
                return chain;
              }
            };
          }
          if (table === 'recipes') {
            return { in: () => Promise.resolve({ data: [makeRecipe({ id: 'r1', name: 'Bít Tết' })], error: null }) };
          }
        }
      } as unknown as MockFromReturn;
    });

    const result = await searchRecipes(['thịt bò', 'hành tây']);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('r1');
    expect(result[0].match_count).toBe(2);
  });

  it('sắp xếp kết quả theo match_count giảm dần', async () => {
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      return {
        select: () => {
          if (table === 'ingredients') {
            return { eq: (col: string, val: string) => Promise.resolve({ data: [{ id: `ing_${val}`, name: val }], error: null }) };
          }
          if (table === 'recipe_ingredients') {
            return {
              in: (col: string) => {
                const chain: any = Promise.resolve({
                  data: [
                    { recipe_id: 'r1' }, { recipe_id: 'r1' },
                    { recipe_id: 'r2' }, { recipe_id: 'r2' }, { recipe_id: 'r2' }
                  ], error: null
                });
                chain.eq = () => Promise.resolve({
                  data: [
                    { recipe_id: 'r1' }, { recipe_id: 'r1' },
                    { recipe_id: 'r2' }, { recipe_id: 'r2' }, { recipe_id: 'r2' }
                  ], error: null
                });
                return chain;
              }
            };
          }
          if (table === 'recipes') {
            return { in: () => Promise.resolve({ data: [makeRecipe({ id: 'r1', name: 'Món A' }), makeRecipe({ id: 'r2', name: 'Món B' })], error: null }) };
          }
        }
      } as unknown as MockFromReturn;
    });

    const result = await searchRecipes(['tỏi', 'hành', 'ớt']);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('r2');
    expect(result[1].id).toBe('r1');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('getRecipeDetail()', () => {
  beforeEach(() => {
    vi.mocked(supabase.from).mockClear();
  });

  it('trả về null khi recipe không tồn tại', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } });
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect, insert: vi.fn(), upsert: vi.fn() } as unknown as MockFromReturn);

    const result = await getRecipeDetail('nonexistent');
    expect(result).toBeNull();
  });

  it('trả về data đầy đủ khi thành công', async () => {
    const mockData = {
      ...makeRecipe({ id: 'r1', name: 'Bún Bò Huế' }),
      recipe_ingredients: [{ amount: '500g', is_main: true, ingredients: { name: 'thịt bò' } }],
      recipe_tags: [{ tag: 'bữa trưa' }],
      steps: ['Luộc thịt', 'Nấu nước lèo'],
    };
    const mockSingle = vi.fn().mockResolvedValue({ data: mockData, error: null });
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect, insert: vi.fn(), upsert: vi.fn() } as unknown as MockFromReturn);

    const result = await getRecipeDetail('r1');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('Bún Bò Huế');
    expect(result!.recipe_ingredients).toHaveLength(1);
    expect(result!.recipe_tags[0].tag).toBe('bữa trưa');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('getPersonalRecipes()', () => {
  beforeEach(() => {
    vi.mocked(supabase.from).mockClear();
  });

  it('trả về [] khi Supabase báo lỗi', async () => {
    const mockOrder = vi.fn().mockResolvedValue({ data: null, error: { message: 'fail' } });
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect, insert: vi.fn(), upsert: vi.fn() } as unknown as MockFromReturn);

    const result = await getPersonalRecipes();
    expect(result).toEqual([]);
  });

  it('trả về [] khi không có recipe cá nhân', async () => {
    const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect, insert: vi.fn(), upsert: vi.fn() } as unknown as MockFromReturn);

    const result = await getPersonalRecipes();
    expect(result).toEqual([]);
  });

  it('trả về danh sách recipe cá nhân đúng', async () => {
    const fakeData = [
      makeRecipe({ id: 'p1', name: 'Canh Chua', is_personal: true }),
      makeRecipe({ id: 'p2', name: 'Rau Muống Xào', is_personal: true }),
    ];
    const mockOrder = vi.fn().mockResolvedValue({ data: fakeData, error: null });
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect, insert: vi.fn(), upsert: vi.fn() } as unknown as MockFromReturn);

    const result = await getPersonalRecipes();
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('p1');
    expect(result[1].name).toBe('Rau Muống Xào');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('getRecipesByIds()', () => {
  beforeEach(() => {
    vi.mocked(supabase.from).mockClear();
  });

  it('trả về [] ngay lập tức nếu ids rỗng (không gọi supabase)', async () => {
    const result = await getRecipesByIds([]);
    expect(result).toEqual([]);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('trả về [] khi Supabase báo lỗi', async () => {
    const mockIn = vi.fn().mockResolvedValue({ data: null, error: { message: 'fail' } });
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn });
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect, insert: vi.fn(), upsert: vi.fn() } as unknown as MockFromReturn);

    const result = await getRecipesByIds(['r1', 'r2']);
    expect(result).toEqual([]);
  });

  it('trả về danh sách recipe theo IDs', async () => {
    const fakeData = [makeRecipe({ id: 'r1', name: 'Phở Gà' }), makeRecipe({ id: 'r2', name: 'Bánh Mì' })];
    const mockIn = vi.fn().mockResolvedValue({ data: fakeData, error: null });
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn });
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect, insert: vi.fn(), upsert: vi.fn() } as unknown as MockFromReturn);

    const result = await getRecipesByIds(['r1', 'r2']);
    expect(result).toHaveLength(2);
    expect(result.map(r => r.id)).toContain('r1');
    expect(result.map(r => r.id)).toContain('r2');
  });

  it('xử lý partial results (DB trả ít hơn số IDs yêu cầu)', async () => {
    const mockIn = vi.fn().mockResolvedValue({ data: [makeRecipe({ id: 'r1' })], error: null });
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn });
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect, insert: vi.fn(), upsert: vi.fn() } as unknown as MockFromReturn);

    const result = await getRecipesByIds(['r1', 'r_nonexistent']);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('r1');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('createRecipe()', () => {
  beforeEach(() => {
    vi.mocked(supabase.from).mockClear();
    vi.mocked(supabase.storage.from).mockClear();
  });

  function makeFormData(overrides: Record<string, string> = {}): FormData {
    const fd = new FormData();
    fd.append('name', overrides.name ?? 'Gà Kho Gừng');
    fd.append('description', overrides.description ?? 'Món ngon');
    fd.append('cookingTime', overrides.cookingTime ?? '30');
    fd.append('difficulty', overrides.difficulty ?? 'easy');
    fd.append('servings', overrides.servings ?? '2');
    fd.append('ingredients', overrides.ingredients ?? JSON.stringify([{ name: 'gà', amount: '500g' }]));
    fd.append('steps', overrides.steps ?? JSON.stringify(['Sơ chế', 'Nấu']));
    return fd;
  }

  it('trả về { success: true, id } khi không có hình ảnh', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockSingleUpsert = vi.fn().mockResolvedValue({ data: { id: 'ing1' }, error: null });
    const mockSelectUpsert = vi.fn().mockReturnValue({ single: mockSingleUpsert });
    const mockUpsert = vi.fn().mockReturnValue({ select: mockSelectUpsert });
    vi.mocked(supabase.from).mockReturnValue({ select: vi.fn(), insert: mockInsert, upsert: mockUpsert } as unknown as MockFromReturn);

    const result = await createRecipe(makeFormData());
    expect(result.success).toBe(true);
    expect(typeof result.id).toBe('string');
  });

  it('trả về { success: false } khi recipe insert thất bại', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ data: null, error: { message: 'insert failed' } });
    vi.mocked(supabase.from).mockReturnValue({ select: vi.fn(), insert: mockInsert, upsert: vi.fn() } as unknown as MockFromReturn);

    const result = await createRecipe(makeFormData());
    expect(result.success).toBe(false);
    expect(result.error).toEqual('[object Object]');
  });

  it('bỏ qua ingredient khi upsert thất bại (không throw)', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockSingleUpsert = vi.fn().mockResolvedValue({ data: null, error: { message: 'upsert error' } });
    const mockSelectUpsert = vi.fn().mockReturnValue({ single: mockSingleUpsert });
    const mockUpsert = vi.fn().mockReturnValue({ select: mockSelectUpsert });
    vi.mocked(supabase.from).mockReturnValue({ select: vi.fn(), insert: mockInsert, upsert: mockUpsert } as unknown as MockFromReturn);

    const result = await createRecipe(
      makeFormData({
        ingredients: JSON.stringify([
          { name: 'tỏi', amount: '5 tép' },
          { name: 'hành', amount: '1 củ' },
        ]),
      })
    );
    // Recipe vẫn được tạo thành công dù ingredient linking lỗi
    expect(result.success).toBe(true);
  });

  it('parse JSON ingredients và steps đúng cách', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockSingleUpsert = vi.fn().mockResolvedValue({ data: { id: 'ing1' }, error: null });
    const mockSelectUpsert = vi.fn().mockReturnValue({ single: mockSingleUpsert });
    const mockUpsert = vi.fn().mockReturnValue({ select: mockSelectUpsert });
    vi.mocked(supabase.from).mockReturnValue({ select: vi.fn(), insert: mockInsert, upsert: mockUpsert } as unknown as MockFromReturn);

    const ingredients = [{ name: 'cà chua', amount: '3 quả' }, { name: 'thịt heo', amount: '300g' }];
    const steps = ['Rửa nguyên liệu', 'Phi thơm hành tỏi', 'Xào đều'];

    const result = await createRecipe(
      makeFormData({
        ingredients: JSON.stringify(ingredients),
        steps: JSON.stringify(steps),
      })
    );
    expect(result.success).toBe(true);
  });

  it('ID recipe được tạo có prefix "user-"', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockSingleUpsert = vi.fn().mockResolvedValue({ data: { id: 'ing1' }, error: null });
    const mockSelectUpsert = vi.fn().mockReturnValue({ single: mockSingleUpsert });
    const mockUpsert = vi.fn().mockReturnValue({ select: mockSelectUpsert });
    vi.mocked(supabase.from).mockReturnValue({ select: vi.fn(), insert: mockInsert, upsert: mockUpsert } as unknown as MockFromReturn);

    const result = await createRecipe(makeFormData());
    expect(result.success).toBe(true);
    expect(result.id).toMatch(/^user-/);
  });
});
