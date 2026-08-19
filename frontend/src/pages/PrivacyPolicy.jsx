import { useEffect, useState } from 'react'
import { api } from '../lib/api'

const DEFAULT_INTRO = 'This Privacy Policy describes how Business Direction ("we," "us," or "our") collects, uses, and protects your information when you visit our website or use our services.'

const DEFAULT_CONTENT_HTML = `
  <p>${DEFAULT_INTRO}</p>
  <h2>1. Information We Collect</h2>
  <p>We collect information you provide directly to us, such as your name, email address, phone number, and company details when you fill out a contact form, subscribe to our newsletter, or request a consultation. We also automatically collect certain technical information, including your IP address, browser type, device information, and pages visited, through cookies and similar tracking technologies.</p>
  <h2>2. How We Use Your Information</h2>
  <p>We use the information we collect to respond to your inquiries, deliver the services you request, send you marketing communications you have opted into, improve our website and offerings, and comply with legal obligations. We do not sell your personal information to third parties.</p>
  <h2>3. Cookies &amp; Tracking Technologies</h2>
  <p>Our website uses cookies and similar technologies to remember your preferences, understand how visitors interact with our site, and improve overall user experience. You can control cookie preferences through your browser settings at any time.</p>
  <h2>4. Sharing Your Information</h2>
  <p>We may share your information with trusted third-party service providers who help us operate our business — such as hosting providers, analytics platforms, and email marketing tools — under strict confidentiality agreements. We may also disclose information when required by law.</p>
  <h2>5. Data Security</h2>
  <p>We implement industry-standard technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security.</p>
  <h2>6. Data Retention</h2>
  <p>We retain personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required or permitted by law.</p>
  <h2>7. Your Rights</h2>
  <p>Depending on your jurisdiction, you may have the right to access, correct, delete, or restrict the use of your personal information, and to object to certain processing activities. To exercise these rights, contact us using the details below.</p>
  <h2>8. Third-Party Links</h2>
  <p>Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of those external sites and encourage you to review their privacy policies.</p>
  <h2>9. Changes to This Policy</h2>
  <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with a revised "Last updated" date. Continued use of our website after changes constitutes acceptance of the updated policy.</p>
  <h2>10. Contact Us</h2>
  <p>If you have questions about this Privacy Policy or how we handle your personal information, please contact us at hello@businessdirection.com or 210 Market Street, San Francisco, CA.</p>
`

export default function PrivacyPolicy() {
  const [page, setPage] = useState(null)

  useEffect(() => {
    api
      .get('/public/pages/privacy-policy')
      .then((res) => setPage(res.data))
      .catch(() => setPage(null))
  }, [])

  const title = page?.title || 'Privacy Policy'
  const contentHtml = page?.content || DEFAULT_CONTENT_HTML
  const updatedAt = page?.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : 'January 1, 2026'

  return (
    <div className="bg-[#0B0E14]">
      <section className="bg-gradient-to-br from-[#0B0E14] to-[#141928] py-24 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#22D3D9]">Legal</p>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">{title}</h1>
          <p className="mt-6 text-sm text-[#8B93A7]">Last updated: {updatedAt}</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div
          className="prose prose-invert max-w-none text-[15px] leading-8 text-[#8B93A7] [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_p]:mt-4"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </section>
    </div>
  )
}
