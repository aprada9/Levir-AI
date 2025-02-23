import { Metadata } from 'next'
import RegisterForm from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Register - Perplexica',
  description: 'Create a new account on Perplexica',
}

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6">Create an Account</h1>
      <RegisterForm />
    </div>
  )
} 