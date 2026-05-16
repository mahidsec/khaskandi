# Khaskandi Village Website Design Guidelines

This document outlines the core design principles and constraints for the Khaskandi village website to ensure a consistent, professional, and mobile-optimized user experience.

## 1. No Emojis
- **Rule:** Do not use any graphical emojis (e.g., 🌿, 📍, 🏢) in the UI, content, or metadata.
- **Rationale:** To maintain a clean, professional, and serious aesthetic suitable for a community information portal.
- **Alternative:** Use descriptive text, standard UI labels, or clean SVG icons if strictly necessary (though text is preferred for simplicity).

## 2. No Glow Effects
- **Rule:** Avoid using CSS `box-shadow` or `text-shadow` for "glow" or "outer radiance" effects on buttons, cards, or text.
- **Rationale:** Glows can look dated and distract from the primary content. A flat or subtly bordered design is preferred.

## 3. Mobile-First Design (Zero Hover Reliance)
- **Rule:** Design all interactive elements assuming the user **cannot hover**.
- **Rationale:** Most users will access the site via mobile devices which do not support hover states. 
- **Implementation:**
    - Do not hide critical information behind hover triggers.
    - Button states should be clear: use an **Inverted Hover** style where the background becomes white and the text color shifts to the darkest green for high contrast.
    - Avoid "lift" or "transform" animations on hover that provide functional feedback, as they won't be seen on mobile.
    - Transitions should be limited to simple color/background changes that provide quick visual confirmation of a tap.

## 4. Typography
- **Primary Bangla Font:** `Hind Siliguri` (Standard, readable).
- **Headline Bangla Font:** `AlinurSangbadpatro` (Used sparingly for main titles only).
- **English Font:** `Inter` (Clean, modern).

## 5. Color Palette
- **Primary:** `#16a34a` (Forest Green).
- **Background:** `#0a1a12` (Deep Dark Green).
- **Cards:** Transparent glassmorphism with subtle borders.

---
*Last Updated: May 16, 2026*
