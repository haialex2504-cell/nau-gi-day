-- Tối ưu hóa dữ liệu cho các phân nhóm cảm hứng trang chủ

-- 1. Làm sạch và gán lại category chuẩn cho các món đặc trưng
-- Bữa sáng
UPDATE recipes 
SET category = 'an-sang' 
WHERE name ILIKE ANY (ARRAY['%Phở bò%', '%Bún bò Huế%', '%Xôi xéo%', '%Bánh mì Pate%', '%Phở gà%']);

-- Ăn vặt & Tráng miệng
UPDATE recipes 
SET category = 'an-vat' 
WHERE name ILIKE ANY (ARRAY['%Bánh tráng trộn%', '%Chè bưởi%', '%Sữa chua dẻo%', '%Tàu hũ trân châu%']);

-- 2. Thêm mới các món "Premium" để tạo điểm nhấn
-- Lưu ý: ID được đặt theo format đặc biệt để dễ quản lý

-- Healthy: Salad ức gà sốt mè
INSERT INTO recipes (id, name, category, sub_category, cooking_time, difficulty, servings, calories, description, image_url, steps)
VALUES (
  'healthy-p01', 
  'Salad ức gà sốt mè rang', 
  'salad-goi', 
  'salad', 
  15, 
  'de', 
  2, 
  320, 
  'Món ăn thanh đạm, giàu đạm, phù hợp cho người giữ dáng.', 
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', 
  ARRAY['Ức gà áp chảo chín tới, thái lát mỏng', 'Rau xà lách, cà chua bi, dưa chuột rửa sạch, cắt miếng vừa ăn', 'Sốt mè rang pha chút nước cốt chanh', 'Trộn đều thịt gà, rau và sốt, rắc thêm chút mè rang']
) ON CONFLICT (id) DO NOTHING;

-- Bữa sáng: Pancake chuối yến mạch
INSERT INTO recipes (id, name, category, sub_category, cooking_time, difficulty, servings, calories, description, image_url, steps)
VALUES (
  'break-p01', 
  'Pancake chuối yến mạch', 
  'an-sang', 
  'banh', 
  20, 
  'de', 
  2, 
  280, 
  'Bữa sáng năng lượng, không đường, tốt cho tim mạch.', 
  'https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445', 
  ARRAY['Dầm nhuyễn 2 quả chuối chín', 'Trộn với 1 quả trứng và 50g bột yến mạch', 'Áp chảo lửa nhỏ cho đến khi vàng đều hai mặt', 'Dùng kèm mật ong và trái cây tươi']
) ON CONFLICT (id) DO NOTHING;

-- Ăn vặt: Chè bưởi dưỡng nhan
INSERT INTO recipes (id, name, category, sub_category, cooking_time, difficulty, servings, calories, description, image_url, steps)
VALUES (
  'snack-p01', 
  'Chè bưởi cốm dừa', 
  'an-vat', 
  'trang-mieng', 
  45, 
  'trung-binh', 
  4, 
  250, 
  'Món tráng miệng truyền thống với hương vị hiện đại, thanh mát.', 
  'https://images.unsplash.com/photo-1590080873974-9a38ca490234', 
  ARRAY['Cùi bưởi sơ chế khử đắng, tẩm bột năng', 'Luộc cùi bưởi cho đến khi trong veo, vớt ra nước lạnh', 'Nấu nước đường thốt nốt, cho đậu xanh đã hấp chín và cốm vào', 'Cho cùi bưởi vào khuấy đều, thêm nước cốt dừa khi ăn']
) ON CONFLICT (id) DO NOTHING;

-- 3. Gán tag để hỗ trợ tìm kiếm nâng cao
INSERT INTO recipe_tags (recipe_id, tag) VALUES 
('healthy-p01', 'healthy'),
('healthy-p01', 'low-carb'),
('break-p01', 'healthy'),
('break-p01', 'energy'),
('snack-p01', 'dessert'),
('snack-p01', 'traditional')
ON CONFLICT DO NOTHING;
