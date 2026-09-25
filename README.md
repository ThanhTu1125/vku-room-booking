# MINI-PROJECT SHORT TECHNICAL REPORT
**Course:** Cross-Platform Mobile App Development (VKU)  
**Mini-Project Title:** Mini-Project 2 - Smart Study Room Booking System (VKU Room Booking)  
**Team / Student Name:** Nguyễn Thanh Tú - 23IT296  
**Submission Date:** 25/09/2026  

---

## 1. GENERAL INFORMATION & DELIVERABLE LINKS
* **Team Members:**
  1. Nguyễn Thanh Tú — Student ID: 23IT296
* **🔗 Live Demo URL:** https://drive.google.com/drive/folders/1Y8mr4evGq1TNf-9_wHbBm2Hv0WBvUsJh?usp=sharing
* **💻 GitHub Repository:** https://github.com/ThanhTu1125/vku-room-booking.git

---

## 2. FEATURE IMPLEMENTATION CHECKLIST
| # | Required Feature | Status | Implementation Details & Acceptance Level |
|:---:|---|:---:|---|
| 1 | **Authentication & Session** | ✅ Complete | Integrated Firebase Auth with `AsyncStorage` for persistent sessions. Implemented secure auto-login lifecycle. |
| 2 | **Real-time Discovery & Filtering** | ✅ Complete | Utilized Firestore `onSnapshot` combined with `Zustand` for reactive, high-performance multi-criteria filtering (Building, Capacity, Equipment). |
| 3 | **Conflict-Free Booking (ACID)** | ✅ Complete | Implemented Firestore `runTransaction` to lock time slots atomically, entirely eliminating Double-Booking anomalies. |
| 4 | **Dynamic QR Ticketing** | ✅ Complete | Generated on-the-fly QR codes (`react-native-qrcode-svg`) encapsulating booking metadata for physical check-ins. |
| 5 | **Local Push Notifications** | ✅ Complete | Configured `expo-notifications` for client-side scheduling, triggering reminders 15 minutes prior to the booked session. |

---

## 3. TECHNICAL ARCHITECTURE & PROJECT STRUCTURE
* **Framework & Environment:** Built on React Native 0.86.3 and Expo SDK 57 (Managed Workflow) utilizing the New Architecture (Fabric & Bridgeless Mode).
* **State Management:** Adopted `Zustand` (v5) for global state management, centralizing Firebase realtime listeners to prevent memory leaks and redundant re-renders common in standard Context API implementations.
* **Database Architecture:** Employed Firebase Cloud Firestore (NoSQL). Designed a denormalized `bookings` collection optimized for read-heavy operations, governed by strict declarative Firebase Security Rules (`firestore.rules`).
* **Directory Pattern:** Layered/Feature-based architecture segregating UI components (`src/components`), custom hooks (`src/hooks`), state stores (`src/store`), and backend services (`src/services`).

---

## 4. TECHNICAL CHALLENGES & RESOLUTIONS
* **Challenge 1: Native Module Exceptions in Expo Go Environment:**
  * *Bottleneck:* The integration of `expo-notifications` triggered fatal `NullPointerException` errors on Android Expo Go due to the deprecation of `NotificationsChannelsProvider` in recent SDKs.
  * *Resolution:* Engineered an environment-detection utility utilizing `expo-constants` to dynamically bypass native channel configurations (`setNotificationChannelAsync`) when executing inside the Expo Go client, ensuring uninterrupted runtime stability without compromising bare-workflow functionality.
* **Challenge 2: Concurrency in Slot Reservation (Double Booking):**
  * *Bottleneck:* High-frequency simultaneous booking attempts led to race conditions where two clients could reserve the exact same room and timeslot.
  * *Resolution:* Shifted from standard Firestore `setDoc` operations to atomic `runTransaction` blocks utilizing a dedicated `slot_locks` collection. This enforces strict ACID properties, rolling back subsequent concurrent requests with appropriate user-facing exception handling.
