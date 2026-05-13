import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import logo from '../assets/logo.png';

export default function Auth() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [activeTab, setActiveTab] = useState("signin"); // 'signin', 'signup'

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const handleAuthSubmit = (data) => {
    // If signin or signup, simulate successful operation
    if (activeTab === 'signin') {
      const success = login(data.email, "User");
      if (success) {
        toast.success("Welcome back! Signed in successfully.");
        navigate('/');
      } else {
        toast.error("User not found! Please sign up first.");
      }
    } else {
      // Signup: create profile session
      const success = login(data.email, data.name, data.phone);
      if (success) {
        toast.success("Account created! Welcome to Crave.");
        navigate('/');
      }
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-12 p-6 bg-white dark:bg-dark-surface border border-black/[0.06] dark:border-white/[0.06] rounded-2xl space-y-6 transition-colors shadow-xl animate-scale-up">
      {/* Brand Icon Header */}
      <div className="text-center space-y-3 select-none">
        <div className="flex justify-center">
          <img 
            src={logo} 
            alt="CRAVE Logo" 
            className="h-10 w-auto object-contain transition-transform duration-300 hover:scale-[1.02]"
          />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Unlock delicious meals</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Sign in to track orders, save locations, and claim discount offers</p>
      </div>

      {/* Segment Tabs */}
      <div className="flex border-b border-black/[0.05] dark:border-white/[0.05]">
        <button
          onClick={() => {
            setActiveTab("signin");
            reset();
          }}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors outline-none cursor-pointer ${
            activeTab === 'signin' ? 'border-brand text-brand' : 'border-transparent text-gray-500'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => {
            setActiveTab("signup");
            reset();
          }}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors outline-none cursor-pointer ${
            activeTab === 'signup' ? 'border-brand text-brand' : 'border-transparent text-gray-500'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Form Submission */}
      <form onSubmit={handleSubmit(handleAuthSubmit)} className="space-y-4">
        {activeTab === 'signup' && (
          <>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Your Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  {...register("name", { required: "Name is required" })}
                  placeholder="Rahul Sharma"
                  className="h-10 pl-9 pr-3 w-full border border-gray-200 dark:border-gray-750 bg-white dark:bg-dark-bg text-xs font-semibold rounded-lg outline-none focus:border-brand"
                />
              </div>
              {errors.name && <span className="text-[10px] font-bold text-brand block">{errors.name.message}</span>}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Phone Number</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  {...register("phone", { 
                    required: "Phone is required",
                    minLength: { value: 10, message: "Must be 10 digits" },
                    maxLength: { value: 10, message: "Must be 10 digits" }
                  })}
                  placeholder="9876543210"
                  className="h-10 pl-9 pr-3 w-full border border-gray-200 dark:border-gray-750 bg-white dark:bg-dark-bg text-xs font-semibold rounded-lg outline-none focus:border-brand"
                />
              </div>
              {errors.phone && <span className="text-[10px] font-bold text-brand block">{errors.phone.message}</span>}
            </div>
          </>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Email Address</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              {...register("email", { 
                required: "Email is required",
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email structure" }
              })}
              placeholder="rahul@gmail.com"
              className="h-10 pl-9 pr-3 w-full border border-gray-200 dark:border-gray-750 bg-white dark:bg-dark-bg text-xs font-semibold rounded-lg outline-none focus:border-brand"
            />
          </div>
          {errors.email && <span className="text-[10px] font-bold text-brand block">{errors.email.message}</span>}
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Password / OTP PIN</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              {...register("password", { 
                required: "Password/OTP is required",
                minLength: { value: 4, message: "Must be at least 4 chars" }
              })}
              placeholder="••••"
              className="h-10 pl-9 pr-3 w-full border border-gray-200 dark:border-gray-750 bg-white dark:bg-dark-bg text-xs font-semibold rounded-lg outline-none focus:border-brand"
            />
          </div>
          {errors.password && <span className="text-[10px] font-bold text-brand block">{errors.password.message}</span>}
        </div>

        <button
          type="submit"
          className="h-11 w-full bg-brand hover:bg-brand-hover text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          {activeTab === 'signin' ? 'Sign In' : 'Create Account'}
          <ArrowRight size={14} />
        </button>
      </form>
    </div>
  );
}
