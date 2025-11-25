import React, { useState } from 'react';
import AdminLayout from "@/components/layout/AdminLayout";
import { Users, Search, Filter, MoreVertical, Shield, Ban, Trash2, Eye, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Mock Data
const MOCK_USERS = [
    { id: 'USR-001', name: 'Jean-Pierre Mba', email: 'jp.mba@example.ga', role: 'Citoyen', status: 'Active', date: '2023-10-15' },
    { id: 'USR-002', name: 'Sophie Nze', email: 'sophie.nze@example.ga', role: 'Citoyen', status: 'Pending', date: '2023-10-16' },
    { id: 'USR-003', name: 'Marc Oulabou', email: 'marc.oulabou@admin.ga', role: 'Admin', status: 'Active', date: '2023-09-01' },
    { id: 'USR-004', name: 'Alice Bongo', email: 'alice.bongo@example.ga', role: 'Visiteur', status: 'Suspended', date: '2023-10-10' },
    { id: 'USR-005', name: 'Paul Kassa', email: 'paul.kassa@example.ga', role: 'Citoyen', status: 'Active', date: '2023-10-18' },
    { id: 'USR-006', name: 'Marie Tchikaya', email: 'marie.t@example.ga', role: 'Citoyen', status: 'Active', date: '2023-10-19' },
    { id: 'USR-007', name: 'Lucas Owono', email: 'lucas.owono@example.ga', role: 'Visiteur', status: 'Pending', date: '2023-10-20' },
];

const AdminUsers = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const filteredUsers = MOCK_USERS.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || user.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleAction = (action: string, userName: string) => {
        toast.success(`Action "${action}" effectuée pour ${userName}`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
            case 'Pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'Suspended': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col h-full space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Users className="w-6 h-6 text-primary" />
                            Gestion des Utilisateurs
                        </h1>
                        <p className="text-muted-foreground text-sm">Gérez les comptes, les rôles et les accès.</p>
                    </div>
                    <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg">
                        + Nouvel Utilisateur
                    </Button>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4 items-center bg-card/50 p-4 rounded-xl neu-inset">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher par nom ou email..."
                            className="pl-10 bg-background border-none shadow-none focus-visible:ring-1"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                        {['All', 'Active', 'Pending', 'Suspended'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${filterStatus === status
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-background text-muted-foreground hover:bg-background/80'
                                    }`}
                            >
                                {status === 'All' ? 'Tous' : status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Users Table */}
                <div className="flex-1 overflow-hidden rounded-xl neu-raised bg-card">
                    <div className="overflow-x-auto h-full">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Utilisateur</th>
                                    <th className="px-6 py-4 font-semibold">Rôle</th>
                                    <th className="px-6 py-4 font-semibold">Statut</th>
                                    <th className="px-6 py-4 font-semibold">Date d'inscription</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-foreground">{user.name}</div>
                                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                    <Shield className="w-3 h-3" />
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                                    {user.status === 'Active' && <CheckCircle className="w-3 h-3" />}
                                                    {user.status === 'Pending' && <Filter className="w-3 h-3" />}
                                                    {user.status === 'Suspended' && <XCircle className="w-3 h-3" />}
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {new Date(user.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleAction('Voir profil', user.name)}>
                                                            <Eye className="w-4 h-4 mr-2" /> Voir profil
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleAction('Modifier rôle', user.name)}>
                                                            <Shield className="w-4 h-4 mr-2" /> Modifier rôle
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleAction('Suspendre', user.name)}>
                                                            <Ban className="w-4 h-4 mr-2" /> Suspendre
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleAction('Supprimer', user.name)}>
                                                            <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                            Aucun utilisateur trouvé.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination (Mock) */}
                <div className="flex justify-between items-center text-sm text-muted-foreground px-2">
                    <div>Affichage de {filteredUsers.length} sur {MOCK_USERS.length} utilisateurs</div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>Précédent</Button>
                        <Button variant="outline" size="sm" disabled>Suivant</Button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminUsers;
