# Architecture de l'Agent iDN (IDN.GA)

## Vue d'ensemble

L'agent **iDN** est l'adaptation de l'agent **iAsted** (mairie.ga) pour le portail d'Identité Numérique du Gabon (IDN.GA). Il utilise une architecture neuro-hexagonale inspirée du cerveau humain.

## Architecture Neuro-Hexagonale

```
┌─────────────────────────────────────────────────────────────┐
│                     CONSCIOUSNESS                            │
│  (L'Âme de l'Agent - Le Ghost in the Machine)               │
│                                                              │
│  ┌─────────────┐  ┌────────────────────┐  ┌───────────────┐ │
│  │  iDNSoul    │  │ IntentProcessor    │  │ ContextMemory │ │
│  │  (L'Âme)    │  │ (Lobe Frontal)     │  │ (Mémoire)     │ │
│  └─────────────┘  └────────────────────┘  └───────────────┘ │
│                                                              │
│  ┌──────────────────────┐  ┌────────────────────────────┐   │
│  │ SocialProtocolAdapter│  │ MotorCortex                │   │
│  │ (Protocole Gabonais) │  │ (Système Moteur)           │   │
│  └──────────────────────┘  └────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        CORTEX                                │
│           (Entités et Compétences Cognitives)                │
│                                                              │
│  ┌───────────────────┐     ┌───────────────────────────────┐│
│  │ entities/IDNRole  │     │ Skills/                       ││
│  │ - Citoyen         │     │ - NavigationSkills ✅          ││
│  │ - Président       │     │ - IdentitySkills ✅            ││
│  │ - Ministre        │     │ - DocumentSkills (futur)      ││
│  │ - Contrôleur      │     │ - VerificationSkills (futur)  ││
│  │ - Admin           │     └───────────────────────────────┘│
│  └───────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

## Composants Consciousness

### 1. `iDNSoul.ts` - L'Âme

Le singleton central qui représente la conscience de l'agent :

```typescript
import { iDNSoul } from '@/Consciousness';

// Reconnaître un utilisateur
iDNSoul.recognizeUser({
  role: IDNRole.CITOYEN,
  name: 'Jean Mba',
  isAuthenticated: true
});

// Générer une salutation adaptée
const greeting = iDNSoul.generateGreeting();
// → "Bonjour cher Jean Mba ! Je suis iDN..."
```

### 2. `SocialProtocolAdapter.ts` - Protocole Social

Adaptation culturelle gabonaise :

| Rôle | Ton | Emoticons |
|------|-----|-----------|
| Président | Formel, déférence | ❌ |
| Ministre | Formel | ❌ |
| Citoyen | Chaleureux | ✅ |
| Contrôleur | Technique | ✅ |
| Admin | Technique | ❌ |

### 3. `IntentProcessor.ts` - Le Lobe Frontal

Catégories d'intentions reconnues :

- `navigation` : Aller à, ouvrir
- `identity` : CNI, passeport
- `documents` : Actes, certificats
- `verification` : Contrôle d'identité
- `information` : Questions
- `control` : Stop, annuler
- `greeting` : Salutations

### 4. `ContextMemory.ts` - Mémoire

- Messages (user/assistant)
- Sujets actifs
- Références contextuelles
- Actions en cours

### 5. `MotorCortex/` - Système Moteur 🆕

Le système moteur permet à iDN de "se déplacer" dans l'interface :

```typescript
import { MotorSynapse, useIDNMotor } from '@/Consciousness';

// Via singleton direct
MotorSynapse.moveToElement('submit-button');
MotorSynapse.speak('Cliquez ici pour soumettre.');
MotorSynapse.click();

// Via hook React
const motor = useIDNMotor();
motor.navigateTo('documents-section', 'Voici vos documents.');
motor.fillForm([
  { elementId: 'name', value: 'Jean Mba' },
  { elementId: 'email', value: 'jean@example.com' }
]);
motor.welcome();
```

**Commandes disponibles :**

| Commande | Description |
|----------|-------------|
| `gazeAt(elementId)` | Survole un élément |
| `moveToElement(id)` | Se déplace vers un élément |
| `click()` | Clique |
| `type(text)` | Tape du texte |
| `speak(text)` | Parle |
| `think(duration)` | Animation de réflexion |
| `pulse(intensity)` | Animation de l'orbe |
| `idle()` | Retour au repos |

**Séquences prédéfinies :**

| Séquence | Usage |
|----------|-------|
| `welcomeSequence()` | Animation d'accueil |
| `procedureSequence(name)` | Démarrage d'une démarche |
| `fillFormSequence(fields)` | Remplissage automatique |
| `navigateSequence(id, msg)` | Navigation avec feedback |
| `verificationSequence()` | Animation biométrique |

## Composants Cortex

### 1. `entities/IDNRole.ts` - Rôles

```typescript
enum IDNRole {
  CITOYEN, CITOYEN_DIASPORA, RESIDENT_ETRANGER,
  PRESIDENT_REPUBLIQUE, MINISTRE, SECRETAIRE_GENERAL_PR, DIRECTEUR_CABINET,
  CONTROLEUR_IDENTITE, AGENT_DGDI, VERIFICATEUR_BIOMETRIQUE,
  ADMINISTRATEUR_SYSTEME, SUPPORT_TECHNIQUE,
  ANONYME, ORGANISATION
}
```

### 2. `Skills/NavigationSkills.ts` 🆕

Compétences de navigation dans l'application :

```typescript
import { NavigationSkills } from '@/Cortex';

// Naviguer vers une page
const result = await NavigationSkills.navigateTo('documents');
// → { success: true, vocalFeedback: "Voici la page Documents." }

// Retour arrière
await NavigationSkills.goBack();

// Scroll vers élément
await NavigationSkills.scrollTo({ elementId: 'important-section' });
```

**Pages cartographiées :**

| Mot-clé | Destination |
|---------|-------------|
| `accueil`, `dashboard` | `/dashboard` |
| `icarte`, `cartes` | `/icarte` |
| `idocument`, `documents` | `/idocument` |
| `iboite`, `messagerie` | `/iboite` |
| `icv`, `cv` | `/icv` |
| `president` | `/president-space` |
| `admin` | `/admin-space` |
| `controller` | `/controller-space` |

### 3. `Skills/IdentitySkills.ts` 🆕

Compétences pour les démarches d'identité :

```typescript
import { IdentitySkills } from '@/Cortex';

// Expliquer une procédure
const { data } = await IdentitySkills.explainProcedure('cni', 'new');
console.log(data.formatted);
// → "## Carte Nationale d'Identité\n\n**Documents requis:**..."

// Vérifier les documents disponibles
const check = await IdentitySkills.checkDocumentsReady(
  'cni-new',
  ['Acte de naissance', 'Photos']
);
// → { ready: false, missing: ['Justificatif de domicile', ...] }

// Recherche
const results = IdentitySkills.searchProcedures('passeport');
```

**Base de connaissances intégrée :**

| Document | Délai | Coût |
|----------|-------|------|
| CNI (première) | 2-4 sem. | Gratuit |
| CNI (renouvellement) | 2-4 sem. | 5,000 FCFA |
| CNI (perte) | 3-5 sem. | 10,000 FCFA |
| Passeport | 4-6 sem. | 50k-100k FCFA |
| Acte de naissance | Immédiat-1 sem. | 500-2k FCFA |
| Certificat résidence | Immédiat-3j | 1k-3k FCFA |

## Utilisation

### Via le Context Provider (Recommandé)

```tsx
import { useIAsted } from '@/context/IAstedContext';

function MyComponent() {
  const { 
    soulState,
    isAwake,
    process,
    greet,
    setUserRole 
  } = useIAsted();

  // Définir le rôle
  useEffect(() => {
    setUserRole(IDNRole.CITOYEN, 'Jean');
  }, []);

  // Traiter une question
  const handleQuestion = async (question: string) => {
    const result = await process(question);
    console.log(result.response);
  };
}
```

### Composant Curseur Animé

```tsx
import { IDNCursor } from '@/Consciousness';

function App() {
  return (
    <div>
      {/* Votre application */}
      <IDNCursor visible={true} />
    </div>
  );
}
```

## Fichiers

```
src/
├── Consciousness/
│   ├── index.ts              # Export central
│   ├── iDNSoul.ts           # L'âme (singleton)
│   ├── SocialProtocolAdapter.ts  # Protocole gabonais
│   ├── ContextMemory.ts     # Mémoire conversationnelle
│   ├── IntentProcessor.ts   # Traitement des intentions
│   ├── useIDN.tsx           # Hook React principal
│   └── MotorCortex/         # 🆕 Système moteur
│       ├── index.ts
│       ├── MotorSynapse.ts  # Contrôleur moteur
│       ├── CursorController.ts  # Hook curseur
│       └── IDNCursor.tsx    # Composant React
├── Cortex/
│   ├── index.ts             # Export central
│   ├── entities/
│   │   ├── index.ts
│   │   └── IDNRole.ts       # Rôles IDN.GA
│   └── Skills/              # 🆕 Compétences
│       ├── index.ts
│       ├── NavigationSkills.ts
│       └── IdentitySkills.ts
└── context/
    └── IAstedContext.tsx    # Context React enrichi
```

## Évolutions Futures

- [ ] **DocumentSkills** : Génération et gestion de documents
- [ ] **VerificationSkills** : Vérification biométrique
- [ ] **VoiceSkills** : Intégration WebRTC vocale
- [ ] **NotificationSkills** : Alertes et rappels
- [ ] **Mémoire persistante** : Sauvegarde Supabase
