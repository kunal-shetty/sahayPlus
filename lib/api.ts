// Sahay+ API Helper
// Centralized fetch wrappers for all API endpoints

const BASE = "/api";

async function request<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const res = await fetch(`${BASE}${endpoint}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "API request failed");
    return json;
}

// ─── Auth ────────────────────────────────────────────────────────────────

export const api = {
    auth: {
        register: (data: { email: string; password: string; name: string; role: string; phone?: string; nickname?: string }) =>
            request<{ user: any }>("/auth/register", { method: "POST", body: JSON.stringify(data) }),

        login: (data: { email: string; password: string }) =>
            request<{ session: any; user: any }>("/auth/login", { method: "POST", body: JSON.stringify(data) }),

        logout: () =>
            request<{ message: string }>("/auth/logout", { method: "POST" }),

        me: (token?: string) =>
            request<{ user: any }>("/auth/me", {
                headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            }),
    },

    // ─── Care Relationships ──────────────────────────────────────────────

    careRelationships: {
        list: (userId?: string) =>
            request<{ relationships: any[] }>(`/care-relationships${userId ? `?user_id=${userId}` : ""}`),

        get: (id: string) =>
            request<{ relationship: any }>(`/care-relationships/${id}`),

        create: (data: { caregiver_id: string; care_receiver_id: string; alt_caregiver_id?: string }) =>
            request<{ relationship: any }>("/care-relationships", { method: "POST", body: JSON.stringify(data) }),

        update: (id: string, data: Record<string, any>) =>
            request<{ relationship: any }>(`/care-relationships/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    },

    // ─── Medications ─────────────────────────────────────────────────────

    medications: {
        list: (careRelationshipId?: string) =>
            request<{ medications: any[] }>(`/medications${careRelationshipId ? `?care_relationship_id=${careRelationshipId}` : ""}`),

        get: (id: string) =>
            request<{ medication: any }>(`/medications/${id}`),

        create: (data: {
            care_relationship_id: string; name: string; dosage: string; time_of_day: string;
            time?: string; notes?: string; simple_explanation?: string; refill_days_left?: number; pharmacist_note?: string;
        }) =>
            request<{ medication: any }>("/medications", { method: "POST", body: JSON.stringify(data) }),

        update: (id: string, data: Record<string, any>) =>
            request<{ medication: any }>(`/medications/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

        remove: (id: string) =>
            request<{ message: string }>(`/medications/${id}`, { method: "DELETE" }),

        take: (id: string, markedBy?: string) =>
            request<{ log: any }>(`/medications/${id}/take`, { method: "POST", body: JSON.stringify({ marked_by: markedBy }) }),

        skip: (id: string, markedBy?: string, note?: string) =>
            request<{ log: any }>(`/medications/${id}/skip`, { method: "POST", body: JSON.stringify({ marked_by: markedBy, note }) }),
    },

    // ─── Timeline ────────────────────────────────────────────────────────

    timeline: {
        list: (careRelationshipId: string, limit = 50, offset = 0) =>
            request<{ events: any[]; total: number }>(`/timeline?care_relationship_id=${careRelationshipId}&limit=${limit}&offset=${offset}`),
    },

    // ─── Notes ───────────────────────────────────────────────────────────

    notes: {
        list: (careRelationshipId?: string) =>
            request<{ notes: any[] }>(`/notes${careRelationshipId ? `?care_relationship_id=${careRelationshipId}` : ""}`),

        create: (data: {
            care_relationship_id: string; text: string; linked_type: string;
            created_by: string; linked_medication_id?: string; linked_date?: string;
        }) =>
            request<{ note: any }>("/notes", { method: "POST", body: JSON.stringify(data) }),

        remove: (id: string) =>
            request<{ message: string }>(`/notes/${id}`, { method: "DELETE" }),
    },

    // ─── Wellness ────────────────────────────────────────────────────────

    wellness: {
        list: (careRelationshipId?: string) =>
            request<{ entries: any[] }>(`/wellness${careRelationshipId ? `?care_relationship_id=${careRelationshipId}` : ""}`),

        log: (data: { care_relationship_id: string; user_id: string; level: string; note?: string }) =>
            request<{ entry: any }>("/wellness", { method: "POST", body: JSON.stringify(data) }),
    },

    // ─── Day Closure ─────────────────────────────────────────────────────

    day: {
        close: (data: {
            care_relationship_id: string; closed_by: string;
            all_taken?: boolean; total_meds?: number; taken_count?: number;
        }) =>
            request<{ closure: any }>("/day/close", { method: "POST", body: JSON.stringify(data) }),

        history: (careRelationshipId: string) =>
            request<{ closures: any[] }>(`/day/history?care_relationship_id=${careRelationshipId}`),
    },

    // ─── Messages ────────────────────────────────────────────────────────

    messages: {
        list: (careRelationshipId: string, limit = 50, offset = 0) =>
            request<{ messages: any[]; total: number }>(`/messages?care_relationship_id=${careRelationshipId}&limit=${limit}&offset=${offset}`),

        send: (data: { care_relationship_id: string; from_user_id: string; text: string }) =>
            request<{ data: any }>("/messages", { method: "POST", body: JSON.stringify(data) }),

        markRead: (id: string) =>
            request<{ data: any }>(`/messages/${id}/read`, { method: "PATCH" }),
    },

    // ─── Safety Check ────────────────────────────────────────────────────

    safetyCheck: {
        trigger: (careRelationshipId: string) =>
            request<{ safetyCheck: any }>("/safety-check/trigger", { method: "POST", body: JSON.stringify({ care_relationship_id: careRelationshipId }) }),

        dismiss: (safetyCheckId: string) =>
            request<{ safetyCheck: any }>("/safety-check/dismiss", { method: "POST", body: JSON.stringify({ safety_check_id: safetyCheckId }) }),
    },

    // ─── Emergency Contacts ──────────────────────────────────────────────

    emergencyContacts: {
        list: (careRelationshipId: string) =>
            request<{ contacts: any[] }>(`/emergency-contacts?care_relationship_id=${careRelationshipId}`),

        create: (data: { care_relationship_id: string; name: string; phone: string; relationship?: string; is_primary?: boolean }) =>
            request<{ contact: any }>("/emergency-contacts", { method: "POST", body: JSON.stringify(data) }),

        remove: (id: string) =>
            request<{ message: string }>(`/emergency-contacts/${id}`, { method: "DELETE" }),
    },

    // ─── Handover ────────────────────────────────────────────────────────

    handover: {
        start: (data: {
            care_relationship_id: string; from_caregiver_id: string; to_person_name: string;
            start_date?: string; end_date?: string;
        }) =>
            request<{ handover: any }>("/handover/start", { method: "POST", body: JSON.stringify(data) }),

        end: (handoverId: string) =>
            request<{ handover: any }>("/handover/end", { method: "POST", body: JSON.stringify({ handover_id: handoverId }) }),

        current: (careRelationshipId: string) =>
            request<{ handover: any | null }>(`/handover/current?care_relationship_id=${careRelationshipId}`),
    },

    // ─── Notifications ──────────────────────────────────────────────────

    notifications: {
        list: (userId: string, limit = 50, offset = 0) =>
            request<{ notifications: any[]; total: number }>(`/notifications?user_id=${userId}&limit=${limit}&offset=${offset}`),

        create: (data: { user_id: string; type: string; title: string; body: string }) =>
            request<{ notification: any }>("/notifications", { method: "POST", body: JSON.stringify(data) }),
    },
};
