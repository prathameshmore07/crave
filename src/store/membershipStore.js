import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';

// persist selected membership plan in localStorage (Zustand persist) — used for /membership-checkout routing
// keep existing app functionality intact — this module does not remove or replace cart/checkout stores

// Membership plans data
const MEMBERSHIP_PLANS = {
  student: {
    id: 'student',
    name: 'Student Pass',
    description: 'For students with a valid college email',
    icon: '🎓',
    cycles: {
      monthly: {
        duration: '1 month',
        price: 99,
        originalPrice: 149,
        billingCycle: 'monthly',
        savingsPercent: 33,
      },
      halfYearly: {
        duration: '6 months',
        price: 499,
        originalPrice: 894,
        billingCycle: 'half-yearly',
        savingsPercent: 44,
      },
      yearly: {
        duration: '12 months',
        price: 799,
        originalPrice: 1788,
        billingCycle: 'yearly',
        savingsPercent: 55,
      },
    },
    benefits: [
      'Free delivery on restaurant orders',
      'Up to 20% off on eligible food items',
      'Reduced platform fees at checkout',
      'Priority customer support',
      'Student-only offers from partner restaurants',
      'Occasional bonus credits on select orders',
    ],
    verificationRequired: true,
    maxPlan: 'yearly',
  },
  individual: {
    id: 'individual',
    name: 'Individual Pass',
    description: 'For everyday orders and family meals',
    icon: '👤',
    cycles: {
      monthly: {
        duration: '1 month',
        price: 149,
        originalPrice: 199,
        billingCycle: 'monthly',
        savingsPercent: 25,
      },
      halfYearly: {
        duration: '6 months',
        price: 799,
        originalPrice: 1194,
        billingCycle: 'half-yearly',
        savingsPercent: 33,
      },
      yearly: {
        duration: '12 months',
        price: 1299,
        originalPrice: 2388,
        billingCycle: 'yearly',
        savingsPercent: 46,
      },
    },
    benefits: [
      'Free delivery on restaurant orders',
      'Up to 15% off on eligible food items',
      'Reduced platform fees at checkout',
      'Priority customer support',
      'Member-only discounts and promos',
      'Birthday & seasonal offers where available',
    ],
    verificationRequired: false,
    maxPlan: 'yearly',
  },
};

// Zustand store
export const useMembershipStore = create(
  persist(
    (set, get) => ({
      // State
      selectedPlanType: null, // 'student' or 'individual'
      selectedCycle: null, // 'monthly', 'halfYearly', 'yearly'
      activeMembership: null, // { type, cycle, startDate, expiryDate, autoRenew }
      membershipHistory: [], // Array of past memberships
      emailVerificationStatus: null, // { email, verified, domain }
      isLoadingMembership: false,
      membershipError: null,

      // Actions
      // safe membership checkout routing — getPlanDetails() needs both selectedPlanType + selectedCycle
      setSelectedPlan: (planType, cycle) =>
        set({
          selectedPlanType: planType,
          selectedCycle: cycle,
          membershipError: null,
        }),

      resetSelection: () =>
        set({
          selectedPlanType: null,
          selectedCycle: null,
          emailVerificationStatus: null,
        }),

      // Email verification for student pass
      verifyStudentEmail: (email) => {
        const allowedDomains = ['.edu', '.edu.in', '.ac.in'];
        const emailLower = email.toLowerCase();
        const isValid = allowedDomains.some((domain) =>
          emailLower.endsWith(domain)
        );

        set({
          emailVerificationStatus: {
            email,
            verified: isValid,
            domain: emailLower.split('@')[1] || '',
            error: isValid
              ? null
              : 'Please use a valid college/university email (.edu, .edu.in, or .ac.in)',
          },
        });

        return isValid;
      },

      // Activate membership (mock payment success)
      activateMembership: async (membershipData) => {
        set({ isLoadingMembership: true, membershipError: null });

        try {
          // Simulate backend processing
          await new Promise((resolve) => setTimeout(resolve, 2500));

          const now = new Date();
          const expiryDate = new Date(now);

          // Calculate expiry based on cycle
          if (membershipData.cycle === 'monthly') {
            expiryDate.setMonth(expiryDate.getMonth() + 1);
          } else if (membershipData.cycle === 'halfYearly') {
            expiryDate.setMonth(expiryDate.getMonth() + 6);
          } else if (membershipData.cycle === 'yearly') {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
          }

          const newMembership = {
            id: `mem_${Date.now()}`,
            type: membershipData.type,
            cycle: membershipData.cycle,
            price: membershipData.price,
            startDate: now.toISOString(),
            expiryDate: expiryDate.toISOString(),
            autoRenew: true,
            status: 'active',
          };

          set((state) => ({
            activeMembership: newMembership,
            membershipHistory: [
              ...state.membershipHistory,
              newMembership,
            ],
            isLoadingMembership: false,
            // Clear checkout selection after activation so routes stay valid
            selectedPlanType: null,
            selectedCycle: null,
          }));

          return newMembership;
        } catch (error) {
          set({
            isLoadingMembership: false,
            membershipError: error.message || 'Failed to activate membership',
          });
          throw error;
        }
      },

      // Renew membership
      renewMembership: async (cycle) => {
        set({ isLoadingMembership: true, membershipError: null });

        try {
          await new Promise((resolve) => setTimeout(resolve, 2000));

          const current = get().activeMembership;
          if (!current) {
            throw new Error('No active membership to renew');
          }

          const expiryDate = new Date(current.expiryDate);

          // Add time based on cycle
          if (cycle === 'monthly') {
            expiryDate.setMonth(expiryDate.getMonth() + 1);
          } else if (cycle === 'halfYearly') {
            expiryDate.setMonth(expiryDate.getMonth() + 6);
          } else if (cycle === 'yearly') {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
          }

          const renewedMembership = {
            ...current,
            cycle,
            expiryDate: expiryDate.toISOString(),
            renewedAt: new Date().toISOString(),
          };

          set((state) => ({
            activeMembership: renewedMembership,
            membershipHistory: [
              ...state.membershipHistory,
              renewedMembership,
            ],
            isLoadingMembership: false,
          }));

          return renewedMembership;
        } catch (error) {
          set({
            isLoadingMembership: false,
            membershipError: error.message || 'Failed to renew membership',
          });
          throw error;
        }
      },

      // Toggle auto-renew
      setAutoRenew: (enabled) =>
        set((state) => ({
          activeMembership: state.activeMembership
            ? { ...state.activeMembership, autoRenew: enabled }
            : null,
        })),

      // Cancel membership
      cancelMembership: () =>
        set({
          activeMembership: null,
          selectedPlanType: null,
          selectedCycle: null,
        }),

      // Get plan details
      getPlanDetails: () => {
        const { selectedPlanType, selectedCycle } = get();
        if (!selectedPlanType || !selectedCycle) return null;

        return {
          plan: MEMBERSHIP_PLANS[selectedPlanType],
          cycle: MEMBERSHIP_PLANS[selectedPlanType].cycles[selectedCycle],
          planType: selectedPlanType,
          cycleName: selectedCycle,
        };
      },

      // Helper to check if membership is active
      isActive: () => {
        // Only active if a user is logged in
        const user = useAuthStore.getState().user;
        if (!user) return false;

        const { activeMembership } = get();
        if (!activeMembership) return false;

        const now = new Date();
        const expiryDate = new Date(activeMembership.expiryDate);

        return now < expiryDate && activeMembership.status === 'active';
      },

      // Get membership discount percentage
      getDiscountPercent: () => {
        const { activeMembership } = get();
        if (!activeMembership) return 0;

        return activeMembership.type === 'student' ? 20 : 15;
      },

      // Calculate savings estimate
      calculateSavingsEstimate: () => {
        const { activeMembership } = get();
        if (!activeMembership) return 0;

        // Mock: assume user spends ₹2000/month
        const monthlySpend = 2000;
        const discountPercent = activeMembership.type === 'student' ? 20 : 15;

        let months = 1;
        if (activeMembership.cycle === 'halfYearly') months = 6;
        if (activeMembership.cycle === 'yearly') months = 12;

        return Math.round((monthlySpend * discountPercent * months) / 100);
      },

      // Getters for UI
      getActiveMembership: () => get().activeMembership,
      getPlanOptions: () => MEMBERSHIP_PLANS,
    }),
    {
      name: 'membership-store',
      version: 1,
    }
  )
);

export default useMembershipStore;
