// Central RBAC vocabulary. Every permission is a (module, action) pair.
export const PERMISSION_ACTIONS = ['view', 'create', 'edit', 'delete', 'publish', 'export', 'approve']

export const PERMISSION_MODULES = [
  'dashboard',
  'users',
  'roles',
  'clients',
  'leads',
  'tasks',
  'projects',
  'blogs',
  'pages',
  'menus',
  'pageContent',
  'services',
  'categories',
  'tags',
  'media',
  'quotations',
  'invoices',
  'campaigns',
  'scripts',
  'utm',
  'forms',
  'social',
  'seo',
  'redirects',
  'integrations',
  'reports',
  'settings',
  'apiKeys',
  'webhooks',
  'activityLogs',
]

export const ROLE_NAMES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  MARKETING_MANAGER: 'Marketing Manager',
  SEO_EXECUTIVE: 'SEO Executive',
  SOCIAL_MEDIA_MANAGER: 'Social Media Manager',
  CONTENT_WRITER: 'Content Writer',
  GRAPHIC_DESIGNER: 'Graphic Designer',
  SALES_EXECUTIVE: 'Sales Executive',
  CLIENT: 'Client',
  TEAM_MEMBER: 'Team Member',
}

const all = PERMISSION_ACTIONS
const rw = ['view', 'create', 'edit']
const viewOnly = ['view']

// Default permission matrix used by the seed script. Super Admin bypasses
// permission checks entirely (see rbac middleware) so it is intentionally
// left out here.
export const DEFAULT_ROLE_PERMISSIONS = {
  [ROLE_NAMES.ADMIN]: PERMISSION_MODULES.reduce((acc, mod) => {
    acc[mod] = all
    return acc
  }, {}),

  [ROLE_NAMES.MARKETING_MANAGER]: {
    dashboard: viewOnly,
    clients: all.filter((a) => a !== 'delete'),
    leads: all.filter((a) => a !== 'delete'),
    tasks: all.filter((a) => a !== 'delete'),
    projects: all.filter((a) => a !== 'delete'),
    campaigns: all,
    utm: all.filter((a) => a !== 'delete'),
    forms: rw,
    social: rw,
    scripts: rw,
    integrations: rw,
    reports: ['view', 'export'],
    seo: rw,
    redirects: rw,
    blogs: [...rw, 'publish'],
    pages: [...rw, 'publish'],
    menus: rw,
    pageContent: rw,
    services: rw,
    categories: rw,
    tags: rw,
    media: rw,
  },

  [ROLE_NAMES.SEO_EXECUTIVE]: {
    dashboard: viewOnly,
    seo: [...rw, 'export'],
    redirects: rw,
    blogs: rw,
    pages: rw,
    pageContent: viewOnly,
    categories: rw,
    tags: rw,
    media: rw,
    reports: ['view', 'export'],
  },

  [ROLE_NAMES.SOCIAL_MEDIA_MANAGER]: {
    dashboard: viewOnly,
    campaigns: [...rw, 'publish'],
    social: [...rw, 'publish'],
    utm: rw,
    media: rw,
    reports: viewOnly,
  },

  [ROLE_NAMES.CONTENT_WRITER]: {
    dashboard: viewOnly,
    blogs: ['view', 'create', 'edit'],
    pages: ['view', 'create', 'edit'],
    pageContent: ['view', 'create', 'edit'],
    services: ['view', 'create', 'edit'],
    categories: viewOnly,
    tags: rw,
    media: ['view', 'create'],
  },

  [ROLE_NAMES.GRAPHIC_DESIGNER]: {
    dashboard: viewOnly,
    media: all.filter((a) => a !== 'delete' && a !== 'approve'),
    blogs: viewOnly,
    pages: viewOnly,
    campaigns: viewOnly,
  },

  [ROLE_NAMES.SALES_EXECUTIVE]: {
    dashboard: viewOnly,
    clients: all.filter((a) => a !== 'delete'),
    leads: all.filter((a) => a !== 'delete'),
    tasks: all.filter((a) => a !== 'delete'),
    quotations: [...rw, 'export', 'approve'],
    invoices: [...rw, 'export'],
    reports: ['view', 'export'],
  },

  [ROLE_NAMES.CLIENT]: {
    dashboard: viewOnly,
    projects: viewOnly,
    invoices: viewOnly,
    quotations: viewOnly,
  },

  [ROLE_NAMES.TEAM_MEMBER]: {
    dashboard: viewOnly,
    projects: ['view', 'edit'],
    tasks: ['view', 'edit'],
    leads: viewOnly,
    media: ['view', 'create'],
  },
}

export const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
export const LEAD_SOURCES = ['website', 'referral', 'google_ads', 'facebook_ads', 'linkedin', 'walk_in', 'cold_call', 'email', 'other']

export const BLOG_STATUSES = ['draft', 'scheduled', 'published', 'archived']
export const PAGE_STATUSES = ['draft', 'scheduled', 'published', 'archived']
export const MENU_LOCATIONS = ['header', 'footer', 'sidebar']
export const PAGE_CONTENT_KEYS = ['home', 'about', 'contact', 'faq', 'portfolio']

export const MEDIA_TYPES = ['image', 'video', 'document', 'other']

export const SCRIPT_PROVIDERS = [
  'gtm',
  'ga4',
  'meta_pixel',
  'linkedin_insight',
  'clarity',
  'hotjar',
  'tiktok_pixel',
  'pinterest_tag',
  'reddit_pixel',
  'custom_html',
  'custom_css',
  'custom_js',
]
export const SCRIPT_PLACEMENTS = ['head', 'body_start', 'body_end']

export const TASK_STATUSES = ['todo', 'in_progress', 'in_review', 'done']
export const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent']

export const FORM_FIELD_TYPES = ['text', 'textarea', 'email', 'phone', 'number', 'select', 'checkbox', 'radio', 'date', 'file']

export const SOCIAL_PLATFORMS = ['facebook', 'instagram', 'linkedin', 'youtube', 'twitter', 'tiktok', 'threads']

export const INTEGRATION_PROVIDERS = [
  'google_analytics',
  'google_search_console',
  'google_tag_manager',
  'google_ads',
  'meta_ads',
  'microsoft_clarity',
  'linkedin_ads',
]

export const REDIRECT_TYPES = [301, 302]

export const MAINTENANCE_MODE_KEY = 'maintenanceMode'
