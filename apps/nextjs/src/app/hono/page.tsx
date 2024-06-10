import { Suspense } from 'react'

import { TRPCReactProvider } from '@a/hono-trpc/react'
import { api } from '@a/hono-trpc/server'

import { Login } from '~/app/login'
import { CreatePostForm, PostCardSkeleton, PostList } from './posts'

export const runtime = 'edge'

export default function HomePage() {
  // You can await this here if you don't want to show Suspense fallback below
  const posts = api.post.all()
  return (
    <TRPCReactProvider>
      <div className='flex flex-col items-end gap-5 p-5'>
        <Login />
        <CreatePostForm />
        <Suspense
          fallback={
            <>
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
            </>
          }>
          <PostList posts={posts} />
        </Suspense>
      </div>
    </TRPCReactProvider>
  )
}
