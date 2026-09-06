/**
 * @file api.ts
 * @description Centralized API helper and service definitions for Sahay+.
 * Provides a set of typed fetch wrappers for all application endpoints,
 * organizing requests by feature area (Auth, Medications, Timeline, etc.).
 */

const BASE = "/api";

/**
 * Generic internal helper to handle API requests.
 * Handles base URL concatenation, default headers, and basic error handling.
 *
 * @template T The expected return type of the API response.
 * @param {string} endpoint - The API endpoint path (relative to BASE).
 * @param {RequestInit} [options] - Optional fetch configuration (method, body, headers, etc.).
 * @returns {Promise<T>} A promise that resolves to the parsed JSON response.
 * @throws {Error} Throws an error if the response is not 'ok', including the API error message if available.
 */
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

/**
 * The main API service object containing all endpoints used by the application.
 * Organized into logical modules for easier discovery and maintenance.
 */
export const api = {
    /**
     * Authentication services for user account management.
     */
    auth: {
        /**
         * Registers a new user account.
         * @param {Object} data - Registration details.
         * @param {string} data.email - User email address.
         * @param {string} data.password - User password.
         * @param {string} data.name - Full name.
         * @param {string} data.role - User role ('caregiver' or 'receiver').
         * @param {string} [data.phone] - Optional phone number.
         * @param {string} [data.nickname] - Optional nickname.
         * @returns {Promise<{ user: any }>} The created user object.
         */
        register: (data: { email: string; password: string; name: string; role: string; phone?: string; nickname?: string }) =>
            request<{ user: any }>("/auth/register", { method: "POST", body: JSON.stringify(data) }),

        /**
         * Authenticates a user and establishes a session.
         * @param {Object} data - Login credentials.
         * @param {string} data.email - User email address.
         * @param {string} data.password - User password.
         * @returns {Promise<{ session: any; user: any }>} The session and user object.
         */
        login: (data: { email: string; password: string }) =>
            request<{ session: any; user: any }>("/auth/login", { method: "POST", body: JSON.stringify(data) }),

        /**
         * Terminates the current user session.
         * @returns {Promise<{ message: string }>} Confirmation message.
         */
        logout: () =>
            request<{ message: string }>("/auth/logout", { method: "POST" }),

        /**
         * Retrieves the profile of the currently authenticated user.
         * @param {string} [token] - Optional bearer token for authentication.
         * @returns {Promise<{ user: any }>} The user profile object.
         */
        me: (token?: string) =>
            request<{ user: any }>("/auth/me", {
                headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            }),
    },

    /**
     * Care Relationship services for managing links between caregivers and receivers.
     */
    careRelationships: {
        /**
         * Lists all care relationships, optionally filtered by user ID.
         * @param {string} [userId] - The ID of the user whose relationships to list.
         * @returns {Promise<{ relationships: any[] }>} List of relationships.
         */
        list: (userId?: string) =>
            request<{ relationships: any[] }>(`/care-relationships${userId ? `?user_id=${userId}` : ""}`),

        /**
         * Retrieves a specific care relationship by its ID.
         * @param {string} id - The unique ID of the relationship.
         * @returns {Promise<{ relationship: any }>} The relationship details.
         */
        get: (id: string) =>
            request<{ relationship: any }>(`/care-relationships/${id}`),

        /**
         * Creates a new care relationship link.
         * @param {Object} data - Relationship data.
         * @param {string} data.caregiver_id - ID of the caregiver.
         * @param {string} data.care_receiver_id - ID of the care receiver.
         * @param {string} [data.alt_caregiver_id] - Optional alternative caregiver ID.
         * @returns {Promise<{ relationship: any }>} The created relationship.
         */
        create: (data: { caregiver_id: string; care_receiver_id: string; alt_caregiver_id?: string }) =>
            request<{ relationship: any }>("/care-relationships", { method: "POST", body: JSON.stringify(data) }),

        /**
         * Updates an existing care relationship.
         * @param {string} id - The ID of the relationship to update.
         * @param {Record<string, any>} data - The fields to update.
         * @returns {Promise<{ relationship: any }>} The updated relationship.
         */
        update: (id: string, data: Record<string, any>) =>
            request<{ relationship: any }>(`/care-relationships/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    },

    /**
     * Medication management services.
     */
    medications: {
        /**
         * Lists medications, optionally filtered by care relationship.
         * @param {string} [careRelationshipId] - Filter by relationship ID.
         * @returns {Promise<{ medications: any[] }>} List of medications.
         */
        list: (careRelationshipId?: string) =>
            request<{ medications: any[] }>(`/medications${careRelationshipId ? `?care_relationship_id=${careRelationshipId}` : ""}`),

        /**
         * Retrieves a specific medication's details.
         * @param {string} id - The medication ID.
         * @returns {Promise<{ medication: any }>} Medication details.
         */
        get: (id: string) =>
            request<{ medication: any }>(`/medications/${id}`),

        /**
         * Adds a new medication to the tracking list.
         * @param {Object} data - Medication details.
         * @param {string} data.care_relationship_id - Associated relationship ID.
         * @param {string} data.name - Medication name.
         * @param {string} data.dosage - Dosage information.
         * @param {string} data.time_of_day - Time of day for administration.
         * @param {string} [data.time] - Specific clock time.
         * @param {string} [data.notes] - Additional notes.
         * @param {string} [data.simple_explanation] - Simplified version for the receiver.
         * @param {number} [data.refill_days_left] - Days until refill needed.
         * @param {string} [data.pharmacist_note] - Notes from the pharmacist.
         * @returns {Promise<{ medication: any }>} The created medication.
         */
        create: (data: {
            care_relationship_id: string; name: string; dosage: string; time_of_day: string;
            time?: string; notes?: string; simple_explanation?: string; refill_days_left?: number; pharmacist_note?: string;
        }) =>
            request<{ medication: any }>("/medications", { method: "POST", body: JSON.stringify(data) }),

        /**
         * Updates medication details.
         * @param {string} id - The medication ID.
         * @param {Record<string, any>} data - Fields to update.
         * @returns {Promise<{ medication: any }>} The updated medication.
         */
        update: (id: string, data: Record<string, any>) =>
            request<{ medication: any }>(`/medications/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

        /**
         * Deletes a medication from the system.
         * @param {string} id - The medication ID.
         * @returns {Promise<{ message: string }>} Success message.
         */
        remove: (id: string) =>
            request<{ message: string }>(`/medications/${id}`, { method: "DELETE" }),

        /**
         * Marks a medication as taken.
         * @param {string} id - The medication ID.
         * @param {string} [markedBy] - User ID of the person marking it as taken.
         * @returns {Promise<{ log: any }>} The medication log entry.
         */
        take: (id: string, markedBy?: string) =>
            request<{ log: any }>(`/medications/${id}/take`, { method: "POST", body: JSON.stringify({ marked_by: markedBy }) }),

        /**
         * Marks a medication as skipped.
         * @param {string} id - The medication ID.
         * @param {string} [markedBy] - User ID of the person marking it as skipped.
         * @param {string} [note] - Reason for skipping.
         * @returns {Promise<{ log: any }>} The medication log entry.
         */
        skip: (id: string, markedBy?: string, note?: string) =>
            request<{ log: any }>(`/medications/${id}/skip`, { method: "POST", body: JSON.stringify({ marked_by: markedBy, note }) }),
    },

    /**
     * Timeline services for tracking events over time.
     */
    timeline: {
        /**
         * Lists timeline events for a care relationship.
         * @param {string} careRelationshipId - The relationship ID.
         * @param {number} [limit=50] - Maximum number of events to return.
         * @param {number} [offset=0] - Pagination offset.
         * @returns {Promise<{ events: any[]; total: number }>} Paginated list of events.
         */
        list: (careRelationshipId: string, limit = 50, offset = 0) =>
            request<{ events: any[]; total: number }>(`/timeline?care_relationship_id=${careRelationshipId}&limit=${limit}&offset=${offset}`),
    },

    /**
     * Note services for care-related documentation.
     */
    notes: {
        /**
         * Lists all notes, optionally filtered by care relationship.
         * @param {string} [careRelationshipId] - Filter by relationship ID.
         * @returns {Promise<{ notes: any[] }>} List of notes.
         */
        list: (careRelationshipId?: string) =>
            request<{ notes: any[] }>(`/notes${careRelationshipId ? `?care_relationship_id=${careRelationshipId}` : ""}`),

        /**
         * Creates a new note linked to a specific entity.
         * @param {Object} data - Note details.
         * @param {string} data.care_relationship_id - Associated relationship ID.
         * @param {string} data.text - Note content.
         * @param {string} data.linked_type - Type of linked entity (e.g., 'medication').
         * @param {string} data.created_by - User ID of the author.
         * @param {string} [data.linked_medication_id] - ID of linked medication.
         * @param {string} [data.linked_date] - ID of linked date.
         * @returns {Promise<{ note: any }>} The created note.
         */
        create: (data: {
            care_relationship_id: string; text: string; linked_type: string;
            created_by: string; linked_medication_id?: string; linked_date?: string;
        }) =>
            request<{ note: any }>("/notes", { method: "POST", body: JSON.stringify(data) }),

        /**
         * Deletes a note by its ID.
         * @param {string} id - The note ID.
         * @returns {Promise<{ message: string }>} Success message.
         */
        remove: (id: string) =>
            request<{ message: string }>(`/notes/${id}`, { method: "DELETE" }),
    },

    /**
     * Wellness tracking services.
     */
    wellness: {
        /**
         * Lists wellness entries, optionally filtered by care relationship.
         * @param {string} [careRelationshipId] - Filter by relationship ID.
         * @returns {Promise<{ entries: any[] }>} List of wellness entries.
         */
        list: (careRelationshipId?: string) =>
            request<{ entries: any[] }>(`/wellness${careRelationshipId ? `?care_relationship_id=${careRelationshipId}` : ""}`),

        /**
         * Logs a new wellness entry.
         * @param {Object} data - Wellness data.
         * @param {string} data.care_relationship_id - Associated relationship ID.
         * @param {string} data.user_id - ID of the user logging the entry.
         * @param {string} data.level - Wellness level.
         * @param {string} [data.note] - Optional descriptive note.
         * @returns {Promise<{ entry: any }>} The created entry.
         */
        log: (data: { care_relationship_id: string; user_id: string; level: string; note?: string }) =>
            request<{ entry: any }>("/wellness", { method: "POST", body: JSON.stringify(data) }),
    },

    /**
     * Daily Closure services for finalizing a day's care.
     */
    day: {
        /**
         * Closes the day by recording medication adherence summary.
         * @param {Object} data - Closure details.
         * @param {string} data.care_relationship_id - Associated relationship ID.
         * @param {string} data.closed_by - User ID of the person closing the day.
         * @param {boolean} [data.all_taken] - Whether all meds were taken.
         * @param {number} [data.total_meds] - Total medications due.
         * @param {number} [data.taken_count] - Number of medications actually taken.
         * @returns {Promise<{ closure: any }>} The closure record.
         */
        close: (data: {
            care_relationship_id: string; closed_by: string;
            all_taken?: boolean; total_meds?: number; taken_count?: number;
        }) =>
            request<{ closure: any }>("/day/close", { method: "POST", body: JSON.stringify(data) }),

        /**
         * Retrieves the history of daily closures for a relationship.
         * @param {string} careRelationshipId - The relationship ID.
         * @returns {Promise<{ closures: any[] }>} List of past closures.
         */
        history: (careRelationshipId: string) =>
            request<{ closures: any[] }>(`/day/history?care_relationship_id=${careRelationshipId}`),
    },

    /**
     * Messaging services for communication between caregivers and receivers.
     */
    messages: {
        /**
         * Lists messages for a care relationship.
         * @param {string} careRelationshipId - The relationship ID.
         * @param {number} [limit=50] - Pagination limit.
         * @param {number} [offset=0] - Pagination offset.
         * @returns {Promise<{ messages: any[]; total: number }>} Paginated messages.
         */
        list: (careRelationshipId: string, limit = 50, offset = 0) =>
            request<{ messages: any[]; total: number }>(`/messages?care_relationship_id=${careRelationshipId}&limit=${limit}&offset=${offset}`),

        /**
         * Sends a new message.
         * @param {Object} data - Message details.
         * @param {string} data.care_relationship_id - Associated relationship ID.
         * @param {string} data.from_user_id - ID of the sender.
         * @param {string} data.text - Message content.
         * @returns {Promise<{ data: any }>} The sent message.
         */
        send: (data: { care_relationship_id: string; from_user_id: string; text: string }) =>
            request<{ data: any }>("/messages", { method: "POST", body: JSON.stringify(data) }),

        /**
         * Marks a specific message as read.
         * @param {string} id - The message ID.
         * @returns {Promise<{ data: any }>} Updated message.
         */
        markRead: (id: string) =>
            request<{ data: any }>(`/messages/${id}/read`, { method: "PATCH" }),
    },

    /**
     * Safety Check services for triggering and dismissing safety alerts.
     */
    safetyCheck: {
        /**
         * Triggers a safety check request for a care relationship.
         * @param {string} careRelationshipId - The relationship ID.
         * @returns {Promise<{ safetyCheck: any }>} The created safety check.
         */
        trigger: (careRelationshipId: string) =>
            request<{ safetyCheck: any }>("/safety-check/trigger", { method: "POST", body: JSON.stringify({ care_relationship_id: careRelationshipId }) }),

        /**
         * Dismisses an active safety check.
         * @param {string} safetyCheckId - The safety check ID.
         * @returns {Promise<{ safetyCheck: any }>} The updated safety check.
         */
        dismiss: (safetyCheckId: string) =>
            request<{ safetyCheck: any }>("/safety-check/dismiss", { method: "POST", body: JSON.stringify({ safety_check_id: safetyCheckId }) }),
    },

    /**
     * Emergency Contact services.
     */
    emergencyContacts: {
        /**
         * Lists emergency contacts for a care relationship.
         * @param {string} careRelationshipId - The relationship ID.
         * @returns {Promise<{ contacts: any[] }>} List of contacts.
         */
        list: (careRelationshipId: string) =>
            request<{ contacts: any[] }>(`/emergency-contacts?care_relationship_id=${careRelationshipId}`),

        /**
         * Adds a new emergency contact.
         * @param {Object} data - Contact details.
         * @param {string} data.care_relationship_id - Associated relationship ID.
         * @param {string} data.name - Contact name.
         * @param {string} data.phone - Contact phone number.
         * @param {string} [data.relationship] - Relation to the care receiver.
         * @param {boolean} [data.is_primary] - Whether this is the primary contact.
         * @returns {Promise<{ contact: any }>} The created contact.
         */
        create: (data: { care_relationship_id: string; name: string; phone: string; relationship?: string; is_primary?: boolean }) =>
            request<{ contact: any }>("/emergency-contacts", { method: "POST", body: JSON.stringify(data) }),

        /**
         * Deletes an emergency contact.
         * @param {string} id - The contact ID.
         * @returns {Promise<{ message: string }>} Success message.
         */
        remove: (id: string) =>
            request<{ message: string }>(`/emergency-contacts/${id}`, { method: "DELETE" }),
    },

    /**
     * Handover services for transferring care responsibilities.
     */
    handover: {
        /**
         * Starts a care handover period.
         * @param {Object} data - Handover details.
         * @param {string} data.care_relationship_id - Associated relationship ID.
         * @param {string} data.from_caregiver_id - ID of the outgoing caregiver.
         * @param {string} data.to_person_name - Name of the person taking over.
         * @param {string} [data.start_date] - Start date of handover.
         * @param {string} [data.end_date] - End date of handover.
         * @returns {Promise<{ handover: any }>} The created handover.
         */
        start: (data: {
            care_relationship_id: string; from_caregiver_id: string; to_person_name: string;
            start_date?: string; end_date?: string;
        }) =>
            request<{ handover: any }>("/handover/start", { method: "POST", body: JSON.stringify(data) }),

        /**
         * Ends a care handover period.
         * @param {string} handoverId - The handover ID.
         * @returns {Promise<{ handover: any }>} The completed handover.
         */
        end: (handoverId: string) =>
            request<{ handover: any }>("/handover/end", { method: "POST", body: JSON.stringify({ handover_id: handoverId }) }),

        /**
         * Retrieves the currently active handover for a relationship.
         * @param {string} careRelationshipId - The relationship ID.
         * @returns {Promise<{ handover: any | null }>} The current handover or null.
         */
        current: (careRelationshipId: string) =>
            request<{ handover: any | null }>(`/handover/current?care_relationship_id=${careRelationshipId}`),
    },

    /**
     * Notification services for system alerts.
     */
    notifications: {
        /**
         * Lists notifications for a specific user.
         * @param {string} userId - The user ID.
         * @param {number} [limit=50] - Pagination limit.
         * @param {number} [offset=0] - Pagination offset.
         * @returns {Promise<{ notifications: any[]; total: number }>} Paginated notifications.
         */
        list: (userId: string, limit = 50, offset = 0) =>
            request<{ notifications: any[]; total: number }>(`/notifications?user_id=${userId}&limit=${limit}&offset=${offset}`),

        /**
         * Creates a new notification for a user.
         * @param {Object} data - Notification details.
         * @param {string} data.user_id - Recipient user ID.
         * @param {string} data.type - Notification type.
         * @param {string} data.title - Notification title.
         * @param {string} data.body - Notification message body.
         * @returns {Promise<{ notification: any }>} The created notification.
         */
        create: (data: { user_id: string; type: string; title: string; body: string }) =>
            request<{ notification: any }>("/notifications", { method: "POST", body: JSON.stringify(data) }),
    },
};
