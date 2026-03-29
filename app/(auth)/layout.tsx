import { Building2 } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="flex items-center gap-2 mb-8">
        <Building2 className="h-6 w-6" />
        <span className="text-xl font-semibold">Permit Portal</span>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}