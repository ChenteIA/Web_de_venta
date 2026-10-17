# San Luyo · chicha de maní por WhatsApp

Web de **San Luyo** (Ica), hecha por **ChenteIA**. Venta de chicha de maní en botella de medio litro (S/ 3) y de 1 litro (S/ 6), desde el lunes 19 de octubre de 2026. WhatsApp: +51 910 897 377.

- `/` → web pública: portada, la chicha con su precio, "Cómo pedir", reseñas con capturas de WhatsApp y botón flotante. Cada clic a WhatsApp se guarda (producto, botón, fecha, día y hora de Lima).
- `/admin` → panel del dueño (login de Supabase; solo las cuentas en la tabla `admins`). No hay ningún enlace a él desde la web pública. Pestañas:
  - **Resumen:** clics a WhatsApp, ventas, unidades vendidas, monto, conversión y ticket promedio; gráficos por día, producto, botón y hora.
  - **Ventas:** registrar ventas (también desde un clic), últimos clics, tabla de ventas y descarga en CSV.
  - **Productos:** cambiar precio, nombre, presentación, descripción y foto; agregar productos nuevos; ocultarlos o eliminarlos. La web los muestra al instante.
  - **Reseñas:** subir capturas de WhatsApp de clientes contentos, mostrarlas, ocultarlas o eliminarlas.
  - **Accesos:** crear un enlace de invitación de un solo uso (vence en 7 días) para que otra persona cree su usuario y entre al panel; ver quién tiene acceso, anular invitaciones y quitar accesos.
- `/admin/invitacion?t=…` → página donde la persona invitada crea su usuario (correo y contraseña).

**Stack:** Next.js 16 (App Router) · Supabase (Postgres + Auth + Storage) · Vercel.

## Estructura

| Ruta | Qué hay |
|---|---|
| `app/page.tsx` | Web pública |
| `app/api/click/route.ts` | Guarda cada clic a WhatsApp |
| `app/admin/` | Login y panel |
| `proxy.ts` | Protege `/admin` (sin sesión → `/admin/login`) |
| `lib/site.ts` | **Nombre, textos del negocio** y la lista de productos de respaldo |
| `lib/products.ts` | Productos desde Supabase (tabla `products`, fotos en el bucket público `productos`) |
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
3. **Authentication → Sign In / Providers → Email**:
   - Deja **activado** *Allow new users to sign up*. Las invitaciones lo necesitan, y la base de datos rechaza cualquier registro que no traiga un enlace de invitación válido (trigger `on_auth_user_invited`), así que nadie puede crear cuentas por su cuenta.
   - Recomendado: desactiva *Confirm email*. Así la persona invitada entra directo al panel; si lo dejas activado, primero tendrá que confirmar su correo.
4. Para dar acceso a otra persona, usa la pestaña **Accesos** del panel: crea el enlace y envíaselo por WhatsApp. Ya no hace falta crear usuarios a mano: una vez que existe un admin, *Add user* desde Supabase también se rechaza (créalos con invitación).
5. Entra a `http://localhost:3000/admin`, inicia sesión y prueba **Generar datos de ejemplo**.

## 3. Subir el código a GitHub (cuenta ChenteIA)

El repositorio es `ChenteIA/Web_de_venta`. Si empiezas desde cero en otra carpeta:

```bash
git init
git add .
git commit -m "San Luyo: web pública + panel"
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
5. En Supabase → **Authentication → URL Configuration** pon tu dominio de Vercel como *Site URL* (por ejemplo `https://san-luyo.vercel.app`).

> Si cambias una variable `NEXT_PUBLIC_*` en Vercel, vuelve a desplegar: esas variables se fijan en el build.

## Seguridad

- **Lo que se ve con F12 es público a propósito:** la URL de Supabase, la *publishable key* y el número de WhatsApp. Esa clave solo permite lo que dejan las políticas RLS de `schema.sql`: leer productos y reseñas visibles, y registrar clics. Todo lo demás (ventas, clics, precios, fotos, invitaciones) exige una sesión de admin. **Nunca** pongas la *secret key* ni la *service_role* en `.env.local` ni en Vercel: la web no las necesita.
- **Freno de clics:** la web pública puede registrar como máximo 60 clics por minuto (trigger `clicks_throttle`); el resto se rechaza con 429. El admin no tiene límite.
- **Cabeceras (`next.config.ts`):** política de contenido (CSP) que solo permite scripts, estilos, fuentes y videos propios y conexiones a Supabase; `X-Frame-Options: DENY` (nadie puede meter la web dentro de otra página), `nosniff`, `Referrer-Policy` y `Permissions-Policy`.
- **Cuentas:** solo se crean con un enlace de invitación (trigger `on_auth_user_invited`). En Supabase → Authentication → Sign In / Providers → Email, pon *Minimum password length* en 8.
- **Repositorio:** no contiene claves (`.env*` está en `.gitignore`; solo se sube `.env.example`).

## Iconos

Los iconos de interfaz salen de [Reicon](https://github.com/dqev/reicon) (licencia MIT; basados en Solar Icons de 480 Design, CC BY 4.0). Solo se copian los que se usan, así la web no carga los 2 700:

```bash
git clone --depth 1 https://github.com/dqev/reicon /tmp/reicon
# agrega el nombre del icono a ICONS en scripts/reicon-icons.mjs (búscalo en https://reicon.dev/icons)
node scripts/reicon-icons.mjs /tmp/reicon
```

Uso: `<Icon name="calendar" />`. Toma el color del texto. La botella y los maníes son ilustraciones SVG propias (`components/Art.tsx`), porque Reicon no tiene esos dibujos.

## Notas

- **Hora de Lima:** la fecha, el día y la hora de cada clic los calcula la base de datos (trigger), no el navegador. Un visitante no puede falsearlos ni marcar clics como vendidos.
- **Reseñas:** el bucket es privado. La web solo puede leer las imágenes de reseñas **visibles** (se sirven con URL firmada), y al ocultar una deja de verse al instante. Antes de subirlas, el panel las reduce a WebP de 1080 px. No subas capturas inventadas y tapa el número del cliente.
- **Ventas:** registrar una venta desde un clic lo marca como vendido, y eliminarla lo desmarca (trigger). Un clic solo admite una venta.
- **Datos de ejemplo:** se guardan con `demo = true` y se borran con un botón sin tocar los datos reales.
- **Preventa:** `LAUNCH` en `lib/site.ts` (lunes 19 de octubre de 2026). Antes de ese día la web está en preventa: aviso "Preventa · Entregas desde el lunes 19", botones "Separar mi botella" y mensaje de WhatsApp para separar. Desde ese día pasa sola a venta normal ("Pedir por WhatsApp").
- **Productos y precios:** se editan en `/admin` → Productos. Precios de lanzamiento: medio litro S/ 3 y 1 litro S/ 6; en una base ya creada se cargan con `supabase/precios-2026-10.sql`. Si dos productos tienen el mismo nombre, la web y el panel los distinguen por el tamaño de la presentación. Si actualizas desde una versión anterior, vuelve a ejecutar `supabase/schema.sql` en el SQL Editor: agrega la tabla `products` y el bucket `productos` sin tocar tus datos. Si la base no responde, la web usa la lista de respaldo de `lib/site.ts`.
- **Videos:** los originales editables están en `videos/san-luyo-web/` (presentación de la web) y `videos/san-luyo-como-pedir/` (el de la sección Cómo pedir). La demo anterior (El Puqui) se quitó del repositorio; queda en el historial de git.
