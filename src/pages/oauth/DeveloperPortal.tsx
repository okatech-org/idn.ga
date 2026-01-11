import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Copy, Eye, EyeOff, Trash2, ExternalLink, Shield, Check, ArrowLeft, Moon, Sun, Code2, Book } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import sceauGabon from '@/assets/sceau_gabon.png';

interface OAuthApp {
  id: string;
  client_id: string;
  client_secret: string;
  client_name: string;
  client_description: string | null;
  client_logo_url: string | null;
  client_website: string | null;
  redirect_uris: string[];
  allowed_scopes: string[];
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

const AVAILABLE_SCOPES = [
  { name: 'openid', label: 'OpenID', required: true, description: 'Identifiant unique' },
  { name: 'profile', label: 'Profil', required: false, description: 'Nom, photo, infos de base' },
  { name: 'nip', label: 'NIP', required: false, description: 'Numéro d\'identification' },
  { name: 'email', label: 'Email', required: false, description: 'Adresse email vérifiée' },
  { name: 'phone', label: 'Téléphone', required: false, description: 'Numéro de téléphone' },
  { name: 'address', label: 'Adresse', required: false, description: 'Adresse postale' },
  { name: 'diplomas', label: 'Diplômes', required: false, description: 'Certifications vérifiées' },
  { name: 'documents', label: 'Documents', required: false, description: 'Accès aux documents' },
  { name: 'biometrics', label: 'Biométrie', required: false, description: 'Données biométriques' },
  { name: 'verify', label: 'Vérification', required: false, description: 'Niveau de vérification' },
];

export default function DeveloperPortal() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [apps, setApps] = useState<OAuthApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [newApp, setNewApp] = useState({
    name: '',
    description: '',
    website: '',
    redirectUris: '',
    scopes: ['openid', 'profile'] as string[],
  });

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('oauth_clients')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApps((data as OAuthApp[]) || []);
    } catch (error) {
      console.error('Error fetching apps:', error);
      toast.error('Erreur lors du chargement des applications');
    } finally {
      setLoading(false);
    }
  };

  const createApp = async () => {
    if (!newApp.name.trim()) {
      toast.error('Le nom de l\'application est requis');
      return;
    }

    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const redirectUris = newApp.redirectUris
        .split('\n')
        .map(uri => uri.trim())
        .filter(uri => uri.length > 0);

      if (redirectUris.length === 0) {
        toast.error('Au moins une URI de redirection est requise');
        setCreating(false);
        return;
      }

      const { data, error } = await supabase
        .from('oauth_clients')
        .insert({
          client_name: newApp.name.trim(),
          client_description: newApp.description.trim() || null,
          client_website: newApp.website.trim() || null,
          redirect_uris: redirectUris,
          allowed_scopes: newApp.scopes,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setApps(prev => [data as OAuthApp, ...prev]);
      setIsCreateOpen(false);
      setNewApp({
        name: '',
        description: '',
        website: '',
        redirectUris: '',
        scopes: ['openid', 'profile'],
      });
      toast.success('Application créée avec succès');
    } catch (error: any) {
      console.error('Error creating app:', error);
      toast.error(error.message || 'Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  };

  const deleteApp = async (appId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette application ?')) return;

    try {
      const { error } = await supabase
        .from('oauth_clients')
        .delete()
        .eq('id', appId);

      if (error) throw error;

      setApps(prev => prev.filter(app => app.id !== appId));
      toast.success('Application supprimée');
    } catch (error) {
      console.error('Error deleting app:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié !`);
  };

  const toggleScope = (scope: string) => {
    if (scope === 'openid') return;
    setNewApp(prev => ({
      ...prev,
      scopes: prev.scopes.includes(scope)
        ? prev.scopes.filter(s => s !== scope)
        : [...prev.scopes, scope],
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <img src={sceauGabon} alt="" className="h-[58px] w-[58px] object-contain" />
              <div>
                <h1 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-primary" />
                  Portail Développeurs
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">IDN.GA OAuth 2.0 / OpenID Connect</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-5 h-5 mr-2" />
                  Nouvelle App
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Créer une Application</DialogTitle>
                  <DialogDescription>
                    Enregistrez votre application pour utiliser l'authentification IDN.GA
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nom de l'application *</label>
                    <Input
                      value={newApp.name}
                      onChange={e => setNewApp(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Mon Application"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                    <Textarea
                      value={newApp.description}
                      onChange={e => setNewApp(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description de votre application..."
                      rows={2}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Site web</label>
                    <Input
                      value={newApp.website}
                      onChange={e => setNewApp(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://monapp.ga"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">URIs de redirection *</label>
                    <Textarea
                      value={newApp.redirectUris}
                      onChange={e => setNewApp(prev => ({ ...prev, redirectUris: e.target.value }))}
                      placeholder="https://monapp.ga/callback"
                      rows={3}
                      className="mt-1"
                    />
                    <p className="text-xs text-slate-500 mt-1">Une URI par ligne</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Scopes autorisés</label>
                    <div className="grid grid-cols-2 gap-2">
                      {AVAILABLE_SCOPES.map(scope => (
                        <label
                          key={scope.name}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors",
                            newApp.scopes.includes(scope.name)
                              ? 'bg-primary/10 border-primary/30 dark:bg-primary/20'
                              : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700',
                            scope.required && 'opacity-75 cursor-not-allowed'
                          )}
                        >
                          <Checkbox
                            checked={newApp.scopes.includes(scope.name)}
                            onCheckedChange={() => toggleScope(scope.name)}
                            disabled={scope.required}
                          />
                          <div>
                            <span className="text-sm font-medium">{scope.label}</span>
                            {scope.required && <Badge variant="secondary" className="ml-2 text-[10px]">Requis</Badge>}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={createApp}
                    disabled={creating}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {creating ? 'Création...' : 'Créer l\'application'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : apps.length === 0 ? (
          <Card className="text-center py-16 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardContent>
              <div className="w-20 h-20 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Aucune application</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Créez votre première application pour intégrer l'authentification IDN.GA à vos services
              </p>
              <Button onClick={() => setIsCreateOpen(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="w-5 h-5 mr-2" />
                Créer une application
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {apps.map(app => (
              <Card key={app.id} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                        {app.client_name}
                        {app.is_verified && (
                          <Badge className="bg-primary/10 text-primary">
                            <Check className="w-3 h-3 mr-1" /> Vérifié
                          </Badge>
                        )}
                        {!app.is_active && (
                          <Badge variant="destructive">Inactif</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{app.client_description}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => deleteApp(app.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Client ID */}
                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Client ID</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg text-sm font-mono">
                        {app.client_id}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(app.client_id, 'Client ID')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Client Secret */}
                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Client Secret</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg text-sm font-mono">
                        {showSecrets[app.id] ? app.client_secret : '••••••••••••••••••••••••••••••••'}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowSecrets(prev => ({ ...prev, [app.id]: !prev[app.id] }))}
                      >
                        {showSecrets[app.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(app.client_secret, 'Client Secret')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Scopes */}
                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Scopes autorisés</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {app.allowed_scopes.map(scope => (
                        <Badge key={scope} variant="secondary" className="dark:bg-slate-700">{scope}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Redirect URIs */}
                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">URIs de redirection</label>
                    <div className="mt-1 space-y-1">
                      {app.redirect_uris.map((uri, idx) => (
                        <code key={idx} className="block bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg text-sm font-mono">
                          {uri}
                        </code>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Documentation Card */}
        <Card className="mt-8 bg-gradient-to-br from-primary/5 to-blue-500/5 dark:from-primary/10 dark:to-blue-500/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="w-5 h-5 text-primary" />
              Documentation d'intégration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                <p className="font-medium text-slate-900 dark:text-white mb-1">Authorization</p>
                <code className="text-xs text-slate-600 dark:text-slate-400">GET /oauth/authorize</code>
              </div>
              <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                <p className="font-medium text-slate-900 dark:text-white mb-1">Token</p>
                <code className="text-xs text-slate-600 dark:text-slate-400">POST /api/oauth-token</code>
              </div>
              <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                <p className="font-medium text-slate-900 dark:text-white mb-1">UserInfo</p>
                <code className="text-xs text-slate-600 dark:text-slate-400">GET /api/oauth-userinfo</code>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Exemple d'URL d'autorisation</p>
              <pre className="bg-slate-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto">
                {`https://idn.ga/oauth/authorize?
  client_id=VOTRE_CLIENT_ID&
  redirect_uri=https://monapp.ga/callback&
  response_type=code&
  scope=openid profile nip&
  state=xyz123`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
