import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiClock, FiMail } from 'react-icons/fi'
import PageHero from '../components/PageHero'
import BlogBrowserGraphic from '../components/graphics/BlogBrowserGraphic'
import { api } from '../lib/api'
import { formatDate, mediaUrl } from '../lib/format'

export default function Blog() {
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/public/categories')
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    setLoading(true)
    setError('')
    const params = activeCategory === 'All' ? {} : { category: activeCategory }
    api
      .get('/public/blogs', { ...params, limit: 12 })
      .then((res) => setPosts(res.data))
      .catch((err) => setError(err.message || 'Unable to load blog posts right now.'))
      .finally(() => setLoading(false))
  }, [activeCategory])

  const featured = posts.find((p) => p.isFeatured) || posts[0]
  const rest = posts.filter((p) => p._id !== featured?._id)

  return (
    <div className="bg-[#09090B]">
      <PageHero
        eyebrow="Blog"
        title="Insights and strategies for modern growth leaders."
        description="Practical, no-fluff perspectives on SEO, paid media, design, and automation from our team."
        graphic={<BlogBrowserGraphic />}
      />

      {error && (
        <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
          <p className="rounded-2xl border border-[#FF7439]/30 bg-[#FF7439]/10 px-5 py-4 text-sm text-[#FF7439]">{error}</p>
        </section>
      )}

      {!error && !loading && posts.length === 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-white/10 bg-[#111115] p-10 text-center text-[#9898A6]">
            No posts published yet — check back soon.
          </div>
        </section>
      )}

      {featured && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <motion.article
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group grid overflow-hidden rounded-[32px] border border-white/10 bg-[#111115] shadow-sm transition hover:shadow-xl lg:grid-cols-2"
          >
            <div className="relative h-64 overflow-hidden lg:h-full">
              <img
                src={mediaUrl(featured.featuredImage, `https://picsum.photos/seed/${featured.slug}/1200/700`)}
                alt={featured.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute left-5 top-5 rounded-full bg-[#FF7439] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">Featured</span>
            </div>
            <div className="flex flex-col justify-center p-8 lg:p-12">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#A050F8]">{featured.category?.name || 'General'}</p>
              <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">{featured.title}</h2>
              <p className="mt-4 text-sm leading-7 text-[#9898A6]">{featured.excerpt}</p>
              <div className="mt-6 flex items-center gap-4 text-xs text-[#6B6B78]">
                <span>{featured.author?.name || 'Business Directions'}</span>
                <span>•</span>
                <span>{formatDate(featured.publishedAt)}</span>
                <span className="flex items-center gap-1"><FiClock size={12} /> {featured.readingTimeMinutes} min read</span>
              </div>
              <Link to={`/blog/${featured.slug}`} className="mt-8 inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#A050F8]">
                Read article <FiArrowRight />
              </Link>
            </div>
          </motion.article>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-3">
          {['All', ...categories.map((c) => c.slug)].map((slug) => {
            const label = slug === 'All' ? 'All' : categories.find((c) => c.slug === slug)?.name || slug
            return (
              <button
                key={slug}
                onClick={() => setActiveCategory(slug)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeCategory === slug ? 'bg-[#A050F8] text-white' : 'bg-white/5 text-[#9898A6] hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {loading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[340px] animate-pulse rounded-[28px] border border-white/10 bg-[#111115]" />
            ))}

          {!loading &&
            rest.map((post, index) => (
              <motion.article
                key={post._id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group overflow-hidden rounded-[28px] border border-white/10 bg-[#111115] shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={mediaUrl(post.featuredImage, `https://picsum.photos/seed/${post.slug}/700/500`)}
                    alt={post.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A050F8]">{post.category?.name || 'General'}</p>
                  <h3 className="mt-3 text-lg font-semibold text-white">{post.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#9898A6]">{post.excerpt}</p>
                  <div className="mt-5 flex items-center gap-3 text-xs text-[#6B6B78]">
                    <span>{post.author?.name || 'Business Directions'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><FiClock size={12} /> {post.readingTimeMinutes} min read</span>
                  </div>
                  <Link to={`/blog/${post.slug}`} className="mt-5 inline-flex text-sm font-semibold text-[#A050F8]">Read more →</Link>
                </div>
              </motion.article>
            ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 rounded-[36px] border border-white/10 bg-[#111115] p-10 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#A050F8] to-[#FF7439] text-white">
            <FiMail size={22} />
          </div>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Never miss an insight.</h2>
          <p className="max-w-xl text-sm leading-7 text-[#9898A6]">Get our best growth thinking delivered straight to your inbox, once a month.</p>
          <form className="flex w-full max-w-md flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
            <input type="email" required placeholder="Your work email" className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white outline-none placeholder:text-[#6B6B78] focus:border-[#A050F8]" />
            <button className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#A050F8] to-[#FF7439] px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.02]">
              Subscribe <FiArrowRight />
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
