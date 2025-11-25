import { toast } from "sonner";

export const DocumentService = {
    generatePDF: async (title: string, content: string) => {
        return new Promise((resolve) => {
            toast.loading("Génération du PDF en cours...");
            setTimeout(() => {
                toast.dismiss();
                toast.success(`Document "${title}.pdf" généré avec succès !`);
                resolve(true);
            }, 2000);
        });
    },

    generateDocx: async (title: string, content: string) => {
        return new Promise((resolve) => {
            toast.loading("Création du fichier Word...");
            setTimeout(() => {
                toast.dismiss();
                toast.success(`Document "${title}.docx" créé avec succès !`);
                resolve(true);
            }, 2000);
        });
    },

    generateReport: async (type: 'activity' | 'security' | 'users') => {
        return new Promise((resolve) => {
            toast.loading(`Analyse des données pour le rapport ${type}...`);
            setTimeout(() => {
                toast.dismiss();
                toast.success(`Rapport ${type}_2023.pdf prêt au téléchargement.`);
                resolve(true);
            }, 3000);
        });
    }
};
