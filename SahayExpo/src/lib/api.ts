// Sahay+ API Helper — Direct Supabase queries (replaces Next.js API routes)
import { supabase } from './supabase';

export const api = {
  // ─── Auth ──────────────────────────────────────────────────────────
  auth: {
    login: async (data: { email: string; name?: string; role?: string }) => {
      const email = data.email.toLowerCase().trim();

      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (existingUser) {
        const { data: relationships } = await supabase
          .from('care_relationships')
          .select('*')
          .or(`caregiver_id.eq.${existingUser.id},care_receiver_id.eq.${existingUser.id}`)
          .limit(1);

        return {
          message: 'Login successful',
          user: existingUser,
          care_relationship: relationships && relationships.length > 0 ? relationships[0] : null,
          is_new: false,
        };
      }

      // New user
      if (!data.name || !data.role) {
        throw new Error('Name and role are required for new users');
      }

      let care_code: string | null = null;
      if (data.role === 'care_receiver') {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let isUnique = false;
        while (!isUnique) {
          care_code = '';
          for (let i = 0; i < 6; i++) {
            care_code += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('care_code', care_code)
            .single();
          if (!existing) isUnique = true;
        }
      }

      const { data: newUser, error } = await supabase
        .from('users')
        .insert({ email, name: data.name, role: data.role, care_code })
        .select()
        .single();

      if (error) throw new Error(error.message);

      return { message: 'Account created', user: newUser, care_relationship: null, is_new: true };
    },
  },

  // ─── Care Relationships ────────────────────────────────────────────
  careRelationships: {
    get: async (id: string) => {
      const { data, error } = await supabase
        .from('care_relationships')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw new Error(error.message);
      return { relationship: data };
    },

    link: async (caregiverId: string, careCode: string) => {
      // Find care receiver by code
      const { data: careReceiver, error: findErr } = await supabase
        .from('users')
        .select('*')
        .eq('care_code', careCode.toUpperCase().trim())
        .single();

      if (findErr || !careReceiver) throw new Error('Invalid care code');

      // Check for existing
      const { data: existing } = await supabase
        .from('care_relationships')
        .select('*')
        .eq('caregiver_id', caregiverId)
        .eq('care_receiver_id', careReceiver.id)
        .single();

      if (existing) {
        return { relationship: existing, care_receiver: careReceiver };
      }

      const { data: rel, error: insertErr } = await supabase
        .from('care_relationships')
        .insert({ caregiver_id: caregiverId, care_receiver_id: careReceiver.id })
        .select()
        .single();

      if (insertErr) throw new Error(insertErr.message);
      return { relationship: rel, care_receiver: careReceiver };
    },

    update: async (id: string, updates: Record<string, any>) => {
      const { data, error } = await supabase
        .from('care_relationships')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { relationship: data };
    },
  },

  // ─── Medications ───────────────────────────────────────────────────
  medications: {
    list: async (careRelationshipId?: string) => {
      let query = supabase.from('medications').select('*');
      if (careRelationshipId) query = query.eq('care_relationship_id', careRelationshipId);
      const { data, error } = await query.order('time_of_day').order('created_at');
      if (error) throw new Error(error.message);
      return { medications: data || [] };
    },

    create: async (med: {
      care_relationship_id: string; name: string; dosage: string; time_of_day: string;
      time?: string; notes?: string; simple_explanation?: string; refill_days_left?: number; pharmacist_note?: string;
    }) => {
      const { data, error } = await supabase
        .from('medications')
        .insert({ ...med, is_active: true })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { medication: data };
    },

    update: async (id: string, updates: Record<string, any>) => {
      const { data, error } = await supabase
        .from('medications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { medication: data };
    },

    remove: async (id: string) => {
      const { error } = await supabase.from('medications').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { message: 'Deleted' };
    },

    take: async (id: string, markedBy?: string) => {
      const { data, error } = await supabase
        .from('medication_logs')
        .insert({
          medication_id: id,
          action: 'taken',
          marked_by: markedBy || null,
          taken_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { log: data };
    },

    skip: async (id: string, markedBy?: string, note?: string) => {
      const { data, error } = await supabase
        .from('medication_logs')
        .insert({
          medication_id: id,
          action: 'skipped',
          marked_by: markedBy || null,
          note: note || null,
          taken_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { log: data };
    },
  },

  // ─── Timeline ──────────────────────────────────────────────────────
  timeline: {
    list: async (careRelationshipId: string, limit = 50, offset = 0) => {
      const { data, error, count } = await supabase
        .from('timeline_events')
        .select('*', { count: 'exact' })
        .eq('care_relationship_id', careRelationshipId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw new Error(error.message);
      return { events: data || [], total: count || 0 };
    },
  },

  // ─── Notes ─────────────────────────────────────────────────────────
  notes: {
    list: async (careRelationshipId?: string) => {
      let query = supabase.from('contextual_notes').select('*');
      if (careRelationshipId) query = query.eq('care_relationship_id', careRelationshipId);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return { notes: data || [] };
    },

    create: async (note: {
      care_relationship_id: string; text: string; linked_type: string;
      created_by: string; linked_medication_id?: string; linked_date?: string;
    }) => {
      const { data, error } = await supabase
        .from('contextual_notes')
        .insert(note)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { note: data };
    },

    remove: async (id: string) => {
      const { error } = await supabase.from('contextual_notes').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { message: 'Deleted' };
    },
  },

  // ─── Wellness ──────────────────────────────────────────────────────
  wellness: {
    list: async (careRelationshipId?: string) => {
      let query = supabase.from('wellness_entries').select('*');
      if (careRelationshipId) query = query.eq('care_relationship_id', careRelationshipId);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return { entries: data || [] };
    },

    log: async (entry: { care_relationship_id: string; user_id: string; level: string; note?: string }) => {
      const { data, error } = await supabase
        .from('wellness_entries')
        .insert({ ...entry, date: new Date().toISOString().split('T')[0] })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { entry: data };
    },
  },

  // ─── Day Closure ───────────────────────────────────────────────────
  day: {
    close: async (closure: {
      care_relationship_id: string; closed_by: string;
      all_taken?: boolean; total_meds?: number; taken_count?: number;
    }) => {
      const { data, error } = await supabase
        .from('day_closures')
        .insert({
          ...closure,
          date: new Date().toISOString().split('T')[0],
          closed_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { closure: data };
    },

    history: async (careRelationshipId: string) => {
      const { data, error } = await supabase
        .from('day_closures')
        .select('*')
        .eq('care_relationship_id', careRelationshipId)
        .order('date', { ascending: false });
      if (error) throw new Error(error.message);
      return { closures: data || [] };
    },
  },

  // ─── Messages ──────────────────────────────────────────────────────
  messages: {
    list: async (careRelationshipId: string, limit = 50, offset = 0) => {
      const { data, error, count } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('care_relationship_id', careRelationshipId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw new Error(error.message);
      return { messages: data || [], total: count || 0 };
    },

    send: async (msg: { care_relationship_id: string; from_user_id: string; text: string }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert(msg)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { data };
    },

    markRead: async (id: string) => {
      const { data, error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { data };
    },
  },

  // ─── Emergency Contacts ────────────────────────────────────────────
  emergencyContacts: {
    list: async (careRelationshipId: string) => {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('care_relationship_id', careRelationshipId);
      if (error) throw new Error(error.message);
      return { contacts: data || [] };
    },

    create: async (contact: {
      care_relationship_id: string; name: string; phone: string;
      relationship?: string; is_primary?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .insert(contact)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { contact: data };
    },

    remove: async (id: string) => {
      const { error } = await supabase.from('emergency_contacts').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { message: 'Deleted' };
    },
  },

  // ─── Handover ──────────────────────────────────────────────────────
  handover: {
    start: async (data: {
      care_relationship_id: string; from_caregiver_id: string; to_person_name: string;
      start_date?: string; end_date?: string;
    }) => {
      const { data: handover, error } = await supabase
        .from('handovers')
        .insert(data)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { handover };
    },

    end: async (handoverId: string) => {
      const { data, error } = await supabase
        .from('handovers')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', handoverId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { handover: data };
    },

    current: async (careRelationshipId: string) => {
      const { data, error } = await supabase
        .from('handovers')
        .select('*')
        .eq('care_relationship_id', careRelationshipId)
        .is('ended_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      return { handover: data || null };
    },
  },

  // ─── Notifications ─────────────────────────────────────────────────
  notifications: {
    list: async (userId: string, limit = 50, offset = 0) => {
      const { data, error, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw new Error(error.message);
      return { notifications: data || [], total: count || 0 };
    },

    create: async (notif: { user_id: string; type: string; title: string; body: string }) => {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notif)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { notification: data };
    },
  },

  // ─── Safety Check ──────────────────────────────────────────────────
  safetyCheck: {
    trigger: async (careRelationshipId: string) => {
      const { data, error } = await supabase
        .from('safety_checks')
        .insert({ care_relationship_id: careRelationshipId, status: 'pending' })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { safetyCheck: data };
    },

    dismiss: async (safetyCheckId: string) => {
      const { data, error } = await supabase
        .from('safety_checks')
        .update({ status: 'dismissed', dismissed_at: new Date().toISOString() })
        .eq('id', safetyCheckId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { safetyCheck: data };
    },
  },
};
