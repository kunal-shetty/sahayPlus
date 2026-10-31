import { Page } from '@playwright/test';

export const mockSeniorUser = {
  id: 'cr-user-1',
  email: 'senior@sahay.app',
  name: 'Ramesh Patel',
  role: 'care_receiver' as const,
  care_code: 'SAHAY9',
  care_relationship_id: 'rel-1',
};

export const mockCaregiverUser = {
  id: 'cg-user-1',
  email: 'anita@sahay.app',
  name: 'Anita Patel',
  role: 'caregiver' as const,
  care_code: 'SAHAY9',
  care_relationship_id: 'rel-1',
};

export const mockCareRelationship = {
  id: 'rel-1',
  caregiver_id: 'cg-user-1',
  care_receiver_id: 'cr-user-1',
  care_code: 'SAHAY9',
  status: 'active',
  created_at: new Date().toISOString(),
};

export const mockMedications = [
  {
    id: 'med-1',
    name: 'Amlodipine',
    dosage: '5mg',
    time: '09:00',
    time_of_day: 'morning',
    timeOfDay: 'morning',
    frequency: 'once_daily',
    taken: false,
    instructions: 'Take 1 tablet after breakfast',
    notes: 'Take 1 tablet after breakfast',
    simple_explanation: 'Take 1 tablet with a full glass of water after breakfast',
    food_instruction: 'after_meal',
    color: 'blue',
    shape: 'round',
    refill_days_left: 14,
  },
  {
    id: 'med-2',
    name: 'Metformin',
    dosage: '500mg',
    time: '13:00',
    time_of_day: 'afternoon',
    timeOfDay: 'afternoon',
    frequency: 'once_daily',
    taken: false,
    instructions: 'Take with warm water after lunch',
    simple_explanation: 'Take with lunch',
    food_instruction: 'with_meal',
    color: 'white',
    shape: 'oval',
    imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    notes: 'Take with warm water after lunch\n<!--SAHAY_META:{"imageUrl":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==","color":"white","shape":"oval"}:SAHAY_META-->',
    refill_days_left: 20,
  },
];

/**
 * Injects authenticated session directly into localStorage before page load.
 */
export async function injectSession(page: Page, role: 'caregiver' | 'care_receiver') {
  const user = role === 'caregiver' ? mockCaregiverUser : mockSeniorUser;
  await page.addInitScript((userData) => {
    window.localStorage.setItem('sahay_user', JSON.stringify(userData));
    window.localStorage.setItem('sahay_onboarding_complete', 'true');
    window.localStorage.setItem(
      'sahay-app-data',
      JSON.stringify({
        userRole: userData.role === 'caregiver' ? 'caregiver' : 'careReceiver',
        caregiver: {
          name: 'Anita Patel',
          email: 'anita@sahay.app',
          phone: '+91 98765 43210',
          status: 'active',
          roleName: 'Primary Caregiver',
        },
        careReceiver: {
          name: 'Ramesh Patel',
          nickname: 'Dada Ji',
          independenceTimes: ['morning'],
        },
        medications: [
          {
            id: 'med-1',
            name: 'Amlodipine',
            dosage: '5mg',
            time: '09:00',
            timeOfDay: 'morning',
            frequency: 'once_daily',
            taken: false,
            instructions: 'Take 1 tablet after breakfast',
            simpleExplanation: 'Take 1 tablet with a full glass of water after breakfast',
            foodInstruction: 'after_meal',
            color: 'blue',
            shape: 'round',
            refillDaysLeft: 14,
          },
          {
            id: 'med-2',
            name: 'Metformin',
            dosage: '500mg',
            time: '13:00',
            timeOfDay: 'afternoon',
            frequency: 'once_daily',
            taken: false,
            instructions: 'Take with warm water after lunch',
            simpleExplanation: 'Take with lunch',
            foodInstruction: 'with_meal',
            color: 'white',
            shape: 'oval',
            imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            notes: 'Take with warm water after lunch\n<!--SAHAY_META:{"imageUrl":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==","color":"white","shape":"oval"}:SAHAY_META-->',
            refillDaysLeft: 20,
          },
        ],
        emergencyContacts: [
          {
            id: 'ec-1',
            name: 'Anita Patel',
            relationship: 'Daughter',
            phone: '9876543210',
            is_primary: true,
            isPrimary: true,
          },
        ],
        timeline: [
          {
            id: 'tl-1',
            type: 'check_in',
            description: 'Morning wellness logged as Good',
            timestamp: new Date().toISOString(),
          },
        ],
      })
    );
  }, user);
}

/**
 * Sets up network route mocking with regex patterns so tests NEVER depend on or hit a live external Supabase DB.
 */
export async function setupMockApi(page: Page, role: 'caregiver' | 'care_receiver' = 'care_receiver') {
  const activeUser = role === 'caregiver' ? mockCaregiverUser : mockSeniorUser;

  // Intercept Auth Login
  await page.route(/\/api\/auth\/login/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Login successful',
        user: activeUser,
        care_relationship: mockCareRelationship,
        is_new: false,
      }),
    });
  });

  // Intercept Care Relationships (both /me and by id)
  await page.route(/\/api\/care-relationships/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        relationship: mockCareRelationship,
        user: activeUser,
        care_receiver: {
          id: 'cr-user-1',
          name: 'Ramesh Patel',
          email: 'senior@sahay.app',
        },
        caregiver: {
          id: 'cg-user-1',
          name: 'Anita Patel',
          email: 'anita@sahay.app',
        },
      }),
    });
  });

  // Intercept Medications CRUD & Actions
  await page.route(/\/api\/medications/, async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (url.includes('/take')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, taken: true }),
      });
      return;
    }
    if (url.includes('/skip')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, skipped: true }),
      });
      return;
    }
    if (method === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, medication: { id: 'med-new', name: 'New Med' } }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ medications: mockMedications }),
    });
  });

  // Intercept Timeline Events
  await page.route(/\/api\/timeline/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        events: [
          {
            id: 'tl-1',
            type: 'check_in',
            description: 'Checked in feeling good',
            created_at: new Date().toISOString(),
          },
        ],
        total: 1,
      }),
    });
  });

  // Intercept Wellness
  const wellnessEntries: any[] = [];
  await page.route(/\/api\/wellness/, async (route) => {
    if (route.request().method() === 'POST') {
      let postData: any = {};
      try {
        postData = route.request().postDataJSON();
      } catch { }
      const newEntry = {
        id: 'w-' + Date.now(),
        level: postData?.level || 'great',
        note: postData?.note || '',
        date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      };
      wellnessEntries.push(newEntry);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, entry: newEntry }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        entries: wellnessEntries,
      }),
    });
  });

  // Intercept Medication Logs
  await page.route(/\/api\/medication-logs/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ logs: [] }),
    });
  });

  // Intercept Day Closures
  await page.route(/\/api\/day/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ closures: [] }),
    });
  });

  // Intercept Contextual Notes
  await page.route(/\/api\/notes/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ notes: [] }),
    });
  });

  // Intercept Emergency Contacts
  await page.route(/\/api\/emergency-contacts/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        contacts: [
          {
            id: 'ec-1',
            name: 'Anita Patel',
            relationship: 'Daughter',
            phone: '9876543210',
            is_primary: true,
            isPrimary: true,
          },
        ],
      }),
    });
  });

  // Intercept Handover
  await page.route(/\/api\/handover/, async (route) => {
    if (route.request().method() === 'POST' || route.request().method() === 'PATCH') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, handover: { id: 'handover-mock-1' } }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ handover: null }),
      });
    }
  });

  // Intercept Pharmacist Contacts
  await page.route(/\/api\/pharmacist-contacts/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ contacts: [] }),
    });
  });

  // Intercept Safety Checks & Messages
  await page.route(/\/api\/safety-check/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  await page.route(/\/api\/messages/, async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { id: 'msg-mock-1', created_at: new Date().toISOString() } }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    }
  });
}
