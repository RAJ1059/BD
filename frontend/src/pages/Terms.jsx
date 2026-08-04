const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using the Business Direction website and services, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use our website or services.',
  },
  {
    title: '2. Services',
    body: 'Business Direction provides digital marketing, web development, branding, and related services as described on our website. The specific scope, timeline, and cost of any engagement will be outlined in a separate written proposal or agreement.',
  },
  {
    title: '3. Use of Website',
    body: 'You agree to use our website only for lawful purposes and in a manner that does not infringe the rights of, restrict, or inhibit anyone else\'s use of the site. Unauthorized use of our website may give rise to a claim for damages.',
  },
  {
    title: '4. Intellectual Property',
    body: 'All content on this website, including text, graphics, logos, images, and software, is the property of Business Direction or its content suppliers and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our prior written consent.',
  },
  {
    title: '5. Client Deliverables',
    body: 'Ownership of final deliverables (such as websites, creative assets, or campaign materials) transfers to the client upon full payment, unless otherwise specified in a signed agreement. Business Direction retains the right to showcase completed work in its portfolio unless a client requests confidentiality in writing.',
  },
  {
    title: '6. Payment Terms',
    body: 'Fees for services are outlined in individual proposals or statements of work. Unless otherwise agreed, invoices are due within 15 days of receipt. Late payments may result in suspension of services.',
  },
  {
    title: '7. Limitation of Liability',
    body: 'Business Direction shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our website or services, to the fullest extent permitted by law.',
  },
  {
    title: '8. Termination',
    body: 'Either party may terminate an ongoing service agreement with written notice as specified in the applicable contract. Fees for work completed prior to termination remain payable.',
  },
  {
    title: '9. Governing Law',
    body: 'These Terms & Conditions are governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law principles.',
  },
  {
    title: '10. Changes to These Terms',
    body: 'We may revise these Terms & Conditions at any time. Updated terms will be posted on this page with a revised "Last updated" date. Continued use of our services after changes constitutes acceptance of the new terms.',
  },
  {
    title: '11. Contact Us',
    body: 'If you have any questions about these Terms & Conditions, please contact us at hello@businessdirection.com or 210 Market Street, San Francisco, CA.',
  },
]

export default function Terms() {
  return (
    <div className="bg-[#0B0E14]">
      <section className="bg-gradient-to-br from-[#0B0E14] to-[#141928] py-24 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#22D3D9]">Legal</p>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Terms & Conditions</h1>
          <p className="mt-6 text-sm text-[#8B93A7]">Last updated: January 1, 2026</p>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
            These Terms & Conditions govern your use of the Business Direction website and services. This is
            placeholder content for demonstration purposes.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title} className="rounded-[24px] border border-white/10 bg-[#141928] p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-white">{section.title}</h2>
              <p className="mt-4 text-sm leading-8 text-[#8B93A7]">{section.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
