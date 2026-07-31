import { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiLink,
  FiImage,
  FiList,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiCode,
  FiMinus,
  FiCornerUpLeft,
  FiCornerUpRight,
} from 'react-icons/fi'
import { FaListOl, FaQuoteLeft, FaHighlighter } from 'react-icons/fa'
import MediaPickerModal from './MediaPickerModal'

function ToolbarButton({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm transition disabled:cursor-not-allowed disabled:opacity-30 ${
        active ? 'bg-[#A050F8] text-white' : 'text-[#9898A6] hover:bg-white/10 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="mx-1 h-6 w-px bg-white/10" />
}

export default function RichTextEditor({ label, value, onChange, hint, required }) {
  const [pickerOpen, setPickerOpen] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ HTMLAttributes: { class: 'rounded-xl max-w-full' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Start writing your post…' }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'blog-editor-content min-h-[420px] px-6 py-5 text-[#E4E4E7] focus:outline-none',
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  })

  useEffect(() => {
    if (!editor) return
    if (value !== editor.getHTML() && document.activeElement?.closest('.ProseMirror') === null) {
      editor.commands.setContent(value || '', false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor])

  if (!editor) return null

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl || 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-[#9898A6]">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <div className="mt-1 overflow-hidden rounded-xl border border-white/10 bg-[#09090B]">
        <div className="flex flex-wrap items-center gap-0.5 border-b border-white/10 bg-[#111115] px-2 py-1.5">
          <select
            onChange={(e) => {
              const v = e.target.value
              if (v === 'p') editor.chain().focus().setParagraph().run()
              else editor.chain().focus().toggleHeading({ level: Number(v) }).run()
            }}
            value={
              editor.isActive('heading', { level: 1 })
                ? '1'
                : editor.isActive('heading', { level: 2 })
                  ? '2'
                  : editor.isActive('heading', { level: 3 })
                    ? '3'
                    : 'p'
            }
            className="mr-1 h-8 rounded-lg border border-white/10 bg-[#09090B] px-2 text-xs text-white outline-none"
          >
            <option value="p">Normal text</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
          </select>

          <ToolbarDivider />

          <ToolbarButton title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
            <FiBold />
          </ToolbarButton>
          <ToolbarButton title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <FiItalic />
          </ToolbarButton>
          <ToolbarButton
            title="Underline"
            active={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <FiUnderline />
          </ToolbarButton>
          <ToolbarButton
            title="Highlight"
            active={editor.isActive('highlight')}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
          >
            <FaHighlighter size={13} />
          </ToolbarButton>
          <ToolbarButton title="Inline code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
            <FiCode />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            title="Align left"
            active={editor.isActive({ textAlign: 'left' })}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
          >
            <FiAlignLeft />
          </ToolbarButton>
          <ToolbarButton
            title="Align center"
            active={editor.isActive({ textAlign: 'center' })}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
          >
            <FiAlignCenter />
          </ToolbarButton>
          <ToolbarButton
            title="Align right"
            active={editor.isActive({ textAlign: 'right' })}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
          >
            <FiAlignRight />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            title="Bullet list"
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <FiList />
          </ToolbarButton>
          <ToolbarButton
            title="Numbered list"
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <FaListOl size={13} />
          </ToolbarButton>
          <ToolbarButton
            title="Quote"
            active={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <FaQuoteLeft size={13} />
          </ToolbarButton>
          <ToolbarButton title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            <FiMinus />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton title="Link" active={editor.isActive('link')} onClick={setLink}>
            <FiLink />
          </ToolbarButton>
          <ToolbarButton title="Insert image" onClick={() => setPickerOpen(true)}>
            <FiImage />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
            <FiCornerUpLeft />
          </ToolbarButton>
          <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
            <FiCornerUpRight />
          </ToolbarButton>
        </div>

        <EditorContent editor={editor} className="max-h-[70vh] overflow-y-auto" />
      </div>
      {hint && <p className="mt-1 text-xs text-[#6B6B78]">{hint}</p>}

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(media) => {
          editor.chain().focus().setImage({ src: media.url, alt: media.originalName }).run()
          setPickerOpen(false)
        }}
      />
    </div>
  )
}
