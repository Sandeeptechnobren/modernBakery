// "use client";

// import { useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Icon } from "@iconify-icon/react";

// type SnackbarProps = {
//   message: string;
//   type: "success" | "error" | "warning";
//   open: boolean;
//   onClose: () => void;
// };

// const icons = {
//   success: "mdi:check-circle",
//   error: "mdi:close-circle",
//   warning: "mdi:alert-circle",
// };

// const colors = {
//   success: "bg-green-500",
//   error: "bg-red-500",
//   warning: "bg-yellow-500 text-black",
// };

// export default function Snackbar({
//   message,
//   type,
//   open,
//   onClose,
// }: SnackbarProps) {
//   // Auto close after 3s
//   useEffect(() => {
//     if (open) {
//       const timer = setTimeout(() => {
//         onClose();
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [open, onClose]);

//   return (
//     <AnimatePresence>
//       {open && (
//         <motion.div
//           initial={{ y: -50, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           exit={{ y: -50, opacity: 0 }}
//           transition={{ duration: 0.3 }}
//           className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg text-white flex items-center gap-2 ${colors[type]} z-50`}
//         >
//           <Icon icon={icons[type]} width={24} height={24} />
//           <span className="font-medium">{message}</span>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }

"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify-icon/react";

type SnackbarProps = {
  message: string;
  type: "success" | "error" | "warning" | "info";
  open: boolean;
  onClose: () => void;
};

const icons = {
  success: "mdi:check-circle",
  error: "mdi:close-circle",
  warning: "mdi:alert-circle",
  info: "mdi:information",
};

const colors = {
  success: "bg-green-500",
  error: "bg-red-500",
  warning: "bg-yellow-500 text-black",
  info: "bg-blue-500",
};

export default function Snackbar({ message, type, open, onClose }: SnackbarProps) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg text-white flex items-center gap-2 ${colors[type]} z-50`}
        >
          <Icon icon={icons[type]} width={24} height={24} />
          <span className="font-medium">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
