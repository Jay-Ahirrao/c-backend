# EveryTube 🎥🐦
> *The ultimate video-centric social platform combining the best of YouTube and Twitter.*

## 🚀 Overview
**EveryTube** is a full-stack web application designed to allow users to upload, watch, and share short-form videos while interacting through a fast-paced, Twitter-like social feed. It bridges the gap between long-form video content and real-time social updates.

### Core Features
- **🎥 Video Uploading (Future version coming with live streaming):** Upload, browse, and watch video content.
- **🐦 Social Feed:** Post short text updates, follow users, and retweet/repost content.
- **💬 Interaction:** Like, comment, and share videos and posts.
- **👤 User Profiles:** Customizable profiles showing video uploads and social activity.
- **🔍 Search & Discovery:** Find trending videos and users.
- **🌓 Dark Mode:** Built-in dark mode support for better user experience.

## 🛠️ Tech Stack
- **Frontend:** [React.js , Shadcn, MUI ]
- **Backend:** [Node.js, Express JS]
- **Database:** [ MongoDB ]
- **Storage:** [Cloudinary - based on AWS]
- **Deployment:** [ Any Free VPS :) ]

## 📷 Screenshots
*Coming Soon ..*
*   **Landing Page (Feed)**
*   **Video Player Component**
*   **User Profile**

---

## 🚀 Key Features

*   **Mixed Media Feed:** Displays short videos and text-based updates (Tweets) in a single, vertical scroll feed.
*   **Personalized Video Player:** Implements a YouTube-like player with controls and related content.
*   **Social Interactions:** Supports liking, commenting, and "reposting" content.
*   **User Profiles:** Dedicated profiles to showcase user-posted content.
*   **Database-Driven:** Stores user activity, comments, and post data.

---

## 🤝 Contributing
Contributions are very welcome! Please follow these steps:
1.  Fork the project.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📜 License

> **Internal Note:** This web application is transitioning from a development prototype to a licensed production environment. The following measures are being implemented to protect the source code and media assets.

---

### ⚖️ 1. Terms of Service & EULA (Clickwrap)
*   **Status:** 🏗️ *Integration in Progress*
*   **Implementation:** Adding a mandatory "I agree to the Terms of Service" checkbox on the `/signup` and `/checkout` routes.
*   **Goal:** Legally binding users to usage limits and prohibiting scraping or unauthorized redistribution of media.

### 🔐 2. Access Control & Domain Locking
*   **Status:** ⏳ *Planned*
*   **Method:** Implementing **JWT (JSON Web Tokens)** for session-based licensing.
*   **Security:** Restricting API requests to verified domains and authenticated users to prevent hotlinking of media assets.

### 📽️ 3. Digital Rights Management (DRM)
*   **Status:** 🎬 *Testing*
*   **Technology:** Integrating **Widevine** and **PlayReady** via systems like *Shaka Player* or *Video.js*.
*   **Purpose:** To prevent users from downloading or recording premium video/audio content directly from the browser.

### 📄 4. Open Source & Third-Party Licenses
*   **Status:** ✅ *Tracking*
*   **Compliance:** Maintaining a `NOTICE` file for all NPM packages and frontend frameworks used in the build.

---

### 🛠️ Developer Checklist
- [ ] Create `/terms-of-service` and `/privacy-policy` pages.
- [ ] Set up **CORS** (Cross-Origin Resource Sharing) policies to lock the API to the production URL.
- [ ] Implement middleware to check for active "subscription/license" status before serving media streams.
- [ ] Obfuscate production JavaScript bundles to protect proprietary logic.

---
*© 2024 EveryTube. All rights reserved.*


## 📧 Contact
Your Name - [@coder_jay_01](https://x.com) - email@example.com

Project Link: [https://github.com](https://github.com)
