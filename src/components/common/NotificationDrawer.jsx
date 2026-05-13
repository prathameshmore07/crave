import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Gift, Star, Compass, Trash2, Check, BellOff } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function NotificationDrawer() {
  const isOpen = useUiStore((state) => state.notificationsOpen);
  const setOpen = useUiStore((state) => state.setNotificationsOpen);

  const notifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const deleteNotification = useNotificationStore((state) => state.deleteNotification);
  const clearAll = useNotificationStore((state) => state.clearAll);

  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNotificationClick = (n) => {
    markAsRead(n.id);
    setOpen(false);
    if (n.link) {
      navigate(n.link);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'order_status':
        return <ShoppingBag size={14} className="text-brand" />;
      case 'promo':
        return <Gift size={14} className="text-amber-500" />;
      case 'delivery_agent':
        return <Compass size={14} className="text-indigo-500" />;
      default:
        return <Star size={14} className="text-emerald-500" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex justify-end">
        {/* Backdrop background blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Panel Container */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          className="relative w-full max-w-md h-full bg-stone-50 dark:bg-dark-bg border-l border-black/[0.06] dark:border-white/[0.06] shadow-2xl flex flex-col z-10"
        >
          {/* Header Row */}
          <div className="p-5 bg-white dark:bg-dark-surface border-b border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                <Compass size={16} />
              </span>
              <div>
                <h2 className="text-sm font-black text-stone-800 dark:text-zinc-50 tracking-wide uppercase">Inbox</h2>
                <p className="text-[9px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider">Live System Coordinates</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={() => {
                    markAllAsRead();
                    toast.success("All notifications marked as read!");
                  }}
                  className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-black/[0.03] dark:bg-white/[0.03] text-stone-500 hover:text-brand rounded-md transition-colors outline-none cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-neutral-850 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer outline-none"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Notifications Scroller */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50 dark:bg-dark-bg">
            <AnimatePresence initial={false}>
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 50, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`p-4 rounded-2xl bg-white dark:bg-dark-surface border border-black/[0.03] dark:border-white/[0.04] flex gap-3 shadow-xs relative group ${
                      !n.isRead ? 'border-l-2 border-l-brand' : ''
                    }`}
                  >
                    {/* Icon Column */}
                    <div className="flex-shrink-0">
                      <span className="w-7 h-7 rounded-full bg-stone-50 dark:bg-neutral-800 flex items-center justify-center border border-black/[0.02]">
                        {getNotifIcon(n.type)}
                      </span>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 text-left min-w-0 pr-6 space-y-1">
                      <button
                        onClick={() => handleNotificationClick(n)}
                        className="w-full text-left focus:outline-none cursor-pointer"
                      >
                        <h3 className={`text-xs font-bold leading-snug tracking-tight text-stone-800 dark:text-zinc-100 ${
                          !n.isRead ? 'font-black' : 'opacity-85'
                        }`}>
                          {n.title}
                        </h3>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-normal font-medium pt-0.5">
                          {n.message}
                        </p>
                      </button>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block pt-1">
                        {n.timestamp}
                      </span>
                    </div>

                    {/* Actions Panel - floating on hover */}
                    <div className="absolute top-3.5 right-3.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.isRead && (
                        <button
                          onClick={() => {
                            markAsRead(n.id);
                            toast.success("Marked as read");
                          }}
                          title="Mark as read"
                          className="w-6 h-6 rounded-md bg-stone-50 dark:bg-neutral-800 hover:bg-emerald-500 hover:text-white flex items-center justify-center text-stone-400 transition-colors cursor-pointer outline-none border border-black/[0.02]"
                        >
                          <Check size={11} strokeWidth={3} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          deleteNotification(n.id);
                          toast.info("Deleted notification");
                        }}
                        title="Delete"
                        className="w-6 h-6 rounded-md bg-stone-50 dark:bg-neutral-800 hover:bg-brand hover:text-white flex items-center justify-center text-stone-400 transition-colors cursor-pointer outline-none border border-black/[0.02]"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>

                    {/* Unread dot indicator (if not hovered or hovered without action panel) */}
                    {!n.isRead && (
                      <span className="absolute top-4 right-4 w-1.5 h-1.5 bg-brand rounded-full group-hover:opacity-0 transition-opacity" />
                    )}
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-16 text-center space-y-3.5"
                >
                  <div className="w-14 h-14 bg-stone-100 dark:bg-neutral-800 text-stone-400 flex items-center justify-center rounded-full mx-auto shadow-inner">
                    <BellOff size={22} />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">All coordinates clear</h3>
                    <p className="text-[11px] text-stone-500 dark:text-stone-500 font-medium">Your live system inbox is currently empty.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Clear all action row */}
          {notifications.length > 0 && (
            <div className="p-4 bg-white dark:bg-dark-surface border-t border-black/[0.05] dark:border-white/[0.05]">
              <button
                onClick={() => {
                  clearAll();
                  toast.success("Inbox cleared completely");
                }}
                className="w-full h-11 border border-black/[0.06] dark:border-white/[0.06] hover:border-brand/40 text-stone-500 hover:text-brand text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer outline-none flex items-center justify-center gap-1.5"
              >
                <Trash2 size={13} />
                Clear System Inbox
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
