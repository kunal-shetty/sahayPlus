'use client'

import { useState } from 'react'
import { useSahay } from '@/lib/sahay-context'
import {
  Phone,
  Plus,
  Star,
  Trash2,
  User,
  Building2,
  Stethoscope,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import { CaregiverLayout } from '@/components/caregiver/caregiver-layout'

/**
 * Emergency Contacts Page
 * Rapid access to critical contacts and emergency protocols.
 */
export default function EmergencyPage() {
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
    <CaregiverLayout>
      <main className="min-h-screen bg-background p-6">
        <header className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg shadow-destructive/20">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Emergency Center</h1>
              <p className="text-muted-foreground text-sm">Rapid access to critical contacts and crisis protocols</p>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Contacts */}
          <div className="lg:col-span-2 space-y-8">
            {/* Primary Contact Highlight */}
            {contacts.find((c) => c.isPrimary) && (
              <section className="bg-sahay-sage-light rounded-3xl p-6 border-2 border-sahay-sage/30 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-4 h-4 text-sahay-sage fill-sahay-sage" />
                  <span className="text-sm font-bold text-sahay-sage uppercase tracking-wider">Primary Contact</span>
                </div>
                {contacts
                  .filter((c) => c.isPrimary)
                  .map((contact) => (
                    <div key={contact.id} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-2xl">
                          {getRelationshipIcon(contact.relationship)}
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">{contact.name}</p>
                          <p className="text-muted-foreground">{contact.relationship}</p>
                        </div>
                      </div>
                      <a
                        href={`tel:${contact.phone}`}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-sahay-sage text-primary-foreground font-bold rounded-2xl hover:bg-sahay-sage-dark transition-all shadow-lg shadow-sahay-sage/20"
                      >
                        <Phone className="w-6 h-6" />
                        <span>Call Now: {contact.phone}</span>
                      </a>
                    </div>
                  ))}
              </section>
            )}

            {/* All Contacts Grid */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Emergency Directory</h2>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Contact
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contacts
                  .filter((c) => !c.isPrimary)
                  .map((contact) => (
                    <div key={contact.id} className="bg-card border-2 border-border rounded-2xl p-5 shadow-sm hover:border-primary/30 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                            {getRelationshipIcon(contact.relationship)}
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{contact.name}</p>
                            <p className="text-xs text-muted-foreground">{contact.relationship}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPrimaryContact(contact.id)}
                            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-sahay-sage transition-all"
                            title="Set as primary"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeEmergencyContact(contact.id)}
                            className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-all"
                            title="Remove contact"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <a
                        href={`tel:${contact.phone}`}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-secondary text-foreground font-medium rounded-xl hover:bg-secondary/80 transition-all"
                      >
                        <Phone className="w-4 h-4" />
                        {contact.phone}
                      </a>
                    </div>
                  ))}
                {contacts.length === 0 && !showAddForm && (
                  <div className="col-span-2 py-12 text-center bg-secondary/30 rounded-3xl border-2 border-dashed border-border">
                    <p className="text-muted-foreground italic">No emergency contacts added yet.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Add Contact Form */}
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-3xl border-2 border-primary/30 p-8 shadow-xl"
              >
                <h3 className="text-xl font-bold mb-6">New Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Dr. Smith"
                      className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Phone Number</label>
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+91 00000 00000"
                      className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Relationship</label>
                    <input
                      type="text"
                      value={newRelationship}
                      onChange={(e) => setNewRelationship(e.target.value)}
                      placeholder="e.g. Cardiologist"
                      className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-3 bg-secondary text-foreground font-bold rounded-xl hover:bg-secondary/80 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    disabled={!newName.trim() || !newPhone.trim()}
                    className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    Save Contact
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Crisis Protocol */}
          <div className="lg:col-span-1 space-y-8">
            <section className="bg-destructive-dark text-destructive-foreground rounded-3xl p-8 shadow-xl sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="w-6 h-6 text-white" />
                <h3 className="text-xl font-bold">Crisis Protocol</h3>
              </div>
              <p className="text-sm text-destructive-foreground/80 mb-6 leading-relaxed">
                Follow these steps in order during an emergency. Stay calm and act quickly.
              </p>
              <div className="space-y-4">
                {[
                  { step: 1, action: 'Call Primary Contact', desc: 'Notify the main doctor or family lead.' },
                  { step: 2, action: 'Check Vitals', desc: 'Check breathing, pulse, and consciousness.' },
                  { step: 3, action: 'Emergency Services', desc: 'Call 911/102 if the situation is critical.' },
                  { step: 4, action: 'Prepare Med List', desc: 'Gather current medications and dosage info.' },
                  { step: 5, action: 'Notify Next-of-Kin', desc: 'Alert other emergency contacts in the directory.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 p-3 bg-white/10 rounded-2xl border border-white/10">
                    <div className="w-6 h-6 rounded-full bg-white text-destructive-dark flex items-center justify-center text-xs font-bold shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{item.action}</p>
                      <p className="text-xs text-destructive-foreground/70">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-4 bg-white/10 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Safety Tip</span>
                </div>
                <p className="text-xs text-destructive-foreground/80 italic">
                  Always keep a physical copy of the Medication History report near the bedside.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </CaregiverLayout>
  )
}
