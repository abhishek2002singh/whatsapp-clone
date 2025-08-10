import React from 'react';
import { Lock } from 'lucide-react';

const MessageArea = () => {
  return (
    <div className="flex-1 bg-[rgb(247,245,243)] flex flex-col items-center justify-center p-8">
      {/* Main illustration/image */}
      <div className="mb-8">
        <img 
          src="https://static.whatsapp.net/rsrc.php/v4/y6/r/wa669aeJeom.png" 
          alt="WhatsApp Web"
          className="w-80 h-auto"
        />
      </div>
      
      {/* Main heading */}
      <h1 className="text-3xl font-light text-[#41525d] mb-6 text-center">
        Download WhatsApp for Windows
      </h1>
      
      {/* Description text */}
      <p className="text-[#667781] text-center mb-8 max-w-md leading-relaxed">
        Make calls, share your screen and get a faster experience when you download the Windows app.
      </p>
      
      {/* Download button */}
      <button className="bg-[#00a884] hover:bg-[#008069] text-white px-8 py-3 rounded-full font-medium text-sm transition-colors duration-200">
        Download
      </button>
      
      {/* Bottom privacy notice */}
      <div className="absolute bottom-8 flex items-center text-[#8696a0] text-sm">
        <Lock className="w-4 h-4 mr-2" />
        <span>Your personal messages are end-to-end encrypted</span>
      </div>
    </div>
  );
};

export default MessageArea;