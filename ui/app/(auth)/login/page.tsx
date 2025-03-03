import { Metadata } from 'next'
import LoginForm from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Login - Levir AI',
  description: 'Login to Levir AI',
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6">Welcome to Levir AI</h1>
      <LoginForm />
    </div>
  )
} 