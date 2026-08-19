// Describes the editable sections for each structured CMS page. The admin
// SectionsEditor renders forms purely from this config, and each public page
// merges fetched `sections` data (keyed the same way) over its own hardcoded
// defaults, so partially-filled CMS content never blanks out a section.

const textField = (key, label, hint) => ({ key, label, type: 'text', hint })
const textareaField = (key, label, hint) => ({ key, label, type: 'textarea', hint })
const iconField = (key, label = 'Icon') => ({ key, label, type: 'icon' })

export const PAGE_CONTENT_SCHEMAS = {
  home: {
    label: 'Home',
    sections: [
      {
        key: 'hero',
        label: 'Hero',
        type: 'group',
        fields: [
          textField('badge', 'Badge text'),
          textField('heading', 'Heading'),
          textField('headingHighlight', 'Heading highlight (gradient part)'),
          textareaField('subheading', 'Subheading'),
          textField('ctaPrimaryText', 'Primary button text'),
          textField('ctaPrimaryLink', 'Primary button link'),
          textField('ctaSecondaryText', 'Secondary button text'),
          textField('ctaSecondaryLink', 'Secondary button link'),
          textField('trustBullet1', 'Trust bullet 1'),
          textField('trustBullet2', 'Trust bullet 2'),
        ],
      },
      { key: 'platforms', label: 'Platforms marquee', type: 'stringList', itemLabel: 'Platform name' },
      { key: 'credentials', label: 'Credentials', type: 'stringList', itemLabel: 'Credential' },
      {
        key: 'services',
        label: 'Core services',
        type: 'list',
        itemFields: [textField('title', 'Title'), textareaField('desc', 'Description'), iconField('icon'), textField('slug', 'Service slug')],
      },
      {
        key: 'about',
        label: 'About teaser',
        type: 'group',
        fields: [textField('eyebrow', 'Eyebrow'), textField('heading', 'Heading'), textareaField('description', 'Description')],
      },
      { key: 'aboutBullets', label: 'About bullets', type: 'stringList', itemLabel: 'Bullet' },
      { key: 'stats', label: 'Stats', type: 'list', itemFields: [textField('value', 'Value'), textField('label', 'Label')] },
      { key: 'whyChooseUs', label: 'Why choose us', type: 'list', itemFields: [textField('title', 'Title'), textareaField('desc', 'Description')] },
      { key: 'process', label: 'Process steps', type: 'list', itemFields: [textField('title', 'Title'), textareaField('desc', 'Description')] },
      { key: 'industries', label: 'Industries', type: 'stringList', itemLabel: 'Industry' },
      {
        key: 'portfolio',
        label: 'Portfolio highlights',
        type: 'list',
        itemFields: [textField('title', 'Title'), textField('tag', 'Tag'), textField('img', 'Image URL')],
      },
      {
        key: 'testimonials',
        label: 'Testimonials',
        type: 'list',
        itemFields: [textareaField('quote', 'Quote'), textField('name', 'Name'), textField('role', 'Role')],
      },
      { key: 'faqs', label: 'FAQs', type: 'list', itemFields: [textField('q', 'Question'), textareaField('a', 'Answer')] },
      {
        key: 'ctaBanner',
        label: 'Contact CTA banner',
        type: 'group',
        fields: [
          textField('eyebrow', 'Eyebrow'),
          textField('heading', 'Heading'),
          textareaField('description', 'Description'),
          textField('buttonText', 'Button text'),
          textField('buttonLink', 'Button link'),
        ],
      },
      {
        key: 'newsletter',
        label: 'Newsletter',
        type: 'group',
        fields: [textField('heading', 'Heading'), textareaField('description', 'Description')],
      },
    ],
  },

  about: {
    label: 'About',
    sections: [
      {
        key: 'hero',
        label: 'Hero',
        type: 'group',
        fields: [textField('eyebrow', 'Eyebrow'), textField('title', 'Title'), textareaField('description', 'Description')],
      },
      { key: 'stats', label: 'Stats', type: 'list', itemFields: [textField('value', 'Value'), textField('label', 'Label')] },
      {
        key: 'mission',
        label: 'Mission',
        type: 'group',
        fields: [textField('heading', 'Heading'), textareaField('description', 'Description')],
      },
      {
        key: 'vision',
        label: 'Vision',
        type: 'group',
        fields: [textField('heading', 'Heading'), textareaField('description', 'Description')],
      },
      { key: 'values', label: 'Values', type: 'list', itemFields: [textField('title', 'Title'), textareaField('desc', 'Description')] },
      {
        key: 'whyUs',
        label: 'Why us',
        type: 'list',
        itemFields: [iconField('icon'), textField('title', 'Title'), textareaField('desc', 'Description')],
      },
      {
        key: 'team',
        label: 'Leadership team',
        type: 'list',
        itemFields: [textField('name', 'Name'), textField('role', 'Role'), textField('img', 'Photo URL')],
      },
      {
        key: 'cta',
        label: 'Join us CTA',
        type: 'group',
        fields: [
          textField('eyebrow', 'Eyebrow'),
          textField('heading', 'Heading'),
          textareaField('description', 'Description'),
          textField('buttonText', 'Button text'),
          textField('buttonLink', 'Button link'),
        ],
      },
    ],
  },

  contact: {
    label: 'Contact',
    sections: [
      {
        key: 'hero',
        label: 'Hero',
        type: 'group',
        fields: [
          textField('eyebrow', 'Eyebrow'),
          textField('title', 'Title'),
          textareaField('description', 'Description'),
          textField('bullet1', 'Trust bullet 1'),
          textField('bullet2', 'Trust bullet 2'),
        ],
      },
      {
        key: 'infoItems',
        label: 'Contact info',
        type: 'list',
        itemFields: [iconField('icon'), textField('label', 'Label'), textField('value', 'Value')],
      },
      {
        key: 'socialLinks',
        label: 'Social links',
        type: 'list',
        itemFields: [iconField('icon'), textField('label', 'Platform'), textField('href', 'URL')],
      },
      {
        key: 'cta',
        label: 'CTA banner',
        type: 'group',
        fields: [
          textField('eyebrow', 'Eyebrow'),
          textField('heading', 'Heading'),
          textareaField('description', 'Description'),
          textField('buttonText', 'Button text'),
          textField('buttonLink', 'Button link'),
        ],
      },
    ],
  },

  faq: {
    label: 'FAQ',
    sections: [
      {
        key: 'hero',
        label: 'Hero',
        type: 'group',
        fields: [textField('eyebrow', 'Eyebrow'), textField('title', 'Title'), textareaField('description', 'Description')],
      },
      {
        key: 'faqs',
        label: 'Questions',
        type: 'list',
        itemFields: [textField('category', 'Category'), textField('question', 'Question'), textareaField('answer', 'Answer')],
      },
      {
        key: 'cta',
        label: 'CTA banner',
        type: 'group',
        fields: [textField('heading', 'Heading'), textareaField('description', 'Description'), textField('buttonText', 'Button text'), textField('buttonLink', 'Button link')],
      },
    ],
  },

  portfolio: {
    label: 'Portfolio',
    sections: [
      {
        key: 'hero',
        label: 'Hero',
        type: 'group',
        fields: [textField('eyebrow', 'Eyebrow'), textField('title', 'Title'), textareaField('description', 'Description')],
      },
      { key: 'industries', label: 'Filter tags', type: 'stringList', itemLabel: 'Industry' },
      {
        key: 'projects',
        label: 'Projects',
        type: 'list',
        itemFields: [
          textField('title', 'Title'),
          textField('category', 'Category'),
          textField('industry', 'Industry'),
          textareaField('description', 'Description'),
          textField('img', 'Image URL'),
          textField('result', 'Result'),
        ],
      },
      {
        key: 'cta',
        label: 'CTA banner',
        type: 'group',
        fields: [
          textField('eyebrow', 'Eyebrow'),
          textField('heading', 'Heading'),
          textareaField('description', 'Description'),
          textField('buttonText', 'Button text'),
          textField('buttonLink', 'Button link'),
        ],
      },
    ],
  },
}
