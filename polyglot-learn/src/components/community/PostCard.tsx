import { Heart, MessageCircle } from 'lucide-react'

import type { CommunityPost } from '@/types/platform'

export function PostCard({ post }: { post: CommunityPost }) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-rose-200 text-sm font-semibold text-slate-950">
              {post.author.slice(0, 1)}
            </div>
            <div>
              <p className="text-base font-medium text-white">{post.author}</p>
              <p className="text-sm text-slate-400">{post.role}</p>
            </div>
          </div>
          {post.badge ? (
            <span className="mt-4 inline-flex rounded-full bg-amber-200/15 px-3 py-1 text-xs text-amber-100">
              {post.badge}
            </span>
          ) : null}
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
          {post.language.toUpperCase()}
        </span>
      </div>
      <p className="mt-5 text-sm leading-7 text-slate-200">{post.content}</p>
      <div className="mt-5 flex items-center gap-4 text-sm text-slate-300">
        <span className="inline-flex items-center gap-2">
          <Heart className="h-4 w-4" />
          {post.likes}
        </span>
        <span className="inline-flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          {post.comments}
        </span>
      </div>
    </article>
  )
}
