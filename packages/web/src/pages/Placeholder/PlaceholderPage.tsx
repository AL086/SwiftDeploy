import React from 'react';

interface PlaceholderPageProps {
  message: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ message }) => {
  const displayText = message.includes('\n') ? message : `${message}\n\n功能开发中...`;

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#495057',
        fontSize: 16,
        textAlign: 'center',
        whiteSpace: 'pre-line',
        lineHeight: 1.8,
      }}
    >
      {displayText}
    </div>
  );
};

export default PlaceholderPage;
