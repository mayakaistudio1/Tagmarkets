import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X } from "lucide-react";

interface EcosystemNode {
  id: string;
  name: string;
  description: string;
  intent: string;
  x: number;
  y: number;
}

const NODES: EcosystemNode[] = [
  {
    id: "tag",
    name: "TAG Markets",
    description: "Licensed brokerage infrastructure for global financial markets access.",
    intent: "ASK_TAG_MARKETS",
    x: 50,
    y: 15,
  },
  {
    id: "bit1",
    name: "BIT1",
    description: "Institutional-grade crypto exchange platform with deep liquidity.",
    intent: "ASK_BIT1",
    x: 78,
    y: 35,
  },
  {
    id: "bix",
    name: "BIX Card",
    description: "Next-gen crypto debit card for seamless crypto-to-fiat spending.",
    intent: "ASK_BIX",
    x: 72,
    y: 72,
  },
  {
    id: "ai",
    name: "AI System",
    description: "AI-powered infrastructure for partner automation and lead qualification.",
    intent: "ASK_AI_SYSTEM",
    x: 28,
    y: 72,
  },
  {
    id: "network",
    name: "Partners",
    description: "Global partner community and multi-level ecosystem for collaborative growth.",
    intent: "ASK_PARTNER_NETWORK",
    x: 22,
    y: 35,
  },
];

interface EcosystemMapSlideProps {
  onAskDennis: (intent: string, question: string) => void;
}

const EcosystemMapSlide: React.FC<EcosystemMapSlideProps> = ({ onAskDennis }) => {
  const [selectedNode, setSelectedNode] = useState<EcosystemNode | null>(null);

  return (
    <div className="eco-map-container">
      {/* Network Lines SVG */}
      <svg className="eco-map-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(124, 58, 237, 0.1)" />
            <stop offset="50%" stopColor="rgba(124, 58, 237, 0.5)" />
            <stop offset="100%" stopColor="rgba(124, 58, 237, 0.1)" />
          </linearGradient>
        </defs>
        {NODES.map((node) => (
          <motion.line
            key={`line-${node.id}`}
            x1="50"
            y1="50"
            x2={node.x}
            y2={node.y}
            stroke="url(#lineGradient)"
            strokeWidth="0.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        ))}
      </svg>

      {/* Center Node */}
      <motion.div
        className="eco-node-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15, stiffness: 100 }}
      >
        <div className="eco-node-center-inner">
          <img src="/jetup-logo.png" alt="JETUP" className="eco-center-logo" />
          <span className="eco-center-text">JETUP</span>
        </div>
        <div className="eco-center-pulse" />
      </motion.div>

      {/* Satellite Nodes */}
      {NODES.map((node, i) => (
        <motion.div
          key={node.id}
          className="eco-node-satellite"
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 + i * 0.1, type: "spring" }}
          onClick={() => setSelectedNode(node)}
          data-testid={`eco-node-${node.id}`}
        >
          <div className="eco-satellite-dot" />
          <div className="eco-satellite-label">{node.name}</div>
          <motion.div
            className="eco-satellite-pulse"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.1, 0.4],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      ))}

      {/* Info Card Overlay */}
      <AnimatePresence>
        {selectedNode && (
          <>
            <motion.div
              className="eco-card-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNode(null)}
            />
            <motion.div
              className="eco-info-card"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              data-testid={`eco-info-card-${selectedNode.id}`}
            >
              <button
                className="eco-card-close"
                onClick={() => setSelectedNode(null)}
                data-testid="btn-close-eco-card"
              >
                <X size={18} />
              </button>
              
              <h3 className="eco-card-title">{selectedNode.name}</h3>
              <p className="eco-card-desc">{selectedNode.description}</p>
              
              <div className="eco-card-actions">
                <button
                  className="eco-card-btn-primary"
                  onClick={() => {
                    onAskDennis(selectedNode.intent, `Расскажи подробнее про ${selectedNode.name}`);
                    setSelectedNode(null);
                  }}
                  data-testid={`btn-ask-dennis-${selectedNode.id}`}
                >
                  <MessageSquare size={16} />
                  Спросить Dennis
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EcosystemMapSlide;
