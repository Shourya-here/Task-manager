import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-24 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-brand-500/10 to-brand-400/5 flex items-center justify-center mb-8 shadow-inner shadow-brand-500/5">
        <Icon size={40} className="text-brand-500" />
      </div>
      <h3 className="text-2xl font-extrabold text-surface-900 dark:text-white mb-2 tracking-tight">{title}</h3>
      {description && (
        <p className="text-base font-medium text-surface-500 dark:text-surface-400 text-center max-w-sm mb-8 leading-relaxed">
          {description}
        </p>
      )}
      <div className="relative">
        {action && action}
      </div>
    </motion.div>
  );
}
