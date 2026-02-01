'use client'

import { useSahay } from '@/lib/sahay-context'
import {
  ArrowLeft,
  Phone,
  Star,
  User,
  Building2,
  Stethoscope,
} from 'lucide-react'

interface EmergencyCallProps {
  onClose: () => void
}

export function EmergencyCall({ onClose }: EmergencyCallProps) {
  const { data } = useSahay()

  const contacts = data.emergencyContacts || []
  const primaryContact = contacts.find((c) => c.isPrimary)
  const otherContacts = contacts.filter((c) => !c.isPrimary)

  const getRelationshipIcon = (relationship: string) => {
    const lower = relationship.toLowerCase()
    if (lower.includes('doctor') || lower.includes('dr.')) {
      return <Stethoscope className="w-6 h-6" />
    }
    if (lower.includes('hospital') || lower.includes('clinic')) {
      return <Building2 className="w-6 h-6" />
    }
    return <User className="w-6 h-6" />
  }

  return (
    <main className="min-h-screen flex flex-col bg-background p-6">
      {/* Header */}
      <button
        onClick={onClose}
        className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-6
                 touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Go back"
      >
        <ArrowLeft className="w-6 h-6 text-foreground" />
      </button>

      <h1 className="text-3xl font-semibold text-foreground mb-2 text-center">
        Need Help?
      </h1>
      <p className="text-xl text-muted-foreground text-center mb-8">
        Tap to call
      </p>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        {/* Primary contact - large and prominent */}
        {primaryContact && (
          <a
            href={`tel:${primaryContact.phone}`}
            className="w-full p-6 bg-sahay-sage rounded-2xl mb-6 flex items-center gap-5
                     touch-manipulation active:opacity-80 transition-opacity
                     focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Phone className="w-10 h-10 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-primary-foreground fill-primary-foreground" />
                <span className="text-sm font-medium text-primary-foreground/80">
                  Primary Contact
                </span>
              </div>
              <p className="text-2xl font-semibold text-primary-foreground">
                {primaryContact.name}
              </p>
              <p className="text-primary-foreground/80">
                {primaryContact.relationship}
              </p>
            </div>
          </a>
        )}

        {/* Other contacts */}
        {otherContacts.length > 0 && (
          <div className="space-y-3">
            <p className="text-lg font-medium text-muted-foreground">
              Other contacts
            </p>
            {otherContacts.map((contact) => (
              <a
                key={contact.id}
                href={`tel:${contact.phone}`}
                className="w-full p-5 bg-card border-2 border-border rounded-xl flex items-center gap-4
                         touch-manipulation hover:border-sahay-sage/50 active:bg-sahay-sage-light
                         transition-all focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                  {getRelationshipIcon(contact.relationship)}
                </div>
                <div className="flex-1">
                  <p className="text-xl font-semibold text-foreground">
                    {contact.name}
                  </p>
                  <p className="text-muted-foreground">
                    {contact.relationship}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-sahay-sage/20 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-sahay-sage" />
                </div>
              </a>
            ))}
          </div>
        )}

        {contacts.length === 0 && (
          <div className="text-center py-12">
            <Phone className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">
              No emergency contacts set up yet
            </p>
            <p className="text-muted-foreground mt-2">
              Ask your caregiver to add contacts
            </p>
          </div>
        )}

        {/* Standard emergency number */}
        <div className="mt-auto pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground text-center mb-3">
            For medical emergencies
          </p>
          <a
            href="tel:112"
            className="w-full p-4 bg-destructive/10 border-2 border-destructive/30 rounded-xl 
                     flex items-center justify-center gap-3
                     touch-manipulation active:bg-destructive/20
                     focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <Phone className="w-6 h-6 text-destructive" />
            <span className="text-xl font-semibold text-destructive">
              Call 112
            </span>
          </a>
        </div>
      </div>
    </main>
  )
}
