import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flag, Home, Plane } from 'lucide-react';

type ProfileType = 'citizen' | 'resident' | 'tourist' | null;

export default function Onboarding() {
  const navigate = useNavigate();
  const [selectedProfile, setSelectedProfile] = useState<ProfileType>(null);
  const [showDetails, setShowDetails] = useState<ProfileType>(null);

  const profiles = [
    {
      type: 'citizen' as ProfileType,
      icon: Flag,
      title: 'Citoyen Gabonais',
      emoji: '🇬🇦',
      documents: ['Carte Nationale d\'Identité', 'Acte de naissance'],
      color: 'from-primary to-primary/80'
    },
    {
      type: 'resident' as ProfileType,
      icon: Home,
      title: 'Résident au Gabon',
      emoji: '🏠',
      documents: ['Carte de séjour', 'Passeport', 'Justificatif de domicile'],
      color: 'from-accent to-accent/80'
    },
    {
      type: 'tourist' as ProfileType,
      icon: Plane,
      title: 'Touriste/Visiteur',
      emoji: '✈️',
      documents: ['Passeport', 'Visa touristique'],
      color: 'from-secondary to-secondary/80'
    }
  ];

  const handleContinue = () => {
    if (selectedProfile) {
      navigate('/kyc-verify');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 pt-8">
          <h1 className="text-3xl font-bold text-foreground">
            Choisissez votre profil
          </h1>
          <p className="text-muted-foreground">
            Sélectionnez le type de profil qui vous correspond
          </p>
        </div>

        {/* Cartes de profil */}
        <div className="grid gap-4 pt-6">
          {profiles.map((profile) => (
            <Card
              key={profile.type}
              className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedProfile === profile.type 
                  ? 'ring-2 ring-primary shadow-lg scale-[1.02]' 
                  : 'hover:scale-[1.01]'
              }`}
              onClick={() => setSelectedProfile(profile.type)}
              onMouseEnter={() => setShowDetails(profile.type)}
              onMouseLeave={() => setShowDetails(null)}
            >
              <div className="flex items-center gap-4">
                {/* Icône avec gradient */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${profile.color} flex items-center justify-center text-3xl shadow-md`}>
                  {profile.emoji}
                </div>

                {/* Contenu */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground">
                    {profile.title}
                  </h3>
                  
                  {/* Documents requis */}
                  {(showDetails === profile.type || selectedProfile === profile.type) && (
                    <div className="mt-2 space-y-1 animate-fade-in">
                      <p className="text-sm text-muted-foreground font-medium">
                        Documents requis :
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-0.5">
                        {profile.documents.map((doc, idx) => (
                          <li key={idx}>• {doc}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Indicateur de sélection */}
                {selectedProfile === profile.type && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Bouton de continuation */}
        <div className="pt-6">
          <Button
            onClick={handleContinue}
            disabled={!selectedProfile}
            className="w-full py-6 text-lg font-semibold rounded-xl"
            size="lg"
          >
            Continuer
          </Button>
        </div>

        {/* Barre de progression */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <div className="w-8 h-1 bg-primary rounded-full"></div>
          <div className="w-8 h-1 bg-muted rounded-full"></div>
          <div className="w-8 h-1 bg-muted rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
