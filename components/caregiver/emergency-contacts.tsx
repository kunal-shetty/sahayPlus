'use client'

import { useState } from 'react'
import { useSahay } from '@/lib/sahay-context'
import {
  ArrowLeft,
  Phone,
  Plus,
  Star,
  Trash2,
  User,
  Building2,
  Stethoscope,
} from 'lucide-react'

interface EmergencyContactsProps {
  onClose: () => void
}

export function EmergencyContacts({ onClose }: EmergencyContactsProps) {
  const { data, addEmergencyContact, removeEmergencyContact, setPrimaryContact } =
    useSahay()

  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newRelationship, setNewRelationship] = useState('')

  const handleAdd = () => {
    if (newName.trim() && newPhone.trim()) {
      addEmergencyContact({
        name: newName.trim(),
        phone: newPhone.trim(),
        relationship: newRelationship.trim() || 'Contact',
        isPrimary: (data.emergencyContacts || []).length === 0,
      })
      setNewName('')
      setNewPhone('')
      setNewRelationship('')
      setShowAddForm(false)
    }
  }

  const getRelationshipIcon = (relationship: string) => {
    const lower = relationship.toLowerCase()
    if (lower.includes('doctor') || lower.includes('dr.')) {
      return <Stethoscope className="w-5 h-5" />
    }
    if (lower.includes('hospital') || lower.includes('clinic')) {
      return <Building2 className="w-5 h-5" />
    }
    return <User className="w-5 h-5" />
  }

  const contacts = data.emergencyContacts || []

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center
                     touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Emergency Contacts
            </h1>
            <p className="text-muted-foreground">
              Quick access when needed
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-8">
        {/* Primary contact highlight */}
        {contacts.find((c) => c.isPrimary) && (
          <div className="mb-6">
            {contacts
              .filter((c) => c.isPrimary)
              .map((contact) => (
                <div
                  key={contact.id}
                  className="bg-sahay-sage-light rounded-2xl p-5 border-2 border-sahay-sage/30"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-sahay-sage fill-sahay-sage" />
                    <span className="text-sm font-medium text-sahay-sage">
                      Primary Contact
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-sahay-sage/20 flex items-center justify-center">
                        {getRelationshipIcon(contact.relationship)}
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-foreground">
                          {contact.name}
                        </p>
                        <p className="text-muted-foreground">
                          {contact.relationship}
                        </p>
                      </div>
                    </div>
                    <a
                      href={`tel:${contact.phone}`}
                      className="w-14 h-14 rounded-full bg-sahay-sage flex items-center justify-center
                               touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring"
                      aria-label={`Call ${contact.name}`}
                    >
                      <Phone className="w-6 h-6 text-primary-foreground" />
                    </a>
                  </div>
                  <p className="mt-3 text-lg font-medium text-foreground">
                    {contact.phone}
                  </p>
                </div>
              ))}
          </div>
        )}

        {/* Other contacts */}
        <section className="mb-6">
          <h2 className="text-lg font-medium text-foreground mb-4">
            All Contacts
          </h2>
          <div className="space-y-3">
            {contacts
              .filter((c) => !c.isPrimary)
              .map((contact) => (
                <div
                  key={contact.id}
                  className="bg-card rounded-xl border-2 border-border p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                        {getRelationshipIcon(contact.relationship)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {contact.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {contact.relationship}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {contact.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPrimaryContact(contact.id)}
                        className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center
                                 touch-manipulation hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring"
                        aria-label="Set as primary"
                      >
                        <Star className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <a
                        href={`tel:${contact.phone}`}
                        className="w-10 h-10 rounded-lg bg-sahay-sage/20 flex items-center justify-center
                                 touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring"
                        aria-label={`Call ${contact.name}`}
                      >
                        <Phone className="w-4 h-4 text-sahay-sage" />
                      </a>
                      <button
                        onClick={() => removeEmergencyContact(contact.id)}
                        className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center
                                 touch-manipulation hover:bg-destructive/20 focus:outline-none focus:ring-2 focus:ring-ring"
                        aria-label="Remove contact"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

            {contacts.length === 0 && !showAddForm && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No emergency contacts added yet
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Add form */}
        {showAddForm ? (
          <div className="bg-card rounded-2xl border-2 border-border p-5 space-y-4">
            <h3 className="font-semibold text-foreground">Add Contact</h3>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Dr. Sharma"
                className="w-full px-4 py-3 bg-input border-2 border-border rounded-xl
                         focus:outline-none focus:border-sahay-sage focus:ring-2 focus:ring-sahay-sage/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 bg-input border-2 border-border rounded-xl
                         focus:outline-none focus:border-sahay-sage focus:ring-2 focus:ring-sahay-sage/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Relationship
              </label>
              <input
                type="text"
                value={newRelationship}
                onChange={(e) => setNewRelationship(e.target.value)}
                placeholder="Family Doctor"
                className="w-full px-4 py-3 bg-input border-2 border-border rounded-xl
                         focus:outline-none focus:border-sahay-sage focus:ring-2 focus:ring-sahay-sage/20"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-3 bg-secondary text-foreground font-medium rounded-xl
                         touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newName.trim() || !newPhone.trim()}
                className="flex-1 py-3 bg-primary text-primary-foreground font-medium rounded-xl
                         touch-manipulation disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                Add
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-4 bg-secondary text-foreground font-medium rounded-xl
                     flex items-center justify-center gap-2 touch-manipulation
                     hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <Plus className="w-5 h-5" />
            Add emergency contact
          </button>
        )}
      </div>
    </main>
  )
}
