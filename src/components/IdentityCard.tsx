
import React from 'react';
import { IdentityData } from '@/services/storageService';
import { cn } from '@/lib/utils';

interface IdentityCardProps {
  identity: IdentityData;
  showDetails?: boolean;
  isHighlighted?: boolean;
  onClick?: () => void;
  className?: string;
}

const IdentityCard: React.FC<IdentityCardProps> = ({
  identity,
  showDetails = true,
  isHighlighted = false,
  onClick,
  className
}) => {
  const formattedDate = new Date(identity.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div 
      className={cn(
        "glass-card rounded-xl overflow-hidden transition-all duration-300 ease-out",
        isHighlighted ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img 
          src={identity.photoDataUrl} 
          alt={identity.name || 'Stored identity'} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]"
        />
        {showDetails && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
            <div className="text-xs uppercase tracking-wide opacity-80">ID: {identity.id.substring(0, 8)}</div>
          </div>
        )}
      </div>
      
      {showDetails && (
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-lg">{identity.name || 'Unnamed Identity'}</h3>
              <p className="text-sm text-muted-foreground">Created {formattedDate}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdentityCard;
