import CopyButton from '@/components/CopyButton';
import Header from '@/components/Header';
import ReviewsGallery, { type PublicReview } from '@/components/ReviewsGallery';
import WaLink from '@/components/WaLink';
import Reveal from '@/components/Reveal';
import WaTracker from '@/components/WaTracker';
import OrderPicker from '@/components/OrderPicker';
import StageSync from '@/components/StageSync';
import { IMAGES, largest, srcSet, type ImgSet } from '@/lib/images';
import { productPhoto, type ProductPhoto } from '@/lib/products';
import { loadProducts } from '@/lib/products-server';
import { BUSINESS, isPresale, LAUNCH, prodName, productLabel, productSize, soles, unitParts, waDisplay, waHref, type Product } from '@/lib/site';
import { BottleArt } from '@/components/Art';
import { hasSupabase, REVIEWS_BUCKET } from '@/lib/supabase/config';
import { supabaseAnon } from '@/lib/supabase/server';
import { dayShort } from '@/lib/time';

// Las reseñas cambian desde el panel: se leen en cada visita.
export const dynamic = 'force-dynamic';

async function loadReviews(products: Product[]): Promise<PublicReview[]> {
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
        caption: (r.product && r.product !== 'general' ? ', ' + prodName(r.product, products) : '') + (r.day ? ', ' + dayShort(r.day) : ''),
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

// Foto de un producto: la subida desde el panel (URL pública) o la optimizada en el build.
function ProductImg({ photo, alt, sizes, className }: { photo: ProductPhoto | null; alt: string; sizes: string; className?: string }) {
  if (!photo) return null;
  return <img className={className} src={photo.src} srcSet={photo.srcSet} sizes={photo.srcSet ? sizes : undefined} width={photo.width} height={photo.height} alt={alt} loading="lazy" decoding="async" />;
}

// Franja de toldo: barras rojas y de papel, hechas con bloques (sin degradados).
const STRIPES = Array.from({ length: 72 });

export default async function Home() {
  const products = await loadProducts();
  const reviews = await loadReviews(products);
  const soon = isPresale();
  const navLabel = products.length === 1 ? 'La chicha' : 'Productos';
  // "500 ml o de 1 litro" y "(desde S/ 3)" para la portada, a partir de la carta real.
  const sizeList = [...new Set(products.map((p) => unitParts(p.unit || '').detail).filter(Boolean))];
  const sizes = sizeList.length > 1 ? `${sizeList.slice(0, -1).join(', ')} o de ${sizeList[sizeList.length - 1]}` : sizeList[0] || '';
  const fromPrice = products.length ? ` (desde ${soles(Math.min(...products.map((p) => p.price)))})` : '';
  const portada = IMAGES.portada;
  const ancha = IMAGES.portadaAncha;
  const logo = IMAGES.logo;

  return (
    <>
      <Header>
        <a href="#chicha">{navLabel}</a>
        <a href="#como-pedir">Cómo pedir</a>
        <a href="#contacto">Contacto</a>
      </Header>

      <main id="pub" className="sl">
        <div className="split">
          {/* La foto que no se mueve: cambia con un fundido lento según la sección que se lee */}
          <div className="stage">
            <div className="stage-frame">
              <div className="layer on" data-layer="portada"><Photo set={portada} alt={`Dos botellas y un vaso de chicha de maní ${BUSINESS.name} con maníes`} sizes="(min-width: 760px) 50vw, 100vw" eager /></div>
              {/* Una capa por producto: al llegar a cada tarjeta se ve la foto de ese producto */}
              {products.map((p) => {
                const ph = productPhoto(p);
                return <div className="layer" data-layer={`p-${p.id}`} key={p.id}>{ph ? <ProductImg photo={ph} alt={productLabel(p, products)} sizes="(min-width: 760px) 50vw, 100vw" /> : <div className="layer-art"><BottleArt /></div>}</div>;
              })}
              <div className="layer" data-layer="ancha"><Photo set={ancha} alt="Botellas de chicha de maní, un vaso y maníes tostados sobre una mesa de madera" sizes="(min-width: 760px) 50vw, 100vw" /></div>
            </div>
          </div>

          <div className="reading">
            <section className="card-hero" data-stage="portada" aria-labelledby="h-hero">
              <div className="awning" aria-hidden="true">{STRIPES.map((_, i) => <i key={i} />)}</div>
              <div className="card-body">
                {logo && <img className="card-logo" src={largest(logo)} width={96} height={96} alt={`Logo de ${BUSINESS.name}`} />}
                <h1 id="h-hero">Chicha de maní, hecha en Ica.</h1>
                <p className="lead">
                  {soon
                    ? `Preventa abierta: separa tus botellas hoy${fromPrice} y te las entregamos desde ${LAUNCH.label}.`
                    : `Hecha en casa con maní tostado${sizes ? `, en botella de ${sizes}` : ''}. Pídela por WhatsApp y coordinamos la entrega.`}
                </p>
                <WaLink product="general" place="portada">{soon ? 'Separar mi botella' : 'Pedir por WhatsApp'}</WaLink>
                <nav className="card-links" aria-label="En esta página">
                  <a href="#chicha">{navLabel}</a>
                  <a href="#como-pedir">Cómo pedir</a>
                  <a href="#contacto">Contacto</a>
                </nav>
              </div>
            </section>

            <div id="chicha" className="products">
              {products.length ? products.map((p) => {
                const u = unitParts(p.unit || 'unidad');
                return (
                  <section className="plate" key={p.id} data-stage={`p-${p.id}`} aria-labelledby={`h-${p.id}`}>
                    <div className="plate-photo" data-reveal="">
                      {productPhoto(p) ? <ProductImg photo={productPhoto(p)} alt={productLabel(p, products)} sizes="(min-width: 760px) 40vw, 92vw" /> : <BottleArt />}
                    </div>
                    <div className="plate-text">
                      <h2 id={`h-${p.id}`} data-reveal="" style={{ '--i': 1 } as React.CSSProperties}>{p.name}{productSize(p, products) && <> <span className="h-size">{productSize(p, products)}</span></>}</h2>
                      <p className="price" data-reveal="" style={{ '--i': 2 } as React.CSSProperties}><b className="num">{soles(p.price)}</b>{p.unit ? ` ${u.fem ? 'la' : 'el'} ${p.unit}` : ''}</p>
                      {p.description && <p className="desc" data-reveal="" style={{ '--i': 3 } as React.CSSProperties}>{p.description}</p>}
                      <div data-reveal="" style={{ '--i': 4 } as React.CSSProperties}>
                        <OrderPicker product={p} presale={soon} label={productLabel(p, products)} />
                      </div>
                    </div>
                    
                  </section>
                );
              }) : (
                <section className="plate" data-stage="ancha">
                  <div className="plate-text">
                    <h2>Pronto, nuevos productos</h2>
                    <p className="desc">Escríbenos por WhatsApp y te contamos qué tenemos hoy.</p>
                  </div>
                </section>
              )}
            </div>

            <section className="itinerary" id="como-pedir" data-stage="ancha" aria-labelledby="h-como">
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

            <section className="words" id="resenas" data-stage="portada" aria-labelledby="h-resenas">
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
          <div className="awning awning-thin" aria-hidden="true">{STRIPES.map((_, i) => <i key={i} />)}</div>
          <div className="contact-inner">
            <div className="contact-head">
              <h2 id="h-contacto" data-reveal="">Escríbenos por WhatsApp</h2>
              <p data-reveal="" style={{ '--i': 1 } as React.CSSProperties}>
                {soon ? 'Para separar tu botella, preguntar algo o coordinar la entrega.' : 'Para pedir, preguntar algo o coordinar la entrega.'}
              </p>
            </div>
            <a className="contact-number num" data-wa="" data-product="general" data-place="flotante" target="_blank" rel="noopener" href={waHref('general')} aria-label={`Abrir WhatsApp con el ${waDisplay()}`} data-reveal="" style={{ '--i': 2 } as React.CSSProperties}>
              {waDisplay()}
            </a>
            <div className="contact-actions" data-reveal="" style={{ '--i': 3 } as React.CSSProperties}>
              <WaLink product="general" place="flotante">Abrir WhatsApp</WaLink>
              <CopyButton text={waDisplay()} label="Copiar número" />
            </div>
            <dl className="contact-facts">
              <div data-reveal="" style={{ '--i': 1 } as React.CSSProperties}><dt>Dónde</dt><dd>{BUSINESS.address}. Recojo o delivery en la ciudad.</dd></div>
              <div data-reveal="" style={{ '--i': 2 } as React.CSSProperties}><dt>Horario</dt><dd>Atendemos 24/7, todos los días.</dd></div>
              <div data-reveal="" style={{ '--i': 3 } as React.CSSProperties}><dt>Pago</dt><dd>Yape, Plin o efectivo.</dd></div>
            </dl>
          </div>
        </section>

        <footer className="final">
          <Photo set={IMAGES.cierre || ancha} alt={IMAGES.cierre ? "El oasis de Huacachina, rodeado de dunas, en Ica" : ""} sizes="100vw" className="final-photo" />
          <div className="final-top" data-reveal="">
            <nav aria-label="Pie de página">
              <a href="#chicha">{navLabel}</a>
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
