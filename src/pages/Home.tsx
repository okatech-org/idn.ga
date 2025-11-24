import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Flag, Shield, Smartphone, Zap, FileCheck, Globe, Lock, CheckCircle } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: 'Sécurité Maximale',
      description: 'Vos données sont protégées par un chiffrement de niveau bancaire'
    },
    {
      icon: Smartphone,
      title: 'Accessible Partout',
      description: 'Votre identité numérique toujours avec vous, sur tous vos appareils'
    },
    {
      icon: Zap,
      title: 'Authentification Rapide',
      description: 'Connectez-vous en quelques secondes sur tous les services publics'
    },
    {
      icon: FileCheck,
      title: 'Documents Centralisés',
      description: 'Tous vos documents officiels au même endroit'
    },
    {
      icon: Globe,
      title: 'API Universelle',
      description: 'Compatible avec tous les services publics et privés du Gabon'
    },
    {
      icon: Lock,
      title: 'Conforme RGPD',
      description: 'Protection complète de vos données personnelles'
    }
  ];

  const useCases = [
    'Impôts et taxes en ligne',
    'Dossiers médicaux',
    'Inscriptions scolaires',
    'Services bancaires',
    'Démarches administratives',
    'Permis de conduire'
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary opacity-95"></div>
        
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 text-center text-white">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
              <Flag className="w-10 h-10 text-primary" />
            </div>
          </div>

          {/* Badge */}
          <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            🇬🇦 Propulsé par la République Gabonaise
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            IDN.GA
          </h1>
          <p className="text-2xl md:text-3xl mb-4 font-light">
            Identité Numérique Gabon
          </p>
          <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-3xl mx-auto">
            Votre identité, partout avec vous. Une seule identité pour tous vos services.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-6 text-lg rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Créer mon compte
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/auth')}
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-6 text-lg rounded-xl"
            >
              Se connecter
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
            <div>
              <p className="text-4xl font-bold mb-2">50K+</p>
              <p className="text-sm opacity-90">Utilisateurs actifs</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">100+</p>
              <p className="text-sm opacity-90">Services partenaires</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">99.9%</p>
              <p className="text-sm opacity-90">Disponibilité</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Une solution complète pour votre identité numérique
          </h2>
          <p className="text-xl text-muted-foreground">
            Simplifiez votre vie avec une seule identité sécurisée
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <Card key={idx} className="p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Utilisez IDN.GA partout
            </h2>
            <p className="text-xl text-muted-foreground">
              Une seule connexion pour accéder à tous vos services
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {useCases.map((useCase, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                <span className="font-medium">{useCase}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-lg text-muted-foreground mb-6">
              Et bien plus encore...
            </p>
            <Button 
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-primary to-accent text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Commencer gratuitement
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-xl text-muted-foreground">
            Simple, rapide et sécurisé
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
              1
            </div>
            <h3 className="text-xl font-semibold mb-2">Inscrivez-vous</h3>
            <p className="text-muted-foreground">
              Créez votre compte en quelques minutes avec vos documents officiels
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
              2
            </div>
            <h3 className="text-xl font-semibold mb-2">Vérifiez votre identité</h3>
            <p className="text-muted-foreground">
              Validation sécurisée en 24-48h par nos équipes
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
              3
            </div>
            <h3 className="text-xl font-semibold mb-2">Utilisez votre IDN</h3>
            <p className="text-muted-foreground">
              Connectez-vous partout avec une seule identité numérique
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-6 bg-muted/20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Flag className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground mb-2">
            © 2024 IDN.GA - République Gabonaise
          </p>
          <p className="text-sm text-muted-foreground">
            Une initiative du Gouvernement Gabonais pour la transformation numérique
          </p>
        </div>
      </footer>
    </div>
  );
}
