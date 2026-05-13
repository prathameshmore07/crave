import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import useMembershipStore from '../store/membershipStore';
import { useAuthStore } from '../store/authStore';

// Crave PRO landing: theme follows global light/dark (Tailwind dark:). Plan + billing period are written to Zustand before /membership-checkout.

// Duration options shown on each plan card (keys match membershipStore cycles)
const DURATION_OPTIONS = [
  { key: 'monthly', label: 'Monthly' },
  { key: 'halfYearly', label: 'Half-yearly' },
  { key: 'yearly', label: 'Yearly' },
];

// prevent input remounting
// keep email input focused while typing
// isolate membership form state
// validate college email without rerender loop
const PlanCard = ({ planKey, badge, plan, goToCheckout }) => {
  const [cycleKey, setCycleKey] = useState('monthly');
  const [studentEmail, setStudentEmail] = useState('');

  const cycle = plan.cycles[cycleKey];

  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-white dark:bg-dark-surface shadow-sm transition-all ${
        planKey === 'individual'
          ? 'border-amber-300/60 dark:border-amber-700/40 ring-1 ring-amber-500/20'
          : 'border-black/[0.08] dark:border-white/[0.08]'
      }`}
    >
      {badge && (
        <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wide bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-md">
          {badge}
        </span>
      )}

      <div className="p-5 md:p-6 flex flex-col flex-1">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl leading-none" aria-hidden>
            {plan.icon}
          </span>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{plan.name}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-[260px]">
              {plan.description}
            </p>
          </div>
        </div>

        {/* Duration selector */}
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
            Billing period
          </p>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map(({ key, label }) => {
              const c = plan.cycles[key];
              const selected = cycleKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCycleKey(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    selected
                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                      : 'bg-gray-50 dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border-black/[0.06] dark:border-white/[0.08] hover:border-amber-400/50'
                  }`}
                >
                  {label}
                  <span className="block text-[10px] font-bold opacity-90 mt-0.5">
                    ₹{c.price}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pricing emphasis */}
        <div className="rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-black/[0.05] dark:border-white/[0.06] p-4 mb-4">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">Due today</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                ₹{cycle.price.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 line-through">₹{cycle.originalPrice.toLocaleString()}</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                Save {cycle.savingsPercent}%
              </p>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
            Renews as {cycle.billingCycle} — cancel anytime from profile.
          </p>
        </div>

        {/* Benefits */}
        <ul className="space-y-2 mb-5 flex-1">
          {plan.benefits.slice(0, 5).map((b, i) => (
            <li key={i} className="flex gap-2 text-xs text-gray-700 dark:text-gray-300">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {planKey === 'student' && (
          <div className="mb-4">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
              College email
            </label>
            <input
              type="email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              placeholder="you@university.edu.in"
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-white dark:bg-zinc-950 border border-black/[0.08] dark:border-white/[0.1] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
            <p className="text-[10px] text-gray-500 mt-1">Must end with .edu, .edu.in, or .ac.in</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => goToCheckout(planKey, cycleKey, studentEmail)}
          className="w-full py-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-sm font-bold transition-colors mt-auto"
        >
          Continue to checkout
        </button>
      </div>
    </div>
  );
};

export default function Membership() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const getPlanOptions = useMembershipStore((s) => s.getPlanOptions);
  const setSelectedPlan = useMembershipStore((s) => s.setSelectedPlan);
  const verifyStudentEmail = useMembershipStore((s) => s.verifyStudentEmail);
  const isActive = useMembershipStore((s) => s.isActive());
  const activeMembership = useMembershipStore((s) => s.activeMembership);

  const plans = getPlanOptions();

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-dark-surface p-8 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Sign in to continue
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Sign in to view Crave PRO plans and subscribe.
          </p>
          <button
            type="button"
            onClick={() => navigate('/auth')}
            className="w-full py-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-sm font-bold transition-colors"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  // keep existing app functionality intact — only block purchase when subscription is currently active
  if (isActive && activeMembership) {
    const plans = getPlanOptions();
    const planInfo = plans[activeMembership.type];
    const estimatedSavings = useMembershipStore.getState().calculateSavingsEstimate();

    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-8 animate-scale-up text-left">
        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-amber-600/[0.02] to-transparent p-6 md:p-8 shadow-xl dark:bg-neutral-900/40">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                ⭐ Crave PRO Member
              </span>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <span className="text-4xl">{planInfo?.icon || '👑'}</span>
                {planInfo?.name || 'Active Pass'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {planInfo?.description}
              </p>
            </div>
            
            <div className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur border border-black/[0.04] dark:border-white/[0.06] p-5 rounded-2xl text-center md:text-right shadow-sm min-w-[180px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Estimated Savings
              </span>
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 block">
                ₹{estimatedSavings}
              </span>
              <span className="text-[10px] text-gray-400 block mt-1">
                With your Pro benefits
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 border-t border-black/[0.05] dark:border-white/[0.05] pt-6 mt-6 relative z-10">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Billing Cycle
              </span>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 capitalize">
                {activeMembership.cycle === 'halfYearly' ? 'Half-yearly' : activeMembership.cycle} Plan
              </p>
              <p className="text-xs text-gray-500">
                ₹{activeMembership.price} paid via mock payment
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Renewal Details
              </span>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Expires on {new Date(activeMembership.expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-xs text-gray-500">
                Auto-renew: {activeMembership.autoRenew ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
        </div>

        {/* Pro Benefits Section */}
        <div className="bg-white dark:bg-dark-surface border border-black/[0.06] dark:border-white/[0.06] rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            Your Premium Pro Benefits
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {planInfo?.benefits.map((benefit, i) => (
              <div key={i} className="flex gap-3 items-start p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900/30 transition-colors">
                <span className="text-amber-500 font-bold text-lg shrink-0">✨</span>
                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full sm:flex-1 py-3.5 rounded-2xl bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-850 dark:hover:bg-white text-white dark:text-neutral-950 text-sm font-black uppercase tracking-wider transition-all shadow-sm focus:outline-none cursor-pointer text-center"
          >
            Start Exploring Food
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="w-full sm:flex-1 py-3.5 rounded-2xl bg-white dark:bg-dark-surface border border-black/[0.08] dark:border-white/[0.08] text-gray-850 dark:text-gray-100 text-sm font-black uppercase tracking-wider transition-all hover:bg-neutral-50 dark:hover:bg-neutral-900 shadow-3xs focus:outline-none cursor-pointer text-center"
          >
            Manage subscription
          </button>
        </div>
      </div>
    );
  }

  const goToCheckout = (planType, cycleKey, email = '') => {
    if (!cycleKey) {
      toast.message('Please choose a billing period.', { duration: 2800 });
      return;
    }

    if (planType === 'student') {
      if (!email.trim()) {
        toast.message('Enter your college email to continue.', { duration: 2800 });
        return;
      }
      const ok = verifyStudentEmail(email.trim());
      if (!ok) {
        const err =
          useMembershipStore.getState().emailVerificationStatus?.error ||
          'Use a valid college email (.edu, .edu.in, or .ac.in).';
        toast.message(err, { duration: 3200 });
        return;
      }
    }

    // persist selected membership plan in Zustand (survives navigation + refresh via persist middleware)
    setSelectedPlan(planType, cycleKey);
    // safe membership checkout routing — never navigate without both plan type and cycle
    navigate('/membership-checkout');
  };

  return (
    // sync membership with global theme — no hardcoded full-page black backgrounds
    <div className="max-w-5xl mx-auto pb-16 pt-2 md:pt-4 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Crave PRO</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Delivery savings and member perks on the orders you already place — similar to other food memberships you may know.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        <PlanCard key="student" planKey="student" badge={null} plan={plans.student} goToCheckout={goToCheckout} />
        <PlanCard key="individual" planKey="individual" badge="Popular" plan={plans.individual} goToCheckout={goToCheckout} />
      </div>

      <div className="max-w-2xl mx-auto rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-dark-surface p-6">
        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4">Common questions</h2>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <details className="group border border-black/[0.06] dark:border-white/[0.08] rounded-xl p-3 cursor-pointer">
            <summary className="font-semibold text-gray-800 dark:text-gray-200 list-none flex justify-between items-center">
              Can I change my plan later?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-2 text-xs leading-relaxed">
              You can switch plans when your current term ends, or after cancelling and resubscribing.
            </p>
          </details>
          <details className="group border border-black/[0.06] dark:border-white/[0.08] rounded-xl p-3 cursor-pointer">
            <summary className="font-semibold text-gray-800 dark:text-gray-200 list-none flex justify-between items-center">
              How does renewal work?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-2 text-xs leading-relaxed">
              By default your plan renews at the end of each billing period. You can turn off auto-renew in your profile.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}
