import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const FloatingContactButton = () => {
  const messengerLink = "https://www.facebook.com/people/AB-Gadgets/100092730792089/";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={messengerLink}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-20 right-4 z-50 bg-gradient-to-br from-orange-500 to-yellow-400 text-white p-3 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl md:bottom-8"
          aria-label="Message us on Facebook"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
      </TooltipTrigger>
      <TooltipContent>
        <p>Message us on Facebook</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default FloatingContactButton; 