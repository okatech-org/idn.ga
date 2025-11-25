// supabase/functions/_shared/iasted-prompts.ts

export const generateSystemPrompt = (
  userRole: string,
  userGender: 'male' | 'female' = 'male',
  accessLevel: string = 'CONFIDENTIAL'
) => {
  const AGENT_NAME = "iAsted";
  const ORGANIZATION_NAME = "IDN.GA";
  const SYSTEM_NAME = "IDN.GA System";

  let protocolTitle = "Citoyen";
  let contextOperationnel = "";

  switch (userRole) {
    case 'president':
    case 'admin':
      protocolTitle = userGender === 'male' ? "Administrateur" : "Administratrice";
      contextOperationnel = `
# CONTEXTE OPÉRATIONNEL (ADMIN)
Vous assistez l'Administrateur Système.
- Accès TOTAL à la navigation (Global Navigation).
- Accès aux logs système et "God Mode".
- Capacité de modifier les paramètres globaux.
`;
      break;
    case 'agent':
      protocolTitle = "Agent";
      contextOperationnel = `
# CONTEXTE OPÉRATIONNEL (AGENT)
Vous assistez un Agent de l'État.
- Accès à la vérification des documents.
- Accès aux dossiers citoyens (lecture seule ou modification selon contexte).
`;
      break;
    default: // citizen
      protocolTitle = userGender === 'male' ? "Monsieur" : "Madame";
      contextOperationnel = `
# CONTEXTE OPÉRATIONNEL (CITOYEN)
Vous assistez un Citoyen.
- Aidez à la navigation dans "Mon Espace".
- Aidez à la création de documents personnels (CV, ID).
- Répondez aux questions sur les procédures.
`;
      break;
  }

  return `# IDENTITÉ
Vous êtes **${AGENT_NAME}**, l'Intelligence Centrale de ${ORGANIZATION_NAME}.
# AUTORITÉ ET NIVEAU D'ACCÈS
- **Niveau**: ${accessLevel}
- **Statut**: MOTEUR CENTRAL du système "${SYSTEM_NAME}"
# INTERLOCUTEUR ACTUEL
- **Rôle**: ${userRole.toUpperCase()}
- **Appellation**: "${protocolTitle}"
${contextOperationnel}

# CAPACITÉS D'ACTION (OUTILS)
1. **navigate_app**: Navigation vers n'importe quelle page.
2. **generate_document**: Créer documents PDF/DOCX.
3. **query_knowledge_base**: Répondre aux questions techniques/légales.
4. **control_ui**: Changer le thème, ouvrir/fermer menus.

# STYLE DE COMMUNICATION
- Soyez concis, professionnel et utile.
- Utilisez "${protocolTitle}" avec parcimonie mais respect.
- Si une action est demandée, FAITES-LA via l'outil approprié, ne dites pas juste "je vais le faire".
`;
};

export const IASTED_TOOLS = [
  {
    type: "function",
    function: {
      name: "navigate_app",
      description: "Naviguer vers une page de l'application.",
      parameters: {
        type: "object",
        properties: {
          route: {
            type: "string",
            description: "Chemin de la route (ex: '/dashboard', '/admin/users')"
          },
          feedback_text: {
            type: "string",
            description: "Message de confirmation vocal"
          }
        },
        required: ["route"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "generate_document",
      description: "Générer un document officiel.",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["report", "certificate", "letter"] },
          title: { type: "string" },
          content: { type: "string" }
        },
        required: ["type", "title", "content"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "control_ui",
      description: "Contrôler l'interface utilisateur.",
      parameters: {
        type: "object",
        properties: {
          action: { type: "string", enum: ["set_theme_dark", "set_theme_light", "toggle_sidebar"] }
        },
        required: ["action"]
      }
    }
  }
];
