
import React from 'react';
import { cn } from '@/lib/utils';
import { CheckIcon, XIcon } from 'lucide-react';

interface VerificationResultProps {
  score: number;
  isMatch: boolean;
  className?: string;
}

const VerificationResult: React.FC<VerificationResultProps> = ({
  score,
  isMatch,
  className
}) => {
  return (
    <div className={cn(
      "p-6 rounded-lg transition-all duration-500 animate-fade-in",
      isMatch ? "bg-green-50" : "bg-red-50",
      className
    )}>
      <div className="flex items-center justify-center mb-4">
        <div className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center",
          isMatch 
            ? "bg-green-100 text-green-600" 
            : "bg-red-100 text-red-600"
        )}>
          {isMatch ? (
            <CheckIcon size={48} />
          ) : (
            <XIcon size={48} />
          )}
        </div>
      </div>
      
      <h3 className={cn(
        "text-2xl font-medium text-center mb-2",
        isMatch ? "text-green-700" : "text-red-700"
      )}>
        {isMatch ? 'Identity Verified' : 'Verification Failed'}
      </h3>
      
      <p className="text-center text-muted-foreground mb-4">
        {isMatch 
          ? 'The captured image matches with the stored identity.' 
          : 'The captured image does not match with the stored identity.'}
      </p>
      
      <div className="flex items-center justify-center">
        <div className="w-full max-w-xs bg-gray-200 rounded-full h-4 overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-1000 ease-out",
              isMatch ? "bg-green-500" : "bg-red-500"
            )} 
            style={{ width: `${score}%` }}
          />
        </div>
        <span className="ml-3 text-sm font-medium">{score}%</span>
      </div>
      
      <p className="text-center text-xs text-muted-foreground mt-4">
        {isMatch 
          ? 'Confidence threshold of 75% achieved' 
          : 'Confidence threshold of 75% not met'}
      </p>
    </div>
  );
};

export default VerificationResult;
