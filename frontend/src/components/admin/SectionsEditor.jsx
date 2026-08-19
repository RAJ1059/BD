import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { TextInput, TextArea, Select } from './FormField'
import { ICON_NAMES } from '../../lib/iconRegistry'

function FieldInput({ field, value, onChange, full }) {
  const wrapClass = full ? 'sm:col-span-2' : ''
  if (field.type === 'textarea') {
    return (
      <div className={wrapClass}>
        <TextArea label={field.label} hint={field.hint} rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    )
  }
  if (field.type === 'icon') {
    return (
      <div className={wrapClass}>
        <Select label={field.label} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select icon</option>
          {ICON_NAMES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
      </div>
    )
  }
  return (
    <div className={wrapClass}>
      <TextInput label={field.label} hint={field.hint} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function GroupFields({ fields, value, onChange }) {
  const update = (key, v) => onChange({ ...value, [key]: v })
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => (
        <FieldInput key={f.key} field={f} value={value[f.key] ?? ''} onChange={(v) => update(f.key, v)} full={f.type === 'textarea'} />
      ))}
    </div>
  )
}

function ListRepeater({ itemFields, value, onChange }) {
  const items = value || []
  const addItem = () => onChange([...items, Object.fromEntries(itemFields.map((f) => [f.key, '']))])
  const removeItem = (i) => onChange(items.filter((_, idx) => idx !== i))
  const updateItem = (i, patch) => onChange(items.map((item, idx) => (idx === i ? { ...item, ...patch } : item)))

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-white/10 p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {itemFields.map((f) => (
              <FieldInput key={f.key} field={f} value={item[f.key] ?? ''} onChange={(v) => updateItem(i, { [f.key]: v })} full={f.type === 'textarea'} />
            ))}
          </div>
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="rounded-lg p-2 text-[#8B93A7] transition hover:bg-red-500/10 hover:text-red-400"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="text-sm text-[#5B6478]">No items yet.</p>}
      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/5"
      >
        <FiPlus size={14} /> Add item
      </button>
    </div>
  )
}

function StringListRepeater({ itemLabel, value, onChange }) {
  const items = value || []
  const addItem = () => onChange([...items, ''])
  const removeItem = (i) => onChange(items.filter((_, idx) => idx !== i))
  const updateItem = (i, v) => onChange(items.map((item, idx) => (idx === i ? v : item)))

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={item}
            onChange={(e) => updateItem(i, e.target.value)}
            placeholder={itemLabel}
            className="mt-0 w-full rounded-xl border border-white/10 bg-[#0B0E14] px-4 py-2.5 text-sm text-white outline-none focus:border-[#05B0BA]"
          />
          <button
            type="button"
            onClick={() => removeItem(i)}
            className="rounded-lg p-2 text-[#8B93A7] transition hover:bg-red-500/10 hover:text-red-400"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/5"
      >
        <FiPlus size={14} /> Add
      </button>
    </div>
  )
}

export default function SectionsEditor({ schema, value, onChange }) {
  const sections = value || {}
  const setSection = (key, val) => onChange({ ...sections, [key]: val })

  return (
    <div className="space-y-6">
      {schema.sections.map((section) => (
        <div key={section.key} className="rounded-2xl border border-white/10 bg-[#141928] p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">{section.label}</h3>
          {section.type === 'group' && (
            <GroupFields fields={section.fields} value={sections[section.key] || {}} onChange={(v) => setSection(section.key, v)} />
          )}
          {section.type === 'list' && (
            <ListRepeater itemFields={section.itemFields} value={sections[section.key] || []} onChange={(v) => setSection(section.key, v)} />
          )}
          {section.type === 'stringList' && (
            <StringListRepeater itemLabel={section.itemLabel} value={sections[section.key] || []} onChange={(v) => setSection(section.key, v)} />
          )}
        </div>
      ))}
    </div>
  )
}
