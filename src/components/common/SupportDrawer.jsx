import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, PhoneCall, Send, HelpCircle, CheckCircle, Clock, Compass } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { useOrderStore } from '../../store/orderStore';
import { useAuthStore } from '../../store/authStore';
import { getLiveChatResponse, loadLocalChatHistory, saveLocalChatHistory } from '../../services/geminiService';
import { toast } from 'sonner';

// Quick Action Prompts
const defaultFaqs = [
  { text: "Refund Issue", reply: "I want to request a refund for my order." },
  { text: "Order Delayed", reply: "My order is delayed. Can you check where it is?" },
  { text: "Wrong Item Received", reply: "I received a wrong or missing item in my order." },
  { text: "Payment Failed", reply: "My payment failed but the money was deducted from my account." }
];

export default function SupportDrawer() {
  const isOpen = useUiStore((state) => state.supportOpen);
  const supportType = useUiStore((state) => state.supportType);
  const setOpen = useUiStore((state) => state.setSupportOpen);

  const activeOrder = useOrderStore((state) => state.activeOrder);
  const user = useAuthStore((state) => state.user);

  const orderId = activeOrder?.orderId || 'general';
  const chatStorageKey = `support_chat_${orderId}`;

  const [activeMode, setActiveMode] = useState('chat'); // 'chat' | 'helpline'
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Callback form states
  const [callbackName, setCallbackName] = useState("");
  const [callbackPhone, setCallbackPhone] = useState("");
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);
  const [callbackTimer, setCallbackTimer] = useState(0);

  const chatEndRef = useRef(null);

  // Sync initial state and tab mode
  useEffect(() => {
    if (isOpen) {
      setActiveMode(supportType);
    }
  }, [isOpen, supportType]);

  // Load chat history from localStorage on mount/open
  useEffect(() => {
    if (isOpen) {
      const saved = loadLocalChatHistory(chatStorageKey);
      if (saved && saved.length > 0) {
        setMessages(saved);
      } else {
        // Gemini customer support assistant initial greeting
        const greeting = activeOrder 
          ? `Hello! I'm Rohan from CRAVE Priority Assistance. I see you're checking on your active order from ${activeOrder.restaurantName}. How can I help you today?`
          : "Hello! I'm Rohan from CRAVE Priority Assistance. How can I help you today?";
        const initial = [{ sender: 'agent', text: greeting, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
        setMessages(initial);
        saveLocalChatHistory(chatStorageKey, initial);
      }
    }
  }, [isOpen, chatStorageKey, activeOrder]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Countdown timer for callback
  useEffect(() => {
    let timerId;
    if (callbackTimer > 0) {
      timerId = setTimeout(() => {
        setCallbackTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timerId);
  }, [callbackTimer]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim() || isTyping) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message to history
    const userMsg = { sender: 'user', text: textToSend, time: timestamp };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    saveLocalChatHistory(chatStorageKey, updatedMessages);
    setInputText("");

    // Trigger Rohan typing simulation
    setIsTyping(true);

    try {
      const context = {
        customerName: user?.name || "Valued Customer",
        restaurantName: activeOrder?.restaurantName || "Campus Kitchen",
        orderStatus: activeOrder?.orderStatus || "Order Confirmed",
        items: activeOrder?.items || [],
        riderName: activeOrder?.riderInfo?.name || "Rohan",
        eta: activeOrder?.eta || "15",
        paymentMethod: activeOrder?.paymentMethod || "UPI"
      };

      // Call the Gemini service with conversation context
      const replyText = await getLiveChatResponse({
        type: "support",
        message: textToSend,
        chatHistory: messages,
        context
      });

      setIsTyping(false);
      const replyMsg = { 
        sender: 'agent', 
        text: replyText, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      
      const updatedWithReply = [...updatedMessages, replyMsg];
      setMessages(updatedWithReply);
      saveLocalChatHistory(chatStorageKey, updatedWithReply);
      toast.success("Rohan has replied to your query!");
    } catch (err) {
      console.error("Failed to fetch support chat reply:", err);
      setIsTyping(false);
      const errorMsg = { 
        sender: 'agent', 
        text: "Support is temporarily unavailable. Please try again in a few moments.", 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      const updatedWithError = [...updatedMessages, errorMsg];
      setMessages(updatedWithError);
      saveLocalChatHistory(chatStorageKey, updatedWithError);
    }
  };

  const handleFaqClick = (faq) => {
    handleSendMessage(faq.reply);
  };

  const handleCallbackSubmit = (e) => {
    e.preventDefault();
    if (!callbackName.trim() || !callbackPhone.trim()) {
      toast.error("Please enter your name and phone number.");
      return;
    }

    setCallbackSubmitted(true);
    setCallbackTimer(120); // 2 minutes countdown
    toast.success("Priority Callback Scheduled!", {
      description: "Our customer success manager will contact you shortly."
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex justify-end">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Support Panel Slider */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          className="relative w-full max-w-md h-full bg-stone-50 dark:bg-dark-bg border-l border-black/[0.06] dark:border-white/[0.06] shadow-2xl flex flex-col z-10"
        >
          {/* Header Row */}
          <div className="p-5 bg-white dark:bg-dark-surface border-b border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                <Compass size={18} className="animate-spin-slow" />
              </span>
              <div>
                <h2 className="text-sm font-black text-stone-800 dark:text-zinc-50 tracking-wide uppercase">CRAVE Care Hub</h2>
                <p className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider">Live Priority Concierge</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-neutral-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer outline-none"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Segment Switcher tabs */}
          <div className="bg-white dark:bg-dark-surface px-4 border-b border-black/[0.04] dark:border-white/[0.04] flex gap-4">
            <button
              onClick={() => setActiveMode('chat')}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wider border-b-2 flex items-center justify-center gap-1.5 cursor-pointer outline-none transition-colors ${
                activeMode === 'chat' ? 'border-brand text-brand' : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              <MessageSquare size={13} />
              24/7 Live Chat
            </button>
            <button
              onClick={() => setActiveMode('helpline')}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wider border-b-2 flex items-center justify-center gap-1.5 cursor-pointer outline-none transition-colors ${
                activeMode === 'helpline' ? 'border-brand text-brand' : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              <PhoneCall size={13} />
              Helpline Callback
            </button>
          </div>

          {/* Mode Contents */}
          {activeMode === 'chat' ? (
            <div className="flex-1 flex flex-col min-h-0 bg-stone-50 dark:bg-dark-bg">
              {/* Message History Scroller */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="max-w-[85%] space-y-1">
                      <div
                        className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed ${
                          m.sender === 'user'
                            ? 'bg-brand text-white rounded-tr-none shadow-sm shadow-brand/10'
                            : 'bg-white dark:bg-dark-surface text-stone-800 dark:text-stone-100 border border-black/[0.04] dark:border-white/[0.04] rounded-tl-none shadow-xs'
                        }`}
                      >
                        {m.text}
                      </div>
                      <span className="text-[9px] text-stone-400 px-1 font-bold uppercase tracking-wider block text-right">
                        {m.sender === 'user' ? 'You' : 'Rohan • CRAVE Support'}
                      </span>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-start gap-1.5">
                    <div className="bg-white dark:bg-dark-surface border border-black/[0.04] dark:border-white/[0.04] p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                      <motion.span className="w-1.5 h-1.5 bg-stone-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                      <motion.span className="w-1.5 h-1.5 bg-stone-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} />
                      <motion.span className="w-1.5 h-1.5 bg-stone-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* FAQ Suggestions Chips panel */}
              {messages.length < 5 && (
                <div className="p-4 bg-white dark:bg-dark-surface/60 border-t border-black/[0.04] dark:border-white/[0.04] space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 block mb-1">Select a popular query:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {defaultFaqs.map((faq, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleFaqClick(faq)}
                        className="text-[10px] font-bold text-stone-600 dark:text-stone-300 hover:text-brand dark:hover:text-brand bg-stone-100 dark:bg-zinc-800 border border-black/[0.03] dark:border-white/[0.04] hover:border-brand/40 px-3 py-1.5 rounded-full transition-all text-left outline-none cursor-pointer"
                      >
                        {faq.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Send Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputText);
                }}
                className="p-4 bg-white dark:bg-dark-surface border-t border-black/[0.05] dark:border-white/[0.05] flex gap-2 items-center"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask Rohan a support question..."
                  className="flex-1 h-11 px-4 text-xs font-semibold bg-stone-50 dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] rounded-xl outline-none focus:bg-white focus:border-brand/50"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-11 h-11 bg-brand hover:bg-brand-hover text-white flex items-center justify-center rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed outline-none"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          ) : (
            /* HELPLINE VIEW */
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* Live telemetry analytics */}
              <div className="p-4 border border-emerald-500/15 bg-emerald-500/[0.02] rounded-2xl flex items-center gap-4 text-left">
                <span className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Clock size={18} />
                </span>
                <div className="space-y-0.5">
                  <h3 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Live Helpline Wait Time</h3>
                  <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 font-semibold leading-relaxed">Estimated queue speed: <span className="font-bold underline">~2 min 40 sec</span>. We suggest submitting a quick callback request below!</p>
                </div>
              </div>

              {callbackSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 bg-white dark:bg-dark-surface border border-emerald-500/10 dark:border-emerald-500/20 rounded-2xl text-center space-y-4 shadow-sm"
                >
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full text-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle size={32} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-stone-800 dark:text-zinc-100 uppercase tracking-wider">Callback Scheduled!</h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 font-semibold leading-relaxed">
                      Hey <span className="font-bold text-stone-800 dark:text-stone-200">{callbackName}</span>, we have reserved your priority slot! Rohan from CRAVE VIP Assistance team will call you at <span className="font-mono font-bold text-stone-800 dark:text-stone-200">{callbackPhone}</span> shortly.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-black/[0.03] text-[11px] font-bold text-stone-400 uppercase tracking-widest flex justify-between items-center px-4">
                    <span>Est. Call Dispatch:</span>
                    <span className="text-emerald-500 font-mono">
                      {Math.floor(callbackTimer / 60)}:{(callbackTimer % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white dark:bg-dark-surface p-5 border border-black/[0.05] dark:border-white/[0.05] rounded-2xl space-y-4">
                  <div className="space-y-0.5 text-left border-b border-black/[0.04] pb-3 mb-2">
                    <h3 className="text-xs font-black text-stone-850 dark:text-zinc-100 uppercase tracking-wider">Priority Helpline Callback</h3>
                    <p className="text-[10px] text-stone-400 font-semibold leading-normal">Submit your mobile coordinates, and our direct dispatch line will dial you right back.</p>
                  </div>

                  <form onSubmit={handleCallbackSubmit} className="space-y-4">
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={callbackName}
                        onChange={(e) => setCallbackName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="h-10 w-full px-3 text-xs font-semibold bg-stone-50 dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] rounded-xl outline-none focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">Delivery Mobile Number</label>
                      <input
                        type="tel"
                        required
                        value={callbackPhone}
                        onChange={(e) => setCallbackPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="h-10 w-full px-3 text-xs font-semibold bg-stone-50 dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] rounded-xl outline-none focus:bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="h-11 w-full bg-brand hover:bg-brand-hover text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-xs transition-colors cursor-pointer outline-none flex items-center justify-center gap-1.5"
                    >
                      <PhoneCall size={12} />
                      Request Direct Call Now
                    </button>
                  </form>
                </div>
              )}

              {/* Direct helpline card coordinates */}
              <div className="p-4 border border-black/[0.05] dark:border-white/[0.05] bg-stone-100/40 dark:bg-dark-surface/40 rounded-xl text-xs space-y-3 text-left">
                <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 block mb-1">Direct Helpline Directory</span>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 font-bold uppercase tracking-wider text-[9px]">India Helpline Toll-Free</span>
                  <span className="text-brand font-mono font-black uppercase tracking-wider">1800-244-CRAVE</span>
                </div>
                <div className="flex justify-between items-center border-t border-black/[0.03] pt-2">
                  <span className="text-stone-500 font-bold uppercase tracking-wider text-[9px]">Local Dispatch WhatsApp</span>
                  <span className="text-emerald-500 font-mono font-black uppercase tracking-wider">+91 22 6124 9911</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
