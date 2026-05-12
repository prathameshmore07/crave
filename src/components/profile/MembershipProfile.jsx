import { useNavigate } from 'react-router-dom';
import useMembershipStore from '../../store/membershipStore';
import { Crown, Calendar, AlertCircle, RotateCcw, Zap } from 'lucide-react';

export default function MembershipProfile() {
  const navigate = useNavigate();
  const {
    activeMembership,
    setAutoRenew,
    cancelMembership,
    getPlanOptions,
    calculateSavingsEstimate,
  } = useMembershipStore();

  if (!activeMembership) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="border-b border-zinc-100 dark:border-zinc-900 pb-5">
          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-3">
            <Crown size={20} />
            Crave PRO
          </h3>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            Free delivery, member discounts, and lower fees on checkout
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-6 bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/30 rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl">✨</div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-white">
                  No membership yet
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Subscribe for delivery savings and order discounts
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/membership')}
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors text-sm"
            >
              Explore Membership Plans
            </button>
          </div>

          {/* Preview of membership benefits */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="p-4 bg-white/50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100/50 dark:border-zinc-800/50">
              <div className="text-2xl mb-2">🚚</div>
              <p className="text-xs font-bold">Free Delivery</p>
            </div>
            <div className="p-4 bg-white/50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100/50 dark:border-zinc-800/50">
              <div className="text-2xl mb-2">💰</div>
              <p className="text-xs font-bold">20% Discount</p>
            </div>
            <div className="p-4 bg-white/50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100/50 dark:border-zinc-800/50">
              <div className="text-2xl mb-2">⭐</div>
              <p className="text-xs font-bold">Priority Support</p>
            </div>
            <div className="p-4 bg-white/50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100/50 dark:border-zinc-800/50">
              <div className="text-2xl mb-2">🎁</div>
              <p className="text-xs font-bold">Monthly Vouchers</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const planOptions = getPlanOptions();
  const plan = planOptions[activeMembership.type];
  const expiryDate = new Date(activeMembership.expiryDate);
  const now = new Date();
  const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysRemaining <= 7;

  const savingsEstimate = calculateSavingsEstimate();
  const startDate = activeMembership.startDate
    ? new Date(activeMembership.startDate)
    : new Date();

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCancelMembership = () => {
    if (
      window.confirm(
        'Are you sure you want to cancel your membership? You can still use benefits until expiry date.'
      )
    ) {
      cancelMembership();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-zinc-100 dark:border-zinc-900 pb-5">
        <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-3">
          <Crown size={20} className="text-orange-500" />
          Crave PRO
        </h3>
        <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
          Renewal, benefits, and billing
        </p>
      </div>

      {/* Active Status Card */}
      <div className="p-6 bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/30 rounded-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="text-4xl">{plan.icon}</div>
            <div>
              <h4 className="font-bold text-zinc-900 dark:text-white text-lg">
                {plan.name}
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Active • {activeMembership.cycle} subscription
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                  Active Now
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-500">
              ₹{activeMembership.price}
            </div>
            <p className="text-xs text-zinc-500 font-medium">Paid</p>
          </div>
        </div>
      </div>

      {/* Expiry Warning */}
      {isExpiringSoon && daysRemaining > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-300 text-sm">
              Expiring Soon
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300/70">
              Your membership expires in {daysRemaining} days. Renew to avoid losing benefits.
            </p>
          </div>
        </div>
      )}

      {/* Membership Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Date */}
        <div className="p-4 bg-white/50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100/50 dark:border-zinc-800/50">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
            Start Date
          </p>
          <p className="text-sm font-bold">{formatDate(startDate)}</p>
        </div>

        {/* Expiry Date */}
        <div
          className={`p-4 rounded-lg border transition-colors ${
            isExpiringSoon
              ? 'bg-amber-500/10 border-amber-500/30'
              : 'bg-white/50 dark:bg-zinc-900/50 border-zinc-100/50 dark:border-zinc-800/50'
          }`}
        >
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
            Renewal Date
          </p>
          <p className="text-sm font-bold">{formatDate(expiryDate)}</p>
          <p
            className={`text-xs mt-1 font-medium ${
              isExpiringSoon ? 'text-amber-600' : 'text-zinc-500'
            }`}
          >
            {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
          </p>
        </div>

        {/* Estimated savings this term */}
        <div className="p-4 bg-emerald-500/5 dark:bg-emerald-950/20 rounded-lg border border-emerald-200/50 dark:border-emerald-900/40 md:col-span-2">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
            Estimated savings this term
          </p>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
            ₹{savingsEstimate.toLocaleString()}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">
            Illustrative total based on ~₹2,000/month spend and your plan discount.
          </p>
        </div>

        {/* Billing Cycle */}
        <div className="p-4 bg-white/50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100/50 dark:border-zinc-800/50">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
            Billing Cycle
          </p>
          <p className="text-sm font-bold capitalize">{activeMembership.cycle}</p>
        </div>

        {/* Auto Renewal */}
        <div className="p-4 bg-white/50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100/50 dark:border-zinc-800/50">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
            Auto Renewal
          </p>
          <div className="flex items-center justify-between">
            <span
              className={`text-sm font-bold ${
                activeMembership.autoRenew
                  ? 'text-green-600'
                  : 'text-zinc-600'
              }`}
            >
              {activeMembership.autoRenew ? 'Enabled' : 'Disabled'}
            </span>
            <button
              onClick={() => setAutoRenew(!activeMembership.autoRenew)}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                activeMembership.autoRenew
                  ? 'bg-green-500/20 text-green-600 hover:bg-green-500/30'
                  : 'bg-zinc-200/50 text-zinc-600 hover:bg-zinc-300/50'
              }`}
            >
              {activeMembership.autoRenew ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>
      </div>

      {/* Included Benefits */}
      <div>
        <h4 className="font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
          <Zap size={16} className="text-orange-500" />
          Included Benefits
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {plan.benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="p-3 bg-white/50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100/50 dark:border-zinc-800/50 flex items-start gap-2"
            >
              <span className="text-green-500 font-bold text-sm mt-0.5">✓</span>
              <span className="text-sm font-medium">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        <button
          onClick={() => navigate('/membership')}
          className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
        >
          <RotateCcw size={16} />
          Renew or Upgrade Membership
        </button>

        <button
          onClick={handleCancelMembership}
          className="w-full h-12 border border-red-200 dark:border-red-900/40 bg-red-50/10 hover:bg-red-500/10 text-red-600 dark:text-red-400 font-bold rounded-xl transition-colors text-sm"
        >
          Cancel Membership
        </button>
      </div>

      {/* Information Box */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          <span className="font-bold">ℹ️ Note:</span> Cancelling your membership
          will revoke all premium benefits immediately. You can reactivate anytime
          from the membership plans page.
        </p>
      </div>
    </div>
  );
}
