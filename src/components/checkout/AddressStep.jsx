import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useForm } from 'react-hook-form';
import { MapPin, Plus, Trash2, Home, Briefcase, PlusCircle, Check, PhoneOff, Bell, Shield, DoorOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function AddressStep({ activeAddressId, onSelectAddress, onNext }) {
  const user = useAuthStore((state) => state.user);
  const addAddress = useAuthStore((state) => state.addAddress);
  const deleteAddress = useAuthStore((state) => state.deleteAddress);

  const [showNewForm, setShowNewForm] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    addAddress(data);
    toast.success("New address added!");
    setShowNewForm(false);
    reset();
  };

  const [selectedInstruction, setSelectedInstruction] = useState("");

  const instructionsList = [
    { id: "avoid-call", label: "Avoid Calling", sub: "Rider will deliver silently", icon: PhoneOff },
    { id: "ring-bell", label: "Ring Bell", sub: "Rider will ring the bell", icon: Bell },
    { id: "leave-gate", label: "Leave with Guard", sub: "Keep package at security gate", icon: Shield },
    { id: "no-contact", label: "No-Contact Drop", sub: "Leave at door & step away", icon: DoorOpen }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-gray-850 dark:text-gray-100">Select Delivery Address</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Please choose where you would like this order delivered</p>
        </div>
        {!showNewForm && (
          <button
            onClick={() => setShowNewForm(true)}
            className="h-9 px-3 border border-brand/20 dark:border-brand/45 bg-brand/[0.03] text-brand hover:bg-brand/10 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer focus:outline-none"
          >
            <Plus size={14} strokeWidth={2.5} />
            Add New Address
          </button>
        )}
      </div>

      {showNewForm ? (
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] space-y-4 animate-scale-up bg-white dark:bg-dark-surface">
          <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.05] pb-2 mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Add New Address</h4>
            <button 
              type="button" 
              onClick={() => setShowNewForm(false)} 
              className="text-xs text-gray-400 hover:text-gray-650 font-bold focus:outline-none cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Address Label</label>
              <select
                {...register("type", { required: true })}
                className="h-10 px-3 w-full border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-dark-bg text-xs font-semibold rounded-xl outline-none focus:ring-1 focus:ring-brand"
              >
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Flat / House No. / Building</label>
              <input
                type="text"
                {...register("flat", { required: "This field is required" })}
                placeholder="e.g. Flat 302, Sea Breeze Apartments"
                className="h-10 px-3.5 w-full border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-dark-bg text-xs font-semibold rounded-xl outline-none focus:ring-1 focus:ring-brand"
              />
              {errors.flat && <span className="text-[10px] font-bold text-brand block">{errors.flat.message}</span>}
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Area / Street / Sector</label>
              <input
                type="text"
                {...register("area", { required: "This field is required" })}
                placeholder="e.g. Bandra West, Near Carter Road"
                className="h-10 px-3.5 w-full border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-dark-bg text-xs font-semibold rounded-xl outline-none focus:ring-1 focus:ring-brand"
              />
              {errors.area && <span className="text-[10px] font-bold text-brand block">{errors.area.message}</span>}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Landmark</label>
              <input
                type="text"
                {...register("landmark")}
                placeholder="e.g. Opp CCD"
                className="h-10 px-3.5 w-full border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-dark-bg text-xs font-semibold rounded-xl outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">City</label>
              <input
                type="text"
                {...register("city", { required: "This field is required" })}
                placeholder="e.g. Mumbai"
                className="h-10 px-3.5 w-full border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-dark-bg text-xs font-semibold rounded-xl outline-none focus:ring-1 focus:ring-brand"
              />
              {errors.city && <span className="text-[10px] font-bold text-brand block">{errors.city.message}</span>}
            </div>
          </div>

          <button
            type="submit"
            className="h-11 w-full bg-brand hover:bg-brand-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer mt-2"
          >
            Save Address
          </button>
        </form>
      ) : (!user?.addresses || user?.addresses.length === 0) ? (
        <div className="text-center py-10 px-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-dark-surface/10 space-y-3.5 max-w-md mx-auto animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto animate-bounce">
            <MapPin size={22} />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-gray-850 dark:text-gray-200">No Saved Addresses Found</h4>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">Please add your delivery details to configure distance-based delivery calculations.</p>
          </div>
          <button
            onClick={() => setShowNewForm(true)}
            className="h-11 px-5 bg-brand hover:bg-brand-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm focus:outline-none"
          >
            <Plus size={15} strokeWidth={2.5} />
            Add First Address
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Saved Addresses Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user?.addresses?.map((addr) => {
              const isSelected = activeAddressId === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={() => onSelectAddress(addr.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex justify-between relative ${
                    isSelected 
                      ? 'border-brand bg-brand/[0.01] shadow-xs' 
                      : 'border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-dark-surface hover:border-gray-350 dark:hover:border-gray-700'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 pr-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-gray-850 dark:text-gray-200 flex items-center gap-1.5">
                        {addr.type === 'Home' ? (
                          <Home size={13} className="text-zinc-400 dark:text-zinc-500" />
                        ) : addr.type === 'Office' ? (
                          <Briefcase size={13} className="text-zinc-400 dark:text-zinc-500" />
                        ) : (
                          <MapPin size={13} className="text-zinc-400 dark:text-zinc-500" />
                        )}
                        {addr.type}
                      </span>
                      {isSelected && (
                        <span className="text-[9px] font-black text-brand bg-brand/10 uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-0.5">
                          <Check size={9} strokeWidth={3} /> Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                      {addr.flat}, {addr.area}, {addr.landmark && `${addr.landmark}, `}{addr.city}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAddress(addr.id);
                      toast.info("Address deleted");
                    }}
                    className="p-1.5 text-gray-400 hover:text-rose-500 self-start transition-colors rounded-lg hover:bg-rose-50/10 cursor-pointer focus:outline-none"
                    title="Delete Address"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Delivery Instructions Selection Grid */}
          <div className="space-y-3 pt-3 border-t border-black/[0.04] dark:border-white/[0.04]">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400">Rider Delivery Instructions</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Custom instructions to help our rider deliver your box perfectly</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {instructionsList.map((ins) => {
                const isSelected = selectedInstruction === ins.id;
                return (
                  <div
                    key={ins.id}
                    onClick={() => {
                      setSelectedInstruction(isSelected ? "" : ins.id);
                      toast.success(`Instruction "${ins.label}" attached to order!`, { duration: 1500 });
                    }}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 select-none ${
                      isSelected 
                        ? 'border-brand bg-brand/[0.02] scale-[1.02]' 
                        : 'border-black/[0.05] dark:border-white/[0.05] bg-gray-50/50 dark:bg-dark-surface/40 hover:bg-gray-100/50 dark:hover:bg-dark-surface/60'
                    }`}
                  >
                    {(() => {
                      const IconComp = ins.icon;
                      return <IconComp size={16} className={isSelected ? "text-brand" : "text-gray-400 dark:text-zinc-500"} />;
                    })()}
                    <span className="text-[11px] font-extrabold text-gray-800 dark:text-gray-200 leading-none mt-1">{ins.label}</span>
                    <span className="text-[8px] text-gray-450 dark:text-gray-500 leading-tight block">{ins.sub}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {user?.addresses?.length > 0 && !showNewForm && (
        <div className="flex justify-end pt-4 border-t border-black/[0.04] dark:border-white/[0.04]">
          <button
            onClick={onNext}
            disabled={!activeAddressId}
            className={`h-11 px-8 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm transition-colors focus:outline-none ${
              activeAddressId 
                ? 'bg-brand hover:bg-brand-hover text-white cursor-pointer' 
                : 'bg-gray-100 dark:bg-neutral-800 text-gray-400 cursor-not-allowed'
            }`}
          >
            Deliver to This Address
          </button>
        </div>
      )}
    </div>
  );
}

