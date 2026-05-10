import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useForm } from 'react-hook-form';
import { Trash2, Plus, Check, Home, Briefcase, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function SavedAddresses() {
  const user = useAuthStore((state) => state.user);
  const addAddress = useAuthStore((state) => state.addAddress);
  const deleteAddress = useAuthStore((state) => state.deleteAddress);

  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    addAddress(data);
    toast.success("Address saved successfully!");
    setShowForm(false);
    reset();
  };

  const addresses = user?.addresses || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-5">
        <div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Saved Addresses</h3>
          <p className="text-[13px] text-zinc-400 mt-1 font-medium">Manage your home, office, and guest delivery details.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="h-10 px-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer outline-none select-none"
          >
            <Plus size={14} strokeWidth={2.5} />
            Add New Location
          </button>
        )}
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-dark-surface space-y-4 max-w-md animate-scale-up">
          <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.05] pb-2 mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">New Location Details</h4>
            <button type="button" onClick={() => setShowForm(false)} className="text-xs text-gray-400 hover:text-gray-600 font-bold">Cancel</button>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Address Category</label>
              <select
                {...register("type", { required: true })}
                className="h-10 px-3 w-full border border-gray-200 dark:border-gray-750 bg-white dark:bg-dark-bg text-xs font-semibold rounded-lg outline-none focus:border-brand"
              >
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Flat / House No. / Block</label>
              <input
                type="text"
                {...register("flat", { required: "Flat/House number is required" })}
                placeholder="e.g. 402, Sea Breeze Apartments"
                className="h-10 px-3 w-full border border-gray-200 dark:border-gray-750 bg-white dark:bg-dark-bg text-xs font-semibold rounded-lg outline-none focus:border-brand"
              />
              {errors.flat && <span className="text-[10px] font-bold text-brand block">{errors.flat.message}</span>}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Street / Area / Locality</label>
              <input
                type="text"
                {...register("area", { required: "Area details are required" })}
                placeholder="e.g. Bandra West, Near Carter Road"
                className="h-10 px-3 w-full border border-gray-200 dark:border-gray-750 bg-white dark:bg-dark-bg text-xs font-semibold rounded-lg outline-none focus:border-brand"
              />
              {errors.area && <span className="text-[10px] font-bold text-brand block">{errors.area.message}</span>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Landmark</label>
                <input
                  type="text"
                  {...register("landmark")}
                  placeholder="e.g. Opp CCD"
                  className="h-10 px-3 w-full border border-gray-200 dark:border-gray-750 bg-white dark:bg-dark-bg text-xs font-semibold rounded-lg outline-none focus:border-brand"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">City</label>
                <input
                  type="text"
                  {...register("city", { required: "City name is required" })}
                  placeholder="e.g. Mumbai"
                  className="h-10 px-3 w-full border border-gray-200 dark:border-gray-750 bg-white dark:bg-dark-bg text-xs font-semibold rounded-lg outline-none focus:border-brand"
                />
                {errors.city && <span className="text-[10px] font-bold text-brand block">{errors.city.message}</span>}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="h-10 w-full bg-brand hover:bg-brand-hover text-white text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
          >
            Save Location
          </button>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="p-5 bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-100 dark:border-zinc-900 rounded-2xl flex justify-between gap-4 hover:border-zinc-200 dark:hover:border-zinc-800 transition-all text-left"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  {addr.type === 'Home' ? (
                    <Home size={14} className="text-zinc-400 dark:text-zinc-500" />
                  ) : addr.type === 'Office' ? (
                    <Briefcase size={14} className="text-zinc-400 dark:text-zinc-500" />
                  ) : (
                    <MapPin size={14} className="text-zinc-400 dark:text-zinc-500" />
                  )}
                  {addr.type}
                </span>
                <p className="text-[13px] text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mt-1">
                  {addr.flat}, {addr.area}, {addr.landmark && `${addr.landmark}, `}{addr.city}
                </p>
              </div>
              <button
                onClick={() => {
                  deleteAddress(addr.id);
                  toast.info("Address deleted successfully");
                }}
                className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all self-start cursor-pointer select-none"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
