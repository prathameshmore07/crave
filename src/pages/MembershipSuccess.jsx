import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useMembershipStore from '../store/membershipStore';

export default function MembershipSuccess() {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const { activeMembership, calculateSavingsEstimate, getPlanOptions } = useMembershipStore();

  const [animate, setAnimate] = useState(false);
  const [countingUp, setCountingUp] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setCountingUp(true), 600);
    return () => clearTimeout(timer);
  }, []);

  if (!activeMembership || (memberId && activeMembership.id !== memberId)) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-dark-surface p-8 shadow-sm">
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Membership not found</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            If you just paid, open membership from your profile. Otherwise, try subscribing again.
          </p>
          <button
            type="button"
            onClick={() => navigate('/membership')}
            className="w-full py-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-sm font-bold"
          >
            Back to plans
          </button>
        </div>
      </div>
    );
  }

  const planOptions = getPlanOptions();
  const plan = planOptions[activeMembership.type];
  const expiryDate = new Date(activeMembership.expiryDate);
  const savingsEstimate = calculateSavingsEstimate();

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const startDate = activeMembership.startDate
    ? new Date(activeMembership.startDate)
    : new Date();

  const daysUntilExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="max-w-2xl mx-auto pb-20 pt-4 px-4">
      <div className="text-center mb-10">
        <div
          className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 mb-6 transition-all duration-700 ${
            animate ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
        >
          <span className="text-4xl text-white" aria-hidden>
            ✓
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          You&apos;re on Crave PRO
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {plan.name} is active — savings apply on checkout automatically.
        </p>
      </div>

      <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-dark-surface p-6 md:p-8 shadow-sm space-y-8">
        <div className="grid sm:grid-cols-3 gap-4 text-left">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">Active</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Plan</p>
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>
                {plan.icon}
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{plan.name}</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Coverage</p>
            <span className="font-semibold text-amber-700 dark:text-amber-400">
              {daysUntilExpiry > 0 ? `${daysUntilExpiry} days left` : 'Ends today'}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/50 border border-black/[0.05] dark:border-white/[0.06]">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Renewal date</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{formatDate(expiryDate)}</p>
            <p className="text-xs text-gray-500 mt-1">Auto-renew can be changed in profile.</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/50 border border-black/[0.05] dark:border-white/[0.06]">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Estimated savings</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {countingUp ? `₹${savingsEstimate.toLocaleString()}` : '—'}
            </p>
            <p className="text-[10px] text-gray-500 mt-1">Based on ~₹2,000/mo example spend.</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">What you get</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {plan.benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="flex gap-2 text-xs text-gray-700 dark:text-gray-300 p-3 rounded-lg border border-black/[0.05] dark:border-white/[0.06]"
              >
                <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex-1 py-3.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-sm"
          >
            Start ordering
          </button>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex-1 py-3.5 rounded-xl border border-black/[0.1] dark:border-white/[0.12] bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-200 font-semibold text-sm"
          >
            View profile
          </button>
        </div>

        <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center">
          Member since {formatDate(startDate)}
        </p>
      </div>
    </div>
  );
}
