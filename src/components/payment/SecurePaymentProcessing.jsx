import { useEffect, useState } from 'react';

const MEMBERSHIP_FLOW_STEPS = [
  { label: 'Securing subscription', completed: false },
  { label: 'Verifying payment', completed: false },
  { label: 'Activating benefits', completed: false },
  { label: 'Syncing membership perks', completed: false },
];

const ORDER_FLOW_STEPS = [
  { label: 'Verifying payment session', completed: false },
  { label: 'Confirming kitchen request', completed: false },
  { label: 'Assigning delivery partner', completed: false },
  { label: 'Securing live order channel', completed: false },
  { label: 'Finalizing order packet', completed: false },
];

// Secure payment overlay — membership vs food order flows
export default function SecurePaymentProcessing({
  type = 'order',
  paymentMethod = 'card',
  onComplete,
  isProcessing = false,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStates, setStepStates] = useState(() =>
    (type === 'membership' ? MEMBERSHIP_FLOW_STEPS : ORDER_FLOW_STEPS).map((s) => ({ ...s }))
  );

  useEffect(() => {
    const tpl = type === 'membership' ? MEMBERSHIP_FLOW_STEPS : ORDER_FLOW_STEPS;
    setStepStates(tpl.map((s) => ({ ...s })));
    setCurrentStep(0);
  }, [type]);

  useEffect(() => {
    if (!isProcessing) return;

    const count = type === 'membership' ? 4 : 5;
    const timings =
      type === 'membership' ? [700, 1200, 1800, 2400] : [800, 1200, 1600, 2000, 2400];
    const timers = [];

    timings.forEach((timing, index) => {
      if (index >= count) return;
      const timer = setTimeout(() => {
        setCurrentStep(index + 1);
        setStepStates((prev) => {
          const updated = [...prev];
          if (updated[index]) updated[index] = { ...updated[index], completed: true };
          return updated;
        });
      }, timing);
      timers.push(timer);
    });

    const completeMs = type === 'membership' ? 2700 : 2800;
    const completeTimer = setTimeout(() => {
      setCurrentStep(count);
      onComplete?.();
    }, completeMs);
    timers.push(completeTimer);

    return () => timers.forEach((t) => clearTimeout(t));
  }, [isProcessing, onComplete, type]);

  const totalSteps = stepStates.length || 1;
  const progressPct = Math.min((currentStep / totalSteps) * 100, 100);

  return (
    <div className="fixed inset-0 bg-black/90 dark:bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 z-[200]">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <div className="relative w-16 h-16">
              <div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-orange-500 border-r-orange-500 animate-spin"
                style={{ animationDuration: '2s' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-2xl" aria-hidden>
                  🔒
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            {type === 'membership' ? 'Activating membership' : 'Processing order'}
          </h2>
          <p className="text-gray-400 text-sm">Secure encrypted payment</p>
        </div>

        <div className="space-y-3 mb-12">
          {stepStates.map((step, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    index < currentStep
                      ? 'bg-green-500 text-white'
                      : index === currentStep
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {index < currentStep ? (
                    <span>✓</span>
                  ) : index === currentStep ? (
                    <span className="inline-block animate-spin">⌛</span>
                  ) : (
                    index + 1
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm font-medium transition-colors ${
                    index <= currentStep ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </p>
              </div>
              {index < currentStep && (
                <div className="text-green-400 text-sm">
                  <span className="animate-pulse">✓</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mb-8">
          <div className="w-full bg-gray-800 rounded-full h-1">
            <div
              className="h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
          <p className="text-xs text-gray-500 mb-2">PAYMENT METHOD</p>
          <div className="flex items-center justify-between">
            <span className="text-white font-medium capitalize">
              {paymentMethod === 'gpay'
                ? 'Google Pay'
                : paymentMethod === 'phonepe'
                  ? 'PhonePe'
                  : paymentMethod
                    ? paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)
                    : '—'}
            </span>
            <span className="text-gray-400 text-xs">Verified</span>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">Your payment details are encrypted in transit.</p>
        </div>
      </div>
    </div>
  );
}
