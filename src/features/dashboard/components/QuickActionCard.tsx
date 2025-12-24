import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'

interface QuickActionCardProps {
  href: string
  label: string
  icon: IconDefinition
  bgColor: string
  textColor: string
  description?: string
}

export default function QuickActionCard({
  href,
  label,
  icon,
  bgColor,
  textColor,
  description,
}: QuickActionCardProps) {
  return (
    <Link href={href}>
      <div
        className={`${bgColor} ${textColor} rounded-lg shadow-md p-8 hover:shadow-lg transition cursor-pointer flex flex-col items-center justify-center min-h-32`}
      >
        <FontAwesomeIcon icon={icon} className="text-5xl mb-4" />
        <h3 className="text-2xl font-bold text-center">{label}</h3>
        {description && (
          <p className="text-sm mt-2 text-center opacity-80">{description}</p>
        )}
      </div>
    </Link>
  )
}
