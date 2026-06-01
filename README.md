# Computer Store — shop + management system

A sales website with product images, customer accounts, a shopping cart, and a **Store Manager** for adding products and changing prices. Works in the browser and can be **installed as an app** (PWA).

## Quick start

```bash
npm install
copy .env.example .env
npm start
```

| URL | Who it's for |
|-----|----------------|
| http://localhost:3000 | Shoppers |
| http://localhost:3000/account.html | Sign up / sign in |
| http://localhost:3000/cart.html | Shopping cart (requires account) |
| http://localhost:3000/backoffice/ | Staff — repairs, calendar, dashboard |
| http://localhost:3000/admin/ | Admin — products & stock only |
| http://localhost:3000/repair-book.html | Customer — book a repair |
| http://localhost:3000/my-repairs.html | Customer — track tickets |

### Logins

| Role | Default credentials |
|------|---------------------|
| **Admin** (products + full back office) | `admin` / your `.env` password |
| **Technician** (repairs + calendar) | `technician` / `tech123` (or `.env`) |
| **Customer** | Create an account at **Sign in** → **Create account** |

Change admin password in `.env` before going live.

## Features

### Shoppers

- Click a product to open its **detail page**
- **Sign up / sign in** to use the cart
- **Add to cart** (must be logged in)
- View and edit cart quantities
- Enquire via contact form
- **Book repairs** (`repair-book.html`) — 48-hour default ETA
- **Track tickets** (`my-repairs.html`)

### Back office (`/backoffice/`)

- Dashboard, repair tickets, technician calendar
- Update status, ETA, schedule, parts used, customer-visible notes
- Admin also links to **Products** (`/admin/`)

### Store Manager (`/admin/`)

- Add, edit, delete products
- **Upload product images** (JPEG, PNG, WebP, GIF — max 5MB)
- Quick price updates from the table
- Store name, phone, email, currency

### Install as an app

Chrome / Edge → **Install app** or **Add to Home screen** for the shop or admin panel.

## Product images

1. Open **Store Manager** → edit or add a product  
2. Choose a file under **Product image**  
3. Save — the image appears on the shop and product page  

Files are stored in `data/uploads/`.

## Customer accounts vs admin

| | Customers | Store Manager |
|---|-----------|---------------|
| URL | `/account.html` | `/admin/` |
| Purpose | Cart, browsing | Manage catalog |
| API | `/api/customer/*` | `/api/auth/*` (admin) |

## Data

- Database: `data/store.db`
- Uploads: `data/uploads/`
- Back up both folders regularly.

## API summary

**Public:** `GET /api/products`, `GET /api/products/:id`, `GET /api/settings`

**Customers:** `POST /api/customer/register`, `POST /api/repairs`, `GET /api/repairs/mine`, cart routes, …

**Staff:** `POST /api/auth/login`, `GET /api/repairs`, `PATCH /api/repairs/:id`, `GET /api/repairs/calendar`, …

**Admin:** `POST /api/products`, `POST /api/products/:id/image`, …

Cart routes require `Authorization: Bearer <customer token>`.

## Configuration

```env
PORT=3000
JWT_SECRET=your-long-random-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```
