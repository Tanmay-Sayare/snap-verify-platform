
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import CameraCapture from '@/components/CameraCapture';
import IdentityCard from '@/components/IdentityCard';
import VerificationResult from '@/components/VerificationResult';
import { 
  saveIdentity, 
  getIdentities, 
  IdentityData,
  deleteIdentity
} from '@/services/storageService';
import { compareImages, isMatch } from '@/services/imageComparisonService';
import { ChevronRightIcon, ArrowLeftIcon, UserPlusIcon, UserCheckIcon, BadgeCheckIcon } from 'lucide-react';

// App steps
type AppStep = 'welcome' | 'register' | 'verify' | 'select-identity' | 'comparing' | 'result';

const Index = () => {
  const [step, setStep] = useState<AppStep>('welcome');
  const [identities, setIdentities] = useState<IdentityData[]>([]);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [selectedIdentity, setSelectedIdentity] = useState<IdentityData | null>(null);
  const [verificationScore, setVerificationScore] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>('');

  // Load identities on initial render
  useEffect(() => {
    const storedIdentities = getIdentities();
    setIdentities(storedIdentities);
  }, []);

  // Handle registration photo capture
  const handleRegistrationCapture = (photoDataUrl: string) => {
    setCapturedPhoto(photoDataUrl);
  };

  // Save new identity
  const handleSaveIdentity = () => {
    if (!capturedPhoto) return;
    
    try {
      const newIdentity: IdentityData = {
        id: uuidv4(),
        name: userName.trim() || undefined,
        photoDataUrl: capturedPhoto,
        createdAt: Date.now()
      };
      
      saveIdentity(newIdentity);
      setIdentities(prev => [...prev, newIdentity]);
      
      toast.success('Identity saved successfully');
      
      // Reset and go back to welcome
      setCapturedPhoto(null);
      setUserName('');
      setStep('welcome');
    } catch (error) {
      console.error('Error saving identity:', error);
      toast.error('Failed to save identity');
    }
  };

  // Handle verification photo capture
  const handleVerificationCapture = async (photoDataUrl: string) => {
    if (!selectedIdentity) return;
    
    setCapturedPhoto(photoDataUrl);
    setStep('comparing');
    
    try {
      // Compare the images
      const score = await compareImages(
        selectedIdentity.photoDataUrl,
        photoDataUrl
      );
      
      setVerificationScore(score);
      setStep('result');
    } catch (error) {
      console.error('Error during verification:', error);
      toast.error('Verification failed');
      setStep('select-identity');
    }
  };

  // Handle identity deletion
  const handleDeleteIdentity = (id: string) => {
    try {
      const success = deleteIdentity(id);
      if (success) {
        setIdentities(prev => prev.filter(identity => identity.id !== id));
        toast.success('Identity deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting identity:', error);
      toast.error('Failed to delete identity');
    }
  };

  // Reset to welcome step
  const handleReset = () => {
    setStep('welcome');
    setCapturedPhoto(null);
    setSelectedIdentity(null);
    setVerificationScore(null);
  };

  // Go back to previous step
  const handleBack = () => {
    switch (step) {
      case 'register':
      case 'verify':
        setStep('welcome');
        break;
      case 'select-identity':
        setStep('verify');
        break;
      case 'result':
        setStep('select-identity');
        setVerificationScore(null);
        setCapturedPhoto(null);
        break;
      default:
        setStep('welcome');
    }
  };

  // Render app content based on current step
  const renderContent = () => {
    switch (step) {
      case 'welcome':
        return (
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold mb-8 text-balance">Identity Verification Platform</h1>
            
            <div className="flex flex-col md:flex-row gap-6">
              <button 
                onClick={() => setStep('register')}
                className="glass-card p-8 rounded-xl flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <UserPlusIcon size={32} className="text-primary" />
                </div>
                <h2 className="text-xl font-medium mb-2">Register New Identity</h2>
                <p className="text-muted-foreground">Capture and store a new identity photo</p>
                <ChevronRightIcon className="mt-4 text-primary" />
              </button>
              
              <button 
                onClick={() => {
                  if (identities.length === 0) {
                    toast.info('Please register an identity first');
                    return;
                  }
                  setStep('verify');
                }}
                className="glass-card p-8 rounded-xl flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <UserCheckIcon size={32} className="text-green-600" />
                </div>
                <h2 className="text-xl font-medium mb-2">Verify Identity</h2>
                <p className="text-muted-foreground">Compare a live photo with a stored identity</p>
                <ChevronRightIcon className="mt-4 text-primary" />
              </button>
            </div>
            
            {identities.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl font-medium mb-4">Stored Identities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {identities.map(identity => (
                    <IdentityCard 
                      key={identity.id} 
                      identity={identity}
                      onClick={() => {
                        setSelectedIdentity(identity);
                        setStep('select-identity');
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'register':
        return (
          <div className="animate-fade-in">
            <div className="mb-6 flex items-center">
              <button 
                onClick={handleBack}
                className="mr-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeftIcon size={20} />
              </button>
              <h2 className="text-2xl font-medium">Register New Identity</h2>
            </div>
            
            {!capturedPhoto ? (
              <>
                <p className="mb-6 text-muted-foreground">
                  Position your face in the frame and click the button to capture.
                </p>
                <div className="max-w-lg mx-auto rounded-xl overflow-hidden shadow-xl">
                  <CameraCapture 
                    onCapture={handleRegistrationCapture} 
                    showCountdown={true}
                  />
                </div>
              </>
            ) : (
              <div className="animate-fade-in">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-full max-w-md">
                    <div className="glass-card p-4 rounded-xl mb-4">
                      <img 
                        src={capturedPhoto} 
                        alt="Captured photo" 
                        className="w-full rounded-lg"
                      />
                    </div>
                    <button 
                      onClick={() => setCapturedPhoto(null)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Retake photo
                    </button>
                  </div>
                  
                  <div className="w-full">
                    <div className="glass-card p-6 rounded-xl">
                      <h3 className="text-xl font-medium mb-4">Save Identity</h3>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="Enter name"
                          className="w-full p-2 rounded-md border border-input bg-background"
                        />
                      </div>
                      
                      <button
                        onClick={handleSaveIdentity}
                        className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
                      >
                        Save Identity
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'verify':
        return (
          <div className="animate-fade-in">
            <div className="mb-6 flex items-center">
              <button 
                onClick={handleBack}
                className="mr-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeftIcon size={20} />
              </button>
              <h2 className="text-2xl font-medium">Verify Identity</h2>
            </div>
            
            <p className="mb-6 text-muted-foreground">
              Select an identity to verify against:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {identities.map(identity => (
                <IdentityCard 
                  key={identity.id} 
                  identity={identity} 
                  onClick={() => {
                    setSelectedIdentity(identity);
                    setStep('select-identity');
                  }}
                />
              ))}
            </div>
          </div>
        );
      
      case 'select-identity':
        return (
          <div className="animate-fade-in">
            <div className="mb-6 flex items-center">
              <button 
                onClick={handleBack}
                className="mr-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeftIcon size={20} />
              </button>
              <h2 className="text-2xl font-medium">Verify Against Selected Identity</h2>
            </div>
            
            {selectedIdentity && (
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-1/3">
                  <h3 className="text-xl font-medium mb-4">Selected Identity</h3>
                  <IdentityCard 
                    identity={selectedIdentity} 
                    isHighlighted={true}
                  />
                  <button 
                    onClick={() => handleDeleteIdentity(selectedIdentity.id)}
                    className="mt-2 text-sm text-red-500 hover:text-red-700 transition-colors"
                  >
                    Delete this identity
                  </button>
                </div>
                
                <div className="w-full md:w-2/3">
                  <h3 className="text-xl font-medium mb-4">Capture Verification Photo</h3>
                  <p className="mb-6 text-muted-foreground">
                    Position your face in the frame and click the button to capture.
                  </p>
                  <div className="max-w-lg rounded-xl overflow-hidden shadow-xl">
                    <CameraCapture 
                      onCapture={handleVerificationCapture} 
                      showCountdown={true}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'comparing':
        return (
          <div className="h-[60vh] flex flex-col items-center justify-center animate-fade-in">
            <div className="w-20 h-20 rounded-full border-4 border-primary border-t-transparent animate-spin mb-6"></div>
            <h2 className="text-2xl font-medium mb-2">Comparing Images</h2>
            <p className="text-muted-foreground">Please wait while we analyze the photos...</p>
          </div>
        );
      
      case 'result':
        if (verificationScore === null || !selectedIdentity || !capturedPhoto) {
          return null;
        }
        
        const matchResult = isMatch(verificationScore);
        
        return (
          <div className="animate-fade-in">
            <div className="mb-6 flex items-center">
              <button 
                onClick={handleBack}
                className="mr-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeftIcon size={20} />
              </button>
              <h2 className="text-2xl font-medium">Verification Result</h2>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3 space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Stored Identity</h3>
                  <div className="glass-card p-2 rounded-xl">
                    <img 
                      src={selectedIdentity.photoDataUrl} 
                      alt="Stored identity" 
                      className="w-full rounded-lg"
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Verification Photo</h3>
                  <div className="glass-card p-2 rounded-xl">
                    <img 
                      src={capturedPhoto} 
                      alt="Verification photo" 
                      className="w-full rounded-lg"
                    />
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-2/3">
                <VerificationResult 
                  score={verificationScore} 
                  isMatch={matchResult}
                  className="glass-card"
                />
                
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleReset}
                    className="bg-primary text-primary-foreground py-2 px-6 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
                  >
                    <BadgeCheckIcon size={20} />
                    Complete Verification
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/50">
      <main className="flex-1 container max-w-6xl py-8 md:py-12">
        {renderContent()}
      </main>
      
      <footer className="py-6 border-t border-border">
        <div className="container max-w-6xl text-center text-sm text-muted-foreground">
          <p>Identity Verification Platform &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
