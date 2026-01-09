import React, { useState } from 'react';
import { Shield, Check, X, AlertTriangle, Building2, GraduationCap, FileText, User, Mail, Phone, MapPin, Fingerprint, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface ScopeDefinition {
  scope_name: string;
  display_name: string;
  description: string;
  category: string;
  is_sensitive: boolean;
  requires_verification: boolean;
}

interface OAuthClient {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  website: string;
  is_verified: boolean;
}

interface OAuthConsentScreenProps {
  client: OAuthClient;
  scopes: ScopeDefinition[];
  onApprove: (selectedScopes: string[]) => void;
  onDeny: () => void;
  isLoading?: boolean;
}

const scopeIcons: Record<string, React.ReactNode> = {
  openid: <Shield className="w-5 h-5" />,
  profile: <User className="w-5 h-5" />,
  nip: <BadgeCheck className="w-5 h-5" />,
  email: <Mail className="w-5 h-5" />,
  phone: <Phone className="w-5 h-5" />,
  address: <MapPin className="w-5 h-5" />,
  diplomas: <GraduationCap className="w-5 h-5" />,
  documents: <FileText className="w-5 h-5" />,
  biometrics: <Fingerprint className="w-5 h-5" />,
  verify: <BadgeCheck className="w-5 h-5" />,
};

export const OAuthConsentScreen: React.FC<OAuthConsentScreenProps> = ({
  client,
  scopes,
  onApprove,
  onDeny,
  isLoading = false,
}) => {
  const [selectedScopes, setSelectedScopes] = useState<Set<string>>(
    new Set(scopes.filter(s => !s.is_sensitive).map(s => s.scope_name))
  );

  const toggleScope = (scopeName: string) => {
    const newSelected = new Set(selectedScopes);
    if (newSelected.has(scopeName)) {
      // Can't unselect openid
      if (scopeName !== 'openid') {
        newSelected.delete(scopeName);
      }
    } else {
      newSelected.add(scopeName);
    }
    setSelectedScopes(newSelected);
  };

  const handleApprove = () => {
    onApprove(Array.from(selectedScopes));
  };

  const categorizedScopes = {
    identity: scopes.filter(s => s.category === 'identity'),
    contact: scopes.filter(s => s.category === 'contact'),
    documents: scopes.filter(s => s.category === 'documents'),
    security: scopes.filter(s => s.category === 'security'),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 via-emerald-800 to-yellow-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-emerald-700">IDN</span>
            </div>
          </div>
          <h1 className="text-xl font-bold">IDN.GA</h1>
          <p className="text-emerald-100 text-sm">Identité Numérique du Gabon</p>
        </div>

        {/* Client Info */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
              {client.logo_url ? (
                <img src={client.logo_url} alt={client.name} className="w-10 h-10 object-contain" />
              ) : (
                <Building2 className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-gray-900">{client.name}</h2>
                {client.is_verified && (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs">
                    <Check className="w-3 h-3 mr-1" /> Vérifié
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500">{client.description}</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>{client.name}</strong> souhaite accéder à votre identité IDN.GA
            </p>
          </div>
        </div>

        {/* Permissions */}
        <div className="p-6 max-h-[400px] overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Permissions demandées
          </h3>

          <div className="space-y-4">
            {Object.entries(categorizedScopes).map(([category, categoryScopes]) => {
              if (categoryScopes.length === 0) return null;
              
              return (
                <div key={category} className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-400 uppercase">
                    {category === 'identity' && 'Identité'}
                    {category === 'contact' && 'Contact'}
                    {category === 'documents' && 'Documents'}
                    {category === 'security' && 'Sécurité'}
                  </h4>
                  {categoryScopes.map((scope) => (
                    <label
                      key={scope.scope_name}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedScopes.has(scope.scope_name)
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      } ${scope.scope_name === 'openid' ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                      <Checkbox
                        checked={selectedScopes.has(scope.scope_name)}
                        onCheckedChange={() => toggleScope(scope.scope_name)}
                        disabled={scope.scope_name === 'openid'}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-600">
                            {scopeIcons[scope.scope_name] || <Shield className="w-5 h-5" />}
                          </span>
                          <span className="font-medium text-gray-900">{scope.display_name}</span>
                          {scope.is_sensitive && (
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{scope.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 border-t space-y-3">
          <Button
            onClick={handleApprove}
            disabled={isLoading || selectedScopes.size === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Autorisation...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                Autoriser
              </span>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={onDeny}
            disabled={isLoading}
            className="w-full h-12 border-gray-300"
          >
            <X className="w-5 h-5 mr-2" />
            Refuser
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            Vous pourrez révoquer cet accès à tout moment depuis vos paramètres IDN.GA
          </p>
        </div>
      </div>
    </div>
  );
};
