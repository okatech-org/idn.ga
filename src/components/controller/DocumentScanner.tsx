import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    QrCode,
    Fingerprint,
    Camera,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Loader2,
    RefreshCw,
    FileText,
    User,
    Shield,
    Scan
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type ScanMode = 'idle' | 'qr' | 'biometric';
type ScanResult = 'success' | 'failure' | 'warning' | null;

interface DocumentScanResult {
    documentId: string;
    holderName: string;
    documentType: string;
    isValid: boolean;
    issueDate: string;
    expiryDate: string;
    warnings?: string[];
}

export const DocumentScanner = () => {
    const [scanMode, setScanMode] = useState<ScanMode>('idle');
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<ScanResult>(null);
    const [documentData, setDocumentData] = useState<DocumentScanResult | null>(null);
    const [scanProgress, setScanProgress] = useState(0);
    const scannerRef = useRef<HTMLDivElement>(null);

    // Reset scan result after delay
    useEffect(() => {
        if (scanResult) {
            const timer = setTimeout(() => {
                if (scanResult !== 'success') {
                    resetScanner();
                }
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [scanResult]);

    const startScan = (mode: ScanMode) => {
        setScanMode(mode);
        setIsScanning(true);
        setScanResult(null);
        setDocumentData(null);
        setScanProgress(0);

        // Simulate scanning process
        const progressInterval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 10;
            });
        }, 200);

        // Simulate scan completion
        setTimeout(() => {
            clearInterval(progressInterval);
            setScanProgress(100);
            completeScan(mode);
        }, 2500);
    };

    const completeScan = (mode: ScanMode) => {
        setIsScanning(false);

        // Simulate random results for demo
        const results = ['success', 'failure', 'warning'] as const;
        const randomResult = results[Math.floor(Math.random() * 3)];
        setScanResult(randomResult);

        if (randomResult === 'success' || randomResult === 'warning') {
            setDocumentData({
                documentId: 'CNI-GA-2026-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                holderName: 'Jean-Pierre Moussavou',
                documentType: mode === 'qr' ? 'Carte Nationale d\'Identité' : 'Vérification Biométrique',
                isValid: randomResult === 'success',
                issueDate: '15/03/2024',
                expiryDate: '14/03/2034',
                warnings: randomResult === 'warning' ? ['Document proche de l\'expiration', 'Adresse non mise à jour'] : undefined
            });
        }
    };

    const resetScanner = () => {
        setScanMode('idle');
        setIsScanning(false);
        setScanResult(null);
        setDocumentData(null);
        setScanProgress(0);
    };

    return (
        <div className="flex flex-col h-full">
            <AnimatePresence mode="wait">
                {scanMode === 'idle' && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex-1 flex flex-col items-center justify-center"
                    >
                        <div className="text-center max-w-lg">
                            {/* Scanner Icon */}
                            <motion.div
                                className="w-40 h-40 mx-auto mb-8 neu-raised rounded-3xl flex items-center justify-center relative overflow-hidden"
                                animate={{
                                    boxShadow: [
                                        '0 0 0 0 rgba(236, 72, 153, 0)',
                                        '0 0 0 20px rgba(236, 72, 153, 0.1)',
                                        '0 0 0 0 rgba(236, 72, 153, 0)'
                                    ]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5" />
                                <Scan className="w-20 h-20 text-primary" />

                                {/* Scanning animation lines */}
                                <motion.div
                                    className="absolute inset-x-0 h-0.5 bg-primary/50"
                                    animate={{ top: ['10%', '90%', '10%'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                />
                            </motion.div>

                            <h2 className="text-2xl font-bold mb-3">Scanner de documents</h2>
                            <p className="text-muted-foreground mb-8">
                                Scannez un QR code officiel ou effectuez une vérification biométrique pour authentifier instantanément un document d'identité.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    size="lg"
                                    onClick={() => startScan('qr')}
                                    className="gap-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white shadow-lg"
                                >
                                    <QrCode className="w-5 h-5" />
                                    Scanner QR Code
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => startScan('biometric')}
                                    className="gap-3"
                                >
                                    <Fingerprint className="w-5 h-5" />
                                    Vérification biométrique
                                </Button>
                            </div>

                            {/* Quick tips */}
                            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                                {[
                                    { icon: QrCode, title: 'QR Code', desc: 'Scannez le code au dos de la CNI' },
                                    { icon: Fingerprint, title: 'Empreinte', desc: 'Placez le doigt sur le capteur' },
                                    { icon: Camera, title: 'Photo', desc: 'Vérification faciale automatique' }
                                ].map((tip, i) => (
                                    <div key={i} className="p-4 neu-raised rounded-xl">
                                        <tip.icon className="w-6 h-6 text-primary mb-2" />
                                        <p className="font-semibold text-sm">{tip.title}</p>
                                        <p className="text-xs text-muted-foreground">{tip.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {(scanMode === 'qr' || scanMode === 'biometric') && !scanResult && (
                    <motion.div
                        key="scanning"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex-1 flex flex-col items-center justify-center"
                    >
                        <div className="text-center">
                            {/* Scanner viewport */}
                            <div
                                ref={scannerRef}
                                className="w-72 h-72 mx-auto mb-8 relative rounded-3xl overflow-hidden border-4 border-primary/30"
                            >
                                {/* Simulated camera view */}
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800">
                                    {/* Corner markers */}
                                    <div className="absolute top-4 left-4 w-12 h-12 border-l-4 border-t-4 border-primary rounded-tl-lg" />
                                    <div className="absolute top-4 right-4 w-12 h-12 border-r-4 border-t-4 border-primary rounded-tr-lg" />
                                    <div className="absolute bottom-4 left-4 w-12 h-12 border-l-4 border-b-4 border-primary rounded-bl-lg" />
                                    <div className="absolute bottom-4 right-4 w-12 h-12 border-r-4 border-b-4 border-primary rounded-br-lg" />

                                    {/* Scanning line */}
                                    <motion.div
                                        className="absolute left-4 right-4 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                                        animate={{ top: ['15%', '85%', '15%'] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                    />

                                    {/* Center icon */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {scanMode === 'qr' ? (
                                            <QrCode className="w-24 h-24 text-white/30" />
                                        ) : (
                                            <Fingerprint className="w-24 h-24 text-white/30" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                <span className="font-medium">
                                    {scanMode === 'qr' ? 'Lecture du QR Code...' : 'Analyse biométrique...'}
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-64 mx-auto h-2 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-pink-500 to-rose-600"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${scanProgress}%` }}
                                />
                            </div>

                            <Button
                                variant="ghost"
                                onClick={resetScanner}
                                className="mt-6"
                            >
                                Annuler
                            </Button>
                        </div>
                    </motion.div>
                )}

                {scanResult && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex-1 flex flex-col items-center justify-center"
                    >
                        <div className="w-full max-w-md">
                            {/* Result Icon */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                className={cn(
                                    'w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center',
                                    scanResult === 'success' && 'bg-green-100 dark:bg-green-900/30',
                                    scanResult === 'failure' && 'bg-red-100 dark:bg-red-900/30',
                                    scanResult === 'warning' && 'bg-yellow-100 dark:bg-yellow-900/30'
                                )}
                            >
                                {scanResult === 'success' && <CheckCircle className="w-12 h-12 text-green-600" />}
                                {scanResult === 'failure' && <XCircle className="w-12 h-12 text-red-600" />}
                                {scanResult === 'warning' && <AlertTriangle className="w-12 h-12 text-yellow-600" />}
                            </motion.div>

                            {/* Result message */}
                            <div className="text-center mb-6">
                                <h3 className={cn(
                                    'text-xl font-bold mb-2',
                                    scanResult === 'success' && 'text-green-600',
                                    scanResult === 'failure' && 'text-red-600',
                                    scanResult === 'warning' && 'text-yellow-600'
                                )}>
                                    {scanResult === 'success' && 'Document Authentique'}
                                    {scanResult === 'failure' && 'Document Non Reconnu'}
                                    {scanResult === 'warning' && 'Vérification Requise'}
                                </h3>
                                <p className="text-muted-foreground">
                                    {scanResult === 'success' && 'Le document a été vérifié avec succès.'}
                                    {scanResult === 'failure' && 'Le document n\'a pas pu être authentifié.'}
                                    {scanResult === 'warning' && 'Des anomalies ont été détectées. Vérification manuelle recommandée.'}
                                </p>
                            </div>

                            {/* Document details */}
                            {documentData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="neu-raised p-5 rounded-xl space-y-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{documentData.documentType}</p>
                                            <p className="text-xs text-muted-foreground">{documentData.documentId}</p>
                                        </div>
                                        <Badge className={cn(
                                            'ml-auto',
                                            documentData.isValid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        )}>
                                            {documentData.isValid ? 'Valide' : 'À vérifier'}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Titulaire</p>
                                            <p className="font-medium flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                {documentData.holderName}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Validité</p>
                                            <p className="font-medium">
                                                {documentData.issueDate} - {documentData.expiryDate}
                                            </p>
                                        </div>
                                    </div>

                                    {documentData.warnings && documentData.warnings.length > 0 && (
                                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                            <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-1">
                                                Avertissements
                                            </p>
                                            <ul className="text-xs text-yellow-600 dark:text-yellow-500 space-y-1">
                                                {documentData.warnings.map((warning, i) => (
                                                    <li key={i} className="flex items-center gap-2">
                                                        <span className="w-1 h-1 rounded-full bg-yellow-500" />
                                                        {warning}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-center gap-3 mt-6">
                                <Button variant="outline" onClick={resetScanner} className="gap-2">
                                    <RefreshCw className="w-4 h-4" />
                                    Nouveau scan
                                </Button>
                                {(scanResult === 'success' || scanResult === 'warning') && (
                                    <Button className="gap-2">
                                        <Shield className="w-4 h-4" />
                                        Voir le dossier
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DocumentScanner;
