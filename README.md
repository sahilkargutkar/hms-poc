# CarePoint AI Receptionist - Frontend & AI Agent Layer

Production-quality Next.js + React + TypeScript frontend and AI Medical Receptionist layer for clinical appointment management.

---

## 🏥 Architecture Overview

```
User (Patient)
      ↓
useChat Hook & Conversation State
      ↓
AI Receptionist Agent (lib/ai/agent.ts)
      ↓
AI Tool / Function Calling (lib/ai/tools.ts)
      ↓
Centralized API Client (lib/api/client.ts)
      ↓
```

---

## ✨ Features & Capabilities

### 1. Natural Language Medical Receptionist
- Understands natural inquiries:
  - *"I want to see a dentist tomorrow."*
  - *"Do you have anything available around 4 PM?"*
  - *"Book me for 4:30."*
  - *"I need to cancel my appointment."*
  - *"Show me my appointments."*
- **Strict Safety Boundaries**: Adheres to medical compliance guardrails (no diagnosis, no prescription, no treatment advice).
- **Integrity**: Never fabricates availability or claims an appointment is booked without backend confirmation.

### 2. Interactive Medical UI Components
- **`DoctorCard`**: Doctor profile with specialty, rating, experience, and slot trigger.
- **`ServiceCard`**: Service details, duration, and estimated pricing.
- **`AvailableSlots`**: Dynamic time pills categorized by Morning, Afternoon, and Evening.
- **`BookingConfirmation`**: Pre-booking confirmation card with patient details.
- **`AppointmentCard`**: Active & upcoming appointments with reference IDs and cancellation triggers.
- **`CancellationConfirmation`**: Verification modal before slot release.
- **`QuickReplies`**: One-tap interactive reply chips.
- **`StateInspector`**: Live conversational state preview pill for demos and debugging.

---

## 🛠️ API & AI Tool Contracts

| Tool Name | Parameters | Purpose |
|---|---|---|
| `find_doctors` | `{ specialization?, name? }` | Locate doctors by specialty or name |
| `get_services` | `{ doctorId?, specialization? }` | Retrieve services and consultation types |
| `get_available_slots` | `{ doctorId, date, serviceId? }` | Query real-time available time slots |
| `book_appointment` | `{ doctorId, serviceId, startTime, endTime, patientName, patientPhone, notes? }` | Finalize booking in clinic database & trigger SMS |
| `get_patient_appointments` | `{ phone }` | Query patient's active/past bookings |
| `cancel_appointment` | `{ appointmentId, reason? }` | Cancel booking and release slot |
| `reschedule_appointment` | `{ appointmentId, newStartTime, newEndTime }` | Reschedule existing visit |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Key configuration variables:
- `NEXT_PUBLIC_API_URL`: Base URL of the backend developer's REST API (e.g. `http://localhost:4000/api`).
- `NEXT_PUBLIC_USE_MOCK_API`: Set to `true` to use the built-in mock backend (default for POC demonstrations), or `false` to route calls to `NEXT_PUBLIC_API_URL`.
- `AI_API_KEY`: *(Optional)* OpenAI / compatible LLM API key. If omitted, the built-in zero-config conversational engine seamlessly handles the dialog!

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000/chat](http://localhost:3000/chat) in your browser.

---

## 🧪 Demo Test Scenarios

- **Booking Flow**: Type `"I need to see a dentist tomorrow"` → Click `Dr. Rajesh Sharma` → Click `4:00 PM` → Click `Use Demo Patient Info` (or type `John, 9876543210`) → Click `Confirm Appointment`.
- **View & Cancellation Flow**: Type `"Show me my appointments"` → Enter test phone `9876543210` → Click `Cancel Appointment` → Confirm cancellation.
