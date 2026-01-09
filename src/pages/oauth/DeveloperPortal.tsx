import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Copy, Eye, EyeOff, Trash2, ExternalLink, Shield, Check } from 'lucide-react';
import { toast } from 'sonner';

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

interface ScopeDefinition {
  scope_name: string;
  display_name: string;
  description: string;
  category: string;
  is_sensitive: boolean;
}

const AVAILABLE_SCOPES = [
  { name: 'openid', label: 'OpenID', required: true },
  { name: 'profile', label: 'Profil', required: false },
  { name: 'nip', label: 'NIP', required: false },
  { name: 'email', label: 'Email', required: false },
  { name: 'phone', label: 'Téléphone', required: false },
  { name: 'address', label: 'Adresse', required: false },
  { name: 'diplomas', label: 'Diplômes', required: false },
  { name: 'documents', label: 'Documents', required: false },
  { name: 'biometrics', label: 'Biométrie', required: false },
  { name: 'verify', label: 'Vérification', required: false },
];

export default function DeveloperPortal() {
  const [apps, setApps] = useState<OAuthApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
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
    if (scope === 'openid') return; // Required
    setNewApp(prev => ({
      ...prev,
      scopes: prev.scopes.includes(scope)
        ? prev.scopes.filter(s => s !== scope)
        : [...prev.scopes, scope],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className="w-8 h-8 text-emerald-600" />
              Portail Développeurs IDN.GA
            </h1>
            <p className="text-gray-600 mt-1">
              Créez et gérez vos applications OAuth 2.0
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-5 h-5 mr-2" />
                Nouvelle Application
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
                  <label className="text-sm font-medium text-gray-700">Nom de l'application *</label>
                  <Input
                    value={newApp.name}
                    onChange={e => setNewApp(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Mon Application"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <Textarea
                    value={newApp.description}
                    onChange={e => setNewApp(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description de votre application..."
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Site web</label>
                  <Input
                    value={newApp.website}
                    onChange={e => setNewApp(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://monapp.ga"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">URIs de redirection *</label>
                  <Textarea
                    value={newApp.redirectUris}
                    onChange={e => setNewApp(prev => ({ ...prev, redirectUris: e.target.value }))}
                    placeholder="https://monapp.ga/callback&#10;https://monapp.ga/auth/callback"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">Une URI par ligne</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Scopes autorisés</label>
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_SCOPES.map(scope => (
                      <label
                        key={scope.name}
                        className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${
                          newApp.scopes.includes(scope.name)
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-gray-50 border-gray-200'
                        } ${scope.required ? 'opacity-75 cursor-not-allowed' : ''}`}
                      >
                        <Checkbox
                          checked={newApp.scopes.includes(scope.name)}
                          onCheckedChange={() => toggleScope(scope.name)}
                          disabled={scope.required}
                        />
                        <span className="text-sm">{scope.label}</span>
                        {scope.required && <Badge variant="secondary" className="text-xs">Requis</Badge>}
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={createApp}
                  disabled={creating}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {creating ? 'Création...' : 'Créer l\'application'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Apps List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : apps.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune application</h3>
              <p className="text-gray-500 mb-4">
                Créez votre première application pour intégrer l'authentification IDN.GA
              </p>
              <Button onClick={() => setIsCreateOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-5 h-5 mr-2" />
                Créer une application
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {apps.map(app => (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {app.client_name}
                        {app.is_verified && (
                          <Badge className="bg-emerald-100 text-emerald-700">
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
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => deleteApp(app.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Client ID */}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Client ID</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono">
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
                    <label className="text-sm font-medium text-gray-500">Client Secret</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono">
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

                  {/* Redirect URIs */}
                  <div>
                    <label className="text-sm font-medium text-gray-500">URIs de redirection</label>
                    <div className="mt-1 space-y-1">
                      {app.redirect_uris.map((uri, idx) => (
                        <code key={idx} className="block bg-gray-100 px-3 py-1.5 rounded text-sm font-mono">
                          {uri}
                        </code>
                      ))}
                    </div>
                  </div>

                  {/* Scopes */}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Scopes autorisés</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {app.allowed_scopes.map(scope => (
                        <Badge key={scope} variant="secondary">{scope}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Website */}
                  {app.client_website && (
                    <div>
                      <a
                        href={app.client_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-emerald-600 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {app.client_website}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Documentation */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Documentation d'intégration</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <h4>Endpoints OAuth 2.0</h4>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="font-medium py-2">Authorization</td>
                  <td><code>GET /oauth/authorize</code></td>
                </tr>
                <tr>
                  <td className="font-medium py-2">Token</td>
                  <td><code>POST /api/oauth-token</code></td>
                </tr>
                <tr>
                  <td className="font-medium py-2">UserInfo</td>
                  <td><code>GET /api/oauth-userinfo</code></td>
                </tr>
              </tbody>
            </table>

            <h4 className="mt-6">Exemple d'URL d'autorisation</h4>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`https://idn.ga/oauth/authorize?
  client_id=VOTRE_CLIENT_ID&
  redirect_uri=https://monapp.ga/callback&
  response_type=code&
  scope=openid profile nip&
  state=xyz123`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
