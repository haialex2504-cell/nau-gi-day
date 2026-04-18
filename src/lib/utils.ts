/**
 * Loại bỏ dấu Tiếng Việt từ một chuỗi.
 * Chuyển đổi "Cá thu" thành "ca thu", "Thịt lợn" thành "thit lon".
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  
  let result = str.toLowerCase();
  
  // Loại bỏ dấu bằng regex chuẩn
  result = result.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  result = result.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  result = result.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  result = result.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  result = result.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  result = result.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  result = result.replace(/đ/g, 'd');
  
  // Loại bỏ các ký tự dấu kết hợp (combining diacritics)
  result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  return result.trim();
}
