import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'fr' | 'en' | 'zh' | 'ko' | 'ja' | 'ru' | 'es' | 'ar' | 'pt' | 'de';

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
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

const translations: Record<Language, Record<string, string>> = {
    fr: {
        // Landing Page
        landing_badge: 'République Gabonaise',
        landing_title_1: 'Votre identité,',
        landing_title_2: 'partout avec vous.',
        landing_description: 'La plateforme officielle pour sécuriser, gérer et utiliser votre identité numérique. Simple, rapide et accessible à tous les citoyens.',
        landing_cta_start: 'Commencer',
        landing_cta_demo: 'Voir la démo',
        landing_features: 'Fonctionnalités',
        landing_vision: 'Vision',
        landing_download: 'Télécharger',
        landing_security: 'Sécurité',
        landing_security_desc: 'Données chiffrées',
        landing_speed: 'Rapidité',
        landing_speed_desc: 'Accès immédiat',
        landing_universal: 'Universel',
        landing_universal_desc: 'Pour tous',
        landing_vision_title: 'Gabon Numérique 2025',
        landing_vision_desc: "Moderniser l'administration, réduire le papier et offrir une expérience citoyenne fluide et transparente.",
        landing_login: 'Connexion',
        landing_privacy: 'Confidentialité',
        landing_support: 'Support',

        demoTitle: "Mode Démo",
        demoSubtitle: "Explorez la plateforme IDN.GA à travers différents profils utilisateurs. Chaque persona dispose de droits et de fonctionnalités spécifiques.",
        backHome: "Retour à l'accueil",
        role: "Rôle",
        status: "Statut",
        objective: "Objectif",
        context: "Contexte",

        // Profile Selection Page
        profile_title: "Quel est votre profil ?",
        profile_subtitle: "Sélectionnez le type de profil qui correspond à votre situation actuelle.",
        profile_step: "Étape 1/5",
        profile_docs_label: "Documents requis",
        profile_protection: "Vos données sont protégées et ne seront utilisées que pour cette procédure.",
        profile_continue: "Continuer",

        profile_citizen_title: "Citoyen Gabonais",
        profile_citizen_desc: "Pour les détenteurs de la nationalité gabonaise.",

        profile_resident_title: "Résident au Gabon",
        profile_resident_desc: "Pour les étrangers résidant légalement au Gabon.",

        profile_tourist_title: "Visiteur Temporaire",
        profile_tourist_desc: "Pour les séjours de courte durée (Tourisme, Affaires, Famille).",

        profile_developer_title: "Développeur",
        profile_developer_desc: "Pour l'intégration API et les comptes professionnels.",

        // Documents
        doc_cni: "Carte Nationale d'Identité",
        doc_birth_cert: "Acte de Naissance",
        doc_residence_card: "Carte de Séjour",
        doc_passport: "Passeport",
        doc_visa: "Visa ou e-Visa",
        doc_business_reg: "Registre de Commerce",
        doc_api_request: "Demande d'accès API",

        // KYC Steps
        kyc_step: "Étape 2/5",
        kyc_front_title: "Recto du document",
        kyc_front_subtitle: "Placez le recto de votre document dans le cadre",
        kyc_back_title: "Verso du document",
        kyc_back_subtitle: "Retournez et placez le verso dans le cadre",
        kyc_processing_title: "Analyse en cours...",
        kyc_processing_subtitle: "Vérification de l'authenticité du document",
        kyc_success_title: "Document vérifié !",
        kyc_success_subtitle: "Passage à la vérification faciale",
        kyc_camera_front: "Face avec la photo",
        kyc_camera_back: "Face avec les informations",
        kyc_tips_lighting: "Assurez-vous que le document est bien éclairé",
        kyc_ocr_processing: "Analyse OCR en cours...",
        kyc_doc_auth: "Document authentifié",

        // Selfie Steps
        selfie_step: "Étape 3/5",
        selfie_title: "Vérification Faciale",
        selfie_subtitle: "Preuve de vie biométrique",
        selfie_msg_position: "Positionnez votre visage dans l'ovale",
        selfie_msg_detecting: "Détection du visage...",
        selfie_msg_ready: "Parfait ! Regardez l'objectif et clignez des yeux",
        selfie_msg_captured: "Analyse biométrique...",
        selfie_msg_verified: "Identité confirmée !",
        selfie_tips: "Restez immobile dans un endroit bien éclairé",

        // PIN Steps
        pin_step: "Étape 4/5",
        pin_create_title: "Créez votre code PIN",
        pin_confirm_title: "Confirmez votre PIN",
        pin_create_subtitle: "Ce code sécurisera l'accès à votre identité",
        pin_confirm_subtitle: "Saisissez à nouveau votre code PIN",
        pin_biometrics: "Activer la biométrie",
        pin_biometrics_desc: "Face ID / Touch ID",
        pin_security: "Votre PIN est chiffré et stocké de manière sécurisée.",

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

        developer_name: "Dev API",
        developer_role: "Développeur",
        developer_status: "API Access Activé",
        developer_objective: "Intégrer les services d'identité numérique via l'API officielle.",
        developer_context: "Pour les entreprises et développeurs tiers.",
    },
    en: {
        // Landing Page
        landing_badge: 'Gabonese Republic',
        landing_title_1: 'Your identity,',
        landing_title_2: 'everywhere with you.',
        landing_description: 'The official platform to secure, manage and use your digital identity. Simple, fast and accessible to all citizens.',
        landing_cta_start: 'Get Started',
        landing_cta_demo: 'View Demo',
        landing_features: 'Features',
        landing_vision: 'Vision',
        landing_download: 'Download',
        landing_security: 'Security',
        landing_security_desc: 'Encrypted data',
        landing_speed: 'Speed',
        landing_speed_desc: 'Instant access',
        landing_universal: 'Universal',
        landing_universal_desc: 'For everyone',
        landing_vision_title: 'Digital Gabon 2025',
        landing_vision_desc: 'Modernize administration, reduce paper and offer a seamless citizen experience.',
        landing_login: 'Login',
        landing_privacy: 'Privacy',
        landing_support: 'Support',

        demoTitle: "Demo Mode",
        demoSubtitle: "Explore the IDN.GA platform through different user profiles. Each persona has specific rights and features.",
        backHome: "Back to Home",
        role: "Role",
        status: "Status",
        objective: "Objective",
        context: "Context",

        // Profile Selection Page
        profile_title: "What is your profile?",
        profile_subtitle: "Select the profile type that corresponds to your current situation.",
        profile_step: "Step 1/5",
        profile_docs_label: "Required Documents",
        profile_protection: "Your data is protected and will only be used for this procedure.",
        profile_continue: "Continue",

        profile_citizen_title: "Gabonese Citizen",
        profile_citizen_desc: "For holders of Gabonese nationality.",

        profile_resident_title: "Resident in Gabon",
        profile_resident_desc: "For foreigners legally residing in Gabon.",

        profile_tourist_title: "Temporary Visitor",
        profile_tourist_desc: "For short-term stays (Tourism, Business, Family).",

        profile_developer_title: "Developer",
        profile_developer_desc: "For API integration and business accounts.",

        // Documents
        doc_cni: "National ID Card",
        doc_birth_cert: "Birth Certificate",
        doc_residence_card: "Residence Card",
        doc_passport: "Passport",
        doc_visa: "Visa or e-Visa",
        doc_business_reg: "Business Registration",
        doc_api_request: "API Access Request",

        // KYC Steps
        kyc_step: "Step 2/5",
        kyc_front_title: "Document Front",
        kyc_front_subtitle: "Place the front of your document in the frame",
        kyc_back_title: "Document Back",
        kyc_back_subtitle: "Flip and place the back in the frame",
        kyc_processing_title: "Processing...",
        kyc_processing_subtitle: "Verifying document authenticity",
        kyc_success_title: "Document Verified!",
        kyc_success_subtitle: "Proceeding to facial verification",
        kyc_camera_front: "Photo Side",
        kyc_camera_back: "Information Side",
        kyc_tips_lighting: "Make sure the document is well lit",
        kyc_ocr_processing: "OCR Analysis in progress...",
        kyc_doc_auth: "Document Authenticated",

        // Selfie Steps
        selfie_step: "Step 3/5",
        selfie_title: "Facial Verification",
        selfie_subtitle: "Biometric Liveness Proof",
        selfie_msg_position: "Position your face in the oval",
        selfie_msg_detecting: "Detecting face...",
        selfie_msg_ready: "Perfect! Look at the camera and blink",
        selfie_msg_captured: "Biometric analysis...",
        selfie_msg_verified: "Identity confirmed!",
        selfie_tips: "Stay still in a well-lit area",

        // PIN Steps
        pin_step: "Step 4/5",
        pin_create_title: "Create your PIN",
        pin_confirm_title: "Confirm your PIN",
        pin_create_subtitle: "This code will secure access to your identity",
        pin_confirm_subtitle: "Enter your PIN again",
        pin_biometrics: "Enable Biometrics",
        pin_biometrics_desc: "Face ID / Touch ID",
        pin_security: "Your PIN is encrypted and stored securely.",

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

        developer_name: "Dev API",
        developer_role: "Developer",
        developer_status: "API Access Enabled",
        developer_objective: "Integrate digital identity services via the official API.",
        developer_context: "For businesses and third-party developers.",
    },
    zh: {
        // Landing Page
        landing_badge: '加蓬共和国',
        landing_title_1: '您的身份，',
        landing_title_2: '随时随地。',
        landing_description: '安全、管理和使用您的数字身份的官方平台。简单、快速，所有公民均可使用。',
        landing_cta_start: '开始',
        landing_cta_demo: '查看演示',
        landing_features: '功能',
        landing_vision: '愿景',
        landing_download: '下载',
        landing_security: '安全',
        landing_security_desc: '加密数据',
        landing_speed: '速度',
        landing_speed_desc: '即时访问',
        landing_universal: '通用',
        landing_universal_desc: '适合所有人',
        landing_vision_title: '数字加蓬 2025',
        landing_vision_desc: '现代化行政，减少纸张，提供无缝的公民体验。',
        landing_login: '登录',
        landing_privacy: '隐私',
        landing_support: '支持',

        demoTitle: "演示模式",
        demoSubtitle: "通过不同的用户配置文件探索 IDN.GA 平台。每个角色都有特定的权限和功能。",
        backHome: "返回首页",
        role: "角色",
        status: "状态",
        objective: "目标",
        context: "背景",

        // Profile Selection Page
        profile_title: "您的个人资料是什么？",
        profile_subtitle: "选择符合您当前情况的个人资料类型。",
        profile_step: "步骤 1/5",
        profile_docs_label: "所需文件",
        profile_protection: "您的数据受到保护，仅用于此过程。",
        profile_continue: "继续",

        profile_citizen_title: "加蓬公民",
        profile_citizen_desc: "持有加蓬国籍的人。",

        profile_resident_title: "加蓬居民",
        profile_resident_desc: "合法居住在加蓬的外国人。",

        profile_tourist_title: "临时访客",
        profile_tourist_desc: "短期停留（旅游、商务、家庭）。",

        profile_developer_title: "开发者",
        profile_developer_desc: "用于 API 集成和企业帐户。",

        // Documents
        doc_cni: "国民身份证",
        doc_birth_cert: "出生证明",
        doc_residence_card: "居留证",
        doc_passport: "护照",
        doc_visa: "签证或电子签证",
        doc_business_reg: "商业登记",
        doc_api_request: "API 访问请求",

        // KYC Steps
        kyc_step: "步骤 2/5",
        kyc_front_title: "文件正面",
        kyc_front_subtitle: "将文件正面放入框内",
        kyc_back_title: "文件背面",
        kyc_back_subtitle: "翻转并将背面放入框内",
        kyc_processing_title: "处理中...",
        kyc_processing_subtitle: "验证文件真实性",
        kyc_success_title: "文件已验证！",
        kyc_success_subtitle: "进入面部验证",
        kyc_camera_front: "照片面",
        kyc_camera_back: "信息面",
        kyc_tips_lighting: "确保文件光线充足",
        kyc_ocr_processing: "OCR 分析进行中...",
        kyc_doc_auth: "文件已认证",

        // Selfie Steps
        selfie_step: "步骤 3/5",
        selfie_title: "面部验证",
        selfie_subtitle: "生物特征活体证明",
        selfie_msg_position: "将脸部对准椭圆框",
        selfie_msg_detecting: "正在检测面部...",
        selfie_msg_ready: "完美！看着镜头并眨眼",
        selfie_msg_captured: "生物特征分析...",
        selfie_msg_verified: "身份已确认！",
        selfie_tips: "在光线充足的地方保持静止",

        // PIN Steps
        pin_step: "步骤 4/5",
        pin_create_title: "创建您的 PIN 码",
        pin_confirm_title: "确认您的 PIN 码",
        pin_create_subtitle: "此代码将保护您的身份访问",
        pin_confirm_subtitle: "再次输入您的 PIN 码",
        pin_biometrics: "启用生物识别",
        pin_biometrics_desc: "面容 ID / 指纹 ID",
        pin_security: "您的 PIN 码已加密并安全存储。",

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

        developer_name: "API 开发者",
        developer_role: "开发者",
        developer_status: "API 访问已启用",
        developer_objective: "通过官方 API 集成数字身份服务。",
        developer_context: "适用于企业和第三方开发者。",
    },
    ko: {
        // Landing Page
        landing_badge: '가봉 공화국',
        landing_title_1: '당신의 신원,',
        landing_title_2: '언제 어디서나.',
        landing_description: '디지털 신원을 보호, 관리 및 사용하기 위한 공식 플랫폼입니다. 간단하고 빠르며 모든 시민이 사용할 수 있습니다.',
        landing_cta_start: '시작하기',
        landing_cta_demo: '데모 보기',
        landing_features: '기능',
        landing_vision: '비전',
        landing_download: '다운로드',
        landing_security: '보안',
        landing_security_desc: '암호화된 데이터',
        landing_speed: '속도',
        landing_speed_desc: '즉시 액세스',
        landing_universal: '범용',
        landing_universal_desc: '모두를 위해',
        landing_vision_title: '디지털 가봉 2025',
        landing_vision_desc: '행정 현대화, 종이 사용 감소, 원활한 시민 경험 제공.',
        landing_login: '로그인',
        landing_privacy: '개인정보',
        landing_support: '지원',

        demoTitle: "데모 모드",
        demoSubtitle: "다양한 사용자 프로필을 통해 IDN.GA 플랫폼을 살펴보세요. 각 페르소나는 특정 권한과 기능을 가지고 있습니다.",
        backHome: "홈으로 돌아가기",
        role: "역할",
        status: "상태",
        objective: "목표",
        context: "컨텍스트",

        // Profile Selection Page
        profile_title: "당신의 프로필은 무엇입니까?",
        profile_subtitle: "현재 상황에 맞는 프로필 유형을 선택하십시오.",
        profile_step: "단계 1/5",
        profile_docs_label: "필요 서류",
        profile_protection: "귀하의 데이터는 보호되며 이 절차에만 사용됩니다.",
        profile_continue: "계속하다",

        profile_citizen_title: "가봉 시민",
        profile_citizen_desc: "가봉 국적 소지자.",

        profile_resident_title: "가봉 거주자",
        profile_resident_desc: "가봉에 합법적으로 거주하는 외국인.",

        profile_tourist_title: "임시 방문자",
        profile_tourist_desc: "단기 체류 (관광, 비즈니스, 가족).",

        profile_developer_title: "개발자",
        profile_developer_desc: "API 통합 및 비즈니스 계정용.",

        // Documents
        doc_cni: "주민등록증",
        doc_birth_cert: "출생 증명서",
        doc_residence_card: "거주증",
        doc_passport: "여권",
        doc_visa: "비자 또는 e-비자",
        doc_business_reg: "사업자 등록증",
        doc_api_request: "API 액세스 요청",

        // KYC Steps
        kyc_step: "단계 2/5",
        kyc_front_title: "문서 앞면",
        kyc_front_subtitle: "문서의 앞면을 프레임에 맞추세요",
        kyc_back_title: "문서 뒷면",
        kyc_back_subtitle: "뒤집어서 뒷면을 프레임에 맞추세요",
        kyc_processing_title: "처리 중...",
        kyc_processing_subtitle: "문서 진위 확인 중",
        kyc_success_title: "문서 확인됨!",
        kyc_success_subtitle: "얼굴 인증으로 진행",
        kyc_camera_front: "사진 면",
        kyc_camera_back: "정보 면",
        kyc_tips_lighting: "문서가 밝게 비춰지는지 확인하세요",
        kyc_ocr_processing: "OCR 분석 진행 중...",
        kyc_doc_auth: "문서 인증됨",

        // Selfie Steps
        selfie_step: "단계 3/5",
        selfie_title: "얼굴 인증",
        selfie_subtitle: "생체 인식 활동 증명",
        selfie_msg_position: "타원형 틀에 얼굴을 맞추세요",
        selfie_msg_detecting: "얼굴 감지 중...",
        selfie_msg_ready: "완벽해요! 카메라를 보고 눈을 깜빡이세요",
        selfie_msg_captured: "생체 인식 분석...",
        selfie_msg_verified: "신원 확인됨!",
        selfie_tips: "밝은 곳에서 움직이지 마세요",

        // PIN Steps
        pin_step: "단계 4/5",
        pin_create_title: "PIN 생성",
        pin_confirm_title: "PIN 확인",
        pin_create_subtitle: "이 코드는 귀하의 신원 접근을 보호합니다",
        pin_confirm_subtitle: "PIN을 다시 입력하세요",
        pin_biometrics: "생체 인식 활성화",
        pin_biometrics_desc: "Face ID / Touch ID",
        pin_security: "귀하의 PIN은 암호화되어 안전하게 저장됩니다.",

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

        developer_name: "API 개발자",
        developer_role: "개발자",
        developer_status: "API 액세스 활성화",
        developer_objective: "공식 API를 통해 디지털 신원 서비스를 통합합니다.",
        developer_context: "기업 및 서드파티 개발자용.",
    },
    ja: {
        // Landing Page
        landing_badge: 'ガボン共和国',
        landing_title_1: 'あなたのアイデンティティ、',
        landing_title_2: 'いつでもどこでも。',
        landing_description: 'デジタル ID を保護、管理、使用するための公式プラットフォーム。シンプル、高速で、すべての市民が利用可能。',
        landing_cta_start: '始める',
        landing_cta_demo: 'デモを見る',
        landing_features: '機能',
        landing_vision: 'ビジョン',
        landing_download: 'ダウンロード',
        landing_security: 'セキュリティ',
        landing_security_desc: '暗号化データ',
        landing_speed: 'スピード',
        landing_speed_desc: '即時アクセス',
        landing_universal: 'ユニバーサル',
        landing_universal_desc: 'すべての人へ',
        landing_vision_title: 'デジタルガボン 2025',
        landing_vision_desc: '行政の近代化、ペーパー削減、シームレスな市民体験の提供。',
        landing_login: 'ログイン',
        landing_privacy: 'プライバシー',
        landing_support: 'サポート',

        demoTitle: "デモモード",
        demoSubtitle: "さまざまなユーザープロファイルを通じてIDN.GAプラットフォームを探索してください。各ペルソナには特定の権限と機能があります。",
        backHome: "ホームに戻る",
        role: "役割",
        status: "ステータス",
        objective: "目的",
        context: "コンテキスト",

        // Profile Selection Page
        profile_title: "あなたのプロフィールは何ですか？",
        profile_subtitle: "現在の状況に合ったプロフィールタイプを選択してください。",
        profile_step: "ステップ 1/5",
        profile_docs_label: "必要書類",
        profile_protection: "データは保護され、この手続きにのみ使用されます。",
        profile_continue: "続行",

        profile_citizen_title: "ガボン市民",
        profile_citizen_desc: "ガボン国籍をお持ちの方。",

        profile_resident_title: "ガボン居住者",
        profile_resident_desc: "ガボンに合法的に居住する外国人。",

        profile_tourist_title: "一時滞在者",
        profile_tourist_desc: "短期滞在（観光、ビジネス、家族）向け。",

        profile_developer_title: "開発者",
        profile_developer_desc: "API統合およびビジネスアカウント用。",

        // Documents
        doc_cni: "国民身分証明書",
        doc_birth_cert: "出生証明書",
        doc_residence_card: "在留カード",
        doc_passport: "パスポート",
        doc_visa: "ビザまたはe-Visa",
        doc_business_reg: "商業登記",
        doc_api_request: "APIアクセス要求",

        // KYC Steps
        kyc_step: "ステップ 2/5",
        kyc_front_title: "書類の表面",
        kyc_front_subtitle: "書類の表面をフレームに合わせてください",
        kyc_back_title: "書類の裏面",
        kyc_back_subtitle: "裏返して裏面をフレームに合わせてください",
        kyc_processing_title: "処理中...",
        kyc_processing_subtitle: "書類の真正性を確認中",
        kyc_success_title: "書類確認完了！",
        kyc_success_subtitle: "顔認証に進みます",
        kyc_camera_front: "写真のある面",
        kyc_camera_back: "情報のある面",
        kyc_tips_lighting: "書類が明るく照らされていることを確認してください",
        kyc_ocr_processing: "OCR分析中...",
        kyc_doc_auth: "書類認証済み",

        // Selfie Steps
        selfie_step: "ステップ 3/5",
        selfie_title: "顔認証",
        selfie_subtitle: "生体認証による生存証明",
        selfie_msg_position: "顔を楕円に合わせてください",
        selfie_msg_detecting: "顔を検出中...",
        selfie_msg_ready: "完璧です！カメラを見て瞬きしてください",
        selfie_msg_captured: "生体認証分析...",
        selfie_msg_verified: "本人確認完了！",
        selfie_tips: "明るい場所で動かないでください",

        // PIN Steps
        pin_step: "ステップ 4/5",
        pin_create_title: "PINコードの作成",
        pin_confirm_title: "PINの確認",
        pin_create_subtitle: "このコードはあなたのIDへのアクセスを保護します",
        pin_confirm_subtitle: "PINを再度入力してください",
        pin_biometrics: "生体認証を有効にする",
        pin_biometrics_desc: "Face ID / Touch ID",
        pin_security: "PINは暗号化され安全に保存されます。",

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

        developer_name: "API 開発者",
        developer_role: "開発者",
        developer_status: "API アクセス有効",
        developer_objective: "公式 API を通じてデジタル ID サービスを統合します。",
        developer_context: "企業およびサードパーティ開発者向け。",
    },
    ru: {
        // Landing Page
        landing_badge: 'Габонская Республика',
        landing_title_1: 'Ваша личность,',
        landing_title_2: 'всегда с вами.',
        landing_description: 'Официальная платформа для защиты, управления и использования вашей цифровой личности. Простая, быстрая и доступная для всех граждан.',
        landing_cta_start: 'Начать',
        landing_cta_demo: 'Смотреть демо',
        landing_features: 'Функции',
        landing_vision: 'Видение',
        landing_download: 'Скачать',
        landing_security: 'Безопасность',
        landing_security_desc: 'Зашифрованные данные',
        landing_speed: 'Скорость',
        landing_speed_desc: 'Мгновенный доступ',
        landing_universal: 'Универсальный',
        landing_universal_desc: 'Для всех',
        landing_vision_title: 'Цифровой Габон 2025',
        landing_vision_desc: 'Модернизация администрации, сокращение бумаги, бесперебойный сервис для граждан.',
        landing_login: 'Вход',
        landing_privacy: 'Конфиденциальность',
        landing_support: 'Поддержка',

        demoTitle: "Демо-режим",
        demoSubtitle: "Изучите платформу IDN.GA через различные профили пользователей. У каждой персоны есть определенные права и функции.",
        backHome: "На главную",
        role: "Роль",
        status: "Статус",
        objective: "Цель",
        context: "Контекст",

        // Profile Selection Page
        profile_title: "Какой у вас профиль?",
        profile_subtitle: "Выберите тип профиля, соответствующий вашей текущей ситуации.",
        profile_step: "Шаг 1/5",
        profile_docs_label: "Необходимые документы",
        profile_protection: "Ваши данные защищены и будут использованы только для этой процедуры.",
        profile_continue: "Продолжить",

        profile_citizen_title: "Гражданин Габона",
        profile_citizen_desc: "Для обладателей габонского гражданства.",

        profile_resident_title: "Резидент Габона",
        profile_resident_desc: "Для иностранцев, легально проживающих в Габоне.",

        profile_tourist_title: "Временный посетитель",
        profile_tourist_desc: "Для краткосрочного пребывания (Туризм, Бизнес, Семья).",

        profile_developer_title: "Разработчик",
        profile_developer_desc: "Для интеграции API и бизнес-аккаунтов.",

        // Documents
        doc_cni: "Национальное удостоверение личности",
        doc_birth_cert: "Свидетельство о рождении",
        doc_residence_card: "Вид на жительство",
        doc_passport: "Паспорт",
        doc_visa: "Виза или электронная виза",
        doc_business_reg: "Регистрация бизнеса",
        doc_api_request: "Запрос доступа к API",

        // KYC Steps
        kyc_step: "Шаг 2/5",
        kyc_front_title: "Лицевая сторона",
        kyc_front_subtitle: "Поместите лицевую сторону документа в рамку",
        kyc_back_title: "Обратная сторона",
        kyc_back_subtitle: "Переверните и поместите обратную сторону в рамку",
        kyc_processing_title: "Обработка...",
        kyc_processing_subtitle: "Проверка подлинности документа",
        kyc_success_title: "Документ проверен!",
        kyc_success_subtitle: "Переход к проверке лица",
        kyc_camera_front: "Сторона с фото",
        kyc_camera_back: "Сторона с информацией",
        kyc_tips_lighting: "Убедитесь, что документ хорошо освещен",
        kyc_ocr_processing: "OCR анализ...",
        kyc_doc_auth: "Документ подтвержден",

        // Selfie Steps
        selfie_step: "Шаг 3/5",
        selfie_title: "Проверка лица",
        selfie_subtitle: "Биометрическое подтверждение жизни",
        selfie_msg_position: "Поместите лицо в овал",
        selfie_msg_detecting: "Обнаружение лица...",
        selfie_msg_ready: "Отлично! Посмотрите в камеру и моргните",
        selfie_msg_captured: "Биометрический анализ...",
        selfie_msg_verified: "Личность подтверждена!",
        selfie_tips: "Оставайтесь неподвижными в хорошо освещенном месте",

        // PIN Steps
        pin_step: "Шаг 4/5",
        pin_create_title: "Создайте PIN-код",
        pin_confirm_title: "Подтвердите PIN-код",
        pin_create_subtitle: "Этот код защитит доступ к вашей личности",
        pin_confirm_subtitle: "Введите PIN-код снова",
        pin_biometrics: "Включить биометрию",
        pin_biometrics_desc: "Face ID / Touch ID",
        pin_security: "Ваш PIN-код зашифрован и надежно сохранен.",

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

        developer_name: "API Разработчик",
        developer_role: "Разработчик",
        developer_status: "API доступ активен",
        developer_objective: "Интеграция сервисов цифровой идентификации через официальный API.",
        developer_context: "Для бизнеса и сторонних разработчиков.",
    },
    es: {
        // Landing Page
        landing_badge: 'República Gabonesa',
        landing_title_1: 'Tu identidad,',
        landing_title_2: 'siempre contigo.',
        landing_description: 'La plataforma oficial para proteger, gestionar y usar tu identidad digital. Simple, rápida y accesible para todos los ciudadanos.',
        landing_cta_start: 'Comenzar',
        landing_cta_demo: 'Ver demo',
        landing_features: 'Funciones',
        landing_vision: 'Visión',
        landing_download: 'Descargar',
        landing_security: 'Seguridad',
        landing_security_desc: 'Datos cifrados',
        landing_speed: 'Velocidad',
        landing_speed_desc: 'Acceso instantáneo',
        landing_universal: 'Universal',
        landing_universal_desc: 'Para todos',
        landing_vision_title: 'Gabón Digital 2025',
        landing_vision_desc: 'Modernizar la administración, reducir el papel, ofrecer una experiencia ciudadana fluida.',
        landing_login: 'Iniciar sesión',
        landing_privacy: 'Privacidad',
        landing_support: 'Soporte',

        demoTitle: "Modo Demo",
        demoSubtitle: "Explore la plataforma IDN.GA a través de diferentes perfiles de usuario. Cada persona tiene derechos y funcionalidades específicas.",
        backHome: "Volver al inicio",
        role: "Rol",
        status: "Estado",
        objective: "Objetivo",
        context: "Contexto",

        // Profile Selection Page
        profile_title: "¿Cuál es tu perfil?",
        profile_subtitle: "Selecciona el tipo de perfil que corresponde a tu situación actual.",
        profile_step: "Paso 1/5",
        profile_docs_label: "Documentos requeridos",
        profile_protection: "Tus datos están protegidos y solo se usarán para este procedimiento.",
        profile_continue: "Continuar",

        profile_citizen_title: "Ciudadano Gabonés",
        profile_citizen_desc: "Para titulares de nacionalidad gabonesa.",

        profile_resident_title: "Residente en Gabón",
        profile_resident_desc: "Para extranjeros que residen legalmente en Gabón.",

        profile_tourist_title: "Visitante Temporal",
        profile_tourist_desc: "Para estancias cortas (Turismo, Negocios, Familia).",

        profile_developer_title: "Desarrollador",
        profile_developer_desc: "Para integración de API y cuentas comerciales.",

        // Documents
        doc_cni: "Documento Nacional de Identidad",
        doc_birth_cert: "Acta de Nacimiento",
        doc_residence_card: "Tarjeta de Residencia",
        doc_passport: "Pasaporte",
        doc_visa: "Visa o e-Visa",
        doc_business_reg: "Registro de Comercio",
        doc_api_request: "Solicitud de acceso API",

        // KYC Steps
        kyc_step: "Paso 2/5",
        kyc_front_title: "Frente del documento",
        kyc_front_subtitle: "Coloca el frente de tu documento en el marco",
        kyc_back_title: "Dorso del documento",
        kyc_back_subtitle: "Voltea y coloca el dorso en el marco",
        kyc_processing_title: "Procesando...",
        kyc_processing_subtitle: "Verificando autenticidad del documento",
        kyc_success_title: "¡Documento verificado!",
        kyc_success_subtitle: "Procediendo a verificación facial",
        kyc_camera_front: "Lado de la foto",
        kyc_camera_back: "Lado de la información",
        kyc_tips_lighting: "Asegúrate de que el documento esté bien iluminado",
        kyc_ocr_processing: "Análisis OCR en curso...",
        kyc_doc_auth: "Documento autenticado",

        // Selfie Steps
        selfie_step: "Paso 3/5",
        selfie_title: "Verificación Facial",
        selfie_subtitle: "Prueba de vida biométrica",
        selfie_msg_position: "Posiciona tu cara en el óvalo",
        selfie_msg_detecting: "Detectando rostro...",
        selfie_msg_ready: "¡Perfecto! Mira a la cámara y parpadea",
        selfie_msg_captured: "Análisis biométrico...",
        selfie_msg_verified: "¡Identidad confirmada!",
        selfie_tips: "Quédate quieto en un lugar bien iluminado",

        // PIN Steps
        pin_step: "Paso 4/5",
        pin_create_title: "Crea tu código PIN",
        pin_confirm_title: "Confirma tu PIN",
        pin_create_subtitle: "Este código asegurará el acceso a tu identidad",
        pin_confirm_subtitle: "Ingresa tu PIN nuevamente",
        pin_biometrics: "Habilitar biométricos",
        pin_biometrics_desc: "Face ID / Touch ID",
        pin_security: "Tu PIN está encriptado y almacenado de forma segura.",

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

        developer_name: "Dev API",
        developer_role: "Desarrollador",
        developer_status: "Acceso API Activado",
        developer_objective: "Integrar servicios de identidad digital a través de la API oficial.",
        developer_context: "Para empresas y desarrolladores externos.",
    },
    ar: {
        // Landing Page
        landing_badge: 'الجمهورية الغابونية',
        landing_title_1: 'هويتك،',
        landing_title_2: 'معك أينما كنت.',
        landing_description: 'المنصة الرسمية لحماية هويتك الرقمية وإدارتها واستخدامها. بسيطة وسريعة ومتاحة لجميع المواطنين.',
        landing_cta_start: 'ابدأ',
        landing_cta_demo: 'مشاهدة العرض',
        landing_features: 'الميزات',
        landing_vision: 'الرؤية',
        landing_download: 'تحميل',
        landing_security: 'الأمان',
        landing_security_desc: 'بيانات مشفرة',
        landing_speed: 'السرعة',
        landing_speed_desc: 'وصول فوري',
        landing_universal: 'شامل',
        landing_universal_desc: 'للجميع',
        landing_vision_title: 'غابون الرقمية 2025',
        landing_vision_desc: 'تحديث الإدارة، تقليل الورق، تقديم تجربة مواطن سلسة.',
        landing_login: 'تسجيل الدخول',
        landing_privacy: 'الخصوصية',
        landing_support: 'الدعم',

        demoTitle: "الوضع التجريبي",
        demoSubtitle: "استكشف منصة IDN.GA من خلال ملفات تعريف المستخدمين المختلفة. لكل شخصية حقوق وميزات محددة.",
        backHome: "العودة إلى الصفحة الرئيسية",
        role: "الدور",
        status: "الحالة",
        objective: "الهدف",
        context: "السياق",

        // Profile Selection Page
        profile_title: "ما هو ملفك الشخصي؟",
        profile_subtitle: "حدد نوع الملف الشخصي الذي يتوافق مع وضعك الحالي.",
        profile_step: "الخطوة 1/5",
        profile_docs_label: "الوثائق المطلوبة",
        profile_protection: "بياناتك محمية ولن تستخدم إلا لهذا الإجراء.",
        profile_continue: "متابعة",

        profile_citizen_title: "مواطن غابوني",
        profile_citizen_desc: "لحاملي الجنسية الغابونية.",

        profile_resident_title: "مقيم في الغابون",
        profile_resident_desc: "للأجانب المقيمين بشكل قانوني في الغابون.",

        profile_tourist_title: "زائر مؤقت",
        profile_tourist_desc: "للإقامات قصيرة الأمد (سياحة، أعمال، عائلة).",

        profile_developer_title: "مطور",
        profile_developer_desc: "للتكامل مع API وحسابات الأعمال.",

        // Documents
        doc_cni: "بطاقة الهوية الوطنية",
        doc_birth_cert: "شهادة الميلاد",
        doc_residence_card: "بطاقة الإقامة",
        doc_passport: "جواز سفر",
        doc_visa: "تأشيرة أو تأشيرة إلكترونية",
        doc_business_reg: "السجل التجاري",
        doc_api_request: "طلب الوصول إلى API",

        // KYC Steps
        kyc_step: "الخطوة 2/5",
        kyc_front_title: "الوجه الأمامي للمستند",
        kyc_front_subtitle: "ضع الوجه الأمامي للمستند في الإطار",
        kyc_back_title: "الوجه الخلفي للمستند",
        kyc_back_subtitle: "اقلب وضع الوجه الخلفي في الإطار",
        kyc_processing_title: "يتم المعالجة...",
        kyc_processing_subtitle: "التحقق من صحة المستند",
        kyc_success_title: "تم التحقق من المستند!",
        kyc_success_subtitle: "الانتقال إلى التحقق من الوجه",
        kyc_camera_front: "جانب الصورة",
        kyc_camera_back: "جانب المعلومات",
        kyc_tips_lighting: "تأكد من إضاءة المستند جيدًا",
        kyc_ocr_processing: "تحليل OCR قيد التقدم...",
        kyc_doc_auth: "تم توثيق المستند",

        // Selfie Steps
        selfie_step: "الخطوة 3/5",
        selfie_title: "التحقق من الوجه",
        selfie_subtitle: "إثبات الحياة البيومتري",
        selfie_msg_position: "ضع وجهك في الشكل البيضاوي",
        selfie_msg_detecting: "جاري اكتشاف الوجه...",
        selfie_msg_ready: "ممتاز! انظر إلى الكاميرا وارمش",
        selfie_msg_captured: "تحليل بيومتري...",
        selfie_msg_verified: "تم تأكيد الهوية!",
        selfie_tips: "ابق ثابتًا في مكان جيد الإضاءة",

        // PIN Steps
        pin_step: "الخطوة 4/5",
        pin_create_title: "أنشئ رمز PIN الخاص بك",
        pin_confirm_title: "أكد رمز PIN",
        pin_create_subtitle: "سيؤمن هذا الرمز الوصول إلى هويتك",
        pin_confirm_subtitle: "أدخل رمز PIN مرة أخرى",
        pin_biometrics: "تفعيل القياسات الحيوية",
        pin_biometrics_desc: "Face ID / Touch ID",
        pin_security: "رمز PIN الخاص بك مشفر ومخزن بأمان.",

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

        developer_name: "مطور API",
        developer_role: "مطور",
        developer_status: "وصول API مُفعّل",
        developer_objective: "دمج خدمات الهوية الرقمية عبر API الرسمي.",
        developer_context: "للشركات والمطورين الخارجيين.",
    },
    pt: {
        // Landing Page
        landing_badge: 'República Gabonesa',
        landing_title_1: 'Sua identidade,',
        landing_title_2: 'sempre com você.',
        landing_description: 'A plataforma oficial para proteger, gerenciar e usar sua identidade digital. Simples, rápida e acessível a todos os cidadãos.',
        landing_cta_start: 'Começar',
        landing_cta_demo: 'Ver demo',
        landing_features: 'Funcionalidades',
        landing_vision: 'Visão',
        landing_download: 'Baixar',
        landing_security: 'Segurança',
        landing_security_desc: 'Dados criptografados',
        landing_speed: 'Velocidade',
        landing_speed_desc: 'Acesso instantâneo',
        landing_universal: 'Universal',
        landing_universal_desc: 'Para todos',
        landing_vision_title: 'Gabão Digital 2025',
        landing_vision_desc: 'Modernizar a administração, reduzir papel, oferecer uma experiência cidadã fluida.',
        landing_login: 'Entrar',
        landing_privacy: 'Privacidade',
        landing_support: 'Suporte',

        demoTitle: "Modo de Demonstração",
        demoSubtitle: "Explore a plataforma IDN.GA através de diferentes perfis de usuário. Cada persona tem direitos e funcionalidades específicas.",
        backHome: "Voltar ao Início",
        role: "Função",
        status: "Status",
        objective: "Objetivo",
        context: "Contexto",

        // Profile Selection Page
        profile_title: "Qual é o seu perfil?",
        profile_subtitle: "Selecione o tipo de perfil que corresponde à sua situação atual.",
        profile_step: "Passo 1/5",
        profile_docs_label: "Documentos necessários",
        profile_protection: "Seus dados estão protegidos e serão usados apenas para este procedimento.",
        profile_continue: "Continuar",

        profile_citizen_title: "Cidadão Gabonês",
        profile_citizen_desc: "Para portadores de nacionalidade gabonesa.",

        profile_resident_title: "Residente no Gabão",
        profile_resident_desc: "Para estrangeiros residindo legalmente no Gabão.",

        profile_tourist_title: "Visitante Temporário",
        profile_tourist_desc: "Para estadias de curta duração (Turismo, Negócios, Família).",

        profile_developer_title: "Desenvolvedor",
        profile_developer_desc: "Para integração de API e contas comerciais.",

        // Documents
        doc_cni: "Carteira Nacional de Identidade",
        doc_birth_cert: "Certidão de Nascimento",
        doc_residence_card: "Cartão de Residência",
        doc_passport: "Passaporte",
        doc_visa: "Visto ou e-Visa",
        doc_business_reg: "Registro Comercial",
        doc_api_request: "Solicitação de acesso à API",

        // KYC Steps
        kyc_step: "Passo 2/5",
        kyc_front_title: "Frente do documento",
        kyc_front_subtitle: "Coloque a frente do seu documento na moldura",
        kyc_back_title: "Verso do documento",
        kyc_back_subtitle: "Vire e coloque o verso na moldura",
        kyc_processing_title: "Processando...",
        kyc_processing_subtitle: "Verificando autenticidade do documento",
        kyc_success_title: "Documento verificado!",
        kyc_success_subtitle: "Prosseguindo para verificação facial",
        kyc_camera_front: "Lado da foto",
        kyc_camera_back: "Lado da informação",
        kyc_tips_lighting: "Certifique-se de que o documento esteja bem iluminado",
        kyc_ocr_processing: "Análise OCR em andamento...",
        kyc_doc_auth: "Documento autenticado",

        // Selfie Steps
        selfie_step: "Passo 3/5",
        selfie_title: "Verificação Facial",
        selfie_subtitle: "Prova de vida biométrica",
        selfie_msg_position: "Posicione seu rosto no oval",
        selfie_msg_detecting: "Detectando rosto...",
        selfie_msg_ready: "Perfeito! Olhe para a câmera e pisque",
        selfie_msg_captured: "Análise biométrica...",
        selfie_msg_verified: "Identidade confirmada!",
        selfie_tips: "Fique imóvel em um local bem iluminado",

        // PIN Steps
        pin_step: "Passo 4/5",
        pin_create_title: "Crie seu código PIN",
        pin_confirm_title: "Confirme seu PIN",
        pin_create_subtitle: "Este código protegerá o acesso à sua identidade",
        pin_confirm_subtitle: "Digite seu PIN novamente",
        pin_biometrics: "Ativar biometria",
        pin_biometrics_desc: "Face ID / Touch ID",
        pin_security: "Seu PIN é criptografado e armazenado com segurança.",

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

        developer_name: "Dev API",
        developer_role: "Desenvolvedor",
        developer_status: "Acesso API Ativado",
        developer_objective: "Integrar serviços de identidade digital via API oficial.",
        developer_context: "Para empresas e desenvolvedores terceiros.",
    },
    de: {
        // Landing Page
        landing_badge: 'Gabunische Republik',
        landing_title_1: 'Ihre Identität,',
        landing_title_2: 'überall bei Ihnen.',
        landing_description: 'Die offizielle Plattform zur Sicherung, Verwaltung und Nutzung Ihrer digitalen Identität. Einfach, schnell und für alle Bürger zugänglich.',
        landing_cta_start: 'Starten',
        landing_cta_demo: 'Demo ansehen',
        landing_features: 'Funktionen',
        landing_vision: 'Vision',
        landing_download: 'Herunterladen',
        landing_security: 'Sicherheit',
        landing_security_desc: 'Verschlüsselte Daten',
        landing_speed: 'Schnelligkeit',
        landing_speed_desc: 'Sofortiger Zugang',
        landing_universal: 'Universal',
        landing_universal_desc: 'Für alle',
        landing_vision_title: 'Digitales Gabun 2025',
        landing_vision_desc: 'Die Verwaltung modernisieren, Papier reduzieren und ein nahtloses Bürgererlebnis bieten.',
        landing_login: 'Anmelden',
        landing_privacy: 'Datenschutz',
        landing_support: 'Support',

        demoTitle: "Demo-Modus",
        demoSubtitle: "Erkunden Sie die IDN.GA-Plattform durch verschiedene Benutzerprofile. Jede Persona hat spezifische Rechte und Funktionen.",
        backHome: "Zurück zur Startseite",
        role: "Rolle",
        status: "Status",
        objective: "Ziel",
        context: "Kontext",

        // Profile Selection Page
        profile_title: "Was ist Ihr Profil?",
        profile_subtitle: "Wählen Sie den Profiltyp, der Ihrer aktuellen Situation entspricht.",
        profile_step: "Schritt 1/5",
        profile_docs_label: "Erforderliche Dokumente",
        profile_protection: "Ihre Daten sind geschützt und werden nur für dieses Verfahren verwendet.",
        profile_continue: "Weiter",

        profile_citizen_title: "Gabunischer Bürger",
        profile_citizen_desc: "Für Inhaber der gabunischen Staatsangehörigkeit.",

        profile_resident_title: "Einwohner in Gabun",
        profile_resident_desc: "Für Ausländer mit rechtmäßigem Wohnsitz in Gabun.",

        profile_tourist_title: "Vorübergehender Besucher",
        profile_tourist_desc: "Für kurzfristige Aufenthalte (Tourismus, Geschäft, Familie).",

        profile_developer_title: "Entwickler",
        profile_developer_desc: "Für API-Integration und Geschäftskonten.",

        // Documents
        doc_cni: "Nationaler Personalausweis",
        doc_birth_cert: "Geburtsurkunde",
        doc_residence_card: "Aufenthaltskarte",
        doc_passport: "Reisepass",
        doc_visa: "Visum oder E-Visum",
        doc_business_reg: "Handelsregister",
        doc_api_request: "API-Zugangsanfrage",

        // KYC Steps
        kyc_step: "Schritt 2/5",
        kyc_front_title: "Dokumentenvorderseite",
        kyc_front_subtitle: "Platzieren Sie die Vorderseite Ihres Dokuments im Rahmen",
        kyc_back_title: "Dokumentenrückseite",
        kyc_back_subtitle: "Umdrehen und Rückseite in den Rahmen legen",
        kyc_processing_title: "Verarbeitung läuft...",
        kyc_processing_subtitle: "Überprüfung der Dokumentenechtheit",
        kyc_success_title: "Dokument verifiziert!",
        kyc_success_subtitle: "Weiter zur Gesichtsverifizierung",
        kyc_camera_front: "Fotoseite",
        kyc_camera_back: "Informationsseite",
        kyc_tips_lighting: "Stellen Sie sicher, dass das Dokument gut beleuchtet ist",
        kyc_ocr_processing: "OCR-Analyse läuft...",
        kyc_doc_auth: "Dokument authentifiziert",

        // Selfie Steps
        selfie_step: "Schritt 3/5",
        selfie_title: "Gesichtsverifizierung",
        selfie_subtitle: "Biometrischer Lebendnachweis",
        selfie_msg_position: "Positionieren Sie Ihr Gesicht im Oval",
        selfie_msg_detecting: "Gesichtserkennung...",
        selfie_msg_ready: "Perfekt! Schauen Sie in die Kamera blinzeln Sie",
        selfie_msg_captured: "Biometrische Analyse...",
        selfie_msg_verified: "Identität bestätigt!",
        selfie_tips: "Bleiben Sie an einem gut beleuchteten Ort ruhig",

        // PIN Steps
        pin_step: "Schritt 4/5",
        pin_create_title: "Erstellen Sie Ihren PIN-Code",
        pin_confirm_title: "Bestätigen Sie Ihren PIN",
        pin_create_subtitle: "Dieser Code sichert den Zugriff auf Ihre Identität",
        pin_confirm_subtitle: "Geben Sie Ihren PIN erneut ein",
        pin_biometrics: "Biometrie aktivieren",
        pin_biometrics_desc: "Face ID / Touch ID",
        pin_security: "Ihr PIN ist verschlüsselt und sicher gespeichert.",

        citizen_name: "Jean Dupont",
        citizen_role: "Gabunischer Bürger",
        citizen_status: "Verifiziert (Stufe 3)",
        citizen_objective: "Zugang zu Verwaltungsdiensten und Verwaltung offizieller Dokumente.",
        citizen_context: "Standardbenutzer mit vollständiger digitaler Identität.",

        resident_name: "Marie Curie",
        resident_role: "Einwohner",
        resident_status: "Verifiziert (Stufe 2)",
        resident_objective: "Aufenthaltsgenehmigung erneuern und Zugang zu Einwohnerdiensten.",
        resident_context: "Expatriierte, die seit 5 Jahren in Gabun lebt.",

        tourist_name: "John Doe",
        tourist_role: "Vorübergehender Besucher",
        tourist_status: "Verifiziert (Stufe 1)",
        tourist_objective: "E-Visum einsehen und Touristeninformationen erhalten.",
        tourist_context: "Tourist auf 2-wöchigem Besuch.",

        admin_name: "Systemadministrator",
        admin_role: "Administrator",
        admin_status: "Superbenutzer",
        admin_objective: "Plattform überwachen, Benutzer und Protokolle verwalten.",
        admin_context: "Technischer Zugang für Wartung und Sicherheit.",

        controller_name: "Verifizierungsagent",
        controller_role: "Identitätskontrolleur",
        controller_status: "Vereidigter Beamter",
        controller_objective: "Dokumentenechtheit überprüfen und Anträge bearbeiten.",
        controller_context: "Wird von Polizei oder Verwaltungsbeamten verwendet.",

        developer_name: "API Entwickler",
        developer_role: "Entwickler",
        developer_status: "API-Zugang Aktiviert",
        developer_objective: "Digitale Identitätsdienste über die offizielle API integrieren.",
        developer_context: "Für Unternehmen und Drittentwickler.",
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
                    'US': 'en', 'GB': 'en', 'AU': 'en', 'CA': 'en', 'NZ': 'en',
                    'CN': 'zh', 'TW': 'zh', 'HK': 'zh',
                    'KR': 'ko',
                    'JP': 'ja',
                    'RU': 'ru',
                    'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es',
                    'SA': 'ar', 'AE': 'ar', 'EG': 'ar', 'MA': 'ar',
                    'PT': 'pt', 'BR': 'pt', 'AO': 'pt', 'MZ': 'pt',
                    'DE': 'de', 'AT': 'de', 'CH': 'de',
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
