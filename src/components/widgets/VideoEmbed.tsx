"use client";

import React from 'react';

interface VideoEmbedProps {
  src: string;
  title?: string;
  className?: string;
}

const VideoEmbed: React.FC<VideoEmbedProps> = ({ src, title = "Video", className = "" }) => {
  // Extract video ID and platform from URL
  const getVideoInfo = (url: string) => {
    // YouTube patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    
    if (youtubeMatch) {
      return {
        platform: 'youtube',
        id: youtubeMatch[1],
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1`
      };
    }

    // Vimeo patterns
    const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    
    if (vimeoMatch) {
      return {
        platform: 'vimeo',
        id: vimeoMatch[1],
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`
      };
    }

    // Direct video file
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return {
        platform: 'direct',
        id: null,
        embedUrl: url
      };
    }

    return null;
  };

  const videoInfo = getVideoInfo(src);

  if (!videoInfo) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg text-center">
        <p className="text-gray-600">Formato video non supportato</p>
      </div>
    );
  }

  if (videoInfo.platform === 'direct') {
    return (
      <div className={`relative w-full ${className}`}>
        <video
          controls
          className="w-full h-auto rounded-lg"
          preload="metadata"
        >
          <source src={videoInfo.embedUrl} type="video/mp4" />
          Il tuo browser non supporta il tag video.
        </video>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative w-full h-0 pb-[56.25%]"> {/* 16:9 aspect ratio */}
        <iframe
          src={videoInfo.embedUrl}
          title={title}
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default VideoEmbed; 