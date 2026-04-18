/**
 * Bảng đồng nghĩa nguyên liệu tiếng Việt
 * ─────────────────────────────────────────
 * Cấu trúc: CANONICAL_MAP[tên_chuẩn] = [danh sách đồng nghĩa]
 * → Được compile thành flat SYNONYM_MAP[đồng_nghĩa] = tên_chuẩn
 *
 * Quy tắc thêm mới:
 *   - KEY   = tên chuẩn nhất, ngắn nhất, phổ biến nhất
 *   - VALUE = mảng tất cả biến thể, vùng miền, thương mại, lỗi gõ
 */

// ─────────────────────────────────────────────
// BẢNG CHÍNH: [tên chuẩn] → [các biến thể]
// ─────────────────────────────────────────────
const CANONICAL_MAP: Record<string, string[]> = {

  // ── THỊT / PROTEIN ──────────────────────────
  'thịt heo': [
    'thịt lợn', 'thịt lon', 'thịt nạc heo', 'thịt thăn heo',
    'thịt heo bằm', 'thịt heo xay', 'nạc vai', 'thit heo', 'thit lon',
    'thịt băm', 'thịt xay', 'thịt bằm', 'thịt minced', 'thit bam', 'thit bam',
  ],
  'thịt ba chỉ': [
    'ba chỉ', 'ba rọi', 'thịt ba rọi', 'thit ba chi', 'ba rọi heo',
  ],
  'thịt bò': [
    'thit bo', 'bò', 'thịt bò băm', 'thịt bò xay', 'bò bằm', 'thit bo bam',
  ],
  'thịt gà': [
    'thit ga', 'gà', 'ức gà', 'đùi gà', 'lườn gà', 'cánh gà',
    'phi lê gà', 'ga',
  ],
  'thịt vịt': [
    'vịt',
  ],
  'thịt bê': [
    'thịt me',
  ],
  'sườn heo': [
    'sườn non', 'sườn thăn', 'sườn lợn', 'suon heo',
  ],
  'giò lụa': [
    'chả lụa',
  ],
  'ruốc': [
    'chà bông',
  ],
  'bóng bì': [
    'da heo phồng', 'bì lợn', 'bì heo',
  ],
  'nem rán': [
    'chả giò', 'ram', 'chả ram',
  ],
  'dạ dày': [
    'bao tử', 'dồi trường',
  ],

  // ── CÁ / HẢI SẢN ────────────────────────────
  'tôm': [
    'tôm tươi', 'tôm sông', 'tôm biển', 'tôm sú', 'tôm thẻ',
  ],
  'mực': [
    'cà mực', 'mực ống', 'mực lá', 'mực nang',
  ],
  'cá lóc': [
    'cá quả', 'cá tràu', 'ca loc', 'ca qua', 'ca trau',
  ],
  'cá hồi': [
    'salmon', 'ca hoi',
  ],
  'cá thu': [
    'ca thu', 'mackerel',
  ],
  'cá chép': [
    'ca chep', 'carp',
  ],
  'cá chẽm': [
    'ca chem', 'seabass',
  ],
  'cá diêu hồng': [
    'ca dieu hong', 'red tilapia',
  ],
  'cá rô phi': [
    'ca ro phi', 'tilapia',
  ],
  'cá': [
    'phi lê cá', 'cá tươi', 'ca',
  ],

  // ── TRỨNG ────────────────────────────────────
  'trứng': [
    'trứng gà', 'hột gà', 'trứng gà ta', 'trứng công nghiệp',
    'lòng đỏ trứng', 'lòng trắng trứng', 'trứng nguyên', 'trung', 'trung ga',
  ],
  'trứng vịt': [
    'hột vịt',
  ],
  'trứng muối': [],

  // ── RAU CỦ ───────────────────────────────────
  'cà chua': [
    'cà chua tươi', 'cà chua hộp', 'sốt cà chua',
    'tương cà', 'cà chua cô đặc', 'cà chua bi',
  ],
  'dưa chuột': [
    'dưa leo',
  ],
  'ngô': [
    'bắp', 'bắp ngô', 'corn',
  ],
  'mướp đắng': [
    'khổ qua',
  ],
  'su hào': [
    'xu hào', 'cải xoong củ', 'kohlrabi',
  ],
  'bí xanh': [
    'bí đao',
  ],
  'cải thảo': [
    'cải bắp trung quốc', 'chinese cabbage',
  ],
  'cải cúc': [
    'tần ô', 'rau tần ô',
  ],
  'cải xoong': [
    'xà lách xoong',
  ],
  'súp lơ': [
    'bông cải', 'hoa lơ', 'bông cải xanh',
  ],
  'khoai sọ': [
    'khoai môn',
  ],
  'khoai mì': [
    'sắn', 'củ sắn',
  ],
  'củ đậu': [
    'củ sắn nước', 'sắn nước',
  ],
  'củ cải': [
    'củ cải trắng', 'daikon',
  ],
  'cà rốt': [
    'cà rốt đỏ', 'carrot',
  ],
  'mã thầy': [
    'củ năng',
  ],
  'dọc mùng': [
    'bạc hà',
  ],
  'rau muống': [
    'rau muống đồng', 'rau muống nước', 'rau muong',
  ],
  'rau lang': [
    'rau ngọt', 'ngọn khoai lang',
  ],
  'rau rút': [
    'rau nhút',
  ],

  // ── TRÁI CÂY ─────────────────────────────────
  'dứa': [
    'thơm', 'trái thơm', 'quả dứa', 'quả gai', 'gai',
  ],
  'na': [
    'mãng cầu', 'na dai', 'mãng cầu na',
  ],
  'quất': [
    'tắc', 'trái tắc',
  ],
  'mận': [
    'roi', 'quả roi', 'trái mận', 'mận bắc',
  ],
  'hồng xiêm': [
    'sa-pô-chê', 'sapôchê', 'lê-ki-ma',
  ],

  // ── RAU THƠM / GIA VỊ TƯƠI ──────────────────
  'ngò rí': [
    'rau mùi', 'mùi ta', 'rau mùi ta', 'ngò', 'ngò ta',
    'rau muoi',
  ],
  'ngò gai': [
    'mùi tàu',
  ],
  'lá dứa': [
    'lá nếp', 'lá pandan',
  ],
  'tía tô': [
    'lá tía tô', 'perilla',
  ],
  'kinh giới': [
    'rau kinh giới',
  ],
  'húng quế': [
    'rau húng quế', 'basil', 'quế sả',
  ],
  'húng lủi': [
    'húng lũi', 'rau húng lủi', 'spearmint',
  ],
  'thì là': [
    'rau thì là', 'dill',
  ],
  'rau răm': [
    'rau răm ta', 'vietnamese coriander',
  ],
  'lá chanh': [
    'lá chanh ta', 'kaffir lime leaf',
  ],
  'gừng': [
    'gừng tươi', 'củ gừng', 'ginger', 'gung',
  ],
  'tỏi': [
    'tỏi tươi', 'tỏi khô', 'garlic', 'toi',
  ],
  'ớt': [
    'ớt tươi', 'ớt hiểm', 'ớt sừng', 'chili', 'ot',
  ],
  'sả': [
    'sả cây', 'lemongrass', 'xa',
  ],
  'riềng': [
    'củ riềng', 'galangal',
  ],
  'nghệ': [
    'củ nghệ', 'nghệ tươi', 'turmeric', 'bot nghe',
  ],
  'hành lá': [
    'hành', 'hanh',
  ],
  'hành tím': [
    'hành khô', 'hành phi', 'hành khô phi', 'shallot',
  ],
  'hành tây': [
    'hanh tay',
  ],

  // ── ĐẬU / HẠT ────────────────────────────────
  'tàu hũ': [
    'đậu phụ', 'đậu khuôn', 'đậu hũ', 'đậu phụ non',
  ],
  'tàu hũ ky': [
    'váng đậu', 'phù trúc',
  ],
  'đậu phộng': [
    'lạc', 'đậu phụng', 'đậu lạc', 'đậu lạc rang',
  ],
  'đậu xanh': [],
  'đậu đen': [],
  'đậu đỏ': [],

  // ── GẠO / BỘT / TINH BỘT ────────────────────
  'gạo nếp': [
    'nếp', 'xôi nếp',
  ],
  'bột sắn dây': [
    'bột năng', 'bột lọc', 'bột đao', 'bột năng tinh',
    'tinh bột sắn', 'bột sắn',
  ],
  'bột mì': [
    'bột', 'flour',
  ],

  // ── SỐT / NƯỚC CHẤM / NƯỚC DÙN ──────────────
  'nước mắm': [
    'nước chấm', 'mắm', 'nước mắm nhĩ', 'nước mắm cốt',
    'fish sauce', 'nuoc mam', 'nam ngư', 'phú quốc',
  ],
  'mắm nêm': [
    'mắm nêm đặc', 'mắm ruốc',
  ],
  'nước tương': [
    'xì dầu', 'tương', 'soy sauce', 'nuoc tuong', 'maggi',
  ],
  'dầu hào': [
    'oyster sauce',
  ],
  'dầu mè': [
    'sesame oil', 'dầu vừng',
  ],
  'tương ớt': [
    'chinsu', 'sriracha', 'hot sauce',
  ],
  'nước cốt dừa': [
    'nước dừa', 'cốt dừa', 'coconut milk',
  ],

  // ── GIA VỊ KHÔ ───────────────────────────────
  'muối': [
    'muối biển', 'muối iốt', 'salt', 'mol',
  ],
  'đường': [
    'đường trắng', 'đường nâu', 'đường cát', 'sugar',
  ],
  'hạt tiêu': [
    'tiêu', 'tiêu đen', 'tiêu xanh', 'pepper', 'hạt tiêu đen',
  ],
  'hạt nêm': [
    'bột nêm', 'gia vị nêm', 'seasoning powder',
    'knorr', 'bột ngọt', 'mì chính', 'mỳ chính',
    'hạt nêm từ thịt', 'gia vị ngọt', 'bột ngọt ajinomoto',
  ],
  'dầu ăn': [
    'dầu thực vật', 'dầu chiên', 'cooking oil', 'dầu',
  ],

  // ── SỬA / TRỨNG / SẢN PHẨM SỮA ──────────────
  'sữa tươi': [
    'sữa', 'vinamilk', 'milk',
  ],
  'sữa đặc': [
    'ông thọ', 'condensed milk',
  ],
  'sữa chua': [
    'ya-ua', 'yaourt', 'yogurt',
  ],
  'phô mai': [
    'cheese',
  ],
  'bơ': [
    'butter', 'bo',
  ],

  // ── MÈ / VỪNG ────────────────────────────────
  'mè': [
    'vừng', 'sesame',
  ],

  // ── NƯỚNG / KHÁC ─────────────────────────────
  'thạch': [
    'sương sa', 'đông sương', 'rau câu', 'thach',
  ],
  'thạch đen': [
    'sương sáo',
  ],
  'mộc nhĩ': [
    'nấm mèo', 'nấm tai mèo', 'moc nhi', 'nam meo',
  ],
  'nộm': [
    'gỏi', 'đồ chua',
  ],
  'bánh tráng': [
    'bánh đa',
  ],
  'bánh flan': [
    'kem caramel', 'caramel flan',
  ],
  'nước lọc': [
    'nước sạch', 'nước đun sôi', 'water', 'nước',
  ],
};

// ─────────────────────────────────────────────
// NHÓM BỔ SUNG: Quan hệ bao hàm (General → Specific)
// Dùng khi người dùng nhập từ tổng quát
// ─────────────────────────────────────────────
export const EXPAND_MAP: Record<string, string[]> = {
  'thịt':        ['thịt heo', 'thịt bò', 'thịt gà', 'thịt vịt'],
  'gia cầm':     ['thịt gà', 'thịt vịt', 'thịt chim cút'],
  'hải sản':     ['tôm', 'cá', 'mực', 'sò', 'nghêu', 'cua'],
  'nấm':         ['nấm hương', 'nấm đông cô', 'nấm đùi gà', 'mộc nhĩ', 'nấm kim châm'],
  'đậu':         ['đậu xanh', 'đậu đen', 'đậu đỏ', 'đậu phộng', 'tàu hũ'],
  'rau thơm':    ['ngò rí', 'húng quế', 'thì là', 'rau răm', 'tía tô', 'kinh giới'],
  'rau xanh':    ['rau muống', 'cải xanh', 'cải thảo', 'rau cải'],
  'gia vị':      ['muối', 'đường', 'nước mắm', 'tiêu', 'hạt nêm'],
  'trứng':       ['trứng gà', 'trứng vịt', 'trứng muối', 'trứng'],
};

// ─────────────────────────────────────────────
// BUILD: Compile CANONICAL_MAP → flat SYNONYM_MAP
// synonym → tên chuẩn
// ─────────────────────────────────────────────
export const SYNONYM_MAP: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const [canonical, synonyms] of Object.entries(CANONICAL_MAP)) {
    for (const syn of synonyms) {
      const key = syn.toLowerCase().trim();
      if (key && !map[key]) {
        map[key] = canonical;
      }
    }
    // canonical cũng map về chính nó (để normalize nhất quán)
    map[canonical.toLowerCase().trim()] = canonical;
  }
  return map;
})();

// ─────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────

/**
 * Chuẩn hóa 1 tên nguyên liệu về tên chuẩn trong DB.
 * "thịt lợn" → "thịt heo"
 * "salmon"   → "cá hồi"
 * "bắp"      → "ngô"
 */
export function normalizeIngredient(input: string): string {
  const key = input.toLowerCase().trim();
  return SYNONYM_MAP[key] ?? key;
}

/**
 * Mở rộng 1 nguyên liệu tổng quát thành nhiều từ khóa cụ thể.
 * "thịt" → ["thịt heo", "thịt bò", "thịt gà", "thịt vịt"]
 * Nếu không có trong EXPAND_MAP → [normalized]
 */
export function expandIngredient(input: string): string[] {
  const normalized = normalizeIngredient(input);
  const key = normalized.toLowerCase().trim();
  return EXPAND_MAP[key] ?? EXPAND_MAP[input.toLowerCase().trim()] ?? [normalized];
}

/**
 * Xử lý danh sách nguyên liệu đầu vào:
 * normalize + expand nếu là từ tổng quát.
 * ["thịt lợn", "nấm", "trứng"] → ["thịt heo", "nấm hương", "nấm đông cô", ..., "trứng"]
 */
export function resolveIngredients(inputs: string[]): string[] {
  const result = new Set<string>();
  for (const input of inputs) {
    const normalized = normalizeIngredient(input);
    const expanded = expandIngredient(normalized);
    expanded.forEach(e => result.add(e));
  }
  return Array.from(result);
}
