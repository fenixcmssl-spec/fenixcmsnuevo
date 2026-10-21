// FenixCMS In-Memory & Resilient Server Repository
// Adheres strictly to the Prisma Schema definitions and PostgreSQL data models

export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'SUPERADMIN' | 'CLIENT' | 'TENANT_ADMIN' | 'TENANT_STAFF' | 'CUSTOMER';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'ARCHIVED';
  mustChangePassword: boolean;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SessionEntity {
  id: string;
  token: string;
  userId: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface TenantDomainEntity {
  id: string;
  tenantId: string;
  domain: string;
  status: 'ACTIVE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  isPrimary: boolean;
  sslStatus: 'ACTIVE' | 'PENDING' | 'FAILED';
  createdAt: string;
  updatedAt: string;
}

export interface TenantEntity {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'CANCELED';
  defaultLocale: string;
  primaryDomain: string | null;
  authorizedModules: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ModuleDefinitionEntity {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  version: string;
  status: 'PUBLISHED' | 'DRAFT' | 'DEPRECATED';
  isCore: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlanEntity {
  id: string;
  code: string;
  name: string;
  description: string;
  isCustom: boolean;
  status: 'ACTIVE' | 'ARCHIVED';
  modules: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ModulePriceEntity {
  id: string;
  targetType: 'PLAN' | 'MODULE';
  targetCode: string;
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'ANNUAL';
  price: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
}

export interface DiscountRuleEntity {
  id: string;
  code: string;
  name: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  appliesTo: string;
  startDate: string | null;
  endDate: string | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface SubscriptionEntity {
  id: string;
  tenantId: string;
  planId: string | null;
  planCode: string | null;
  status: 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'ANNUAL';
  price: number;
  currency: string;
  modules: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentEntity {
  id: string;
  tenantId: string;
  tenantName: string;
  subscriptionId: string | null;
  amount: number;
  currency: string;
  status: 'SUCCEEDED' | 'PENDING' | 'FAILED' | 'REFUNDED';
  provider: 'STRIPE' | 'REDSYS' | 'BIZUM' | 'MANUAL';
  transactionId: string | null;
  createdAt: string;
}

export interface LicenseEntity {
  id: string;
  tenantId: string;
  tenantName: string;
  licenseKey: string;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'REVOKED';
  maxTenants: number;
  maxDomains: number;
  issuedAt: string;
  expiresAt: string | null;
  activationsCount: number;
  updatedAt: string;
}

export interface PluginCatalogEntity {
  id: string;
  slug: string;
  name: string;
  description: string;
  version: string;
  status: 'PUBLISHED' | 'REVIEW' | 'DEPRECATED' | 'BETA';
  category: string;
  price: number;
  isFree: boolean;
  author: string;
  minCmsVersion: string;
  createdAt: string;
  updatedAt: string;
}

export interface ThemeCatalogEntity {
  id: string;
  slug: string;
  name: string;
  description: string;
  version: string;
  status: 'PUBLISHED' | 'REVIEW' | 'DEPRECATED';
  category: string;
  price: number;
  isFree: boolean;
  author: string;
  previewImage: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImporterCatalogEntity {
  id: string;
  slug: string;
  name: string;
  sourcePlatform: 'WORDPRESS' | 'SHOPIFY' | 'PRESTASHOP' | 'WOOCOMMERCE' | 'MAGENTO';
  description: string;
  version: string;
  status: 'PUBLISHED' | 'REVIEW' | 'DEPRECATED' | 'BETA';
  createdAt: string;
  updatedAt: string;
}

export interface PlatformSettingEntity {
  id: string;
  key: string;
  value: string;
  category: string;
  isEncrypted: boolean;
  updatedAt: string;
}

export interface AuditLogEntity {
  id: string;
  userId: string | null;
  userEmail: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  details: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface StoreProductEntity {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  stock: number;
  category: string;
  imageUrl: string;
  status: 'ACTIVE' | 'DRAFT';
  createdAt: string;
}

export interface StoreOrderEntity {
  id: string;
  tenantId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ productId: string; name: string; quantity: number; price: number }>;
  totalAmount: number;
  currency: string;
  status: 'COMPLETED' | 'PENDING' | 'SHIPPED';
  createdAt: string;
}

// In-Memory Global State (persists across hot turns)
class FenixRepository {
  public users: UserEntity[] = [];
  public sessions: SessionEntity[] = [];
  public tenants: TenantEntity[] = [];
  public tenantDomains: TenantDomainEntity[] = [];
  public modules: ModuleDefinitionEntity[] = [];
  public plans: PlanEntity[] = [];
  public prices: ModulePriceEntity[] = [];
  public discounts: DiscountRuleEntity[] = [];
  public subscriptions: SubscriptionEntity[] = [];
  public payments: PaymentEntity[] = [];
  public licenses: LicenseEntity[] = [];
  public plugins: PluginCatalogEntity[] = [];
  public themes: ThemeCatalogEntity[] = [];
  public importers: ImporterCatalogEntity[] = [];
  public settings: PlatformSettingEntity[] = [];
  public auditLogs: AuditLogEntity[] = [];
  public storeProducts: StoreProductEntity[] = [];
  public storeOrders: StoreOrderEntity[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const now = new Date().toISOString();

    // 1. Initial Superadmin (Verified bcrypt hash of 'Admin123!*Fenix')
    const adminPasswordHash = '$2b$10$604SQuLxfRBEg/IDiZ7iTeVEvxBO0G33kYxNKpidJuMcBB30q6aRu';

    this.users = [
      {
        id: 'usr_superadmin_01',
        email: 'admin@fenixcms.es',
        passwordHash: adminPasswordHash,
        name: 'Superadministrador Principal',
        role: 'SUPERADMIN',
        status: 'ACTIVE',
        mustChangePassword: false,
        emailVerified: true,
        lastLoginAt: now,
        createdAt: '2026-01-10T08:00:00.000Z',
        updatedAt: now,
      },
      {
        id: 'usr_superadmin_02',
        email: 'comercialobejo@gmail.com',
        passwordHash: adminPasswordHash,
        name: 'Superadministrador Comercial',
        role: 'SUPERADMIN',
        status: 'ACTIVE',
        mustChangePassword: false,
        emailVerified: true,
        lastLoginAt: now,
        createdAt: '2026-01-10T08:00:00.000Z',
        updatedAt: now,
      },
      {
        id: 'usr_client_01',
        email: 'carlos@latotaltienda.es',
        passwordHash: adminPasswordHash,
        name: 'Carlos Mendoza',
        role: 'CLIENT',
        status: 'ACTIVE',
        mustChangePassword: false,
        emailVerified: true,
        lastLoginAt: '2026-10-18T14:30:00.000Z',
        createdAt: '2026-02-01T10:00:00.000Z',
        updatedAt: now,
      },
      {
        id: 'usr_client_02',
        email: 'maria@modaboutique.com',
        passwordHash: adminPasswordHash,
        name: 'María Gómez',
        role: 'CLIENT',
        status: 'ACTIVE',
        mustChangePassword: false,
        emailVerified: true,
        lastLoginAt: '2026-10-19T09:15:00.000Z',
        createdAt: '2026-03-15T11:20:00.000Z',
        updatedAt: now,
      },
    ];

    // 2. Tenants & Domains
    this.tenants = [
      {
        id: 'ten_latotaltienda',
        name: 'La Total Tienda',
        slug: 'latotaltienda',
        ownerId: 'usr_client_01',
        status: 'ACTIVE',
        defaultLocale: 'es',
        primaryDomain: 'latotaltienda.es',
        authorizedModules: ['ecommerce', 'blog'],
        createdAt: '2026-02-01T10:05:00.000Z',
        updatedAt: now,
      },
      {
        id: 'ten_modaboutique',
        name: 'Moda Boutique París',
        slug: 'modaboutique',
        ownerId: 'usr_client_02',
        status: 'ACTIVE',
        defaultLocale: 'fr',
        primaryDomain: 'modaboutique.com',
        authorizedModules: ['ecommerce'],
        createdAt: '2026-03-15T11:25:00.000Z',
        updatedAt: now,
      },
    ];

    this.tenantDomains = [
      {
        id: 'dom_01',
        tenantId: 'ten_latotaltienda',
        domain: 'latotaltienda.es',
        status: 'ACTIVE',
        isPrimary: true,
        sslStatus: 'ACTIVE',
        createdAt: '2026-02-01T10:10:00.000Z',
        updatedAt: now,
      },
      {
        id: 'dom_02',
        tenantId: 'ten_latotaltienda',
        domain: 'tienda.latotal.com',
        status: 'VERIFIED',
        isPrimary: false,
        sslStatus: 'ACTIVE',
        createdAt: '2026-05-12T16:00:00.000Z',
        updatedAt: now,
      },
      {
        id: 'dom_03',
        tenantId: 'ten_modaboutique',
        domain: 'modaboutique.com',
        status: 'ACTIVE',
        isPrimary: true,
        sslStatus: 'ACTIVE',
        createdAt: '2026-03-15T11:30:00.000Z',
        updatedAt: now,
      },
    ];

    // 3. Core Modules (6 specified in Section 8.3)
    this.modules = [
      {
        id: 'mod_blog',
        code: 'blog',
        name: 'Blog & Editorial',
        description: 'Publicación de artículos, autores, categorías, etiquetas y SEO optimizado.',
        category: 'content',
        version: '1.2.0',
        status: 'PUBLISHED',
        isCore: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: now,
      },
      {
        id: 'mod_ecommerce',
        code: 'ecommerce',
        name: 'Tienda Online E-commerce',
        description: 'Catálogo de productos, cesta, pasarelas de pago y gestión completa de pedidos.',
        category: 'commerce',
        version: '2.0.0',
        status: 'PUBLISHED',
        isCore: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: now,
      },
      {
        id: 'mod_real_estate',
        code: 'real_estate',
        name: 'Inmobiliaria',
        description: 'Propiedades, fincas, geolocalización en mapa y filtros avanzados de superficie.',
        category: 'vertical',
        version: '1.0.0',
        status: 'PUBLISHED',
        isCore: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: now,
      },
      {
        id: 'mod_auction',
        code: 'auction',
        name: 'Subastas',
        description: 'Pujas en tiempo real, precios de reserva, cuenta regresiva e incrementos automáticos.',
        category: 'vertical',
        version: '1.1.0',
        status: 'PUBLISHED',
        isCore: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: now,
      },
      {
        id: 'mod_classifieds',
        code: 'classifieds',
        name: 'Anuncios Clasificados',
        description: 'Publicación de anuncios por particulares y empresas con sistema de moderación.',
        category: 'vertical',
        version: '1.0.0',
        status: 'PUBLISHED',
        isCore: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: now,
      },
      {
        id: 'mod_personal_ads',
        code: 'personal_ads',
        name: 'Contactos y Personales',
        description: 'Directorio privado de perfiles con moderación avanzada y alta confidencialidad.',
        category: 'vertical',
        version: '1.0.0',
        status: 'PUBLISHED',
        isCore: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: now,
      },
    ];

    // 4. Plans & Bundles (Section 8.4)
    this.plans = [
      {
        id: 'plan_starter',
        code: 'starter_blog',
        name: 'Starter Editorial (Blog)',
        description: 'Ideal para creadores de contenido, revistas digitales y blogs corporativos.',
        isCustom: false,
        status: 'ACTIVE',
        modules: ['blog'],
        createdAt: '2026-01-05T00:00:00.000Z',
        updatedAt: now,
      },
      {
        id: 'plan_pro_ecommerce',
        code: 'pro_ecommerce',
        name: 'E-commerce Pro (Tienda + Blog)',
        description: 'Solución integral de comercio online con catálogo, pagos y blog corporativo.',
        isCustom: false,
        status: 'ACTIVE',
        modules: ['ecommerce', 'blog'],
        createdAt: '2026-01-05T00:00:00.000Z',
        updatedAt: now,
      },
      {
        id: 'plan_multimarket',
        code: 'multimarket',
        name: 'MultiMarket (Tienda + Subastas + Clasificados)',
        description: 'Plataforma comercial combinada con venta directa, subastas y clasificados.',
        isCustom: false,
        status: 'ACTIVE',
        modules: ['ecommerce', 'auction', 'classifieds'],
        createdAt: '2026-01-05T00:00:00.000Z',
        updatedAt: now,
      },
      {
        id: 'plan_custom',
        code: 'enterprise_custom',
        name: 'Combinación Personalizada',
        description: 'Plan a medida con selección de cualquier módulo según las necesidades del cliente.',
        isCustom: true,
        status: 'ACTIVE',
        modules: ['ecommerce', 'blog', 'real_estate'],
        createdAt: '2026-01-05T00:00:00.000Z',
        updatedAt: now,
      },
    ];

    // 5. Prices (Section 8.5)
    this.prices = [
      // Starter Plan
      { id: 'pr_1', targetType: 'PLAN', targetCode: 'starter_blog', billingCycle: 'MONTHLY', price: 19.0, currency: 'EUR', isActive: true, createdAt: now },
      { id: 'pr_2', targetType: 'PLAN', targetCode: 'starter_blog', billingCycle: 'QUARTERLY', price: 52.0, currency: 'EUR', isActive: true, createdAt: now },
      { id: 'pr_3', targetType: 'PLAN', targetCode: 'starter_blog', billingCycle: 'SEMIANNUAL', price: 95.0, currency: 'EUR', isActive: true, createdAt: now },
      { id: 'pr_4', targetType: 'PLAN', targetCode: 'starter_blog', billingCycle: 'ANNUAL', price: 180.0, currency: 'EUR', isActive: true, createdAt: now },

      // E-commerce Pro Plan
      { id: 'pr_5', targetType: 'PLAN', targetCode: 'pro_ecommerce', billingCycle: 'MONTHLY', price: 49.0, currency: 'EUR', isActive: true, createdAt: now },
      { id: 'pr_6', targetType: 'PLAN', targetCode: 'pro_ecommerce', billingCycle: 'QUARTERLY', price: 135.0, currency: 'EUR', isActive: true, createdAt: now },
      { id: 'pr_7', targetType: 'PLAN', targetCode: 'pro_ecommerce', billingCycle: 'SEMIANNUAL', price: 250.0, currency: 'EUR', isActive: true, createdAt: now },
      { id: 'pr_8', targetType: 'PLAN', targetCode: 'pro_ecommerce', billingCycle: 'ANNUAL', price: 470.0, currency: 'EUR', isActive: true, createdAt: now },

      // MultiMarket Plan
      { id: 'pr_9', targetType: 'PLAN', targetCode: 'multimarket', billingCycle: 'MONTHLY', price: 89.0, currency: 'EUR', isActive: true, createdAt: now },
      { id: 'pr_10', targetType: 'PLAN', targetCode: 'multimarket', billingCycle: 'ANNUAL', price: 850.0, currency: 'EUR', isActive: true, createdAt: now },
    ];

    // 6. Discounts (Section 8.5)
    this.discounts = [
      {
        id: 'disc_01',
        code: 'BIENVENIDA20',
        name: 'Descuento de Bienvenida 20%',
        type: 'PERCENTAGE',
        value: 20.0,
        appliesTo: 'ALL',
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-12-31T23:59:59.000Z',
        maxUses: 500,
        usedCount: 28,
        isActive: true,
        createdAt: now,
      },
      {
        id: 'disc_02',
        code: 'ANUAL30',
        name: 'Promoción Anual 30€ Fijo',
        type: 'FIXED',
        value: 30.0,
        appliesTo: 'PLAN',
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-12-31T23:59:59.000Z',
        maxUses: 200,
        usedCount: 14,
        isActive: true,
        createdAt: now,
      },
    ];

    // 7. Subscriptions (Section 8.6)
    this.subscriptions = [
      {
        id: 'sub_01',
        tenantId: 'ten_latotaltienda',
        planId: 'plan_pro_ecommerce',
        planCode: 'pro_ecommerce',
        status: 'ACTIVE',
        currentPeriodStart: '2026-10-01T00:00:00.000Z',
        currentPeriodEnd: '2026-11-01T00:00:00.000Z',
        billingCycle: 'MONTHLY',
        price: 49.0,
        currency: 'EUR',
        modules: ['ecommerce', 'blog'],
        createdAt: '2026-02-01T10:15:00.000Z',
        updatedAt: now,
      },
      {
        id: 'sub_02',
        tenantId: 'ten_modaboutique',
        planId: 'plan_pro_ecommerce',
        planCode: 'pro_ecommerce',
        status: 'ACTIVE',
        currentPeriodStart: '2026-10-15T00:00:00.000Z',
        currentPeriodEnd: '2027-10-15T00:00:00.000Z',
        billingCycle: 'ANNUAL',
        price: 470.0,
        currency: 'EUR',
        modules: ['ecommerce'],
        createdAt: '2026-03-15T11:40:00.000Z',
        updatedAt: now,
      },
    ];

    // 8. Payments (Section 8.6)
    this.payments = [
      {
        id: 'pay_01',
        tenantId: 'ten_latotaltienda',
        tenantName: 'La Total Tienda',
        subscriptionId: 'sub_01',
        amount: 49.0,
        currency: 'EUR',
        status: 'SUCCEEDED',
        provider: 'STRIPE',
        transactionId: 'ch_3N87a9FenixStripeReal',
        createdAt: '2026-10-01T08:30:00.000Z',
      },
      {
        id: 'pay_02',
        tenantId: 'ten_modaboutique',
        tenantName: 'Moda Boutique París',
        subscriptionId: 'sub_02',
        amount: 470.0,
        currency: 'EUR',
        status: 'SUCCEEDED',
        provider: 'STRIPE',
        transactionId: 'ch_4P99b2FenixAnnualStripe',
        createdAt: '2026-10-15T11:00:00.000Z',
      },
    ];

    // 9. Licenses (Section 8.6)
    this.licenses = [
      {
        id: 'lic_01',
        tenantId: 'ten_latotaltienda',
        tenantName: 'La Total Tienda',
        licenseKey: 'FNX-PRO-2026-TOT-88912-SPA',
        status: 'ACTIVE',
        maxTenants: 1,
        maxDomains: 5,
        issuedAt: '2026-02-01T10:20:00.000Z',
        expiresAt: '2027-02-01T10:20:00.000Z',
        activationsCount: 2,
        updatedAt: now,
      },
      {
        id: 'lic_02',
        tenantId: 'ten_modaboutique',
        tenantName: 'Moda Boutique París',
        licenseKey: 'FNX-ENT-2026-MOD-99411-FRA',
        status: 'ACTIVE',
        maxTenants: 1,
        maxDomains: 3,
        issuedAt: '2026-03-15T11:45:00.000Z',
        expiresAt: '2027-03-15T11:45:00.000Z',
        activationsCount: 1,
        updatedAt: now,
      },
    ];

    // 10. Plugins Catalog (Section 8.7)
    this.plugins = [
      {
        id: 'plg_01',
        slug: 'seo-booster-pro',
        name: 'SEO Booster Pro & Schema LD-JSON',
        description: 'Generación automática de sitemaps XML, meta etiquetas OpenGraph y microdatos Schema.org.',
        version: '2.4.1',
        status: 'PUBLISHED',
        category: 'marketing',
        price: 0.0,
        isFree: true,
        author: 'FenixCMS Core Team',
        minCmsVersion: '1.0.0',
        createdAt: '2026-01-20T00:00:00.000Z',
        updatedAt: now,
      },
      {
        id: 'plg_02',
        slug: 'stripe-bizum-gateway',
        name: 'Stripe, Redsys & Bizum Gateway Hub',
        description: 'Conector integral de pagos con tarjeta de crédito, Bizum instantáneo y Apple Pay / Google Pay.',
        version: '3.1.0',
        status: 'PUBLISHED',
        category: 'payment',
        price: 29.0,
        isFree: false,
        author: 'Fenix Pay Labs',
        minCmsVersion: '1.0.0',
        createdAt: '2026-02-10T00:00:00.000Z',
        updatedAt: now,
      },
      {
        id: 'plg_03',
        slug: 'whatsapp-order-bot',
        name: 'WhatsApp Business Order Notifications',
        description: 'Envío automático de confirmaciones de pedido y estados de envío directamente al móvil del cliente.',
        version: '1.5.0',
        status: 'PUBLISHED',
        category: 'communication',
        price: 15.0,
        isFree: false,
        author: 'ConnectFenix',
        minCmsVersion: '1.0.0',
        createdAt: '2026-03-01T00:00:00.000Z',
        updatedAt: now,
      },
      {
        id: 'plg_04',
        slug: 'ai-product-describer',
        name: 'AI Smart Copywriter & Product Enricher',
        description: 'Asistente para autocompletar descripciones vendedoras de productos optimizadas para conversión.',
        version: '1.0.0',
        status: 'BETA',
        category: 'ai_tools',
        price: 19.0,
        isFree: false,
        author: 'Fenix Intelligence',
        minCmsVersion: '1.0.0',
        createdAt: '2026-04-12T00:00:00.000Z',
        updatedAt: now,
      },
    ];

    // 11. Themes Catalog (Section 8.7)
    this.themes = [
      {
        id: 'thm_01',
        slug: 'obsidian-red-store',
        name: 'Obsidian Black & Red Commercial',
        description: 'Tema premium de alta conversión con paleta comercial oscura, contrastes rojos y carga ultra rápida.',
        version: '1.0.0',
        status: 'PUBLISHED',
        category: 'ecommerce',
        price: 0.0,
        isFree: true,
        author: 'FenixCMS Design Studio',
        previewImage: '/assets/theme-obsidian.png',
        createdAt: '2026-01-15T00:00:00.000Z',
        updatedAt: now,
      },
      {
        id: 'thm_02',
        slug: 'minimalist-luxe',
        name: 'Minimalist Luxe Boutique',
        description: 'Estilo editorial blanco y tipográfico ideal para moda, joyería y productos de autor.',
        version: '1.2.0',
        status: 'PUBLISHED',
        category: 'fashion',
        price: 39.0,
        isFree: false,
        author: 'Studio Atelier',
        previewImage: '/assets/theme-minimal.png',
        createdAt: '2026-02-18T00:00:00.000Z',
        updatedAt: now,
      },
      {
        id: 'thm_03',
        slug: 'auction-house-turbo',
        name: 'Auction House Live Pro',
        description: 'Especializado en casas de subastas con sala de pujas en vivo interactiva y reloj dinámico.',
        version: '1.1.0',
        status: 'PUBLISHED',
        category: 'auction',
        price: 49.0,
        isFree: false,
        author: 'FenixCMS Vertical Labs',
        previewImage: '/assets/theme-auction.png',
        createdAt: '2026-03-22T00:00:00.000Z',
        updatedAt: now,
      },
    ];

    // 12. Importers Catalog (Section 8.7)
    this.importers = [
      {
        id: 'imp_01',
        slug: 'wordpress-woocommerce-importer',
        name: 'Migrador WordPress & WooCommerce',
        sourcePlatform: 'WOOCOMMERCE',
        description: 'Importación completa de posts, páginas, productos, categorías, imágenes y clientes desde WordPress.',
        version: '2.1.0',
        status: 'PUBLISHED',
        createdAt: '2026-01-10T00:00:00.000Z',
        updatedAt: now,
      },
      {
        id: 'imp_02',
        slug: 'shopify-store-migration',
        name: 'Importador Oficial Shopify',
        sourcePlatform: 'SHOPIFY',
        description: 'Migración directa mediante API de Shopify o exportación CSV para catálogo, variantes y stock.',
        version: '1.8.0',
        status: 'PUBLISHED',
        createdAt: '2026-02-05T00:00:00.000Z',
        updatedAt: now,
      },
      {
        id: 'imp_03',
        slug: 'prestashop-catalog-transfer',
        name: 'PrestaShop 1.7 / 8 Bridge',
        sourcePlatform: 'PRESTASHOP',
        description: 'Extracción y traspaso de catálogo de referencias, atributos, combinaciones e impuestos.',
        version: '1.4.0',
        status: 'PUBLISHED',
        createdAt: '2026-03-12T00:00:00.000Z',
        updatedAt: now,
      },
    ];

    // 13. Platform Settings (Section 4.1)
    this.settings = [
      { id: 'set_1', key: 'PLATFORM_NAME', value: 'FenixCMS SaaS', category: 'general', isEncrypted: false, updatedAt: now },
      { id: 'set_2', key: 'DEFAULT_LOCALE', value: 'es', category: 'localization', isEncrypted: false, updatedAt: now },
      { id: 'set_3', key: 'DEFAULT_CURRENCY', value: 'EUR', category: 'billing', isEncrypted: false, updatedAt: now },
      { id: 'set_4', key: 'MAX_UPLOAD_MB', value: '25', category: 'system', isEncrypted: false, updatedAt: now },
      { id: 'set_5', key: 'SESSION_EXPIRY_HOURS', value: '24', category: 'security', isEncrypted: false, updatedAt: now },
      { id: 'set_6', key: 'PASSWORD_MIN_LENGTH', value: '8', category: 'security', isEncrypted: false, updatedAt: now },
    ];

    // 14. Audit Logs (Section 7.1)
    this.auditLogs = [
      {
        id: 'aud_01',
        userId: 'usr_superadmin_01',
        userEmail: 'admin@fenixcms.es',
        action: 'SUPERADMIN_INITIALIZED',
        resource: 'System',
        resourceId: 'init',
        details: JSON.stringify({ message: 'Sistema FenixCMS SaaS Fase 1 inicializado exitosamente' }),
        ipAddress: '127.0.0.1',
        userAgent: 'FenixCMS Server Boot Engine',
        createdAt: '2026-10-20T08:00:00.000Z',
      },
      {
        id: 'aud_02',
        userId: 'usr_superadmin_01',
        userEmail: 'admin@fenixcms.es',
        action: 'LOGIN',
        resource: 'User',
        resourceId: 'usr_superadmin_01',
        details: JSON.stringify({ status: 'SUCCESS', method: 'SESSION_COOKIE' }),
        ipAddress: '192.168.1.10',
        userAgent: 'Mozilla/5.0 (Superadmin Terminal)',
        createdAt: '2026-10-20T08:01:00.000Z',
      },
    ];

    // 15. Store Products for the Integrated E-commerce Store
    this.storeProducts = [
      {
        id: 'prod_01',
        tenantId: 'ten_latotaltienda',
        name: 'Auriculares Inalámbricos Pro ANC',
        slug: 'auriculares-inalambricos-pro-anc',
        description: 'Cancelación activa de ruido híbrida, 40 horas de autonomía y transductores de titanio.',
        price: 129.99,
        currency: 'EUR',
        stock: 45,
        category: 'Electrónica',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
        status: 'ACTIVE',
        createdAt: now,
      },
      {
        id: 'prod_02',
        tenantId: 'ten_latotaltienda',
        name: 'Reloj Inteligente Fenix Chrono Titan',
        slug: 'reloj-inteligente-fenix-chrono-titan',
        description: 'Caja de titanio de grado aeroespacial, GPS de doble frecuencia y sensor biométrico de pulso.',
        price: 249.50,
        currency: 'EUR',
        stock: 22,
        category: 'Tecnología',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        status: 'ACTIVE',
        createdAt: now,
      },
      {
        id: 'prod_03',
        tenantId: 'ten_latotaltienda',
        name: 'Mochila Urbana Impermeable Roll-Top',
        slug: 'mochila-urbana-impermeable-roll-top',
        description: 'Tejido cordura balístico repelente al agua, compartimento acolchado para portátil de 16 pulgadas.',
        price: 79.00,
        currency: 'EUR',
        stock: 80,
        category: 'Accesorios',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
        status: 'ACTIVE',
        createdAt: now,
      },
      {
        id: 'prod_04',
        tenantId: 'ten_latotaltienda',
        name: 'Cámara Mirrorless 4K Cine Edition',
        slug: 'camara-mirrorless-4k-cine-edition',
        description: 'Sensor Full-Frame con grabación 4K a 120fps, perfiles Log y estabilización de imagen de 5 ejes.',
        price: 899.00,
        currency: 'EUR',
        stock: 12,
        category: 'Fotografía',
        imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
        status: 'ACTIVE',
        createdAt: now,
      },
    ];

    // 16. Store Orders
    this.storeOrders = [
      {
        id: 'ord_1001',
        tenantId: 'ten_latotaltienda',
        customerName: 'Javier Navarro',
        customerEmail: 'j.navarro@gmail.com',
        items: [{ productId: 'prod_01', name: 'Auriculares Inalámbricos Pro ANC', quantity: 1, price: 129.99 }],
        totalAmount: 129.99,
        currency: 'EUR',
        status: 'COMPLETED',
        createdAt: '2026-10-19T16:20:00.000Z',
      },
    ];
  }

  // AUDIT HELPER
  public logAudit(userId: string | null, userEmail: string | null, action: string, resource: string, resourceId: string | null, details: Record<string, unknown>, ip = '127.0.0.1') {
    const entry: AuditLogEntity = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      userEmail,
      action,
      resource,
      resourceId,
      details: JSON.stringify(details),
      ipAddress: ip,
      userAgent: 'Next.js App Server',
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.unshift(entry);
    // keep at most 200 items in memory
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop();
    }
    return entry;
  }
}

// Global singleton instance
const globalForRepo = global as unknown as { fenixRepo?: FenixRepository };
export const repo = globalForRepo.fenixRepo || new FenixRepository();
if (process.env.NODE_ENV !== 'production') {
  globalForRepo.fenixRepo = repo;
}
