"use client";
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

if (typeof window !== 'undefined') {
  // @ts-expect-error || @ts-ignore
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    // person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
    person_profiles: 'always', // or 'always' to create profiles for anonymous users as well
  })
}
// @ts-expect-error || @ts-ignore
export function CSPostHogProvider({ children }) {
    return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}