import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/permits/status-badge'
import type { Permit } from '@/db/schema/permits'

interface PermitDetailHeaderProps {
  permit: Permit
  isOwner: boolean
  canEdit: boolean
}

export default function PermitDetailHeader({
  permit,
  isOwner: _isOwner,
  canEdit,
}: PermitDetailHeaderProps) {
  const ref = permit.id.slice(0, 8).toUpperCase()
  const formData = (permit.formData ?? {}) as Record<string, unknown>
  const companyName =
    typeof formData.companyName === 'string' ? formData.companyName : null

  return (
    <div className="flex items-start justify-between gap-4">
      {/* Left */}
      <div>
        <p className="text-sm text-muted-foreground font-mono">
          Ref # {ref}
        </p>
        <h1 className="text-2xl font-semibold mt-1">{permit.projectName}</h1>
        {companyName && (
          <p className="text-base text-muted-foreground">{companyName}</p>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 shrink-0">
        <StatusBadge status={permit.status} />
        {canEdit && (
          <Button variant="outline" asChild>
            <Link href={`/applications/${permit.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit application
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}