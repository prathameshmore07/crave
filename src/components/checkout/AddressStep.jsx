import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useForm } from 'react-hook-form';
import { MapPin, Plus, Trash2, Home, Briefcase, Check, PhoneOff, Bell, Shield, DoorOpen, Sparkles, Info, Package, BellRing, PhoneCall } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '../../store/cartStore';

export default function AddressStep({ activeAddressId, onSelectAddress, onNext }) {
  const user = useAuthStore((state) => state.user);
  const addAddress = useAuthStore((state) => state.addAddress);
  const deleteAddress = useAuthStore((state) => state.deleteAddress);

  const [showNewForm, setShowNewForm] = useState(false);
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isValid } } = useForm({
    mode: "onChange",
    defaultValues: {
      type: "Home",
      state: "Maharashtra",
      isDefault: false,
      leaveAtDoor: false,
      ringBell: true,
      callOnArrival: false,
      customTypeLabel: "",
      floor: "",
      doorbellName: "",
      instructions: ""
    }
  });

  const selectedType = watch("type");
  const leaveAtDoor = watch("leaveAtDoor");
  const ringBell = watch("ringBell");
  const callOnArrival = watch("callOnArrival");

  const onSubmit = (data) => {
    // Smart address features: Auto-capitalize names
    if (data.fullName) {
      data.fullName = data.fullName
        .trim()
        .split(/\s+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }

    if (data.city) {
      data.city = data.city.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }

    if (data.state) {
      data.state = data.state.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }

    // Set custom label if chosen
    if (data.type === "Other" && data.customTypeLabel?.trim()) {
      data.type = data.customTypeLabel.trim();
    }

    addAddress(data);
    toast.success("New address added successfully!");
    setShowNewForm(false);
    reset();
  };

  const selectedInstruction = useCartStore((state) => state.deliveryInstruction);
  const setSelectedInstruction = useCartStore((state) => state.setDeliveryInstruction);

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
            className="h-9 px-3 border border-brand/20 dark:border-brand/45 bg-brand/[0.03] text-brand hover:bg-brand/10 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer focus:outline-none shadow-sm"
          >
            <Plus size={14} strokeWidth={2.5} />
            Add New Address
          </button>
        )}
      </div>

      {showNewForm ? (
        <div className="bg-white dark:bg-dark-surface rounded-[24px] border border-black/[0.08] dark:border-white/[0.08] shadow-xl overflow-hidden animate-scale-up text-left">
          {/* Header */}
          <div className="px-5 py-4 border-b border-black/[0.04] dark:border-white/[0.04] bg-zinc-50/50 dark:bg-zinc-900/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-brand/10 text-brand">
                <Sparkles size={13} />
              </span>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-350">Add New Address</h4>
                <p className="text-[9px] text-gray-450">Input precise details for reliable delivery tracking</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => { setShowNewForm(false); reset(); }} 
              className="text-xs text-gray-400 hover:text-gray-650 dark:hover:text-zinc-200 font-bold focus:outline-none cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
            
            {/* Section 1: Recipient Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 border-b border-black/[0.03] dark:border-white/[0.03] pb-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-brand">1. Recipient Details</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Full Name <span className="text-brand text-xs">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("fullName", { required: "Full name is required" })}
                    placeholder="e.g. Rahul Sharma"
                    className="h-10 px-3.5 w-full border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-dark-bg text-xs font-semibold rounded-xl outline-none focus:border-brand dark:focus:border-brand focus:ring-1 focus:ring-brand text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 transition-all text-transform: capitalize"
                  />
                  {errors.fullName && <span className="text-[9px] font-bold text-brand block">{errors.fullName.message}</span>}
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Phone Number <span className="text-brand text-xs">*</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    {...register("phone", { 
                      required: "Phone number is required",
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: "Must be a valid 10-digit phone number starting with 6-9"
                      },
                      onChange: (e) => {
                        // allow only 10 digit mobile numbers & prevent invalid phone input
                        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      }
                    })}
                    placeholder="e.g. 9876543210"
                    className={`h-10 px-3.5 w-full border text-xs font-semibold rounded-xl outline-none transition-all bg-white dark:bg-dark-bg text-zinc-800 dark:text-zinc-100 ${
                      errors.phone 
                        ? 'border-red-500/50 dark:border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white dark:bg-dark-bg' 
                        : 'border-black/[0.06] dark:border-white/[0.06] focus:border-brand dark:focus:border-brand focus:ring-1 focus:ring-brand'
                    }`}
                  />
                  {errors.phone ? (
                    <span className="text-[9px] font-bold text-red-500 dark:text-red-400 block">{errors.phone.message}</span>
                  ) : (
                    <span className="text-[8px] text-gray-400 dark:text-gray-500 font-medium block">Exactly 10 digits required</span>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Core Delivery Coordinates */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-1.5 border-b border-black/[0.03] dark:border-white/[0.03] pb-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-brand">2. Address Coordinates</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Flat / House No. / Building <span className="text-brand text-xs">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("flat", { required: "Flat/House number is required" })}
                    placeholder="e.g. Flat 402, Sea Breeze Apartments"
                    className="h-10 px-3.5 w-full border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-dark-bg text-xs font-semibold rounded-xl outline-none focus:ring-1 focus:ring-brand text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 transition-all"
                  />
                  {errors.flat && <span className="text-[9px] font-bold text-brand block">{errors.flat.message}</span>}
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Floor / Wing (Optional)
                  </label>
                  <input
                    type="text"
                    {...register("floor")}
                    placeholder="e.g. 4th Floor, B-Wing"
                    className="h-10 px-3.5 w-full border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-dark-bg text-xs font-semibold rounded-xl outline-none focus:ring-1 focus:ring-brand text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Area / Street / Locality <span className="text-brand text-xs">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("area", { required: "Street details are required" })}
                    placeholder="e.g. Bandra West, Near Carter Road"
                    className="h-10 px-3.5 w-full border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-dark-bg text-xs font-semibold rounded-xl outline-none focus:ring-1 focus:ring-brand text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 transition-all"
                  />
                  {errors.area && <span className="text-[9px] font-bold text-brand block">{errors.area.message}</span>}
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Landmark (Optional)</label>
                  <input
                    type="text"
                    {...register("landmark")}
                    placeholder="e.g. Opposite CCD / Near National Park"
                    className="h-10 px-3.5 w-full border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-dark-bg text-xs font-semibold rounded-xl outline-none focus:ring-1 focus:ring-brand text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Pincode <span className="text-brand text-xs">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    {...register("pincode", { 
                      required: "Pincode is required",
                      pattern: {
                        value: /^\d{6}$/,
                        message: "PIN must be exactly 6 digits"
                      },
                      onChange: (e) => {
                        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      }
                    })}
                    placeholder="e.g. 400050"
                    className="h-10 px-3.5 w-full border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-dark-bg text-xs font-semibold rounded-xl outline-none focus:ring-1 focus:ring-brand text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 transition-all"
                  />
                  {errors.pincode && <span className="text-[9px] font-bold text-brand block">{errors.pincode.message}</span>}
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    City <span className="text-brand text-xs">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("city", { required: "City is required" })}
                    placeholder="e.g. Mumbai"
                    className="h-10 px-3.5 w-full border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-dark-bg text-xs font-semibold rounded-xl outline-none focus:ring-1 focus:ring-brand text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 transition-all"
                  />
                  {errors.city && <span className="text-[9px] font-bold text-brand block">{errors.city.message}</span>}
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    State <span className="text-brand text-xs">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("state", { required: "State is required" })}
                    placeholder="e.g. Maharashtra"
                    className="h-10 px-3.5 w-full border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-dark-bg text-xs font-semibold rounded-xl outline-none focus:ring-1 focus:ring-brand text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 transition-all"
                  />
                  {errors.state && <span className="text-[9px] font-bold text-brand block">{errors.state.message}</span>}
                </div>
              </div>
            </div>

            {/* Section 3: Restored Premium Delivery Preferences */}
            <div className="space-y-3.5 pt-1">
              <div className="flex items-center gap-1.5 border-b border-black/[0.03] dark:border-white/[0.03] pb-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-brand">3. Restored Premium delivery preferences</span>
              </div>

              {/* Address Label Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Address Label / Category
                  </label>
                  <select
                    {...register("type", { required: true })}
                    className="h-10 px-3 w-full border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-dark-bg text-xs font-bold rounded-xl outline-none focus:border-brand dark:focus:border-brand focus:ring-1 focus:ring-brand text-zinc-800 dark:text-zinc-300"
                  >
                    <option value="Home">Home (Flat/Apartment)</option>
                    <option value="Office">Office (Workplace)</option>
                    <option value="Other">Other (Custom Label)</option>
                  </select>
                </div>

                {/* Custom Label input (triggers transitionally) */}
                {selectedType === "Other" && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      Enter Custom Label Name <span className="text-brand text-xs">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("customTypeLabel", { required: selectedType === "Other" })}
                      placeholder="e.g. Friends Hostel / Gym / Library"
                      className="h-10 px-3.5 w-full border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-dark-bg text-xs font-semibold rounded-xl outline-none focus:border-brand dark:focus:border-brand focus:ring-1 focus:ring-brand text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650"
                    />
                  </div>
                )}
              </div>

              {/* Doorbell name & custom details */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Doorbell Name or Gate Code (Optional)
                </label>
                <input
                  type="text"
                  {...register("doorbellName")}
                  placeholder="e.g. Ring under name 'Kumar' / Code #2049"
                  className="h-10 px-3.5 w-full border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-dark-bg text-xs font-semibold rounded-xl outline-none focus:border-brand dark:focus:border-brand focus:ring-1 focus:ring-brand text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 transition-all"
                />
              </div>

              {/* Preferences Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Leave at Door */}
                <label className={`group relative flex flex-col justify-between p-4 rounded-2xl border cursor-pointer select-none transition-all duration-350 transform active:scale-[0.98] ${
                  leaveAtDoor 
                    ? 'border-emerald-500 bg-emerald-500/[0.02] shadow-[0_4px_20px_rgba(16,185,129,0.06)]' 
                    : 'border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-dark-bg hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      {/* Premium Illustrated Icon Container */}
                      <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                        leaveAtDoor 
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                          : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-110'
                      }`}>
                        <Package size={20} className="stroke-[2.25]" />
                      </div>
                      <input
                        type="checkbox"
                        {...register("leaveAtDoor")}
                        className="w-4 h-4 text-emerald-500 rounded border-zinc-300 focus:ring-emerald-400 cursor-pointer accent-emerald-500"
                      />
                    </div>
                    <div className="space-y-0.5 text-left">
                      <span className="text-xs font-black text-gray-850 dark:text-gray-150 tracking-tight block">Leave at door</span>
                      <span className="text-[10px] text-gray-450 dark:text-gray-500 font-semibold leading-snug block">Drop package at front door silently</span>
                    </div>
                  </div>
                  {leaveAtDoor && (
                    <span className="absolute bottom-2 right-2 text-[8px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                  )}
                </label>

                {/* Ring Bell */}
                <label className={`group relative flex flex-col justify-between p-4 rounded-2xl border cursor-pointer select-none transition-all duration-350 transform active:scale-[0.98] ${
                  ringBell 
                    ? 'border-indigo-500 bg-indigo-500/[0.02] shadow-[0_4px_20px_rgba(99,102,241,0.06)]' 
                    : 'border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-dark-bg hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      {/* Premium Illustrated Icon Container */}
                      <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                        ringBell 
                          ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                          : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 group-hover:scale-110'
                      }`}>
                        <BellRing size={20} className="stroke-[2.25]" />
                      </div>
                      <input
                        type="checkbox"
                        {...register("ringBell")}
                        className="w-4 h-4 text-indigo-500 rounded border-zinc-300 focus:ring-indigo-400 cursor-pointer accent-indigo-500"
                      />
                    </div>
                    <div className="space-y-0.5 text-left">
                      <span className="text-xs font-black text-gray-850 dark:text-gray-150 tracking-tight block">Ring Doorbell</span>
                      <span className="text-[10px] text-gray-450 dark:text-gray-500 font-semibold leading-snug block">Notify household on arrival</span>
                    </div>
                  </div>
                  {ringBell && (
                    <span className="absolute bottom-2 right-2 text-[8px] font-black text-indigo-500 uppercase tracking-widest">Active</span>
                  )}
                </label>

                {/* Call on arrival */}
                <label className={`group relative flex flex-col justify-between p-4 rounded-2xl border cursor-pointer select-none transition-all duration-350 transform active:scale-[0.98] ${
                  callOnArrival 
                    ? 'border-blue-500 bg-blue-500/[0.02] shadow-[0_4px_20px_rgba(59,130,246,0.06)]' 
                    : 'border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-dark-bg hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      {/* Premium Illustrated Icon Container */}
                      <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                        callOnArrival 
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                          : 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 group-hover:scale-110'
                      }`}>
                        <PhoneCall size={20} className="stroke-[2.25]" />
                      </div>
                      <input
                        type="checkbox"
                        {...register("callOnArrival")}
                        className="w-4 h-4 text-blue-500 rounded border-zinc-300 focus:ring-blue-400 cursor-pointer accent-blue-500"
                      />
                    </div>
                    <div className="space-y-0.5 text-left">
                      <span className="text-xs font-black text-gray-850 dark:text-gray-150 tracking-tight block">Call on Arrival</span>
                      <span className="text-[10px] text-gray-450 dark:text-gray-500 font-semibold leading-snug block">Ring recipient upon reaching</span>
                    </div>
                  </div>
                  {callOnArrival && (
                    <span className="absolute bottom-2 right-2 text-[8px] font-black text-blue-500 uppercase tracking-widest">Active</span>
                  )}
                </label>
              </div>

              {/* Text instructions & Quick Tags */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">
                  Delivery Helper & Easy Reach Note (Optional)
                </label>

                {/* Quick preset tags */}
                <div className="flex gap-2 flex-wrap pb-0.5 select-none">
                  {[
                    "Doorbell not working",
                    "Call when outside gate",
                    "Leave at security desk",
                    "Dog inside, please call first"
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setValue("instructions", preset, { shouldValidate: true })}
                      className="text-[8px] font-black uppercase tracking-wider px-2 py-1.5 rounded-lg border border-black/[0.05] dark:border-white/[0.05] bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:border-brand hover:text-brand transition-all cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={2}
                  {...register("instructions")}
                  placeholder="e.g. Leave package with security guard / Ring bell silently"
                  className="p-3 w-full border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-dark-bg text-xs font-semibold rounded-xl outline-none focus:border-brand dark:focus:border-brand focus:ring-1 focus:ring-brand text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 resize-none transition-all"
                />
              </div>

              {/* Default switch checkbox */}
              <div className="flex items-center gap-2 select-none pl-1">
                <input
                  type="checkbox"
                  id="save-default-checkout"
                  {...register("isDefault")}
                  className="w-4 h-4 text-brand bg-zinc-50 border-zinc-200 rounded focus:ring-brand cursor-pointer accent-brand"
                />
                <label htmlFor="save-default-checkout" className="text-xs font-bold text-gray-655 dark:text-zinc-300 cursor-pointer">
                  Make default address
                </label>
              </div>
            </div>

            {/* Submit button */}
            {/* remove unnecessary emoji clutter */}
            <button
              type="submit"
              disabled={!isValid}
              className={`h-11 w-full text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 ${
                isValid 
                  ? 'bg-brand hover:bg-brand-hover shadow-brand/15 cursor-pointer hover:shadow-brand/25' 
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-550 cursor-not-allowed shadow-none'
              }`}
            >
              Save and Select Address
            </button>
          </form>
        </div>
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
                  className={`p-5 rounded-2xl border cursor-pointer transition-all flex justify-between gap-4 text-left relative ${
                    isSelected 
                      ? 'border-brand bg-brand/[0.01] shadow-xs' 
                      : 'border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-dark-surface hover:border-gray-350 dark:hover:border-gray-700'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 pr-4 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black text-gray-850 dark:text-gray-200 flex items-center gap-1.5 leading-none">
                        {addr.type === 'Home' ? (
                          <Home size={13} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
                        ) : addr.type === 'Office' ? (
                          <Briefcase size={13} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
                        ) : (
                          <MapPin size={13} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
                        )}
                        {addr.type}
                      </span>
                      {isSelected && (
                        <span className="text-[8px] font-black text-brand bg-brand/10 uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center gap-0.5 leading-none shrink-0">
                          <Check size={8} strokeWidth={3} /> Active
                        </span>
                      )}
                      {addr.isDefault && (
                        <span className="text-[8px] font-black text-blue-500 bg-blue-500/10 uppercase tracking-wider px-1.5 py-0.5 rounded leading-none shrink-0">
                          Default
                        </span>
                      )}
                    </div>
                    
                    <div className="pt-2 text-[13px] font-bold text-zinc-800 dark:text-zinc-150 leading-none">
                      {addr.fullName || user?.name || "Recipient"}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-semibold mt-0.5">
                      📞 {addr.phone || user?.phone || "Phone not added"}
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed mt-2">
                      {addr.flat}, {addr.floor && `${addr.floor}, `}{addr.area}, {addr.landmark && `${addr.landmark}, `}{addr.city}, {addr.state} - {addr.pincode}
                    </p>

                    {/* Restored Preferences Indicator Chips */}
                    {(addr.doorbellName || addr.leaveAtDoor || addr.ringBell === false || addr.callOnArrival || addr.instructions) && (
                      <div className="mt-3 flex flex-wrap gap-1.5 pt-1.5 border-t border-black/[0.03] dark:border-white/[0.03]">
                        {addr.doorbellName && (
                          <span className="text-[9px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-105 dark:bg-zinc-900/60 px-2 py-0.5 rounded-md">
                            🔔 Name: {addr.doorbellName}
                          </span>
                        )}
                        {addr.leaveAtDoor && (
                          <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded-md">
                            🚪 Leave at Door
                          </span>
                        )}
                        {addr.ringBell === false && (
                          <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded-md">
                            🤫 Don't Ring Bell
                          </span>
                        )}
                        {addr.callOnArrival && (
                          <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded-md">
                            📞 Call Arrival
                          </span>
                        )}
                      </div>
                    )}

                    {addr.instructions && (
                      <div className="mt-2.5 flex items-start gap-1.5 p-2 rounded-xl bg-zinc-55/50 dark:bg-zinc-900/30 text-[10px] text-zinc-500 dark:text-zinc-400 font-medium leading-tight">
                        <Info size={11} className="text-brand flex-shrink-0 mt-0.5" />
                        <span>{addr.instructions}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAddress(addr.id);
                      toast.info("Address deleted successfully");
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
