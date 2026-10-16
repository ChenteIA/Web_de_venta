import CopyButton from '@/components/CopyButton';
import Header from '@/components/Header';
import ReviewsGallery, { type PublicReview } from '@/components/ReviewsGallery';
import WaLink from '@/components/WaLink';
import Reveal from '@/components/Reveal';
import WaTracker from '@/components/WaTracker';
import OrderPicker from '@/components/OrderPicker';
import StageSync from '@/components/StageSync';
import { IMAGES, largest, srcSet, type ImgSet } from '@/lib/images';
import { BUSINESS, isPresale, LAUNCH, PRODUCTS, prodName, waDisplay, waHref } from '@/lib/site';
import { hasSupabase, REVIEWS_BUCKET } from '@/lib/supabase/config';
import { supabaseAnon } from '@/lib/supabase/server';
import { dayShort } from '@/lib/time';

// Las reseñas cambian desde el panel: se leen en cada visita.
export const dynamic = 'force-dynamic';

async function loadReviews(): Promise<PublicReview[]> {
  if (!hasSupabase) return [];
  try {
    const sb = supabaseAnon();
    const { data, error } = await sb
      .from('reviews')
      .select('id, image_path, customer, product, day')
      .eq('visible', true)
      .order('ts', { ascending: false })
      .limit(60);
    if (error || !data?.length) return [];
    const { data: signed } = await sb.storage.from(REVIEWS_BUCKET).createSignedUrls(data.map((r) => r.image_path), 60 * 60 * 6);
    const urls = new Map((signed || []).map((s) => [s.path, s.signedUrl]));
    return data
      .filter((r) => urls.get(r.image_path))
      .map((r) => ({
        id: r.id,
        url: urls.get(r.image_path) as string,
        who: r.customer || 'Cliente',
        caption: (r.product && r.product !== 'general' ? ', ' + prodName(r.product) : '') + (r.day ? ', ' + dayShort(r.day) : ''),
      }));
  } catch {
    return [];
  }
}

function Photo({ set, alt, sizes, className, eager }: { set: ImgSet | null | undefined; alt: string; sizes: string; className?: string; eager?: boolean }) {
  if (!set) return null;
  return (
    <img
      className={className}
      src={largest(set)}
      srcSet={srcSet(set)}
      sizes={sizes}
      width={set.width}
      height={set.height}
      alt={alt}
      loading={eager ? undefined : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
    />
  );
}

// Franja de toldo: barras rojas y de papel, hechas con bloques (sin degradados).
const STRIPES = Array.from({ length: 40 });

export default async function Home() {
  const reviews = await loadReviews();
  const soon = isPresale();
  const chicha = PRODUCTS[0];
  const fotoChicha = IMAGES.products[chicha.id];
  const portada = IMAGES.portada;
  const ancha = IMAGES.portadaAncha;
  const logo = IMAGES.logo;

  return (
    <>
      <Header>
        <a href="#chicha">La chicha</a>
        <a href="#como-pedir">Cómo pedir</a>
        <a href="#contacto">Contacto</a>
      </Header>

      <main id="pub" className="sl">
        <div className="split">
          {/* La foto que no se mueve: cambia con un fundido lento según la sección que se lee */}
          <div className="stage">
            <div className="stage-frame">
              <div className="layer on" data-layer="0"><Photo set={portada} alt={`Dos botellas y un vaso de chicha de maní ${BUSINESS.name} con maníes`} sizes="(min-width: 961px) 50vw, 100vw" eager /></div>
              <div className="layer" data-layer="1"><Photo set={fotoChicha} alt="Botella de chicha de maní de medio litro junto a un vaso servido" sizes="(min-width: 961px) 50vw, 100vw" /></div>
              <div className="layer" data-layer="2"><Photo set={ancha} alt="Botellas de chicha de maní, un vaso y maníes tostados sobre una mesa de madera" sizes="(min-width: 961px) 50vw, 100vw" /></div>
            </div>
          </div>

          <div className="reading">
            <section className="card-hero" data-stage="0" aria-labelledby="h-hero">
              <div className="awning" aria-hidden="true">{STRIPES.map((_, i) => <i key={i} />)}</div>
              <div className="card-body">
                {logo && <img className="card-logo" src={largest(logo)} width={96} height={96} alt={`Logo de ${BUSINESS.name}`} />}
                <h1 id="h-hero">Chicha de maní, hecha en Ica.</h1>
                <p className="lead">
                  {soon
                    ? `Preventa abierta: separa tus botellas hoy y te las entregamos desde ${LAUNCH.label}.`
                    : 'Botellas de medio litro, hechas en casa con maní tostado. Pídela por WhatsApp y coordinamos la entrega.'}
                </p>
                <WaLink product="general" place="portada">{soon ? 'Separar mi botella' : 'Pedir por WhatsApp'}</WaLink>
                <nav className="card-links" aria-label="En esta página">
                  <a href="#chicha">La chicha</a>
                  <a href="#como-pedir">Cómo pedir</a>
                  <a href="#contacto">Contacto</a>
                </nav>
              </div>
            </section>

            <section className="plate" id="chicha" data-stage="1" aria-labelledby="h-chicha">
              <div className="plate-photo" data-reveal="">
                <Photo set={fotoChicha} alt="Botella de chicha de maní con etiqueta de papel y un vaso servido" sizes="(min-width: 961px) 40vw, 92vw" />
              </div>
              <div className="plate-text">
                <h2 id="h-chicha" data-reveal="" style={{ '--i': 1 } as React.CSSProperties}>{chicha.name}</h2>
                <p className="price" data-reveal="" style={{ '--i': 2 } as React.CSSProperties}><b className="num">S/ {chicha.price}</b> la {chicha.unit}</p>
                <p className="desc" data-reveal="" style={{ '--i': 3 } as React.CSSProperties}>{chicha.desc}</p>
                <div data-reveal="" style={{ '--i': 4 } as React.CSSProperties}>
                  <OrderPicker productId={chicha.id} price={chicha.price} presale={soon} />
                </div>
              </div>
            </section>

            <section className="itinerary" id="como-pedir" data-stage="2" aria-labelledby="h-como">
              <div className="itin-head">
                <h2 id="h-como" data-reveal="">Cómo pedir</h2>
                <p data-reveal="" style={{ '--i': 1 } as React.CSSProperties}>
                  {soon
                    ? `Separas hoy, confirmamos por WhatsApp y desde ${LAUNCH.label} te la llevamos.`
                    : 'Nos escribes, confirmamos por WhatsApp y al día siguiente te la llevamos.'}
                </p>
              </div>
              <div className="slip" data-reveal="" style={{ '--i': 2 } as React.CSSProperties}>
                <h3>Hoy</h3>
                <ul>
                  <li><span>Eliges cuántas botellas</span><i aria-hidden="true" /><span>en la web</span></li>
                  <li><span>Nos escribes por WhatsApp</span><i aria-hidden="true" /><span>a cualquier hora</span></li>
                </ul>
                <h3>Al confirmar</h3>
                <ul>
                  <li><span>Te respondemos con la disponibilidad</span><i aria-hidden="true" /><span>por WhatsApp</span></li>
                  <li><span>Pagas</span><i aria-hidden="true" /><span>Yape, Plin o efectivo</span></li>
                </ul>
                <h3>{soon ? `Desde ${LAUNCH.label}` : 'Al día siguiente'}</h3>
                <ul>
                  <li><span>Recojo o delivery en Ica</span><i aria-hidden="true" /><span>a la hora acordada</span></li>
                </ul>
                <p className="slip-total"><span>Tu chicha, bien helada</span><span>{soon ? `desde ${LAUNCH.short}` : 'en un día'}</span></p>
              </div>
            </section>

            <section className="words" id="resenas" data-stage="0" aria-labelledby="h-resenas">
              <h2 id="h-resenas" data-reveal="">Lo que nos escriben</h2>
              {reviews.length ? (
                <>
                  <p data-reveal="" style={{ '--i': 1 } as React.CSSProperties}>
                    {reviews.length === 1 ? 'Un cliente nos escribió' : `${reviews.length} clientes nos escribieron`} para contarnos qué tal les fue. Toca una captura para verla completa.
                  </p>
                  <ReviewsGallery reviews={reviews} />
                </>
              ) : (
                <p data-reveal="" style={{ '--i': 1 } as React.CSSProperties}>
                  Aquí publicaremos capturas reales de los mensajes de nuestros clientes. Si ya probaste la chicha, cuéntanos qué tal por WhatsApp.
                </p>
              )}
            </section>
          </div>
        </div>

        <section className="contact" id="contacto" aria-labelledby="h-contacto">
          <h2 id="h-contacto" className="contact-say" data-reveal="">Escríbenos por WhatsApp para separar, preguntar o coordinar tu entrega.</h2>
          <a className="contact-number num" data-wa="" data-product="general" data-place="flotante" target="_blank" rel="noopener" href={waHref('general')} data-reveal="" style={{ '--i': 1 } as React.CSSProperties}>
            {waDisplay()}
          </a>
          <div className="contact-foot" data-reveal="" style={{ '--i': 2 } as React.CSSProperties}>
            <p>{BUSINESS.address} · Recojo o delivery en la ciudad</p>
            <div className="copy-row"><span>Atendemos 24/7 · Yape, Plin o efectivo</span><CopyButton text={waDisplay()} /></div>
          </div>
        </section>

        <footer className="final">
          <Photo set={ancha} alt="" sizes="100vw" className="final-photo" />
          <div className="final-top" data-reveal="">
            <nav aria-label="Pie de página">
              <a href="#chicha">La chicha</a>
              <a href="#como-pedir">Cómo pedir</a>
              <a href="#resenas">Reseñas</a>
            </nav>
            <p>{BUSINESS.tagline}<br />{BUSINESS.hours}</p>
          </div>
          <div className="final-bottom" data-reveal="" style={{ '--i': 1 } as React.CSSProperties}>
            <p className="wordmark">{BUSINESS.name}</p>
            <p className="legal">© 2026 {BUSINESS.name} · Web hecha por ChenteIA</p>
          </div>
        </footer>

        <WaLink product="general" place="flotante" className="btn btn-wa fab" label="Escríbenos por WhatsApp"><span>Escríbenos</span></WaLink>
      </main>
      <WaTracker />
      <Reveal />
      <StageSync />
    </>
  );
}
