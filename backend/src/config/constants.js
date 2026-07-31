// Central RBAC vocabulary. Every permission is a (module, action) pair.
export const PERMISSION_ACTIONS = ['view', 'create', 'edit', 'delete', 'publish', 'export', 'approve']

export const PERMISSION_MODULES = [
  'dashboard',
  'users',
  'roles',
  'clients',
  'leads',
  'projects',
  'blogs',
  'categories',
  'tags',
  'media',
  'quotations',
  'invoices',
  'campaigns',
  'seo',
  'reports',
  'settings',
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
    projects: all.filter((a) => a !== 'delete'),
    campaigns: all,
    reports: ['view', 'export'],
    seo: rw,
    blogs: [...rw, 'publish'],
    categories: rw,
    tags: rw,
    media: rw,
  },

  [ROLE_NAMES.SEO_EXECUTIVE]: {
    dashboard: viewOnly,
    seo: [...rw, 'export'],
    blogs: rw,
    categories: rw,
    tags: rw,
    media: rw,
    reports: ['view', 'export'],
  },

  [ROLE_NAMES.SOCIAL_MEDIA_MANAGER]: {
    dashboard: viewOnly,
    campaigns: [...rw, 'publish'],
    media: rw,
    reports: viewOnly,
  },

  [ROLE_NAMES.CONTENT_WRITER]: {
    dashboard: viewOnly,
    blogs: ['view', 'create', 'edit'],
    categories: viewOnly,
    tags: rw,
    media: ['view', 'create'],
  },

  [ROLE_NAMES.GRAPHIC_DESIGNER]: {
    dashboard: viewOnly,
    media: all.filter((a) => a !== 'delete' && a !== 'approve'),
    blogs: viewOnly,
    campaigns: viewOnly,
  },

  [ROLE_NAMES.SALES_EXECUTIVE]: {
    dashboard: viewOnly,
    clients: all.filter((a) => a !== 'delete'),
    leads: all.filter((a) => a !== 'delete'),
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
    leads: viewOnly,
    media: ['view', 'create'],
  },
}

export const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
export const LEAD_SOURCES = ['website', 'referral', 'google_ads', 'facebook_ads', 'linkedin', 'walk_in', 'cold_call', 'email', 'other']

export const BLOG_STATUSES = ['draft', 'scheduled', 'published', 'archived']

export const MEDIA_TYPES = ['image', 'video', 'document', 'other']
