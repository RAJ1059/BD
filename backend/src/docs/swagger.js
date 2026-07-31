import swaggerJSDoc from 'swagger-jsdoc'
import { env } from '../config/env.js'

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'Business Direction Admin API',
    version: '1.0.0',
    description:
      'REST API powering the Business Direction admin panel and the public marketing website. ' +
      'Covers authentication, RBAC, CRM (leads/clients/projects), the blog CMS, media library, ' +
      'dashboard analytics, and audit logging.',
  },
  servers: [{ url: `${env.apiBaseUrl}/api`, description: 'Current environment' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      ApiSuccess: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: { type: 'object' },
          meta: { type: 'object' },
        },
      },
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          details: { type: 'array', items: { type: 'object' } },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: 'Auth', description: 'Login, sessions, password lifecycle, 2FA' },
    { name: 'Users', description: 'Admin user management' },
    { name: 'Roles', description: 'RBAC roles & permissions' },
    { name: 'Clients', description: 'CRM client records' },
    { name: 'Leads', description: 'CRM lead pipeline' },
    { name: 'Projects', description: 'Project tracking' },
    { name: 'Blogs', description: 'Blog CMS (admin)' },
    { name: 'Categories', description: 'Blog categories' },
    { name: 'Tags', description: 'Blog tags' },
    { name: 'Media', description: 'File & image library' },
    { name: 'Dashboard', description: 'Analytics widgets & charts' },
    { name: 'Activity Logs', description: 'Audit trail' },
    { name: 'Public', description: 'Endpoints consumed directly by the marketing website' },
  ],
}

export const swaggerSpec = swaggerJSDoc({
  definition,
  apis: ['./src/routes/*.js', './src/docs/paths/*.yaml'],
})
