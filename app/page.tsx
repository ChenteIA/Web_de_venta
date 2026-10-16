import { BottleArt, PeanutsArt, ProductIcon } from '@/components/Art';
import CopyButton from '@/components/CopyButton';
import Header from '@/components/Header';
import ReviewsGallery, { type PublicReview } from '@/components/ReviewsGallery';
import WaLink from '@/components/WaLink';
import Reveal from '@/components/Reveal';
import WaTracker from '@/components/WaTracker';
import Icon from '@/components/icons';
import { IMAGES, largest, srcSet } from '@/lib/images';
import { BUSINESS, LAUNCH, PRODUCTS, prodName, waDisplay } from '@/lib/site';
import { hasSupabase, REVIEWS_BUCKET } from '@/lib/supabase/config';
import { supabaseAnon } from '@/lib/supabase/server';
import { dayShort, today } from '@/lib/time';

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

export default async function Home() {
  const reviews = await loadReviews();
  const portada = IMAGES.portada;
  const ancha = IMAGES.portadaAncha;
  const soon = today() < LAUNCH.day;

  const heroText = (
    <>
      {soon && <p className="launch">Empezamos {LAUNCH.label}. Ya puedes separar tu botella.</p>}
      <h1>Chicha de maní casera, hecha en Ica.</h1>
      <p className="lede">Botellas de medio litro, preparadas en casa en tandas pequeñas. Tócale al botón y coordinamos tu pedido por WhatsApp.</p>
      <div className="actions">
        <WaLink product="general" place="portada">Pedir por WhatsApp</WaLink>
        <a className="btn btn-ghost" href="#carta">Ver la chicha</a>
      </div>
    </>
  );
  const heroFacts = (
    <div className="facts">
      <div><Icon name="calendar" className="fi" /><b>Pide con un día de anticipación</b><span>Así te la tenemos fresca.</span></div>
      <div><Icon name="truck" className="fi" /><b>Recojo o delivery</b><span>En la ciudad de Ica.</span></div>
      <div><Icon name="clock" className="fi" /><b>Atendemos 24/7</b><span>Escríbenos a cualquier hora.</span></div>
      <div><Icon name="wallet" className="fi" /><b>Pago al confirmar</b><span>Yape, Plin o efectivo.</span></div>
    </div>
  );

  return (
    <>
      <Header>
        <a href="#carta">La chicha</a>
        <a href="#como-pedir">Cómo pedir</a>
        <a href="#resenas">Reseñas</a>
      </Header>

      <main id="pub">
        {portada || ancha ? (
          /* Portada fotográfica: la foto a todo lo ancho con el texto encima.
             Computadora: portada-ancha.jpg (horizontal). Celular: portada.jpg (vertical). */
          <section className="hero hero-wide">
            <div className="hero-stage">
              <div className="hero-photo">
                {/* Una sola imagen: el navegador descarga solo la versión que muestra */}
                <picture>
                  {ancha && portada && <source media="(min-width: 821px)" srcSet={srcSet(ancha)} sizes="100vw" width={ancha.width} height={ancha.height} />}
                  <img
                    src={largest((portada || ancha)!)}
                    srcSet={srcSet((portada || ancha)!)}
                    sizes="100vw"
                    width={(portada || ancha)!.width}
                    height={(portada || ancha)!.height}
                    alt={`Chicha de maní ${BUSINESS.name}`}
                    fetchPriority="high"
                  />
                </picture>
              </div>
              <div className="wrap hero-copy">
                {heroText}
              </div>
            </div>
            <div className="wrap hero-facts">{heroFacts}</div>
          </section>
        ) : (
          <section className="hero">
            <div className="wrap">
              <div>
                {heroText}
                {heroFacts}
              </div>
              <div className="pie-art" role="img" aria-label="Ilustración de una botella de chicha de maní con un vaso servido"><BottleArt /></div>
            </div>
          </section>
        )}

        <section className="band alt" id="carta">
          <div className="wrap">
            <div className="sec-head" data-reveal="">
              <h2>Nuestra chicha</h2>
              <p>Precio en soles. El botón abre WhatsApp con tu pedido ya escrito: solo pon cuántas botellas quieres.</p>
            </div>
            <div className={PRODUCTS.length === 1 ? 'menu single' : 'menu'}>
              {PRODUCTS.map((p, idx) => {
                const photo = IMAGES.products[p.id];
                return (
                  <article className="item" key={p.id} data-reveal="" style={{ '--i': idx % 3 } as React.CSSProperties}>
                    {photo ? (
                      <div className="art photo">
                        <img src={largest(photo)} srcSet={srcSet(photo)} sizes="(max-width: 700px) 92vw, 380px" width={photo.width} height={photo.height} alt={p.name} loading="lazy" decoding="async" />
                      </div>
                    ) : (
                      <div className="art"><ProductIcon kind={p.icon} /></div>
                    )}
                    <div className="body">
                      <h3>{p.name}</h3>
                      <div className="price"><b className="num">S/ {p.price}</b><span>{p.unit}</span></div>
                      <p>{p.desc}</p>
                      <WaLink product={p.id} place="carta">Pedir por WhatsApp</WaLink>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="band" id="como-pedir">
          <div className="wrap">
            <div className="sec-head" data-reveal=""><h2>Cómo pedir</h2></div>
            <ol className="steps">
              <li data-reveal="" style={{ '--i': 0 } as React.CSSProperties}><span className="n">1</span><b>Elige y toca el botón</b><span>Se abre WhatsApp con la chicha y el precio. Solo agrega cuántas botellas quieres y para cuándo.</span></li>
              <li data-reveal="" style={{ '--i': 1 } as React.CSSProperties}><span className="n">2</span><b>Confirmamos y pagas</b><span>Te respondemos con la disponibilidad. Pagas con Yape, Plin o en efectivo al recoger.</span></li>
              <li data-reveal="" style={{ '--i': 2 } as React.CSSProperties}><span className="n">3</span><b>Recoges o te lo llevamos</b><span>Recojo en el local o delivery en Ica, a la hora que acordemos.</span></li>
            </ol>
          </div>
        </section>

        <section className="band alt" id="resenas">
          <div className="wrap">
            <div className="sec-head" data-reveal="">
              <h2>Lo que nos escriben</h2>
              {reviews.length ? (
                <p>
                  <span className="review-count">{reviews.length}{reviews.length === 1 ? ' cliente nos escribió' : ' clientes nos escribieron'}</span> para contarnos qué tal les fue. Toca una captura para verla completa.
                </p>
              ) : (
                <p>Capturas reales de los mensajes que nos mandan nuestros clientes por WhatsApp.</p>
              )}
            </div>
            {reviews.length ? (
              <ReviewsGallery reviews={reviews} />
            ) : (
              <div className="empty" data-reveal=""><b>Pronto compartiremos lo que nos escriben</b><span>Si ya probaste nuestra chicha, cuéntanos qué tal por WhatsApp.</span></div>
            )}
          </div>
        </section>

        <footer className="site">
          <div className="foot-art" aria-hidden="true"><PeanutsArt /></div>
          <div className="wrap">
            <div><b>{BUSINESS.name}</b><p>{BUSINESS.tagline}</p></div>
            <div><h3><Icon name="map-point" />Dónde estamos</h3><p>{BUSINESS.address}</p></div>
            <div><h3><Icon name="clock" />Horario</h3><p>{BUSINESS.hours}</p></div>
            <div><h3><Icon name="whatsapp" />WhatsApp</h3><div className="copy-row"><span className="num">{waDisplay()}</span><CopyButton text={waDisplay()} /></div></div>
            <p className="credit">Web hecha por ChenteIA</p>
          </div>
        </footer>

        <WaLink product="general" place="flotante" className="btn btn-wa fab" label="Escríbenos por WhatsApp"><span>Escríbenos</span></WaLink>
      </main>
      <WaTracker />
      <Reveal />
    </>
  );
}
