'use client';

import { useFirebaseFavorites } from '@/hooks/useFirebaseFavorites';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useRouter } from 'next/navigation';

export default function TestFavoritesPage() {
  const { user, isAuthenticated } = useFirebaseAuth();
  const { favorites, toggleFavorite, isLoaded } = useFirebaseFavorites();
  const router = useRouter();

  const mockRecipes = [
    { id: 'ca-chep-01', name: 'Cá chép om dưa' },
    { id: 'ca-qua-02', name: 'Cá quả nướng' },
    { id: 'thit-bo-03', name: 'Thịt bò xào rau muống' },
  ];

  if (!isLoaded) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-2xl font-black mb-2 text-orange-600">Test Firebase Favorites</h1>
        
        <div className="mb-6 p-4 bg-orange-50 rounded-2xl border border-orange-100">
          <p className="text-sm font-bold text-orange-800">Trạng thái Auth:</p>
          {isAuthenticated ? (
            <p className="text-sm text-green-600">✅ Đã đăng nhập: {user?.email}</p>
          ) : (
            <div>
              <p className="text-sm text-red-500 mb-2">❌ Chưa đăng nhập Firebase</p>
              <button 
                onClick={() => router.push('/vi/login-firebase')}
                className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full font-bold"
              >
                Đến trang Login
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="font-bold text-gray-700">Thử bấm "Yêu thích" xem sao:</h2>
          {mockRecipes.map(recipe => (
            <div key={recipe.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <p className="font-bold text-gray-800">{recipe.name}</p>
                <p className="text-[10px] text-gray-400">ID: {recipe.id}</p>
              </div>
              <button 
                onClick={() => toggleFavorite(recipe.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  favorites.includes(recipe.id) 
                    ? 'bg-red-500 text-white shadow-lg scale-110' 
                    : 'bg-white text-gray-300 border border-gray-200'
                }`}
              >
                <span className="material-symbols-outlined">favorite</span>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm font-bold text-gray-500 mb-2">Dữ liệu hiện tại ({favorites.length}):</p>
          <code className="block p-4 bg-gray-900 text-green-400 rounded-xl text-xs overflow-auto">
            {JSON.stringify(favorites, null, 2)}
          </code>
        </div>
      </div>
      
      <div className="mt-8 text-center text-gray-400 text-xs">
        <p>Lưu ý: Nếu bạn đang login, dữ liệu sẽ được lưu vào Firestore.</p>
        <p>Nếu chưa login, nó sẽ lưu vào LocalStorage.</p>
      </div>
    </div>
  );
}
