import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import ServiceDetail from './pages/ServiceDetail'
import Portfolio from './pages/Portfolio'
import Blog from './pages/Blog'
import BlogDetail from './pages/BlogDetail'
import FAQ from './pages/FAQ'
import Contact from './pages/Contact'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Terms from './pages/Terms'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import AdminLayout from './layouts/AdminLayout'
import DashboardHome from './pages/admin/DashboardHome'
import UsersPage from './pages/admin/UsersPage'
import RolesPage from './pages/admin/RolesPage'
import ClientsPage from './pages/admin/ClientsPage'
import LeadsPage from './pages/admin/LeadsPage'
import ProjectsPage from './pages/admin/ProjectsPage'
import BlogsPage from './pages/admin/BlogsPage'
import BlogEditorPage from './pages/admin/BlogEditorPage'
import CategoriesPage from './pages/admin/CategoriesPage'
import TagsPage from './pages/admin/TagsPage'
import MediaPage from './pages/admin/MediaPage'
import ActivityLogsPage from './pages/admin/ActivityLogsPage'
import SocialLinksPage from './pages/admin/SocialLinksPage'
import RedirectsPage from './pages/admin/RedirectsPage'
import TasksPage from './pages/admin/TasksPage'
import CampaignsPage from './pages/admin/CampaignsPage'
import FormsPage from './pages/admin/FormsPage'
import FormSubmissionsPage from './pages/admin/FormSubmissionsPage'
import MenusPage from './pages/admin/MenusPage'
import PagesPage from './pages/admin/PagesPage'
import PageEditorPage from './pages/admin/PageEditorPage'
import ScriptsPage from './pages/admin/ScriptsPage'
import SettingsPage from './pages/admin/SettingsPage'
import IntegrationsPage from './pages/admin/IntegrationsPage'
import WebhooksPage from './pages/admin/WebhooksPage'
import ApiKeysPage from './pages/admin/ApiKeysPage'
import CronJobsPage from './pages/admin/CronJobsPage'
import BackupsPage from './pages/admin/BackupsPage'
import JobsPage from './pages/admin/JobsPage'
import ErrorLogsPage from './pages/admin/ErrorLogsPage'
import NotFoundLogsPage from './pages/admin/NotFoundLogsPage'
import IpRulesPage from './pages/admin/IpRulesPage'
import ClientLayout from './layouts/ClientLayout'
import ClientDashboard from './pages/client/ClientDashboard'
import ClientProjectsPage from './pages/client/ClientProjectsPage'
import ClientProfilePage from './pages/client/ClientProfilePage'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute denyRoles={['Client']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="blogs" element={<BlogsPage />} />
            <Route path="blogs/new" element={<BlogEditorPage />} />
            <Route path="blogs/:id" element={<BlogEditorPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="tags" element={<TagsPage />} />
            <Route path="media" element={<MediaPage />} />
            <Route path="activity-logs" element={<ActivityLogsPage />} />
            <Route path="pages" element={<PagesPage />} />
            <Route path="pages/new" element={<PageEditorPage />} />
            <Route path="pages/:id" element={<PageEditorPage />} />
            <Route path="menus" element={<MenusPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="campaigns" element={<CampaignsPage />} />
            <Route path="social-links" element={<SocialLinksPage />} />
            <Route path="forms" element={<FormsPage />} />
            <Route path="forms/:id/submissions" element={<FormSubmissionsPage />} />
            <Route path="scripts" element={<ScriptsPage />} />
            <Route path="redirects" element={<RedirectsPage />} />
            <Route path="not-found-logs" element={<NotFoundLogsPage />} />
            <Route path="ip-rules" element={<IpRulesPage />} />
            <Route path="api-keys" element={<ApiKeysPage />} />
            <Route path="webhooks" element={<WebhooksPage />} />
            <Route path="cron-jobs" element={<CronJobsPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="backups" element={<BackupsPage />} />
            <Route path="error-logs" element={<ErrorLogsPage />} />
            <Route path="integrations" element={<IntegrationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route
            path="/client"
            element={
              <ProtectedRoute roles={['Client']}>
                <ClientLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ClientDashboard />} />
            <Route path="projects" element={<ClientProjectsPage />} />
            <Route path="profile" element={<ClientProfilePage />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/services/:slug" element={<ServiceDetail />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogDetail />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            }
          />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  )
}

export default App
