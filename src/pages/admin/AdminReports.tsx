import React from 'react';
import AdminLayout from "@/components/layout/AdminLayout";
import { BarChart3, TrendingUp, Users, Globe, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// Mock Data
const GROWTH_DATA = [
    { name: 'Jan', users: 4000 },
    { name: 'Fév', users: 3000 },
    { name: 'Mar', users: 2000 },
    { name: 'Avr', users: 2780 },
    { name: 'Mai', users: 1890 },
    { name: 'Juin', users: 2390 },
    { name: 'Juil', users: 3490 },
    { name: 'Août', users: 4200 },
    { name: 'Sep', users: 5100 },
    { name: 'Oct', users: 6500 },
];

const DEMOGRAPHICS_DATA = [
    { name: 'Citoyens', value: 8500 },
    { name: 'Résidents', value: 2500 },
    { name: 'Visiteurs', value: 1000 },
];

const COLORS = ['#009E49', '#FCD116', '#0072CE'];

const AdminReports = () => {
    return (
        <AdminLayout>
            <div className="flex flex-col h-full space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-primary" />
                        Rapports & Statistiques
                    </h1>
                    <p className="text-muted-foreground text-sm">Analysez la croissance et l'utilisation de la plateforme.</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="neu-raised p-6 rounded-xl flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Croissance Mensuelle</div>
                            <div className="text-2xl font-bold">+12.5%</div>
                        </div>
                    </div>
                    <div className="neu-raised p-6 rounded-xl flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Utilisateurs Actifs</div>
                            <div className="text-2xl font-bold">8,942</div>
                        </div>
                    </div>
                    <div className="neu-raised p-6 rounded-xl flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Taux de Rétention</div>
                            <div className="text-2xl font-bold">94%</div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">

                    {/* User Growth Chart */}
                    <div className="neu-raised p-6 rounded-xl flex flex-col">
                        <h3 className="font-semibold mb-6 text-foreground flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Croissance des Inscriptions
                        </h3>
                        <div className="flex-1 min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={GROWTH_DATA}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#009E49" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#009E49" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tickMargin={10} stroke="var(--muted-foreground)" />
                                    <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
                                    />
                                    <Area type="monotone" dataKey="users" stroke="#009E49" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Demographics Chart */}
                    <div className="neu-raised p-6 rounded-xl flex flex-col">
                        <h3 className="font-semibold mb-6 text-foreground flex items-center gap-2">
                            <Globe className="w-4 h-4" /> Répartition Démographique
                        </h3>
                        <div className="flex-1 min-h-[300px] flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={DEMOGRAPHICS_DATA}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {DEMOGRAPHICS_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminReports;
