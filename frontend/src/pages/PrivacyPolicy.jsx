const sections = [
  {
    title: '1. Information We Collect',
    body: 'We collect information you provide directly to us, such as your name, email address, phone number, and company details when you fill out a contact form, subscribe to our newsletter, or request a consultation. We also automatically collect certain technical information, including your IP address, browser type, device information, and pages visited, through cookies and similar tracking technologies.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use the information we collect to respond to your inquiries, deliver the services you request, send you marketing communications you have opted into, improve our website and offerings, and comply with legal obligations. We do not sell your personal information to third parties.',
  },
  {
    title: '3. Cookies & Tracking Technologies',
    body: 'Our website uses cookies and similar technologies to remember your preferences, understand how visitors interact with our site, and improve overall user experience. You can control cookie preferences through your browser settings at any time.',
  },
  {
    title: '4. Sharing Your Information',
    body: 'We may share your information with trusted third-party service providers who help us operate our business — such as hosting providers, analytics platforms, and email marketing tools — under strict confidentiality agreements. We may also disclose information when required by law.',
  },
  {
    title: '5. Data Security',
    body: 'We implement industry-standard technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security.',
  },
  {
    title: '6. Data Retention',
    body: 'We retain personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required or permitted by law.',
  },
  {
    title: '7. Your Rights',
    body: 'Depending on your jurisdiction, you may have the right to access, correct, delete, or restrict the use of your personal information, and to object to certain processing activities. To exercise these rights, contact us using the details below.',
  },
  {
    title: '8. Third-Party Links',
    body: 'Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of those external sites and encourage you to review their privacy policies.',
  },
  {
    title: '9. Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. Any changes will be posted on this page with a revised "Last updated" date. Continued use of our website after changes constitutes acceptance of the updated policy.',
  },
  {
    title: '10. Contact Us',
    body: 'If you have questions about this Privacy Policy or how we handle your personal information, please contact us at hello@businessdirection.com or 210 Market Street, San Francisco, CA.',
  },
]

export default function PrivacyPolicy() {
  return (
    <div className="bg-[#09090B]">
      <section className="bg-gradient-to-br from-[#09090B] to-[#111115] py-24 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#FF7439]">Legal</p>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Privacy Policy</h1>
          <p className="mt-6 text-sm text-[#9898A6]">Last updated: January 1, 2026</p>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
            This Privacy Policy describes how Business Direction ("we," "us," or "our") collects, uses, and protects
            your information when you visit our website or use our services. This is placeholder content for
            demonstration purposes.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title} className="rounded-[24px] border border-white/10 bg-[#111115] p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-white">{section.title}</h2>
              <p className="mt-4 text-sm leading-8 text-[#9898A6]">{section.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
