import React from 'react';
import { Platform } from '../types';
import { Gamepad2, Monitor, Trophy, Box, Bot } from 'lucide-react';

interface Props {
  platform: Platform;
  className?: string;
}

export const PlatformIcon: React.FC<Props> = ({ platform, className = "w-5 h-5" }) => {
  switch (platform) {
    case Platform.STEAM:
      return <Monitor className={`${className} text-blue-400`} />;
    case Platform.PSN:
      return <Gamepad2 className={`${className} text-blue-600`} />;
    case Platform.XBOX:
      return <Box className={`${className} text-green-500`} />;
    case Platform.EPIC:
      return <Trophy className={`${className} text-white`} />;
    case Platform.DISCORD:
      return <Bot className={`${className} text-[#5865F2]`} />;
    default:
      return <Gamepad2 className={className} />;
  }
};