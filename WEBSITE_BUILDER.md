# PUBLIC WEBSITE BUILDER SPECIFICATION
## Code-Free Content Customization, Booking Integration, & Multi-Tenant SEO Setup

This document specifies the architecture for public customer-facing sub-sites (e.g., `hotel.marketforge.com`). It allows non-technical business owners to configure, style, and publish professional websites without writing a single line of code.

---

## 1. Domain Routing & Rendering Engine

```
  [PUBLIC BROWSER REQUEST] -> (hotel.marketforge.com)
             │
             ▼
    [API ROUTING SHIELD] (Inspects Host Header)
             │
             ▼
    [TENANT METADATA RESOLUTION] (Loads branding for 'hotel')
             │
             ▼
    [SSR HTML GENERATION] (Renders customized landing layout)
```

### Routing Mechanics
1.  A guest navigates to `https://hotel-aurora.marketforge.com` or `https://www.aurorahotel.com`.
2.  The ingress server catches the host header, extracts the subdomain prefix (`hotel-aurora`), and queries the database for active domain maps.
3.  Loads the branding metadata payload and injects CSS variables to dynamically style the public layout.

---

## 2. Public Website JSON Schema

All custom content sections, SEO keywords, blog arrays, and booking calendars are stored in a single unified settings document in the database under the tenant configuration:

```json
{
  "publicSite": {
    "enabled": true,
    "domain": "hotel-aurora.marketforge.com",
    "seo": {
      "metaTitle": "Aurora Luxury Resort | Boutique Mountain Cabins",
      "metaDescription": "Experience standard relaxation in our isolated mountain retreat. Clean rooms, high-contrast amenities, and organic dining options.",
      "keywords": ["mountain hotel", "boutique cabins", "luxury spa"]
    },
    "theme": {
      "primaryColor": "#0f172a",
      "secondaryColor": "#475569",
      "typography": "Space Grotesk"
    },
    "sections": {
      "hero": {
        "title": "Escape to the Peaks of Serenity",
        "subtitle": "Comfort paired with rugged elegance",
        "backgroundImage": "https://images.unsplash.com/photo-1566073771259-6a8506099945"
      },
      "services": [
        {
          "title": "Private Hot Tubs",
          "description": "Geothermal heated pools overlooking the forest.",
          "icon": "Waves"
        },
        {
          "title": "Organic Gastronomy",
          "description": "Farm-to-fork dining curated daily by our chef.",
          "icon": "Utensils"
        }
      ],
      "testimonials": [
        {
          "author": "Marcus V.",
          "rating": 5,
          "content": "An incredible experience. The checkin felt seamless and the booking portal was beautiful."
        }
      ]
    }
  }
}
```

---

## 3. The Visual Editor Experience

The visual editor lives inside the tenant admin workspace dashboard. It matches the luxury design style of Framer or Notion:

```
┌────────────────────────────────────────────────────────┐
│  VISUAL EDITOR CONTROLS (Sidebar)                      │
│                                                        │
│  [Hero Header]    ────────► [ Live Visual iframe     ] │
│  [Primary Color]  ────────► [   Refreshes Instantly  ] │
│  [Services List]  ────────► [   On Content Change    ] │
│                                                        │
│  [ PUBLISH CHANGES ]                                   │
└────────────────────────────────────────────────────────┘
```

*   **Interactive Panel**: Owners click text boxes directly in the sidebar preview panel to edit wording, change colors using standard color Pickers, or select visual layout styles.
*   **Asset Management**: Integrated drag-and-drop file uploaders accept images, process and compress them into modern formats, and host them in cloud storage.
*   **Booking Integration**: Public websites automatically render a modern, high-contrast booking widget connected to the live tenant room inventory. When a guest completes a booking, the transaction writes to the active database partition and sends an email to the on-duty receptionist instantly.
