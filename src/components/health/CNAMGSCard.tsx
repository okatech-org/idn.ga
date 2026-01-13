import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, Download, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState, useEffect, useRef } from "react";

interface CNAMGSCardProps {
    profile: any;
}

interface LayoutField {
    id: string;
    type: string;
    bbox: [number, number, number, number];
    text?: string;
    fontSize?: number;
    circle?: {
        cx: number;
        cy: number;
        r: number;
    };
    href?: string;
}

interface CardLayout {
    template: string;
    canvas: {
        width: number;
        height: number;
    };
    fields: LayoutField[];
}

export const CNAMGSCard = ({ profile }: CNAMGSCardProps) => {
    const [svgContent, setSvgContent] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const svgContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const generateCard = async () => {
            if (!profile) {
                console.log('CNAMGSCard: No profile provided');
                return;
            }

            setIsGenerating(true);
            console.log('CNAMGSCard: Starting card generation for profile:', profile);

            try {
                // Charger le template SVG avec cache-busting agressif
                const cacheBuster = `v2_${Date.now()}_${Math.random().toString(36).substring(7)}`;
                const templateResponse = await fetch(`/cnamgs_card_template.svg?${cacheBuster}`);
                const templateText = await templateResponse.text();

                // Charger le layout JSON
                const layoutResponse = await fetch(`/cnamgs_layout.json?v=${Date.now()}`);
                const layout: CardLayout = await layoutResponse.json();

                // Parser le SVG
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(templateText, 'image/svg+xml');
                const svg = svgDoc.documentElement as unknown as SVGElement;

                // Préparer les données
                const fullNameParts = profile?.full_name?.split(' ') || [];
                const nom = fullNameParts.length > 0 ? fullNameParts[fullNameParts.length - 1] : 'NOM';
                const prenoms = fullNameParts.length > 1 ? fullNameParts.slice(0, -1).join(' ') : 'PRENOMS';
                const dateNaissance = profile?.birth_date
                    ? format(new Date(profile.birth_date), "dd/MM/yyyy", { locale: fr })
                    : '01/01/1990';
                const sexe = profile?.gender === 'male' ? 'M' : profile?.gender === 'female' ? 'F' : 'M';
                const numeroCard = profile?.cnamgs_number || '000-000-000-0';

                // Appliquer le layout et injecter les données
                applySVGLayout(svg, layout, {
                    cardNumber: numeroCard,
                    nom: nom,
                    prenoms: prenoms,
                    naissance: dateNaissance,
                    sexe: sexe,
                    photo: profile?.avatar_url
                });

                // Convertir le SVG en string
                const serializer = new XMLSerializer();
                const svgString = serializer.serializeToString(svg);
                setSvgContent(svgString);
                setIsGenerating(false);
            } catch (error) {
                console.error("CNAMGSCard: Error in card generation:", error);
                setIsGenerating(false);
            }
        };

        generateCard();
    }, [profile]);

    // Fonction pour manipuler le SVG avec le layout
    const applySVGLayout = (
        svg: SVGElement,
        layout: CardLayout,
        data: {
            cardNumber: string;
            nom: string;
            prenoms: string;
            naissance: string;
            sexe: string;
            photo: string | null;
        }
    ) => {
        const $ = (sel: string) => svg.querySelector(sel);
        const esc = (id: string) => '#' + CSS.escape(id);

        // Fonction pour placer un texte selon bbox
        const placeText = (id: string, bbox: [number, number, number, number], opts: any = {}) => {
            const node = $(esc(id));
            if (!node) return;
            const [x, y, w, h] = bbox;
            if (w === 0 && h === 0) return; // sera géré par fallback
            node.setAttribute('x', String(x));
            node.setAttribute('y', String(Math.round(y + h - h * 0.2 + 12)));
            if (opts.anchor) node.setAttribute('text-anchor', opts.anchor);
            if (opts.fontSize) node.setAttribute('font-size', String(opts.fontSize));
        };

        // Fallback si bbox = [0,0,0,0]
        const fallbackPlaceNearLabel = (fieldId: string, labelId: string, dx = 22, dy = 12) => {
            const node = $(esc(fieldId));
            const label = $(esc(labelId));
            if (!node || !label) return;
            const lx = +(label.getAttribute('x') || 0);
            const ly = +(label.getAttribute('y') || 0);
            const labelLength = (label as SVGTextElement).getComputedTextLength?.() || 0;
            node.setAttribute('x', String(lx + dx + labelLength));
            node.setAttribute('y', String(ly + dy));
        };

        // Nouveau fallback: placer SOUS le libellé
        const fallbackPlaceBelowLabel = (fieldId: string, labelId: string, dx = 0, dy = 35) => {
            const node = $(esc(fieldId));
            const label = $(esc(labelId));
            if (!node || !label) return;
            const lx = +(label.getAttribute('x') || 0);
            const ly = +(label.getAttribute('y') || 0);
            node.setAttribute('x', String(lx + dx));
            node.setAttribute('y', String(ly + dy));
        };

        // Fonction pour injecter le texte
        const setText = (id: string, value: string = '') => {
            const node = $(esc(id));
            if (node) node.textContent = value ?? '';
        };

        // 1) Numéro de carte - aligné à gauche au niveau du "C" de "Carte d'Assurance Maladie"
        const cardNumberNode = $(esc('field-card-number'));
        if (cardNumberNode) {
            cardNumberNode.setAttribute('x', '501');
            cardNumberNode.setAttribute('y', '288');
            cardNumberNode.setAttribute('text-anchor', 'start');
            cardNumberNode.setAttribute('font-size', '34');
            cardNumberNode.setAttribute('font-weight', '900');
            cardNumberNode.setAttribute('letter-spacing', '1');
        }

        // 2) Champs SOUS les libellés
        const setFieldBelowLabel = (fieldId: string, x: number, y: number) => {
            const node = $(esc(fieldId));
            if (node) {
                node.setAttribute('x', String(x));
                node.setAttribute('y', String(y));
                node.setAttribute('font-size', '32');
                node.setAttribute('font-weight', 'bold');
            }
        };

        setFieldBelowLabel('field-name', 62, 442);
        setFieldBelowLabel('field-given-names', 62, 524);
        setFieldBelowLabel('field-birthdate', 62, 606);
        setFieldBelowLabel('field-sex', 511, 606);

        // 3) Injecter les données texte
        setText('field-card-number', data.cardNumber);
        setText('field-name', (data.nom || '').toUpperCase());
        setText('field-given-names', (data.prenoms || '').toUpperCase());
        setText('field-birthdate', data.naissance || '');
        setText('field-sex', (data.sexe || '').toUpperCase());

        // 4) Photo dans l'ellipse
        if (data.photo) {
            const ph = $(esc('photo-placeholder'));
            if (ph) {
                const cx = +(ph.getAttribute('cx') || 847);
                const cy = +(ph.getAttribute('cy') || 447);
                const rx = +(ph.getAttribute('rx') || 130);
                const ry = +(ph.getAttribute('ry') || 160);

                // Créer l'élément image SVG
                const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
                img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', data.photo);
                img.setAttribute('x', String(cx - rx));
                img.setAttribute('y', String(cy - ry));
                img.setAttribute('width', String(2 * rx));
                img.setAttribute('height', String(2 * ry));
                img.setAttribute('preserveAspectRatio', 'xMidYMid slice');
                img.setAttribute('clip-path', 'url(#clip-photo)');

                // Insérer l'image avant l'ellipse placeholder
                ph.parentNode?.insertBefore(img, ph);

                // Masquer l'ellipse placeholder
                ph.setAttribute('opacity', '0');
            }
        }
    };

    const handleExportPDF = async () => {
        try {
            toast.info("Génération de l'attestation...");

            // Importer la fonction de génération
            const { generateCNAMGSPdf } = await import('@/utils/cnamgs-pdf-generator');

            // Préparer les données
            const fullNameParts = profile?.full_name?.split(' ') || [];
            const nom = fullNameParts.length > 0 ? fullNameParts[fullNameParts.length - 1].toUpperCase() : 'NOM';
            const prenoms = fullNameParts.length > 1 ? fullNameParts.slice(0, -1).join(' ').toUpperCase() : 'PRENOMS';
            const dateNaissance = profile?.birth_date
                ? format(new Date(profile.birth_date), "dd/MM/yyyy", { locale: fr })
                : '01/01/1990';
            const sexe = profile?.gender === 'male' ? 'M' : profile?.gender === 'female' ? 'F' : 'M';
            const numeroCard = profile?.cnamgs_number || '000-000-000-0';

            // Calculer l'âge
            const age = profile?.birth_date
                ? new Date().getFullYear() - new Date(profile.birth_date).getFullYear() + ' ans'
                : undefined;

            // Générer le PDF
            await generateCNAMGSPdf(
                {
                    numero: numeroCard,
                    nom: nom,
                    prenoms: prenoms,
                    dateNaissance: dateNaissance,
                    lieuNaissance: profile?.birth_place || "Non renseigné",
                    age: age,
                    sexe: sexe as "M" | "F",
                    regime: "Secteur Privé",
                    qualite: "Assuré principal",
                    employeur: profile?.employer || "N/A",
                    couvertures: [
                        {
                            type: "Affections courantes",
                            taux: "80%",
                            ticket: "20% à charge de l'assuré"
                        },
                        {
                            type: "Affections Longue Durée (ALD)",
                            taux: "90%",
                            ticket: "10% à charge de l'assuré"
                        },
                        {
                            type: "Femmes enceintes déclarées",
                            taux: "100%",
                            ticket: "0% (prise en charge totale)"
                        }
                    ]
                },
                {
                    armoiriesUrl: '/emblem_gabon.png',
                    cnamgsLogoUrl: '/cnamgs_logo.png',
                    photoUrl: profile?.avatar_url || undefined
                },
                {
                    showGrid: false,
                    downloadFileName: `attestation-cnamgs-${profile?.full_name?.replace(/\s+/g, '-') || 'patient'}.pdf`
                }
            );

            toast.success("Attestation CNAMGS téléchargée");
        } catch (error) {
            console.error("Error in PDF export:", error);
            toast.error("Erreur lors de l'export PDF");
        }
    };

    return (
        <Card className="p-4 sm:p-6 bg-card/50 border backdrop-blur-sm flex flex-col h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-semibold text-foreground">CNAMGS</h2>
                        <p className="text-xs text-muted-foreground">Carte d'assuré</p>
                    </div>
                </div>
                <Button onClick={handleExportPDF} size="sm" className="self-start sm:self-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Download className="h-3 w-3 mr-1.5" />
                    <span className="text-xs">Téléchargez votre attestation CNAMGS</span>
                </Button>
            </div>

            <Separator className="mb-3" />

            {/* SVG de la carte CNAMGS personnalisée */}
            <div
                ref={svgContainerRef}
                className="mb-3 rounded-lg overflow-hidden border border-border/50 w-full"
                style={{ aspectRatio: '1050 / 650' }}
            >
                <div
                    className="w-full h-full cnamgs-card-svg [&>svg]:w-full [&>svg]:h-auto"
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                />
            </div>

            {/* Informations de couverture compactes */}
            <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="p-2.5 rounded-lg bg-muted/20 border border-border/50">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Couverture</p>
                    <p className="text-xs font-bold text-foreground">80%</p>
                </div>

                <div className="p-2.5 rounded-lg bg-muted/20 border border-border/50">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Plafond</p>
                    <p className="text-xs font-bold text-foreground">5M FCFA</p>
                </div>
            </div>

            <div className="p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-between">
                <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Statut</p>
                    <p className="text-xs font-bold text-foreground">Actif</p>
                </div>
                <Badge className="bg-green-600 h-6 text-[10px] px-2">
                    <CheckCircle className="h-2.5 w-2.5 mr-1" />
                    Valide
                </Badge>
            </div>

            <div className="mt-auto pt-3">
                <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 flex items-start gap-1.5">
                        <Shield className="h-3 w-3 flex-shrink-0 mt-0.5" />
                        <span>Présentez cette carte dans les établissements conventionnés.</span>
                    </p>
                </div>
            </div>
        </Card>
    );
};
