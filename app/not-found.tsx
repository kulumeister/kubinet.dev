import { Metadata } from 'next'
import NotFoundPageContent from './NotFoundPageContent' // Yeni oluşturduğumuz client component

export const metadata: Metadata = {
  title: '404 - kubinet.dev',
}

export default function NotFound() {
  return <NotFoundPageContent />
} 