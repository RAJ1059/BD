// Mirrors the DEFAULT_* constants in the frontend page components, so the
// admin starts with real editable content instead of blank forms, and the
// public site keeps rendering identically on day one.

export const PAGE_CONTENT_SEED = {
  home: {
    hero: {
      badge: 'Technology & growth partner for ambitious brands',
      heading: 'Turn bold ambition into',
      headingHighlight: 'measurable digital growth.',
      subheading: 'Business Direction combines strategy, creative, and performance marketing to build enterprise-grade experiences that convert.',
      ctaPrimaryText: 'Schedule a Discovery Call',
      ctaPrimaryLink: '/contact',
      ctaSecondaryText: 'Explore Services',
      ctaSecondaryLink: '/services',
      trustBullet1: 'Award-winning team',
      trustBullet2: 'Fast, transparent execution',
    },
    platforms: ['HubSpot', 'Salesforce', 'Webflow', 'Shopify', 'Google Ads', 'Meta Ads', 'Slack'],
    credentials: ['Google Partner', 'Meta Business Partner', 'HubSpot Solutions Partner', 'Microsoft Advertising'],
    services: [
      { title: 'SEO Strategy', desc: 'Technical, on-page, and enterprise SEO that compounds visibility.', icon: 'FiSearch', slug: 'seo' },
      { title: 'Google Ads (PPC)', desc: 'High-intent campaigns engineered for qualified pipeline.', icon: 'FiTarget', slug: 'google-ads-ppc' },
      { title: 'Social Media', desc: 'Content-led growth for social channels that convert attention.', icon: 'FiZap', slug: 'social-media-marketing' },
      { title: 'Web & App Development', desc: 'React and WordPress experiences built to scale.', icon: 'FiMonitor', slug: 'react-wordpress-development' },
    ],
    about: {
      eyebrow: 'About Business Direction',
      heading: 'A strategic agency for modern growth challenges.',
      description: 'We blend consulting rigor with marketing creativity to help ambitious brands scale with clarity, confidence, and measurable momentum.',
    },
    aboutBullets: ['Senior-led strategy and execution', 'Transparent reporting and KPI visibility', 'Cross-channel campaigns designed for conversion'],
    stats: [
      { value: '150+', label: 'projects delivered' },
      { value: '40+', label: 'active clients' },
      { value: '92%', label: 'client retention' },
      { value: '6', label: 'industries served' },
    ],
    whyChooseUs: [
      { title: 'Enterprise-ready execution', desc: 'Cross-functional teams that move quickly without sacrificing quality.' },
      { title: 'Analytics-led approach', desc: 'Every campaign is measured, optimized, and tied to business outcomes.' },
      { title: 'Brand elevation', desc: 'Refined creative that improves perception and conversion alike.' },
      { title: 'Full-funnel strategy', desc: 'From awareness to loyalty, we design for measurable growth.' },
    ],
    process: [
      { title: 'Discover', desc: 'We audit your brand, market, and funnel to uncover the highest-leverage growth opportunities.' },
      { title: 'Design', desc: 'Strategy, creative, and experience design come together into a unified growth plan.' },
      { title: 'Launch', desc: 'Campaigns, websites, and content go live with precision and quality assurance.' },
      { title: 'Optimize', desc: 'Continuous testing and reporting keep performance compounding month over month.' },
    ],
    industries: ['Healthcare', 'Fintech', 'Retail', 'Manufacturing', 'Technology', 'Education'],
    portfolio: [
      { title: 'Northstar Health', tag: 'SEO + Web', img: 'https://picsum.photos/seed/northstar/640/480' },
      { title: 'Aurelia Capital', tag: 'PPC + Analytics', img: 'https://picsum.photos/seed/aurelia/640/480' },
      { title: 'Lumen Retail', tag: 'Ecommerce Growth', img: 'https://picsum.photos/seed/lumen/640/480' },
    ],
    testimonials: [
      { quote: 'A thoughtful partner that brought strategy, design, and performance together as one team.', name: 'Mina Chen', role: 'CMO, Northstar Health' },
      { quote: 'Their ability to turn insights into growth was exceptional from day one.', name: 'Darren Brooks', role: 'VP Marketing, Aurelia Capital' },
      { quote: 'The website launch elevated both our brand and our conversion rate immediately.', name: 'Sofia Alvarez', role: 'Founder, Lumen Retail' },
      { quote: 'Reporting is transparent and the team acts like a true extension of ours.', name: 'Grace Whitfield', role: 'Head of Growth, Crest Labs' },
    ],
    faqs: [
      { q: 'What types of businesses do you work with?', a: 'We collaborate with ambitious companies across healthcare, fintech, retail, SaaS, and professional services.' },
      { q: 'Can you support both strategy and execution?', a: 'Yes. We lead both the planning and hands-on delivery of campaigns, websites, and creative systems.' },
      { q: 'Do you offer ongoing retainer support?', a: 'Absolutely. Many clients choose a retainer model for continuous optimization and growth support.' },
    ],
    ctaBanner: {
      eyebrow: "Let's build momentum",
      heading: 'Ready for a growth partner with enterprise-level standards?',
      description: 'From strategy workshops to launch execution, we help growth-minded companies move faster with clarity and confidence.',
      buttonText: 'Start your project',
      buttonLink: '/contact',
    },
    newsletter: {
      heading: 'Growth insights, straight to your inbox.',
      description: 'Join hundreds of marketing leaders getting our monthly playbook on SEO, paid media, and conversion design.',
    },
  },

  about: {
    hero: {
      eyebrow: 'About Business Direction',
      title: 'An elite growth partner for companies ready to scale.',
      description: 'We unite strategy, design, and digital execution to help ambitious brands win in crowded markets with confidence.',
    },
    stats: [
      { value: '8+', label: 'years in business' },
      { value: '320+', label: 'brands served' },
      { value: '94%', label: 'client retention' },
      { value: '12', label: 'countries reached' },
    ],
    mission: {
      heading: 'Our mission',
      description: 'To help businesses grow through thoughtful digital strategy, modern websites, high-performing campaigns, and brand experiences that create lasting value.',
    },
    vision: {
      heading: 'Our vision',
      description: 'To become the go-to growth partner for companies that want premium execution and measurable business impact.',
    },
    values: [
      { title: 'Clarity', desc: 'We simplify complex growth challenges into clear, focused action.' },
      { title: 'Momentum', desc: 'We move with urgency and maintain momentum from strategy to launch.' },
      { title: 'Precision', desc: 'Every decision is grounded in insight, performance data, and intent.' },
    ],
    whyUs: [
      { icon: 'FiTarget', title: 'Focused strategy', desc: 'We define the highest-impact growth initiatives first.' },
      { icon: 'FiUsers', title: 'Deep collaboration', desc: 'You get a partner that acts like an extension of your team.' },
      { icon: 'FiCompass', title: 'Cohesive execution', desc: 'Brand, product, and performance are aligned from the start.' },
      { icon: 'FiAward', title: 'Proven results', desc: 'We measure what matters and optimize with discipline.' },
    ],
    team: [
      { name: 'Nadia Brooks', role: 'Founder & CEO', img: 'https://picsum.photos/seed/nadia/400/400' },
      { name: 'Caleb Torres', role: 'Strategy Director', img: 'https://picsum.photos/seed/caleb/400/400' },
      { name: 'Maya Patel', role: 'Creative Lead', img: 'https://picsum.photos/seed/maya/400/400' },
      { name: 'Owen Reyes', role: 'Head of Engineering', img: 'https://picsum.photos/seed/owen/400/400' },
    ],
    cta: {
      eyebrow: 'Join our team',
      heading: "We're always looking for ambitious talent.",
      description: "Curious, craft-obsessed people do their best work here. Let's talk about your next chapter.",
      buttonText: 'Get in touch',
      buttonLink: '/contact',
    },
  },

  contact: {
    hero: {
      eyebrow: 'Contact',
      title: "Let's create your next growth chapter.",
      description: 'Tell us about your goals and a strategist will get back to you within one business day.',
      bullet1: 'Free strategy consultation',
      bullet2: 'Response within 24 hours',
    },
    infoItems: [
      { icon: 'FiMail', label: 'Email us', value: 'hello@businessdirection.com' },
      { icon: 'FiPhone', label: 'Call us', value: '+1 (415) 555-1040' },
      { icon: 'FiMapPin', label: 'Visit us', value: '210 Market Street, San Francisco, CA' },
      { icon: 'FiClock', label: 'Working hours', value: 'Mon – Fri, 9:00 AM – 6:00 PM PST' },
    ],
    socialLinks: [
      { icon: 'FaFacebookF', label: 'Facebook', href: '#' },
      { icon: 'FaTwitter', label: 'Twitter', href: '#' },
      { icon: 'FaLinkedinIn', label: 'LinkedIn', href: '#' },
      { icon: 'FaInstagram', label: 'Instagram', href: '#' },
      { icon: 'FaWhatsapp', label: 'WhatsApp', href: '#' },
    ],
    cta: {
      eyebrow: 'Prefer a quick call?',
      heading: 'Book a free 30-minute strategy session.',
      description: 'No pressure, no pitch decks — just a candid conversation about your growth goals.',
      buttonText: 'Schedule a call',
      buttonLink: '#',
    },
  },

  faq: {
    hero: {
      eyebrow: 'FAQ',
      title: 'Frequently asked questions about working with us.',
      description: 'Everything you need to know before booking a strategy call — organized by topic.',
    },
    faqs: [
      { category: 'Working together', question: 'What types of businesses do you work with?', answer: 'We collaborate with ambitious companies across healthcare, fintech, retail, SaaS, and professional services.' },
      { category: 'Working together', question: 'Can you support both strategy and execution?', answer: 'Yes. We can lead both the planning and hands-on delivery of campaigns, websites, and creative systems.' },
      { category: 'Working together', question: 'Do you offer ongoing retainer support?', answer: 'Absolutely. Many clients choose a retainer model for continuous optimization and growth support.' },
      { category: 'Working together', question: 'How do we get started?', answer: "Book a free discovery call. We'll learn about your goals, audit your current setup, and propose a tailored plan within a few days." },
      { category: 'Pricing & engagement', question: 'How is pricing structured?', answer: 'Most engagements are structured as monthly retainers scoped to your goals, with project-based pricing available for one-off work like website builds.' },
      { category: 'Pricing & engagement', question: 'What is the minimum contract length?', answer: 'Retainers typically start with a 3-month minimum so we have enough runway to show measurable results, though project work can be shorter.' },
      { category: 'Pricing & engagement', question: 'Do you offer custom packages for startups?', answer: 'Yes — we build flexible scopes for early-stage teams that need focused wins before scaling investment.' },
      { category: 'Process & reporting', question: 'How often will we receive reporting?', answer: "You'll get a live dashboard plus a monthly strategic review covering performance, insights, and next steps." },
      { category: 'Process & reporting', question: 'Who will we be working with day to day?', answer: 'A dedicated strategist leads every engagement, backed by senior specialists across SEO, paid media, design, and development.' },
      { category: 'Process & reporting', question: 'What tools and platforms do you use?', answer: 'We work within your existing stack where possible and recommend best-in-class tools (CRM, analytics, automation) when gaps exist.' },
    ],
    cta: {
      heading: 'Still have questions?',
      description: 'Our team is happy to walk through your specific situation on a free strategy call.',
      buttonText: 'Contact us',
      buttonLink: '/contact',
    },
  },

  portfolio: {
    hero: {
      eyebrow: 'Portfolio',
      title: 'Selected work that blends strategy, design, and growth.',
      description: "A curated look at how we've helped ambitious brands turn strategy into measurable outcomes.",
    },
    industries: ['Healthcare', 'Fintech', 'Retail', 'Technology'],
    projects: [
      { title: 'Northstar Health', category: 'SEO + Web', industry: 'Healthcare', description: 'Repositioning a healthcare brand for higher trust and stronger lead capture.', img: 'https://picsum.photos/seed/northstar/800/600', result: '+142% qualified leads' },
      { title: 'Aurelia Capital', category: 'PPC + Analytics', industry: 'Fintech', description: 'Paid media expansion with a sharper funnel and stronger attribution reporting.', img: 'https://picsum.photos/seed/aurelia/800/600', result: '4.8x paid media efficiency' },
      { title: 'Lumen Retail', category: 'Ecommerce Growth', industry: 'Retail', description: 'Growth design and CRO improvements for a modern retail experience.', img: 'https://picsum.photos/seed/lumen/800/600', result: '+67% ecommerce conversion' },
      { title: 'Crest Labs', category: 'Brand + Development', industry: 'Technology', description: 'Brand transformation paired with a new conversion-optimized digital presence.', img: 'https://picsum.photos/seed/crest/800/600', result: '+58% brand recall' },
      { title: 'Havenwell', category: 'SEO + Content', industry: 'Healthcare', description: 'Content-led organic growth engine built around patient education.', img: 'https://picsum.photos/seed/havenwell/800/600', result: '3.1x organic traffic' },
      { title: 'Ridgeline Supply', category: 'Web + Automation', industry: 'Retail', description: 'A rebuilt storefront paired with lifecycle automation for repeat buyers.', img: 'https://picsum.photos/seed/ridgeline/800/600', result: '+41% repeat purchase rate' },
    ],
    cta: {
      eyebrow: 'Like what you see?',
      heading: "Let's build your next case study together.",
      description: "Tell us about your goals and we'll show you how we'd approach your project.",
      buttonText: 'Start a project',
      buttonLink: '/contact',
    },
  },
}

export const SERVICE_SEED = [
  { slug: 'seo', title: 'SEO', icon: 'FiSearch', summary: 'Technical, on-page, and authority building that improves discoverability and demand generation.', description: 'We build durable organic visibility through technical audits, content architecture, and authority-building — turning search into a predictable growth channel instead of a guessing game.', features: ['Technical SEO audits', 'Keyword & content strategy', 'On-page optimization', 'Link building & authority', 'Core Web Vitals tuning', 'Monthly performance reporting'], benefits: ['Compounding organic traffic', 'Lower cost per acquisition over time', 'Stronger domain authority', 'Higher-quality inbound leads'] },
  { slug: 'local-seo', title: 'Local SEO', icon: 'FiMapPin', summary: 'Hyperlocal strategy for store visibility, map presence, and nearby conversion.', description: 'We optimize your Google Business presence, local citations, and map rankings so nearby customers find and choose you first.', features: ['Google Business Profile optimization', 'Local citation building', 'Review & reputation management', 'Map pack ranking strategy', 'Location page SEO', 'Local link building'], benefits: ['Higher map pack visibility', 'More foot traffic & calls', 'Improved local trust signals', 'Better multi-location consistency'] },
  { slug: 'google-ads-ppc', title: 'Google Ads (PPC)', icon: 'FiTarget', summary: 'Intent-led paid search and shopping campaigns tuned for profitable growth.', description: 'We design and manage high-intent search, display, and shopping campaigns with tight conversion tracking so every dollar is accountable.', features: ['Search & shopping campaigns', 'Landing page conversion testing', 'Audience & remarketing strategy', 'Bid & budget optimization', 'Conversion tracking setup', 'Weekly performance reporting'], benefits: ['Immediate qualified traffic', 'Transparent cost-per-lead', 'Scalable ad spend efficiency', 'Faster pipeline velocity'] },
  { slug: 'social-media-marketing', title: 'Social Media Marketing', icon: 'FiShare2', summary: 'Audience-first social planning and paid amplification for high engagement.', description: 'We plan and run paid social campaigns across platforms, pairing creative testing with audience targeting to grow reach and engagement profitably.', features: ['Paid social campaign strategy', 'Creative & copy testing', 'Audience targeting & retargeting', 'Cross-platform media planning', 'Performance analytics', 'Influencer collaboration support'], benefits: ['Stronger brand awareness', 'Higher engagement rates', 'Efficient paid social spend', 'Consistent audience growth'] },
  { slug: 'social-media-management', title: 'Social Media Management', icon: 'FiUsers', summary: 'Community strategy, content calendars, and steady brand presence.', description: 'We handle day-to-day content planning, publishing, and community engagement so your brand shows up consistently and authentically.', features: ['Content calendar planning', 'Organic post creation', 'Community management', 'Brand voice & tone guides', 'Platform growth strategy', 'Monthly analytics reporting'], benefits: ['Consistent brand presence', 'Stronger community trust', 'Time saved for your team', 'Steady organic follower growth'] },
  { slug: 'web-design', title: 'Web Design', icon: 'FiLayout', summary: 'High-converting landing pages and digital experiences that reflect your brand.', description: 'We design conversion-focused websites and landing pages that balance premium aesthetics with clear user journeys.', features: ['Custom UI design', 'Responsive layouts', 'Conversion-focused wireframing', 'Design systems & style guides', 'Landing page design', 'Accessibility best practices'], benefits: ['Higher on-site conversion', 'Stronger brand perception', 'Faster page load experience', 'Consistent design across pages'] },
  { slug: 'react-wordpress-development', title: 'React & WordPress Development', icon: 'FiCode', summary: 'Fast, scalable websites built for modern marketing teams.', description: "We build performant React applications and flexible WordPress sites, matched to your team's technical needs and content workflows.", features: ['Custom React development', 'WordPress theme & plugin builds', 'CMS integration', 'Performance optimization', 'API & third-party integrations', 'Ongoing technical support'], benefits: ['Fast, reliable site performance', 'Easy content management', 'Scalable technical foundation', 'Reduced long-term maintenance cost'] },
  { slug: 'ui-ux-design', title: 'UI/UX Design', icon: 'FiFigma', summary: 'Thoughtful product and marketing journeys designed around user behavior.', description: 'We research and design digital experiences grounded in real user behavior, reducing friction across every touchpoint.', features: ['User research & personas', 'Wireframing & prototyping', 'Usability testing', 'Interaction design', 'Design system creation', 'Conversion journey mapping'], benefits: ['Reduced user friction', 'Higher task completion rates', 'Improved customer satisfaction', 'Faster design-to-dev handoff'] },
  { slug: 'branding', title: 'Branding', icon: 'FiAward', summary: 'Identity systems, strategy, and messaging frameworks that build trust.', description: 'We craft brand identities and messaging frameworks that give your company a clear, differentiated voice in the market.', features: ['Brand strategy & positioning', 'Logo & visual identity', 'Messaging frameworks', 'Brand guidelines', 'Naming & tagline development', 'Competitive brand audits'], benefits: ['Clear market differentiation', 'Stronger customer trust', 'Consistent brand expression', 'Easier sales & marketing alignment'] },
  { slug: 'graphic-design', title: 'Graphic Design', icon: 'FiImage', summary: 'Visual assets engineered for campaigns, content, and sales enablement.', description: 'We produce polished visual assets — from social creative to sales decks — that keep your brand looking sharp everywhere it shows up.', features: ['Social & ad creative', 'Sales enablement decks', 'Print & packaging design', 'Infographics & data visuals', 'Brand asset libraries', 'Campaign visual systems'], benefits: ['Consistent visual quality', 'Faster campaign turnaround', 'Stronger sales collateral', 'Cohesive brand presentation'] },
  { slug: 'content-marketing', title: 'Content Marketing', icon: 'FiEdit3', summary: 'Editorial strategy and conversion-focused content that compounds authority.', description: 'We build editorial strategies and produce content that earns trust, ranks organically, and moves readers toward conversion.', features: ['Content strategy & calendars', 'SEO-driven article writing', 'Case studies & whitepapers', 'Content distribution planning', 'Topic cluster mapping', 'Performance reporting'], benefits: ['Compounding organic authority', 'Stronger thought leadership', 'More top-of-funnel demand', 'Better content-to-lead conversion'] },
  { slug: 'email-marketing', title: 'Email Marketing', icon: 'FiMail', summary: 'Lifecycle campaigns and nurture flows that improve conversion and retention.', description: 'We design lifecycle email programs — welcome flows, nurture sequences, and retention campaigns — that turn subscribers into customers.', features: ['Lifecycle flow design', 'List segmentation strategy', 'A/B tested campaigns', 'Newsletter design & copy', 'Deliverability optimization', 'Performance analytics'], benefits: ['Higher email conversion rates', 'Improved customer retention', 'Better list health & deliverability', 'Automated revenue channel'] },
  { slug: 'video-marketing', title: 'Video Marketing', icon: 'FiVideo', summary: 'Explainer videos, motion graphics, and short-form storytelling for demand generation.', description: 'We produce explainer videos, motion graphics, and short-form social content that communicate your value quickly and memorably.', features: ['Explainer video production', 'Motion graphics & animation', 'Short-form social video', 'Scriptwriting & storyboarding', 'Video ad creative', 'Platform-specific editing'], benefits: ['Higher engagement & watch time', 'Clearer product communication', 'Stronger social performance', 'Improved ad conversion rates'] },
  { slug: 'mobile-app-development', title: 'Mobile App Development', icon: 'FiSmartphone', summary: 'Native and cross-platform products built for modern customer experiences.', description: 'We design and build native and cross-platform mobile apps that give your customers a fast, reliable experience on any device.', features: ['iOS & Android development', 'Cross-platform builds', 'UX-focused app design', 'API & backend integration', 'App store optimization', 'Post-launch support'], benefits: ['Reliable cross-device experience', 'Faster time to market', 'Stronger customer engagement', 'Scalable technical architecture'] },
  { slug: 'marketing-automation', title: 'Marketing Automation', icon: 'FiZap', summary: 'CRM-connected workflows that streamline lead nurture and pipeline acceleration.', description: 'We build CRM-connected automation workflows that qualify, nurture, and route leads automatically — so your team focuses on closing, not chasing.', features: ['CRM workflow design', 'Lead scoring & routing', 'Automated nurture sequences', 'Sales & marketing alignment', 'Reporting dashboards', 'Tool integration & setup'], benefits: ['Faster lead response times', 'Higher lead-to-customer conversion', 'Less manual busywork', 'Clear pipeline visibility'] },
]

export const LEGAL_PAGE_SEED = [
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    content: `<p>This Privacy Policy describes how Business Direction ("we," "us," or "our") collects, uses, and protects your information when you visit our website or use our services.</p>
<h2>1. Information We Collect</h2><p>We collect information you provide directly to us, such as your name, email address, phone number, and company details when you fill out a contact form, subscribe to our newsletter, or request a consultation. We also automatically collect certain technical information, including your IP address, browser type, device information, and pages visited, through cookies and similar tracking technologies.</p>
<h2>2. How We Use Your Information</h2><p>We use the information we collect to respond to your inquiries, deliver the services you request, send you marketing communications you have opted into, improve our website and offerings, and comply with legal obligations. We do not sell your personal information to third parties.</p>
<h2>3. Cookies &amp; Tracking Technologies</h2><p>Our website uses cookies and similar technologies to remember your preferences, understand how visitors interact with our site, and improve overall user experience. You can control cookie preferences through your browser settings at any time.</p>
<h2>4. Sharing Your Information</h2><p>We may share your information with trusted third-party service providers who help us operate our business — such as hosting providers, analytics platforms, and email marketing tools — under strict confidentiality agreements. We may also disclose information when required by law.</p>
<h2>5. Data Security</h2><p>We implement industry-standard technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security.</p>
<h2>6. Data Retention</h2><p>We retain personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required or permitted by law.</p>
<h2>7. Your Rights</h2><p>Depending on your jurisdiction, you may have the right to access, correct, delete, or restrict the use of your personal information, and to object to certain processing activities. To exercise these rights, contact us using the details below.</p>
<h2>8. Third-Party Links</h2><p>Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of those external sites and encourage you to review their privacy policies.</p>
<h2>9. Changes to This Policy</h2><p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with a revised "Last updated" date. Continued use of our website after changes constitutes acceptance of the updated policy.</p>
<h2>10. Contact Us</h2><p>If you have questions about this Privacy Policy or how we handle your personal information, please contact us at hello@businessdirection.com or 210 Market Street, San Francisco, CA.</p>`,
  },
  {
    slug: 'terms',
    title: 'Terms & Conditions',
    content: `<p>These Terms &amp; Conditions govern your use of the Business Direction website and services.</p>
<h2>1. Acceptance of Terms</h2><p>By accessing or using the Business Direction website and services, you agree to be bound by these Terms &amp; Conditions. If you do not agree to these terms, please do not use our website or services.</p>
<h2>2. Services</h2><p>Business Direction provides digital marketing, web development, branding, and related services as described on our website. The specific scope, timeline, and cost of any engagement will be outlined in a separate written proposal or agreement.</p>
<h2>3. Use of Website</h2><p>You agree to use our website only for lawful purposes and in a manner that does not infringe the rights of, restrict, or inhibit anyone else's use of the site. Unauthorized use of our website may give rise to a claim for damages.</p>
<h2>4. Intellectual Property</h2><p>All content on this website, including text, graphics, logos, images, and software, is the property of Business Direction or its content suppliers and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our prior written consent.</p>
<h2>5. Client Deliverables</h2><p>Ownership of final deliverables (such as websites, creative assets, or campaign materials) transfers to the client upon full payment, unless otherwise specified in a signed agreement. Business Direction retains the right to showcase completed work in its portfolio unless a client requests confidentiality in writing.</p>
<h2>6. Payment Terms</h2><p>Fees for services are outlined in individual proposals or statements of work. Unless otherwise agreed, invoices are due within 15 days of receipt. Late payments may result in suspension of services.</p>
<h2>7. Limitation of Liability</h2><p>Business Direction shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our website or services, to the fullest extent permitted by law.</p>
<h2>8. Termination</h2><p>Either party may terminate an ongoing service agreement with written notice as specified in the applicable contract. Fees for work completed prior to termination remain payable.</p>
<h2>9. Governing Law</h2><p>These Terms &amp; Conditions are governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law principles.</p>
<h2>10. Changes to These Terms</h2><p>We may revise these Terms &amp; Conditions at any time. Updated terms will be posted on this page with a revised "Last updated" date. Continued use of our services after changes constitutes acceptance of the new terms.</p>
<h2>11. Contact Us</h2><p>If you have any questions about these Terms &amp; Conditions, please contact us at hello@businessdirection.com or 210 Market Street, San Francisco, CA.</p>`,
  },
]
