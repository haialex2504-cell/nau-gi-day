'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkEmailExists } from '@/app/[lang]/actions/auth';
import { createClient } from '@/utils/supabase/client';

type LoginStep = 'email' | 'password_new' | 'password_existing';

export default function LoginPage() {
  const [step, setStep] = useState<LoginStep>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const router = useRouter();
  const supabase = createClient();

  const handleNextFromEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Vui lòng nhập email hợp lệ');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    try {
      const exists = await checkEmailExists(email);
      if (exists) {
        setStep('password_existing');
      } else {
        setStep('password_new');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMsg('Mật khẩu tối thiểu 6 ký tự');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu nhập lại không khớp');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      // Sync local favorites if needed
      window.dispatchEvent(new Event('nau_auth_changed'));
      router.push('/');
    }
  };

  const handleLoginWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg('Vui lòng nhập mật khẩu');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg('Sai mật khẩu hoặc lỗi đăng nhập');
      setLoading(false);
    } else {
      window.dispatchEvent(new Event('nau_auth_changed'));
      router.push('/');
    }
  };

  const handleMagicLink = async () => {
    if (!email) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Đã gửi Magic Link vào email của bạn! Vui lòng kiểm tra hộp thư.');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep('email');
    setErrorMsg('');
    setSuccessMsg('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-[#FDF9F3] text-on-background font-body px-6 py-12 flex flex-col relative overflow-hidden">
      
      {/* Background decorations matching the mockup */}
      <div className="absolute top-10 right-[-20%] w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-12 relative z-10">
        {step !== 'email' ? (
          <button onClick={goBack} className="p-2 hover:bg-surface-variant/50 rounded-full transition-colors active:scale-95 text-primary">
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
        ) : (
          <h1 className="text-2xl font-black text-primary italic font-headline tracking-tight">Nấu Gì Đây?</h1>
        )}
        {step === 'email' && (
          <button onClick={() => router.push('/')} className="text-on-surface-variant font-medium text-sm hover:text-primary transition-colors">
            Tiếp tục với tư cách khách
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full relative z-10 mt-4">
        
        {step === 'email' && (
          <div className="animate-fade-in">
            <h2 className="font-headline font-extrabold text-5xl tracking-tight leading-[1.1] mb-4">
              Chào mừng bạn <br /> <span className="text-primary">đến với gian bếp.</span>
            </h2>
            <p className="text-on-surface-variant font-medium mb-12 pr-8">
              Khám phá hàng ngàn công thức nấu ăn ngon mỗi ngày.
            </p>

            <form onSubmit={handleNextFromEmail} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant ml-4">Địa chỉ email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="chef@example.com"
                    className="w-full bg-white/60 backdrop-blur-md border border-outline-variant/30 rounded-2xl py-4 px-5 focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface placeholder:text-outline/40 font-medium transition-all shadow-sm outline-none"
                  />
                </div>
              </div>

              {errorMsg && <p className="text-error text-sm px-4 pt-1">{errorMsg}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-4 bg-primary text-on-primary rounded-2xl font-bold text-lg shadow-[0_8px_20px_-8px_rgba(171,53,0,0.5)] hover:shadow-[0_12px_24px_-8px_rgba(171,53,0,0.6)] hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : 'Tiếp theo'}
                {!loading && <span className="material-symbols-outlined text-base">arrow_forward</span>}
              </button>
            </form>

            <div className="my-8 flex items-center gap-4 text-outline/50">
              <div className="h-px bg-outline-variant/50 flex-1"></div>
              <span className="text-[10px] font-black uppercase tracking-widest">hoặc tham gia bằng</span>
              <div className="h-px bg-outline-variant/50 flex-1"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-4 bg-white text-on-surface rounded-2xl font-bold border border-outline-variant/30 hover:bg-surface-variant/30 hover:border-outline-variant/50 transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-3 disabled:opacity-70"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Tiếp tục với Google
            </button>
          </div>
        )}

        {step === 'password_new' && (
          <div className="animate-fade-in">
            <div className="inline-block px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-black uppercase tracking-widest mb-6">
              Bước 2 của 2
            </div>
            
            <h2 className="font-headline font-extrabold text-4xl tracking-tight leading-tight mb-4">
              Tuyệt vời! Hãy đặt <br /> mật khẩu để lưu <br /> công thức của bạn
            </h2>

            <form onSubmit={handleRegister} className="space-y-5 mt-10">
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant ml-4">Mật khẩu mới</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline/60 text-[20px]">lock</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full bg-white/60 backdrop-blur-md border border-outline-variant/30 rounded-2xl py-4 pl-12 pr-5 focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface placeholder:text-outline/40 font-medium transition-all shadow-sm outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant ml-4">Nhập lại mật khẩu</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline/60 text-[20px]">verified_user</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Nhập lại mật khẩu"
                    className="w-full bg-white/60 backdrop-blur-md border border-outline-variant/30 rounded-2xl py-4 pl-12 pr-5 focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface placeholder:text-outline/40 font-medium transition-all shadow-sm outline-none"
                  />
                </div>
              </div>

              {errorMsg && <p className="text-error text-sm px-4 pt-1">{errorMsg}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-6 bg-primary text-on-primary rounded-2xl font-bold text-lg shadow-[0_8px_20px_-8px_rgba(171,53,0,0.5)] hover:shadow-[0_12px_24px_-8px_rgba(171,53,0,0.6)] hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2 pt-4"
              >
                {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : 'Tạo Tài Khoản'}
              </button>
            </form>
          </div>
        )}

        {step === 'password_existing' && (
          <div className="animate-fade-in">
            <h2 className="font-headline font-extrabold text-4xl tracking-tight leading-tight mb-2">
              Mừng bạn trở lại!
            </h2>
            <p className="text-on-surface-variant font-medium mb-10">
              Nhập mật khẩu cho {email}
            </p>

            <form onSubmit={handleLoginWithPassword} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant ml-4">Mật khẩu</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline/60 text-[20px]">lock</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Nhập mật khẩu"
                    className="w-full bg-white/60 backdrop-blur-md border border-outline-variant/30 rounded-2xl py-4 pl-12 pr-5 focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface placeholder:text-outline/40 font-medium transition-all shadow-sm outline-none"
                  />
                </div>
              </div>

              {errorMsg && <p className="text-error text-sm px-4 pt-1">{errorMsg}</p>}
              {successMsg && <p className="text-primary text-sm px-4 pt-1 bg-primary/10 py-3 rounded-xl border border-primary/20">{successMsg}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-4 bg-primary text-on-primary rounded-2xl font-bold text-lg shadow-[0_8px_20px_-8px_rgba(171,53,0,0.5)] hover:shadow-[0_12px_24px_-8px_rgba(171,53,0,0.6)] hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : 'Đăng Nhập'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={handleMagicLink}
                disabled={loading}
                className="text-primary font-bold text-sm hover:underline active:opacity-70 transition-all"
              >
                Quên mật khẩu? Gửi Magic Link đăng nhập nhanh qua Email
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
