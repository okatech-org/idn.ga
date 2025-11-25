import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'fr' | 'en' | 'zh' | 'ko' | 'ja' | 'ru' | 'es' | 'ar' | 'pt';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
];

const translations: Record<Language, Record<string, string>> = {
    fr: {
        demoTitle: "Mode Démo",
        demoSubtitle: "Explorez la plateforme IDN.GA à travers différents profils utilisateurs. Chaque persona dispose de droits et de fonctionnalités spécifiques.",
        backHome: "Retour à l'accueil",
        role: "Rôle",
        status: "Statut",
        objective: "Objectif",
        context: "Contexte",

        // Personas
        citizen_name: "Jean Dupont",
        citizen_role: "Citoyen Gabonais",
        citizen_status: "Vérifié (Niveau 3)",
        citizen_objective: "Accéder aux services administratifs et gérer ses documents officiels.",
        citizen_context: "Utilisateur standard avec une identité numérique complète.",

        resident_name: "Marie Curie",
        resident_role: "Résident",
        resident_status: "Vérifié (Niveau 2)",
        resident_objective: "Renouveler sa carte de séjour et accéder aux services pour résidents.",
        resident_context: "Expatriée vivant au Gabon depuis 5 ans.",

        tourist_name: "John Doe",
        tourist_role: "Visiteur Temporaire",
        tourist_status: "Vérifié (Niveau 1)",
        tourist_objective: "Consulter son e-Visa et obtenir des informations touristiques.",
        tourist_context: "Touriste en visite pour 2 semaines.",

        admin_name: "Admin Système",
        admin_role: "Administrateur",
        admin_status: "Super Utilisateur",
        admin_objective: "Superviser la plateforme, gérer les utilisateurs et les logs.",
        admin_context: "Accès technique pour la maintenance et la sécurité.",

        controller_name: "Agent Vérificateur",
        controller_role: "Contrôleur d'Identité",
        controller_status: "Agent Assermenté",
        controller_objective: "Vérifier l'authenticité des documents et traiter les demandes.",
        controller_context: "Utilisé par la police ou les agents administratifs.",
    },
    en: {
        demoTitle: "Demo Mode",
        demoSubtitle: "Explore the IDN.GA platform through different user profiles. Each persona has specific rights and features.",
        backHome: "Back to Home",
        role: "Role",
        status: "Status",
        objective: "Objective",
        context: "Context",

        citizen_name: "Jean Dupont",
        citizen_role: "Gabonese Citizen",
        citizen_status: "Verified (Level 3)",
        citizen_objective: "Access administrative services and manage official documents.",
        citizen_context: "Standard user with a complete digital identity.",

        resident_name: "Marie Curie",
        resident_role: "Resident",
        resident_status: "Verified (Level 2)",
        resident_objective: "Renew residence permit and access resident services.",
        resident_context: "Expat living in Gabon for 5 years.",

        tourist_name: "John Doe",
        tourist_role: "Temporary Visitor",
        tourist_status: "Verified (Level 1)",
        tourist_objective: "View e-Visa and get tourist information.",
        tourist_context: "Tourist visiting for 2 weeks.",

        admin_name: "System Admin",
        admin_role: "Administrator",
        admin_status: "Super User",
        admin_objective: "Supervise the platform, manage users and logs.",
        admin_context: "Technical access for maintenance and security.",

        controller_name: "Verification Agent",
        controller_role: "Identity Controller",
        controller_status: "Sworn Officer",
        controller_objective: "Verify document authenticity and process requests.",
        controller_context: "Used by police or administrative agents.",
    },
    zh: {
        demoTitle: "演示模式",
        demoSubtitle: "通过不同的用户配置文件探索 IDN.GA 平台。每个角色都有特定的权限和功能。",
        backHome: "返回首页",
        role: "角色",
        status: "状态",
        objective: "目标",
        context: "背景",

        citizen_name: "Jean Dupont",
        citizen_role: "加蓬公民",
        citizen_status: "已验证 (3级)",
        citizen_objective: "访问行政服务并管理官方文件。",
        citizen_context: "拥有完整数字身份的标准用户。",

        resident_name: "Marie Curie",
        resident_role: "居民",
        resident_status: "已验证 (2级)",
        resident_objective: "更新居留许可并访问居民服务。",
        resident_context: "在加蓬居住5年的外籍人士。",

        tourist_name: "John Doe",
        tourist_role: "临时访客",
        tourist_status: "已验证 (1级)",
        tourist_objective: "查看电子签证并获取旅游信息。",
        tourist_context: "访问2周的游客。",

        admin_name: "系统管理员",
        admin_role: "管理员",
        admin_status: "超级用户",
        admin_objective: "监督平台，管理用户和日志。",
        admin_context: "用于维护和安全的技术访问。",

        controller_name: "验证代理",
        controller_role: "身份控制员",
        controller_status: "宣誓官员",
        controller_objective: "验证文件真实性并处理请求。",
        controller_context: "由警察或行政人员使用。",
    },
    ko: {
        demoTitle: "데모 모드",
        demoSubtitle: "다양한 사용자 프로필을 통해 IDN.GA 플랫폼을 살펴보세요. 각 페르소나는 특정 권한과 기능을 가지고 있습니다.",
        backHome: "홈으로 돌아가기",
        role: "역할",
        status: "상태",
        objective: "목표",
        context: "컨텍스트",

        citizen_name: "Jean Dupont",
        citizen_role: "가봉 시민",
        citizen_status: "인증됨 (레벨 3)",
        citizen_objective: "행정 서비스에 액세스하고 공식 문서를 관리합니다.",
        citizen_context: "완전한 디지털 신원을 가진 표준 사용자.",

        resident_name: "Marie Curie",
        resident_role: "거주자",
        resident_status: "인증됨 (레벨 2)",
        resident_objective: "거주 허가를 갱신하고 거주자 서비스에 액세스합니다.",
        resident_context: "가봉에 5년째 거주 중인 외국인.",

        tourist_name: "John Doe",
        tourist_role: "임시 방문자",
        tourist_status: "인증됨 (레벨 1)",
        tourist_objective: "e-비자를 확인하고 관광 정보를 얻습니다.",
        tourist_context: "2주 동안 방문하는 관광객.",

        admin_name: "시스템 관리자",
        admin_role: "관리자",
        admin_status: "슈퍼 유저",
        admin_objective: "플랫폼을 감독하고 사용자 및 로그를 관리합니다.",
        admin_context: "유지 관리 및 보안을 위한 기술 액세스.",

        controller_name: "검증 요원",
        controller_role: "신원 통제관",
        controller_status: "선서 공무원",
        controller_objective: "문서 진위 여부를 확인하고 요청을 처리합니다.",
        controller_context: "경찰이나 행정 요원이 사용합니다.",
    },
    ja: {
        demoTitle: "デモモード",
        demoSubtitle: "さまざまなユーザープロファイルを通じてIDN.GAプラットフォームを探索してください。各ペルソナには特定の権限と機能があります。",
        backHome: "ホームに戻る",
        role: "役割",
        status: "ステータス",
        objective: "目的",
        context: "コンテキスト",

        citizen_name: "Jean Dupont",
        citizen_role: "ガボン市民",
        citizen_status: "認証済み (レベル3)",
        citizen_objective: "行政サービスにアクセスし、公式文書を管理します。",
        citizen_context: "完全なデジタルIDを持つ標準ユーザー。",

        resident_name: "Marie Curie",
        resident_role: "居住者",
        resident_status: "認証済み (レベル2)",
        resident_objective: "滞在許可を更新し、居住者向けサービスにアクセスします。",
        resident_context: "ガボンに5年間居住している外国人。",

        tourist_name: "John Doe",
        tourist_role: "一時滞在者",
        tourist_status: "認証済み (レベル1)",
        tourist_objective: "e-Visaを確認し、観光情報を入手します。",
        tourist_context: "2週間滞在する観光客。",

        admin_name: "システム管理者",
        admin_role: "管理者",
        admin_status: "スーパーユーザー",
        admin_objective: "プラットフォームを監督し、ユーザーとログを管理します。",
        admin_context: "メンテナンスとセキュリティのための技術的アクセス。",

        controller_name: "検証エージェント",
        controller_role: "身元管理者",
        controller_status: "宣誓官",
        controller_objective: "文書の真正性を検証し、要求を処理します。",
        controller_context: "警察や行政官が使用します。",
    },
    ru: {
        demoTitle: "Демо-режим",
        demoSubtitle: "Изучите платформу IDN.GA через различные профили пользователей. У каждой персоны есть определенные права и функции.",
        backHome: "На главную",
        role: "Роль",
        status: "Статус",
        objective: "Цель",
        context: "Контекст",

        citizen_name: "Jean Dupont",
        citizen_role: "Гражданин Габона",
        citizen_status: "Подтвержден (Уровень 3)",
        citizen_objective: "Доступ к административным услугам и управление официальными документами.",
        citizen_context: "Стандартный пользователь с полным цифровым удостоверением личности.",

        resident_name: "Marie Curie",
        resident_role: "Резидент",
        resident_status: "Подтвержден (Уровень 2)",
        resident_objective: "Продление вида на жительство и доступ к услугам для резидентов.",
        resident_context: "Экспат, проживающий в Габоне 5 лет.",

        tourist_name: "John Doe",
        tourist_role: "Временный посетитель",
        tourist_status: "Подтвержден (Уровень 1)",
        tourist_objective: "Просмотр электронной визы и получение туристической информации.",
        tourist_context: "Турист, приехавший на 2 недели.",

        admin_name: "Системный администратор",
        admin_role: "Администратор",
        admin_status: "Суперпользователь",
        admin_objective: "Контроль платформы, управление пользователями и журналами.",
        admin_context: "Технический доступ для обслуживания и безопасности.",

        controller_name: "Агент проверки",
        controller_role: "Контролер личности",
        controller_status: "Присяжный офицер",
        controller_objective: "Проверка подлинности документов и обработка запросов.",
        controller_context: "Используется полицией или административными агентами.",
    },
    es: {
        demoTitle: "Modo Demo",
        demoSubtitle: "Explore la plataforma IDN.GA a través de diferentes perfiles de usuario. Cada persona tiene derechos y funcionalidades específicas.",
        backHome: "Volver al inicio",
        role: "Rol",
        status: "Estado",
        objective: "Objetivo",
        context: "Contexto",

        citizen_name: "Jean Dupont",
        citizen_role: "Ciudadano Gabonés",
        citizen_status: "Verificado (Nivel 3)",
        citizen_objective: "Acceder a servicios administrativos y gestionar documentos oficiales.",
        citizen_context: "Usuario estándar con identidad digital completa.",

        resident_name: "Marie Curie",
        resident_role: "Residente",
        resident_status: "Verificado (Nivel 2)",
        resident_objective: "Renovar permiso de residencia y acceder a servicios para residentes.",
        resident_context: "Expatriada viviendo en Gabón desde hace 5 años.",

        tourist_name: "John Doe",
        tourist_role: "Visitante Temporal",
        tourist_status: "Verificado (Nivel 1)",
        tourist_objective: "Consultar e-Visa y obtener información turística.",
        tourist_context: "Turista de visita por 2 semanas.",

        admin_name: "Admin del Sistema",
        admin_role: "Administrador",
        admin_status: "Superusuario",
        admin_objective: "Supervisar la plataforma, gestionar usuarios y registros.",
        admin_context: "Acceso técnico para mantenimiento y seguridad.",

        controller_name: "Agente de Verificación",
        controller_role: "Controlador de Identidad",
        controller_status: "Oficial Jurado",
        controller_objective: "Verificar autenticidad de documentos y procesar solicitudes.",
        controller_context: "Utilizado por policía o agentes administrativos.",
    },
    ar: {
        demoTitle: "الوضع التجريبي",
        demoSubtitle: "استكشف منصة IDN.GA من خلال ملفات تعريف المستخدمين المختلفة. لكل شخصية حقوق وميزات محددة.",
        backHome: "العودة إلى الصفحة الرئيسية",
        role: "الدور",
        status: "الحالة",
        objective: "الهدف",
        context: "السياق",

        citizen_name: "Jean Dupont",
        citizen_role: "مواطن غابوني",
        citizen_status: "تم التحقق (المستوى 3)",
        citizen_objective: "الوصول إلى الخدمات الإدارية وإدارة الوثائق الرسمية.",
        citizen_context: "مستخدم قياسي بهوية رقمية كاملة.",

        resident_name: "Marie Curie",
        resident_role: "مقيم",
        resident_status: "تم التحقق (المستوى 2)",
        resident_objective: "تجديد تصريح الإقامة والوصول إلى خدمات المقيمين.",
        resident_context: "مغتربة تعيش في الغابون منذ 5 سنوات.",

        tourist_name: "John Doe",
        tourist_role: "زائر مؤقت",
        tourist_status: "تم التحقق (المستوى 1)",
        tourist_objective: "عرض التأشيرة الإلكترونية والحصول على معلومات سياحية.",
        tourist_context: "سائح في زيارة لمدة أسبوعين.",

        admin_name: "مسؤول النظام",
        admin_role: "مسؤول",
        admin_status: "مستخدم متميز",
        admin_objective: "الإشراف على المنصة وإدارة المستخدمين والسجلات.",
        admin_context: "وصول تقني للصيانة والأمان.",

        controller_name: "وكيل التحقق",
        controller_role: "مراقب الهوية",
        controller_status: "ضابط محلف",
        controller_objective: "التحقق من صحة الوثائق ومعالجة الطلبات.",
        controller_context: "يستخدم من قبل الشرطة أو الوكلاء الإداريين.",
    },
    pt: {
        demoTitle: "Modo de Demonstração",
        demoSubtitle: "Explore a plataforma IDN.GA através de diferentes perfis de usuário. Cada persona tem direitos e funcionalidades específicas.",
        backHome: "Voltar ao Início",
        role: "Função",
        status: "Status",
        objective: "Objetivo",
        context: "Contexto",

        citizen_name: "Jean Dupont",
        citizen_role: "Cidadão Gabonês",
        citizen_status: "Verificado (Nível 3)",
        citizen_objective: "Acessar serviços administrativos e gerenciar documentos oficiais.",
        citizen_context: "Usuário padrão com identidade digital completa.",

        resident_name: "Marie Curie",
        resident_role: "Residente",
        resident_status: "Verificado (Nível 2)",
        resident_objective: "Renovar autorização de residência e acessar serviços para residentes.",
        resident_context: "Expatriada vivendo no Gabão há 5 anos.",

        tourist_name: "John Doe",
        tourist_role: "Visitante Temporário",
        tourist_status: "Verificado (Nível 1)",
        tourist_objective: "Consultar e-Visa e obter informações turísticas.",
        tourist_context: "Turista em visita por 2 semanas.",

        admin_name: "Admin do Sistema",
        admin_role: "Administrador",
        admin_status: "Superusuário",
        admin_objective: "Supervisionar a plataforma, gerenciar usuários e logs.",
        admin_context: "Acesso técnico para manutenção e segurança.",

        controller_name: "Agente de Verificação",
        controller_role: "Controlador de Identidade",
        controller_status: "Oficial Juramentado",
        controller_objective: "Verificar autenticidade de documentos e processar solicitações.",
        controller_context: "Usado pela polícia ou agentes administrativos.",
    }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>('fr');

    useEffect(() => {
        const detectLanguage = async () => {
            try {
                // Try to get country from IP
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                const countryCode = data.country_code;

                const countryToLang: Record<string, Language> = {
                    'FR': 'fr', 'GA': 'fr', // Gabon -> French
                    'US': 'en', 'GB': 'en',
                    'CN': 'zh',
                    'KR': 'ko',
                    'JP': 'ja',
                    'RU': 'ru',
                    'ES': 'es',
                    'SA': 'ar', 'AE': 'ar', 'EG': 'ar',
                    'PT': 'pt', 'BR': 'pt',
                };

                if (countryCode && countryToLang[countryCode]) {
                    setLanguage(countryToLang[countryCode]);
                } else {
                    // Fallback to browser language
                    const browserLang = navigator.language.split('-')[0] as Language;
                    if (translations[browserLang]) {
                        setLanguage(browserLang);
                    }
                }
            } catch (error) {
                console.error("Failed to detect language via IP, falling back to browser default", error);
                // Fallback to browser language
                const browserLang = navigator.language.split('-')[0] as Language;
                if (translations[browserLang]) {
                    setLanguage(browserLang);
                }
            }
        };

        detectLanguage();
    }, []);

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    const dir = language === 'ar' ? 'rtl' : 'ltr';

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
            <div dir={dir} className="contents">
                {children}
            </div>
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
