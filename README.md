# Agriva Indonesia

> Platform agritech yang menghubungkan teknologi modern dengan kearifan lokal petani nusantara.

---

## Struktur Project

```
agriva-indonesia/
│
├── index.html                    # Entry point — markup saja, tanpa inline CSS/JS
│
└── assets/
    ├── css/
    │   ├── main.css              # Entry point CSS (@import semua partial)
    │   │
    │   ├── base/
    │   │   ├── variables.css     # Design tokens (warna, tipografi, spacing, radius)
    │   │   ├── reset.css         # CSS reset & base body styles
    │   │   └── animations.css    # Global @keyframes & .reveal utility
    │   │
    │   ├── layout/
    │   │   ├── nav.css           # Navbar desktop + hamburger + mobile drawer
    │   │   └── footer.css        # Footer
    │   │
    │   ├── sections/
    │   │   ├── hero.css          # Hero section + particles + badge
    │   │   ├── stats.css         # Stats bar
    │   │   ├── about.css         # About / mission + value items
    │   │   ├── services.css      # Services grid + featured card
    │   │   ├── impact.css        # Impact timeline + metric cards
    │   │   ├── team.css          # Team grid + cards
    │   │   ├── testimonials.css  # Testimonials carousel
    │   │   ├── partners.css      # Partners bar
    │   │   └── cta-contact.css   # CTA section + contact form
    │   │
    │   └── utils/
    │       ├── components.css    # Shared: buttons, tags, section headings, cursor
    │       └── responsive.css    # Media queries (900 / 640 / 420px + touch)
    │
    └── js/
        ├── main.js               # Entry point JS (import & init semua modul)
        │
        └── modules/
            ├── cursor.js         # Custom cursor + auto-disable on touch
            ├── nav.js            # Sticky nav scroll + smooth anchor
            ├── mobileMenu.js     # Hamburger toggle + Escape key support
            ├── particles.js      # Hero particle generator
            ├── animations.js     # Reveal / metric bars / count-up
            ├── testimonials.js   # Drag-to-scroll carousel
            └── form.js           # Contact form feedback
```

---

## Cara Menjalankan

Karena JS menggunakan **ES Modules** (`type="module"`), file harus dijalankan melalui HTTP server — tidak bisa dibuka langsung sebagai `file://`.

### Opsi 1 — VS Code Live Server
Install ekstensi **Live Server**, klik kanan `index.html` → *Open with Live Server*.

### Opsi 2 — Python
```bash
python -m http.server 3000
# buka http://localhost:3000
```

### Opsi 3 — Node / npx
```bash
npx serve .
```

---

## Keputusan Arsitektur

| Keputusan | Alasan |
|---|---|
| CSS dipisah per section | Mudah ditemukan, diubah, atau dihapus tanpa memengaruhi bagian lain |
| `main.css` sebagai entry `@import` | Urutan cascade terkontrol; satu titik masuk untuk build tool |
| JS ES Modules | Tidak ada global scope pollution; siap di-bundle (Vite / Rollup) |
| Setiap modul JS satu tanggung jawab | Mudah di-test dan di-extend secara independen |
| Semantic HTML + ARIA | Aksesibilitas: screen reader, keyboard navigation |
| Design tokens di `variables.css` | Ubah warna/spacing dari satu tempat, berlaku seluruh project |

---

## Browser Support

Chrome 80+, Firefox 75+, Safari 14+, Edge 80+  
*(semua browser yang mendukung ES Modules & CSS Custom Properties)*
