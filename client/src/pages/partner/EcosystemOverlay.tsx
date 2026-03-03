import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import HomePage from "../HomePage";

interface EcosystemOverlayProps {
  onClose: () => void;
}

const EcosystemOverlay: React.FC<EcosystemOverlayProps> = ({ onClose }) => {
  return (
    <motion.div
      className="eco-overlay"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 280 }}
    >
      <div className="eco-header">
        <button className="eco-back-btn" onClick={onClose} data-testid="btn-back-to-dennis">
          <ArrowLeft size={18} />
          <span>Вернуться к Денису</span>
        </button>
      </div>
      <div className="eco-content">
        <HomePage />
      </div>
    </motion.div>
  );
};

export default EcosystemOverlay;
