# El Puqui · web de pedidos por WhatsApp

Demo de **ChenteIA** para negocios de Mala–Cañete. *El Puqui es un negocio ficticio y el número de WhatsApp es de prueba.*

- `/` → web pública: portada, carta de 6 productos, "Cómo pedir", reseñas con capturas de WhatsApp y botón flotante. Cada clic a WhatsApp se guarda (producto, botón, fecha, día y hora de Lima).
- `/admin` → panel del dueño (login de Supabase). No hay ningún enlace a él desde la web pública.

**Stack:** Next.js 16 (App Router) · Supabase (Postgres + Auth + Storage) · Vercel.

## Estructura

| Ruta | Qué hay |
|---|---|
| `app/page.tsx` | Web pública |
| `app/api/click/route.ts` | Guarda cada clic a WhatsApp |
| `app/admin/` | Login y panel |
| `proxy.ts` | Protege `/admin` (sin sesión → `/admin/login`) |
| `lib/site.ts` | **Nombre, productos, precios y textos del negocio** |
| `supabase/schema.sql` | SQL completo: tablas, triggers, RLS y Storage |
| `scripts/optimize-images.mjs` | Convierte `./imagenes` a WebP responsivo |
| `imagenes/` | Fotos originales (ver `imagenes/LEEME.md`) |
| `components/icons.tsx` | Iconos de [Reicon](https://reicon.dev) (MIT), generados con `scripts/reicon-icons.mjs` |

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # y rellena los valores
npm run dev                  # http://localhost:3000
```

Variables (`.env.local` en local, *Environment Variables* en Vercel):

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (`sb_publishable_…`) o la anon key antigua |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Solo dígitos con código de país. Prueba: `51900000000` |

No hace falta la *service role key*: todo pasa por las políticas RLS.

## 1. Crear el proyecto en Supabase

1. Entra a <https://supabase.com/dashboard> → **New project**. Región: **South America (São Paulo)**, la más cercana a Lima. Guarda la contraseña de la base de datos.
2. **SQL Editor → New query**: pega todo `supabase/schema.sql` y pulsa **Run**. Crea las tablas `admins`, `clicks`, `sales` y `reviews`, los triggers, las políticas RLS y el bucket privado `reviews`. Se puede volver a ejecutar sin problema.
3. **Project Settings → API Keys** (o el botón **Connect**): copia la *Project URL* y la *Publishable key* a `.env.local`.

## 2. Crear tu usuario admin

1. **Authentication → Users → Add user → Create new user**: tu correo y una contraseña segura, con **Auto Confirm User** marcado.
2. En **SQL Editor**, dale permiso de admin (cambia el correo):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'tu-correo@ejemplo.com';
   ```
3. Recomendado: **Authentication → Sign In / Providers → Email** y desactiva **Allow new users to sign up**. Así nadie más puede crear cuentas. Aunque alguien lo hiciera, sin estar en `admins` no ve ningún dato.
4. Entra a `http://localhost:3000/admin`, inicia sesión y prueba **Generar datos de ejemplo**.

## 3. Subir el código a GitHub (cuenta ChenteIA)

El repositorio es `ChenteIA/Web_de_venta`. Si empiezas desde cero en otra carpeta:

```bash
git init
git add .
git commit -m "El Puqui: web pública + panel"
git branch -M main
git remote add origin https://github.com/ChenteIA/Web_de_venta.git
git push -u origin main
```

`.env.local` está en `.gitignore`: **nunca** se sube.

## 4. Desplegar en Vercel

1. <https://vercel.com/new> → **Import Git Repository** → elige `ChenteIA/Web_de_venta`. Si no aparece, en *Adjust GitHub App Permissions* dale acceso a ese repo.
2. Framework: **Next.js**, detectado solo. No cambies los comandos.
3. En **Environment Variables** agrega las tres variables de la tabla de arriba.
4. **Deploy**. Cada `git push` a `main` vuelve a desplegar.
5. En Supabase → **Authentication → URL Configuration** pon tu dominio de Vercel como *Site URL* (por ejemplo `https://el-puqui.vercel.app`).

> Si cambias una variable `NEXT_PUBLIC_*` en Vercel, vuelve a desplegar: esas variables se fijan en el build.

## Iconos

Los iconos de interfaz salen de [Reicon](https://github.com/dqev/reicon) (licencia MIT; basados en Solar Icons de 480 Design, CC BY 4.0). Solo se copian los que se usan, así la web no carga los 2 700:

```bash
git clone --depth 1 https://github.com/dqev/reicon /tmp/reicon
# agrega el nombre del icono a ICONS en scripts/reicon-icons.mjs (búscalo en https://reicon.dev/icons)
node scripts/reicon-icons.mjs /tmp/reicon
```

Uso: `<Icon name="calendar" />`. Toma el color del texto. Las ilustraciones de los productos (frascos, caja de regalo) siguen siendo SVG propios, porque Reicon no tiene iconos de frascos ni frutas.

## Notas

- **Hora de Lima:** la fecha, el día y la hora de cada clic los calcula la base de datos (trigger), no el navegador. Un visitante no puede falsearlos ni marcar clics como vendidos.
- **Reseñas:** el bucket es privado. La web solo puede leer las imágenes de reseñas **visibles** (se sirven con URL firmada), y al ocultar una deja de verse al instante. Antes de subirlas, el panel las reduce a WebP de 1080 px. No subas capturas inventadas y tapa el número del cliente.
- **Ventas:** registrar una venta desde un clic lo marca como vendido, y eliminarla lo desmarca (trigger). Un clic solo admite una venta.
- **Datos de ejemplo:** se guardan con `demo = true` y se borran con un botón sin tocar los datos reales.
