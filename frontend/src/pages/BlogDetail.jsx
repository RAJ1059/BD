import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiClock, FiSend } from 'react-icons/fi'
import { api } from '../lib/api'
import { formatDate, mediaUrl } from '../lib/format'

export default function BlogDetail() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ready | not-found | error
  const [error, setError] = useState('')

  const [commentForm, setCommentForm] = useState({ name: '', email: '', message: '' })
  const [commentStatus, setCommentStatus] = useState('idle')
  const [commentError, setCommentError] = useState('')

  useEffect(() => {
    setStatus('loading')
    api
      .get(`/public/blogs/${slug}`)
      .then((res) => {
        setPost(res.data)
        setStatus('ready')
        document.title = res.data.seo?.metaTitle || `${res.data.title} | Business Directions Blog`
      })
      .catch((err) => {
        setStatus(err.status === 404 ? 'not-found' : 'error')
        setError(err.message || 'Unable to load this post right now.')
      })
  }, [slug])

  const handleCommentChange = (e) => setCommentForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    setCommentStatus('submitting')
    setCommentError('')
    try {
      await api.post(`/public/blogs/${slug}/comments`, commentForm)
      setCommentStatus('sent')
      setCommentForm({ name: '', email: '', message: '' })
    } catch (err) {
      setCommentStatus('idle')
      setCommentError(err.message || 'Unable to submit your comment right now.')
    }
  }

  if (status === 'loading') {
    return (
      <div className="bg-[#09090B] px-4 py-24">
        <div className="mx-auto max-w-3xl animate-pulse space-y-4">
          <div className="h-6 w-32 rounded bg-white/10" />
          <div className="h-10 w-full rounded bg-white/10" />
          <div className="h-72 w-full rounded-[28px] bg-white/10" />
        </div>
      </div>
    )
  }

  if (status === 'not-found') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#09090B] px-4 py-20">
        <div className="max-w-xl rounded-[32px] border border-white/10 bg-[#111115] p-10 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#A050F8]">404</p>
          <h1 className="mt-4 text-3xl font-semibold text-white">Post not found</h1>
          <p className="mt-4 text-sm leading-7 text-[#9898A6]">This article may have been unpublished or moved.</p>
          <Link to="/blog" className="mt-8 inline-flex rounded-full bg-[#A050F8] px-6 py-3 font-semibold text-white">Back to blog</Link>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#09090B] px-4 py-20">
        <div className="max-w-xl rounded-[32px] border border-[#FF7439]/30 bg-[#FF7439]/10 p-10 text-center text-[#FF7439]">{error}</div>
      </div>
    )
  }

  return (
    <div className="bg-[#09090B]">
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-[#A050F8]">
          <FiArrowLeft /> Back to blog
        </Link>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.25em] text-[#A050F8]">{post.category?.name || 'General'}</p>
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{post.title}</h1>
        <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-[#6B6B78]">
          <span>{post.author?.name || 'Business Directions'}</span>
          <span>•</span>
          <span>{formatDate(post.publishedAt)}</span>
          <span className="flex items-center gap-1"><FiClock size={12} /> {post.readingTimeMinutes} min read</span>
        </div>

        {post.featuredImage && (
          <div className="mt-8 overflow-hidden rounded-[28px]">
            <img src={mediaUrl(post.featuredImage)} alt={post.title} className="h-auto w-full object-cover" />
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-invert mt-10 max-w-none text-[15px] leading-8 text-[#C4C4CC] [&_a]:text-[#A050F8] [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-white [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-white [&_img]:rounded-2xl [&_p]:mt-4"
          // Content is authored exclusively by admins through our own CMS (src/pages/BlogDetail.jsx consumes /api/public/blogs/:slug) — never raw user input.
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags?.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag._id} className="rounded-full bg-white/5 px-3 py-1 text-xs text-[#9898A6]">#{tag.name}</span>
            ))}
          </div>
        )}

        {post.relatedPosts?.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-semibold text-white">Related posts</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {post.relatedPosts.map((rp) => (
                <Link key={rp._id} to={`/blog/${rp.slug}`} className="rounded-2xl border border-white/10 bg-[#111115] p-4 transition hover:border-[#A050F8]/40">
                  <p className="text-sm font-semibold text-white">{rp.title}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-16 border-t border-white/10 pt-10">
          <h2 className="text-xl font-semibold text-white">Comments {post.comments?.length ? `(${post.comments.length})` : ''}</h2>

          <div className="mt-6 space-y-5">
            {post.comments?.map((comment) => (
              <div key={comment._id} className="rounded-2xl border border-white/10 bg-[#111115] p-5">
                <p className="text-sm font-semibold text-white">{comment.name}</p>
                <p className="mt-1 text-xs text-[#6B6B78]">{formatDate(comment.createdAt)}</p>
                <p className="mt-3 text-sm leading-7 text-[#9898A6]">{comment.message}</p>
              </div>
            ))}
            {!post.comments?.length && <p className="text-sm text-[#6B6B78]">Be the first to comment.</p>}
          </div>

          {commentStatus === 'sent' ? (
            <div className="mt-8 rounded-2xl border border-[#A050F8]/30 bg-[#A050F8]/10 p-5 text-sm text-white">
              Thanks! Your comment has been submitted and is awaiting moderation.
            </div>
          ) : (
            <form onSubmit={handleCommentSubmit} className="mt-8 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  name="name"
                  value={commentForm.name}
                  onChange={handleCommentChange}
                  required
                  placeholder="Your name"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#A050F8]"
                />
                <input
                  type="email"
                  name="email"
                  value={commentForm.email}
                  onChange={handleCommentChange}
                  required
                  placeholder="Email (not published)"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#A050F8]"
                />
              </div>
              <textarea
                name="message"
                value={commentForm.message}
                onChange={handleCommentChange}
                required
                placeholder="Add a comment"
                className="min-h-[100px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#A050F8]"
              />
              {commentError && <p className="text-sm text-[#FF7439]">{commentError}</p>}
              <button
                type="submit"
                disabled={commentStatus === 'submitting'}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#A050F8] to-[#FF7439] px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:opacity-70"
              >
                {commentStatus === 'submitting' ? 'Submitting…' : <>Post comment <FiSend /></>}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
