import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileText, User, Briefcase, History, Bell, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import IAstedInterface from '@/components/iasted/IAstedInterface';

export default function Dashboard() {
  const [qrTimer, setQrTimer] = useState(300); // 5 minutes en secondes

  useEffect(() => {
    const interval = setInterval(() => {
      setQrTimer((prev) => {
        if (prev <= 1) return 300;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-white">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm opacity-90">Bonjour,</p>
              <h2 className="text-lg font-bold">Jean DUPONT</h2>
            </div>
          </div>
          <div className="relative">
            <Bell className="w-6 h-6" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-destructive text-white text-xs">
              3
            </Badge>
          </div>
        </div>
        <Badge className="bg-white/20 text-white border-white/30">
          Citoyen Gabonais
        </Badge>
      </div>

      <div className="p-6 space-y-6">
        {/* Carte d'identité numérique */}
        <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-white shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm opacity-90">République Gabonaise</p>
              <p className="text-lg font-bold">Identité Numérique</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-90">NIP</p>
              <p className="font-mono font-bold">GA241127001</p>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 border-2 border-white">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-lg">Jean DUPONT</p>
                <p className="text-sm opacity-90">15/03/1990</p>
              </div>
            </div>

            {/* QR Code avec timer */}
            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center mb-1">
                <QrCode className="w-16 h-16 text-primary" />
              </div>
              <p className="text-xs opacity-90">{formatTime(qrTimer)}</p>
            </div>
          </div>

          <Button 
            variant="secondary" 
            className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            Afficher en plein écran
          </Button>
        </Card>

        {/* Sections principales en grille */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Mes Documents</p>
                <Badge variant="secondary" className="mt-1">12</Badge>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <User className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="font-semibold">Mon Profil</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="font-semibold">Mon CV</p>
                <Badge variant="secondary" className="mt-1">78%</Badge>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <History className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold">Historique</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="flex items-center justify-around p-4">
          <button className="flex flex-col items-center gap-1 text-primary">
            <div className="w-6 h-6 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
            </div>
            <span className="text-xs font-medium">Accueil</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-muted-foreground">
            <FileText className="w-6 h-6" />
            <span className="text-xs">Documents</span>
          </button>
          <button className="flex flex-col items-center -mt-8">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <QrCode className="w-7 h-7 text-white" />
            </div>
          </button>
          <button className="flex flex-col items-center gap-1 text-muted-foreground">
            <Briefcase className="w-6 h-6" />
            <span className="text-xs">CV</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-muted-foreground">
            <User className="w-6 h-6" />
            <span className="text-xs">Profil</span>
          </button>
        </div>
      </div>

      {/* Agent iAsted adapté pour IDN.GA */}
      <IAstedInterface userRole="citizen" />
    </div>
  );
}
