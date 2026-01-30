import React, { useState } from "react";
import LiveAvatarChat from "@/components/LiveAvatar";
import TextChat from "@/components/TextChat";

type ChatMode = 'text' | 'video';

const MariaPage: React.FC = () => {
  const [mode, setMode] = useState<ChatMode>('text');

  const handleSessionEnd = (messages: any[]) => {
    console.log("Session ended with messages:", messages);
  };

  const handleSwitchToVideo = () => {
    setMode('video');
  };

  const handleBackToText = () => {
    setMode('text');
  };

  return (
    <div className="h-full flex flex-col">
      {mode === 'video' ? (
        <LiveAvatarChat 
          language="ru" 
          onSessionEnd={handleSessionEnd}
          onClose={handleBackToText}
        />
      ) : (
        <TextChat 
          onSwitchToVideo={handleSwitchToVideo}
        />
      )}
    </div>
  );
};

export default MariaPage;
