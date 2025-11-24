import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Flag } from 'lucide-react';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    // Animation d'entrée
    const timer = setTimeout(() => {
      document.getElementById('splash-content')?.classList.add('animate-fade-in');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-accent to-primary flex flex-col items-center justify-center p-6">
      <div id="splash-content" className="text-center space-y-8 opacity-0 transition-opacity duration-1000">
        {/* Logo IDN.GA */}
        <div className="relative">
          <div className="w-32 h-32 mx-auto bg-white rounded-3xl shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
            <Flag className="w-16 h-16 text-primary" />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-secondary text-foreground px-4 py-1 rounded-full text-sm font-bold shadow-lg">
            IDN.GA
          </div>
        </div>

        {/* Titre et slogan */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-white">
            Identité Numérique
          </h1>
          <p className="text-xl text-white/90 font-light">
            Votre identité, partout avec vous
          </p>
        </div>

        {/* République Gabonaise */}
        <div className="text-white/80 text-sm">
          République Gabonaise
        </div>

        {/* Bouton de démarrage */}
        <div className="pt-8">
          <Button 
            size="lg"
            onClick={() => navigate('/onboarding')}
            className="bg-white text-primary hover:bg-white/90 font-semibold px-12 py-6 text-lg rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Commencer
          </Button>
        </div>

        {/* Version */}
        <div className="pt-12 text-white/60 text-xs">
          Version 1.0.0
        </div>
      </div>
    </div>
  );
}
