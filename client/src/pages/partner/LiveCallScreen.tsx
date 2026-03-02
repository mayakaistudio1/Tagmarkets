import React from "react";
import { motion } from "framer-motion";
import { PhoneOff } from "lucide-react";
import { useLocation } from "wouter";

const LiveCallScreen: React.FC = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="ph-live-root">
      <div className="ph-live-content">
        <div className="ph-live-avatar-wrap">
          <img src="/dennis-photo.png" alt="Dennis" className="ph-live-avatar" />
          <div className="ph-live-ring-anim" />
          <div className="ph-live-ring-anim ph-live-ring-2" />
        </div>

        <h2 className="ph-live-name">Dennis</h2>
        <p className="ph-live-status">
          <span className="ph-live-pulse" />
          Live Avatar
        </p>

        <div className="ph-live-placeholder">
          <p>HeyGen LiveAvatar будет подключён здесь</p>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          className="ph-live-end"
          onClick={() => setLocation("/p/dennis")}
          data-testid="btn-end-call"
        >
          <PhoneOff size={22} />
          Завершить звонок
        </motion.button>
      </div>
    </div>
  );
};

export default LiveCallScreen;
