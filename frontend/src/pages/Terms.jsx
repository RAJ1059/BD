import { useEffect, useState } from 'react'
import { api } from '../lib/api'

const DEFAULT_CONTENT_HTML = `
  <p>These Terms &amp; Conditions govern your use of the Business Direction website and services.</p>
  <h2>1. Acceptance of Terms</h2>
  <p>By accessing or using the Business Direction website and services, you agree to be bound by these Terms &amp; Conditions. If you do not agree to these terms, please do not use our website or services.</p>
  <h2>2. Services</h2>
  <p>Business Direction provides digital marketing, web development, branding, and related services as described on our website. The specific scope, timeline, and cost of any engagement will be outlined in a separate written proposal or agreement.</p>
  <h2>3. Use of Website</h2>
  <p>You agree to use our website only for lawful purposes and in a manner that does not infringe the rights of, restrict, or inhibit anyone else's use of the site. Unauthorized use of our website may give rise to a claim for damages.</p>
  <h2>4. Intellectual Property</h2>
  <p>All content on this website, including text, graphics, logos, images, and software, is the property of Business Direction or its content suppliers and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our prior written consent.</p>
  <h2>5. Client Deliverables</h2>
  <p>Ownership of final deliverables (such as websites, creative assets, or campaign materials) transfers to the client upon full payment, unless otherwise specified in a signed agreement. Business Direction retains the right to showcase completed work in its portfolio unless a client requests confidentiality in writing.</p>
  <h2>6. Payment Terms</h2>
  <p>Fees for services are outlined in individual proposals or statements of work. Unless otherwise agreed, invoices are due within 15 days of receipt. Late payments may result in suspension of services.</p>
  <h2>7. Limitation of Liability</h2>
  <p>Business Direction shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our website or services, to the fullest extent permitted by law.</p>
  <h2>8. Termination</h2>
  <p>Either party may terminate an ongoing service agreement with written notice as specified in the applicable contract. Fees for work completed prior to termination remain payable.</p>
  <h2>9. Governing Law</h2>
  <p>These Terms &amp; Conditions are governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law principles.</p>
  <h2>10. Changes to These Terms</h2>
  <p>We may revise these Terms &amp; Conditions at any time. Updated terms will be posted on this page with a revised "Last updated" date. Continued use of our services after changes constitutes acceptance of the new terms.</p>
  <h2>11. Contact Us</h2>
  <p>If you have any questions about these Terms &amp; Conditions, please contact us at hello@businessdirection.com or 210 Market Street, San Francisco, CA.</p>
`

export default function Terms() {
  const [page, setPage] = useState(null)

  useEffect(() => {
    api
      .get('/public/pages/terms')
      .then((res) => setPage(res.data))
      .catch(() => setPage(null))
  }, [])

  const title = page?.title || 'Terms & Conditions'
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
