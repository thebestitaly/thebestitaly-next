"use client";

import React from 'react';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube,
  Globe
} from 'lucide-react';

interface SocialIconProps {
  socials: Record<string, string>;
}

const SOCIAL_ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  website: Globe
};

const SocialIcon: React.FC<SocialIconProps> = ({ socials }) => {
  return React.createElement(
    'div',
    { className: "flex gap-4" },
    Object.entries(socials).map(([platform, url]) => {
      const Icon = SOCIAL_ICONS[platform as keyof typeof SOCIAL_ICONS];
      if (!Icon || !url) return null;

      return React.createElement(
        'a',
        {
          key: platform,
          href: url,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "text-gray-600 hover:text-blue-600 transition-colors"
        },
        React.createElement(Icon, { 
          className: "w-6 h-6" 
        })
      );
    })
  );
};

export default SocialIcon;