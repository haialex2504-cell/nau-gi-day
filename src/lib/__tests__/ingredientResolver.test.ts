import { describe, it, expect } from 'vitest';
import { cleanIngredient } from '../ingredientResolver';

describe('cleanIngredient', () => {
  it('should remove digits and units', () => {
    expect(cleanIngredient('500g thịt bò')).toBe('thịt bò');
    expect(cleanIngredient('1kg thịt lợn')).toBe('thịt lợn');
    expect(cleanIngredient('2 quả trứng')).toBe('trứng');
  });

  it('should handle fractions/decimals', () => {
    expect(cleanIngredient('1/2 củ hành tây')).toBe('hành tây');
    expect(cleanIngredient('1.5 lít nước')).toBe('nước');
  });

  it('should trim and lowercase', () => {
    expect(cleanIngredient(' 2 Tép tỏi ')).toBe('tỏi');
  });

  it('should leave strings without units intact', () => {
    expect(cleanIngredient('muối')).toBe('muối');
    expect(cleanIngredient('hạt tiêu')).toBe('hạt tiêu');
  });
});
