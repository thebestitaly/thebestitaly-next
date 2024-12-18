import React from 'react';

interface ShareButtonsProps {
  url: string;
  title: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ url, title }) => {
  const socialPlatforms = [
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      className: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Twitter',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      className: 'bg-sky-500 hover:bg-sky-600'
    },
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
      className: 'bg-blue-700 hover:bg-blue-800'
    },
    {
      name: 'WhatsApp',
      url: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      className: 'bg-green-600 hover:bg-green-700'
    }
  ];

  return (
    <div className="flex flex-wrap gap-4">
      {socialPlatforms.map(platform => (
        <a
          key={platform.name}
          href={platform.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${platform.className} text-white px-4 py-2 rounded-lg transition-colors`}
        >
          Share on {platform.name}
        </a>
      ))}
    </div>
  );
};

export default ShareButtons;