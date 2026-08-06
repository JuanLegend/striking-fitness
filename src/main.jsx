import React, { createContext, lazy, Suspense, useContext, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const CombatExperience = lazy(() => import('./CombatExperience.jsx'));
const LocationsMap = lazy(() => import('./LocationsMap.jsx'));

const RouterContext = createContext(null);
const basePath = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '');

function withBase(path) {
  return `${basePath}${path}`;
}

function BrowserRouter({ children }) {
  const getPathname = () => {
    const current = window.location.pathname;
    return basePath && current.startsWith(basePath) ? current.slice(basePath.length) || '/' : current;
  };
  const [pathname, setPathname] = useState(getPathname);
  useEffect(() => {
    const onPopState = () => setPathname(getPathname());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  const navigate = (path) => {
    if (path === pathname) return;
    window.history.pushState({}, '', withBase(path));
    setPathname(path);
  };
  return <RouterContext.Provider value={{ pathname, navigate }}>{children}</RouterContext.Provider>;
}

function useLocation() {
  const { pathname } = useContext(RouterContext);
  return { pathname };
}

function usePageMeta({ title, description, canonical, robots = 'index,follow' }) {
  useEffect(() => {
    document.title = title;

    const setMeta = (selector, attribute, value) => {
      let tag = document.head.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        const [name, key] = attribute;
        tag.setAttribute(name, key);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', value);
    };

    setMeta('meta[name="description"]', ['name', 'description'], description);
    setMeta('meta[name="robots"]', ['name', 'robots'], robots);
    setMeta('meta[property="og:title"]', ['property', 'og:title'], title);
    setMeta('meta[property="og:description"]', ['property', 'og:description'], description);
    setMeta('meta[property="og:url"]', ['property', 'og:url'], canonical);
    setMeta('meta[name="twitter:title"]', ['name', 'twitter:title'], title);
    setMeta('meta[name="twitter:description"]', ['name', 'twitter:description'], description);

    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', canonical);
  }, [title, description, canonical]);
}

function Link({ to, children, className = '', onClick, ...props }) {
  const { navigate } = useContext(RouterContext);
  const handleClick = (event) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(to);
  };
  return <a href={withBase(to)} className={className} onClick={handleClick} {...props}>{children}</a>;
}

function NavLink({ to, end = false, children, className }) {
  const { pathname } = useContext(RouterContext);
  const isActive = end ? pathname === to : pathname.startsWith(to);
  const resolvedClass = typeof className === 'function' ? className({ isActive }) : className;
  return <Link to={to} className={resolvedClass} aria-current={isActive ? 'page' : undefined}>{children}</Link>;
}

const navLinks = [
  { label: 'Inicio', path: '/' },
  { label: 'Boxeo', path: '/boxeo' },
  { label: 'Brazilian Jiu Jitsu', short: 'BJJ', path: '/brazilian-jiu-jitsu' },
  { label: 'Kick Boxing', path: '/kick-boxing' },
  { label: 'MMA', path: '/mma' },
  { label: 'Próximos eventos', short: 'Eventos', path: '/eventos' },
  { label: 'Sedes y contacto', short: 'Contacto', path: '/sedes-contacto' },
];

const disciplines = [
  { number: '01', name: 'Boxeo', path: '/boxeo', color: '#5d89bd', line: 'Técnica · potencia · estrategia' },
  { number: '02', name: 'Brazilian Jiu Jitsu', path: '/brazilian-jiu-jitsu', color: '#5a78ff', line: 'Control · paciencia · precisión' },
  { number: '03', name: 'Kick Boxing', path: '/kick-boxing', color: '#ff5a36', line: 'Ritmo · coordinación · resistencia' },
  { number: '04', name: 'MMA', path: '/mma', color: '#bd8cff', line: 'Striking · derribos · ground game' },
];

const certifications = [
  'Potencia y fuerza',
  'Deportes de combate',
  'PNL y psicología deportiva de combate',
  'WMA Boxeo México · Deportes de contacto',
  'WBC · Nutrición y peso',
];

const achievementHighlights = [
  { value: '2', label: 'Campeones departamentales' },
  { value: 'ORO', label: 'WBC internacional' },
  { value: '22–23', label: 'Mejor entrenador de Colombia' },
];

const achievementDetails = [
  '1 campeón nacional',
  '1 plata nacional',
  '1 bronce nacional',
  '1 participación en Arabia Saudita',
];

function Arrow({ diagonal = false }) {
  return <span className="arrow" aria-hidden="true">{diagonal ? '↗' : '→'}</span>;
}

function Logo() {
  return (
    <Link className="logo" to="/" aria-label="Striking Fitness, inicio">
      <img
        src={withBase('/brand/striking-fitness-logo-white.png')}
        alt="Striking Fitness"
        width="2560"
        height="1116"
      />
    </Link>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header className="site-header">
      <Logo />
      <button className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="site-navigation">
        <span>{open ? 'Cerrar' : 'Menú'}</span><i aria-hidden="true">{open ? '×' : '＋'}</i>
      </button>
      <nav id="site-navigation" className={open ? 'site-nav is-open' : 'site-nav'} aria-label="Navegación principal">
        {navLinks.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'} className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="nav-long">{item.label}</span><span className="nav-short">{item.short || item.label}</span>
          </NavLink>
        ))}
      </nav>
      <a className="header-call" href="tel:+573188594270" aria-label="318 859 4270"><span>318 859 4270</span><Arrow diagonal /></a>
    </header>
  );
}

function Layout({ children }) {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const elements = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.13 });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [location.pathname]);
  return <><a className="skip-link" href="#main-content">Saltar al contenido</a><Header />{children}<Footer /></>;
}

function HomeHero() {
  return (
    <section className="home-hero page-pad" id="inicio">
      <div className="hero-lines" aria-hidden="true" />
      <div className="home-hero-copy" data-reveal>
        <p className="kicker"><span /> Desde 2014 · Cali, Colombia</p>
        <h1><span>Academia de boxeo,</span><br />kick boxing, Brazilian Jiu Jitsu<br />y artes marciales mixtas.</h1>
        <p className="hero-statement">Somos los mejores de Colombia<br />y orgullosamente de Cali.</p>
        <div className="hero-ctas">
          <Link className="button button-acid" to="/sedes-contacto">Agenda tu clase <Arrow /></Link>
          <a className="underlink" href="#disciplinas">Conoce las disciplinas <Arrow diagonal /></a>
        </div>
      </div>

      <figure className="hero-photo" data-reveal>
        <div className="photo-frame">
          <picture>
            <source srcSet={withBase('/images/julian-mike-tyson.webp')} type="image/webp" />
            <img src={withBase('/images/julian-mike-tyson.png')} alt="Julián Martínez junto a Mike Tyson en un ring de boxeo" width="800" height="788" fetchPriority="high" decoding="async" />
          </picture>
        </div>
        <figcaption><span>Julián Martínez</span><span>Experiencia internacional</span></figcaption>
      </figure>

      <div className="hero-bottom">
        <span>Boxeo</span><i>✦</i><span>BJJ</span><i>✦</i><span>Kick Boxing</span><i>✦</i><span>MMA</span>
      </div>
    </section>
  );
}

function CombatScroll() {
  const sectionRef = useRef(null);
  const [webgl, setWebgl] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      setWebgl(Boolean(canvas.getContext('webgl2')));
    } catch {
      setWebgl(false);
    }
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setSceneReady(true);
        observer.disconnect();
      }
    }, { rootMargin: '100px 0px' });
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="combat-visual" ref={sectionRef} aria-label="Animación tridimensional de guantes de boxeo y cinturón de Brazilian Jiu Jitsu">
      <div className="combat-visual-sticky">
        <div className="combat-canvas" aria-hidden="true">
          {webgl && sceneReady ? (
            <Suspense fallback={<div className="combat-fallback"><span>SF</span></div>}>
              <CombatExperience sectionRef={sectionRef} />
            </Suspense>
          ) : <div className="combat-fallback"><span>SF</span></div>}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="about page-pad" id="nosotros">
      <div className="section-intro" data-reveal>
        <p className="kicker dark"><span /> Somos Striking Fitness</p>
        <p className="section-index">01 / Nuestra historia</p>
        <h2>Cuna de<br /><em>campeones.</em></h2>
      </div>

      <div className="about-copy" data-reveal>
        <p className="about-lead">Desde el 26 de agosto de 2014 construimos una alternativa deportiva enfocada en el entrenamiento de distintas disciplinas de combate.</p>
        <div className="about-columns">
          <p>Formamos niños y jóvenes en Boxeo, Jiu Jitsu Brasileño, Kick Boxing y Artes Marciales Mixtas. Para los adultos, somos también una forma de escapar de la rutina, mejorar el estado físico y fortalecer la confianza.</p>
          <p>Somos formadores de talentos. Nuestra experiencia competitiva y nuestros títulos en el mundo del boxeo respaldan el método con el que entrenamos cada día en Cali.</p>
        </div>
      </div>

      <div className="achievement-summary" data-reveal>
        <div className="achievement-grid">
        {achievementHighlights.map((item) => (
          <article key={`${item.value}-${item.label}`}>
            <strong>{item.value}</strong><span>{item.label}</span>
          </article>
        ))}
        </div>
        <div className="achievement-more" aria-label="Otros logros">
          {achievementDetails.map((item) => <span key={item}>✓ {item}</span>)}
        </div>
      </div>
    </section>
  );
}

function Disciplines() {
  return (
    <section className="home-disciplines page-pad" id="disciplinas">
      <div className="section-intro light" data-reveal>
        <p className="kicker"><span /> Todas nuestras disciplinas</p>
        <p className="section-index">02 / Elige tu camino</p>
        <h2>Entrena lo que<br /><em>te transforma.</em></h2>
      </div>
      <p className="disciplines-lead" data-reveal>Distintos caminos para una misma meta: construir una versión más fuerte, técnica y segura de ti.</p>
      <div className="discipline-grid">
        {disciplines.map((item) => (
          <Link className="discipline-link" style={{ '--discipline-color': item.color }} to={item.path} key={item.path} data-reveal>
            <span className="discipline-number">{item.number}</span>
            <div><p>{item.line}</p><h3>{item.name}</h3><span className="explore">Explorar disciplina <Arrow diagonal /></span></div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Founder() {
  return (
    <section className="founder page-pad" id="julian-martinez">
      <figure className="founder-photo" data-reveal>
        <picture>
          <source srcSet={withBase('/images/julian-martinez-campeones.webp')} type="image/webp" />
          <img src={withBase('/images/julian-martinez-campeones.png')} alt="Julián Martínez junto a atletas y campeones formados en Striking Fitness" width="900" height="900" loading="lazy" decoding="async" />
        </picture>
        <div className="founder-photo-tag"><span>15+</span><small>Años de experiencia</small></div>
      </figure>
      <div className="founder-copy" data-reveal>
        <p className="kicker"><span /> Liderazgo y experiencia</p>
        <p className="section-index">03 / Head Coach</p>
        <h2>Julián<br /><em>Martínez.</em></h2>
        <h3>Head Coach de boxeo y CEO de Striking Fitness</h3>
        <p>Más de 15 años de experiencia en el mundo deportivo en Estados Unidos, México y Colombia. Su conocimiento competitivo guía el método de toda la academia.</p>
        <div className="certifications">
          {certifications.slice(0, 3).map((item, index) => <span key={item}><i>{String(index + 1).padStart(2, '0')}</i>{item}</span>)}
          <details>
            <summary>Ver otras certificaciones <span aria-hidden="true">＋</span></summary>
            {certifications.slice(3).map((item, index) => <p key={item}><i>{String(index + 4).padStart(2, '0')}</i>{item}</p>)}
          </details>
        </div>
      </div>
    </section>
  );
}

function HomeCTA() {
  return (
    <section className="home-cta page-pad" data-reveal>
      <p className="kicker dark"><span /> Haz parte de nuestra familia</p>
      <h2>El primer round<br /><em>empieza contigo.</em></h2>
      <p>Visita una de nuestras sedes, conoce el equipo y encuentra la disciplina ideal para tu objetivo.</p>
      <Link className="button button-acid" to="/sedes-contacto">Agenda una clase de prueba <Arrow /></Link>
    </section>
  );
}

function HomePage() {
  usePageMeta({
    title: 'Striking Fitness | Academia de deportes de combate en Cali',
    description: 'Academia de boxeo, Brazilian Jiu Jitsu, Kick Boxing y MMA en Cali. Entrenamiento para niños, jóvenes y adultos desde 2014.',
    canonical: 'https://striking-fitness.com/',
  });
  return <main id="main-content"><HomeHero /><CombatScroll /><About /><Disciplines /><Founder /><HomeCTA /></main>;
}

const boxingBenefits = [
  { number: '01', title: 'Condición física', text: 'Mejora resistencia, coordinación, velocidad y fuerza con sesiones exigentes y progresivas.' },
  { number: '02', title: 'Técnica y confianza', text: 'Aprende postura, desplazamientos, defensa y golpeo con acompañamiento cercano.' },
  { number: '03', title: 'Ruta competitiva', text: 'Desarrolla tu nivel con un equipo que ha formado campeones nacionales e internacionales.' },
];

const boxingCoaches = [
  { name: 'Yefri', role: 'Campeón nacional de boxeo', image: 'coach-yefri' },
  { name: 'Julián Martínez', role: 'Head Coach y CEO', image: 'coach-julian' },
  { name: 'Jean Orobio', role: 'Campeón nacional de boxeo', image: 'coach-jean' },
];

function BoxingSchedule() {
  const [view, setView] = useState('week');
  return (
    <section className="boxing-schedule page-pad" id="horarios-boxeo">
      <div className="boxing-schedule-heading" data-reveal>
        <div>
          <p className="kicker dark"><span /> Sede El Cedro</p>
          <h2>Horarios de<br /><em>boxeo.</em></h2>
        </div>
        <div className="boxing-location">
          <span>Calle 7 # 27-08</span>
          <p>Cali, Colombia</p>
          <a href="https://maps.google.com/?q=Calle+7+27-08+Cali+Colombia" target="_blank" rel="noreferrer">Abrir ubicación <Arrow diagonal /></a>
        </div>
      </div>

      <div className="schedule-switch" role="group" aria-label="Seleccionar días" data-reveal>
        <button className={view === 'week' ? 'active' : ''} onClick={() => setView('week')} aria-pressed={view === 'week'}>Lunes a viernes</button>
        <button className={view === 'weekend' ? 'active' : ''} onClick={() => setView('weekend')} aria-pressed={view === 'weekend'}>Fin de semana</button>
      </div>

      <div className={`schedule-panel ${view === 'weekend' ? 'is-weekend' : ''}`} aria-live="polite">
        {view === 'week' ? (
          <>
            <article>
              <span className="schedule-audience">Adultos</span>
              <h3>Mañana</h3>
              <div className="schedule-times"><time>06:00</time><time>08:00</time><time>10:00</time></div>
            </article>
            <article>
              <span className="schedule-audience">Adultos</span>
              <h3>Tarde y noche</h3>
              <div className="schedule-times"><time>12:00</time><time>03:30</time><time>06:00</time><time>07:00</time><time>08:00</time><time>09:00</time></div>
            </article>
            <article>
              <span className="schedule-audience">Niños</span>
              <h3>Tarde</h3>
              <div className="schedule-times"><time>04:30</time></div>
            </article>
          </>
        ) : (
          <>
            <article>
              <span className="schedule-audience">Todas las edades</span>
              <h3>Sábado</h3>
              <div className="schedule-times"><time>09:00</time><time>11:00</time></div>
            </article>
            <article>
              <span className="schedule-audience">Todas las edades</span>
              <h3>Domingo</h3>
              <div className="schedule-times"><time>11:00</time></div>
            </article>
          </>
        )}
      </div>
      <p className="schedule-note">Los horarios pueden variar en festivos o por eventos deportivos. Confírmalos antes de tu primera visita.</p>
    </section>
  );
}

function BoxingPage() {
  usePageMeta({
    title: 'Academia de boxeo en Cali | Striking Fitness',
    description: 'Clases de boxeo en Cali para niños y adultos, desde nivel recreativo hasta competencia. Entrena con campeones en Striking Fitness.',
    canonical: 'https://striking-fitness.com/boxeo/',
  });

  return (
    <main className="boxing-page" id="main-content">
      <section className="boxing-hero page-pad">
        <div className="boxing-hero-copy" data-reveal>
          <p className="kicker"><span /> Academia de boxeo en Cali</p>
          <h1>Entrena boxeo.<br /><em>Encuentra tu nivel.</em></h1>
          <p>Entrenamiento recreativo o competitivo para niños y adultos, guiado por atletas y campeones que entienden cada etapa del proceso.</p>
          <div className="boxing-tags" aria-label="Modalidades disponibles">
            <span>Recreativo</span><span>Competitivo</span><span>Niños y adultos</span>
          </div>
        </div>

        <figure className="boxing-hero-photo" data-reveal>
          <picture>
            <source srcSet={withBase('/images/boxing/boxing-hero-julian.webp')} type="image/webp" />
            <img src={withBase('/images/boxing/boxing-hero-julian.jpg')} alt="Julián Martínez, Head Coach de Striking Fitness, junto a Mike Tyson" width="800" height="793" fetchPriority="high" decoding="async" />
          </picture>
          <figcaption><span>Experiencia internacional</span><strong>Boxeo con método.</strong></figcaption>
        </figure>
      </section>

      <section className="boxing-purpose page-pad">
        <div className="boxing-purpose-copy" data-reveal>
          <p className="kicker dark"><span /> Para cada objetivo</p>
          <h2>Tu primer round<br /><em>empieza aquí.</em></h2>
          <p>Si quieres competir, mejorar tu salud o desarrollar disciplina física y mental, construimos un proceso adecuado para ti. No necesitas experiencia previa.</p>
          <Link className="text-link" to="/sedes-contacto">Cuéntanos tu objetivo <Arrow diagonal /></Link>
        </div>
        <figure className="boxing-purpose-photo" data-reveal>
          <picture>
            <source srcSet={withBase('/images/boxing/boxing-champion.webp')} type="image/webp" />
            <img src={withBase('/images/boxing/boxing-champion.jpg')} alt="Boxeador de Striking Fitness celebrando una victoria con su cinturón" width="800" height="796" loading="lazy" decoding="async" />
          </picture>
          <figcaption>Formación recreativa y de alto rendimiento</figcaption>
        </figure>
        <div className="boxing-benefits" data-reveal>
          {boxingBenefits.map((benefit) => (
            <article key={benefit.number}>
              <span>{benefit.number}</span><h3>{benefit.title}</h3><p>{benefit.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="boxing-coaches page-pad">
        <div className="boxing-coaches-heading" data-reveal>
          <div><p className="kicker"><span /> Nuestro equipo técnico</p><h2>Profesionales.<br /><em>Campeones.</em></h2></div>
          <p>Nuestros entrenadores combinan experiencia de alto rendimiento, conocimiento técnico y una forma cercana de enseñar.</p>
        </div>
        <div className="coach-grid">
          {boxingCoaches.map((coach, index) => (
            <article className="coach-card" key={coach.name} data-reveal>
              <figure>
                <picture>
                  <source srcSet={withBase(`/images/boxing/${coach.image}.webp`)} type="image/webp" />
                  <img src={withBase(`/images/boxing/${coach.image}.jpg`)} alt={`${coach.name}, ${coach.role}`} width="700" height="900" loading="lazy" decoding="async" />
                </picture>
                <span>{String(index + 1).padStart(2, '0')}</span>
              </figure>
              <h3>{coach.name}</h3><p>{coach.role}</p>
            </article>
          ))}
        </div>
      </section>

      <BoxingSchedule />

      <section className="boxing-final-cta page-pad" data-reveal>
        <div><p className="kicker"><span /> Haz parte del equipo</p><h2>Prueba una clase.<br /><em>Siente la diferencia.</em></h2></div>
        <div><p>Conoce la sede, conversa con el equipo y encuentra el plan que se ajuste a tu nivel.</p><Link className="button button-acid" to="/sedes-contacto">Quiero entrenar boxeo <Arrow /></Link></div>
      </section>
    </main>
  );
}

const bjjBenefits = [
  { number: '01', title: 'Técnica sobre fuerza', text: 'Aprende a controlar posiciones y resolver situaciones usando palancas, precisión y estrategia.' },
  { number: '02', title: 'Cuerpo y mente', text: 'Desarrolla resistencia, movilidad, enfoque y capacidad para mantener la calma bajo presión.' },
  { number: '03', title: 'Defensa y confianza', text: 'Construye recursos prácticos de defensa personal mientras fortaleces tu seguridad.' },
  { number: '04', title: 'Una comunidad real', text: 'Entrena en un ambiente de respeto donde compañeros y profesores acompañan tu proceso.' },
];

const beltLevels = [
  { name: 'Blanco', color: '#f2efe7', text: 'La base', description: 'Aprender a respirar, moverte y comprender las posiciones fundamentales.' },
  { name: 'Azul', color: '#5478d9', text: 'El juego', description: 'Conectar técnicas, reconocer opciones y construir un estilo propio.' },
  { name: 'Púrpura', color: '#8053a8', text: 'La precisión', description: 'Refinar decisiones y usar la técnica con intención y fluidez.' },
  { name: 'Marrón', color: '#76503b', text: 'El dominio', description: 'Profundizar detalles, enseñar con el ejemplo y competir con madurez.' },
  { name: 'Negro', color: '#111111', text: 'El camino continúa', description: 'El cinturón no cierra el proceso: abre una nueva forma de aprender.' },
];

function BeltJourney() {
  const sectionRef = useRef(null);
  const [activeBelt, setActiveBelt] = useState(0);
  const activeBeltRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    let wheelLocked = false;
    let wheelTimer;
    let touchStartY = null;
    let touchCaptured = false;

    const isActive = () => {
      const rect = section.getBoundingClientRect();
      return rect.top <= window.innerHeight * 0.16 && rect.bottom >= window.innerHeight * 0.76;
    };

    const isEntering = (direction) => {
      const rect = section.getBoundingClientRect();
      return direction > 0
        ? rect.top > window.innerHeight * 0.16 && rect.top <= window.innerHeight * 0.92
        : rect.bottom < window.innerHeight * 0.76 && rect.bottom >= window.innerHeight * 0.08;
    };

    const alignJourney = (direction) => {
      const edgeBelt = direction > 0 ? 0 : beltLevels.length - 1;
      activeBeltRef.current = edgeBelt;
      setActiveBelt(edgeBelt);
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const canMove = (direction) => direction > 0
      ? activeBeltRef.current < beltLevels.length - 1
      : activeBeltRef.current > 0;

    const move = (direction) => {
      if (!canMove(direction)) return false;
      const next = Math.min(beltLevels.length - 1, Math.max(0, activeBeltRef.current + direction));
      activeBeltRef.current = next;
      setActiveBelt(next);
      return true;
    };

    const onWheel = (event) => {
      if (Math.abs(event.deltaY) < 12) return;
      const direction = event.deltaY > 0 ? 1 : -1;
      if (isEntering(direction)) {
        event.preventDefault();
        if (!wheelLocked) {
          alignJourney(direction);
          wheelLocked = true;
          window.clearTimeout(wheelTimer);
          wheelTimer = window.setTimeout(() => { wheelLocked = false; }, 620);
        }
        return;
      }
      if (!isActive()) return;
      if (!canMove(direction)) return;
      event.preventDefault();
      if (wheelLocked) return;
      if (move(direction)) {
        wheelLocked = true;
        window.clearTimeout(wheelTimer);
        wheelTimer = window.setTimeout(() => { wheelLocked = false; }, 620);
      }
    };

    const onTouchStart = (event) => {
      if (event.touches.length !== 1) return;
      touchStartY = event.touches[0].clientY;
      touchCaptured = false;
    };

    const onTouchMove = (event) => {
      if (touchStartY === null || event.touches.length !== 1) return;
      if (touchCaptured) {
        event.preventDefault();
        return;
      }
      const distance = touchStartY - event.touches[0].clientY;
      if (Math.abs(distance) < 32) return;
      const direction = distance > 0 ? 1 : -1;
      if (isEntering(direction)) {
        event.preventDefault();
        alignJourney(direction);
        touchCaptured = true;
        return;
      }
      if (!isActive()) return;
      if (!canMove(direction)) return;
      event.preventDefault();
      touchCaptured = move(direction);
    };

    const onTouchEnd = () => {
      touchStartY = null;
      touchCaptured = false;
    };

    const onKeyDown = (event) => {
      const direction = ['ArrowDown', 'PageDown'].includes(event.key) ? 1 : ['ArrowUp', 'PageUp'].includes(event.key) ? -1 : 0;
      if (!direction || !canMove(direction)) return;
      event.preventDefault();
      move(direction);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });
    section.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(wheelTimer);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      section.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const selectBelt = (index) => {
    activeBeltRef.current = index;
    setActiveBelt(index);
  };

  return (
    <section className="belt-journey" ref={sectionRef} tabIndex="0" aria-label="Progresión interactiva de cinturones de Brazilian Jiu Jitsu. Usa la rueda, desliza o utiliza las flechas para avanzar.">
      <div className="belt-journey-sticky page-pad">
        <div className="belt-copy">
          <p className="kicker"><span /> Tu progreso se construye</p>
          <p className="belt-step">Cinturón {String(activeBelt + 1).padStart(2, '0')} / {String(beltLevels.length).padStart(2, '0')}</p>
          <p className="belt-scroll-hint">Un gesto · un cinturón</p>
          <h2>Un camino.<br /><em>Cinco etapas.</em></h2>
          <div className="belt-active-copy" aria-live="polite">
            <strong>{beltLevels[activeBelt].name}</strong>
            <span>{beltLevels[activeBelt].text}</span>
            <p>{beltLevels[activeBelt].description}</p>
          </div>
          <p className="belt-disclaimer">Cada proceso tiene su propio ritmo. Los cinturones representan aprendizaje, constancia y evolución, no un plazo fijo.</p>
        </div>

        <div className="belt-stage" aria-hidden="true">
          {beltLevels.map((belt, index) => (
            <div
              className={`belt-object ${index === activeBelt ? 'active' : ''} ${index < activeBelt ? 'passed' : ''}`}
              style={{ '--belt-color': belt.color, '--belt-index': index, '--belt-distance': index - activeBelt }}
              key={belt.name}
            >
              <i /><span /><b>{belt.name}</b>
            </div>
          ))}
        </div>

        <div className="belt-controls" aria-label="Seleccionar cinturón">
          {beltLevels.map((belt, index) => (
            <button key={belt.name} className={index === activeBelt ? 'active' : ''} onClick={() => selectBelt(index)} aria-pressed={index === activeBelt}>
              <i style={{ background: belt.color }} />{belt.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function BjjPage() {
  usePageMeta({
    title: 'Academia de Brazilian Jiu Jitsu en Cali | Striking Fitness',
    description: 'Clases de Brazilian Jiu Jitsu en Cali para principiantes y practicantes de todos los niveles. Entrena técnica, disciplina y confianza.',
    canonical: 'https://striking-fitness.com/brazilian-jiu-jitsu/',
  });

  return (
    <main className="bjj-page" id="main-content">
      <section className="bjj-hero page-pad">
        <div className="bjj-hero-copy" data-reveal>
          <p className="kicker"><span /> Brazilian Jiu Jitsu en Cali</p>
          <h1>Aprende a<br /><em>resolver.</em></h1>
          <p>El arte suave convierte técnica, paciencia y control en una forma distinta de enfrentar cada reto. Entrena desde cero o lleva tu juego al siguiente nivel.</p>
          <div className="bjj-hero-facts"><span>Todos los niveles</span><span>Todas las edades</span><span>Gi · técnica · rolling</span></div>
        </div>

        <figure className="bjj-hero-photo" data-reveal>
          <picture>
            <source srcSet={withBase('/images/bjj/bjj-hero.webp')} type="image/webp" />
            <img src={withBase('/images/bjj/bjj-hero.jpg')} alt="Practicantes entrenando una técnica de Brazilian Jiu Jitsu" width="800" height="800" fetchPriority="high" decoding="async" />
          </picture>
          <figcaption><span>Técnica sobre fuerza</span><strong>Arte suave.</strong></figcaption>
        </figure>
      </section>

      <section className="bjj-intro page-pad">
        <div className="bjj-intro-heading" data-reveal>
          <p className="kicker dark"><span /> Mucho más que combate</p>
          <h2>Piensa mejor.<br /><em>Muévete mejor.</em></h2>
        </div>
        <div className="bjj-intro-copy" data-reveal>
          <p>El Brazilian Jiu Jitsu usa el apalancamiento, el control y la estrategia para resolver situaciones en el suelo. Aquí encuentras un espacio de respeto, crecimiento y entrenamiento real, tengas o no experiencia.</p>
          <Link className="text-link" to="/sedes-contacto">Quiero empezar desde cero <Arrow diagonal /></Link>
        </div>
        <figure className="bjj-belts-photo" data-reveal>
          <picture>
            <source srcSet={withBase('/images/bjj/bjj-training.webp')} type="image/webp" />
            <img src={withBase('/images/bjj/bjj-training.png')} alt="Cinturones blanco, azul, púrpura, marrón y negro de Brazilian Jiu Jitsu" width="700" height="700" loading="lazy" decoding="async" />
          </picture>
        </figure>
        <div className="bjj-benefit-grid" data-reveal>
          {bjjBenefits.map((benefit) => <article key={benefit.number}><span>{benefit.number}</span><h3>{benefit.title}</h3><p>{benefit.text}</p></article>)}
        </div>
      </section>

      <BeltJourney />

      <section className="bjj-professor page-pad" id="profesor-bjj">
        <figure className="bjj-professor-photo" data-reveal>
          <picture>
            <source srcSet={withBase('/images/bjj/profesor-juan-diego.webp')} type="image/webp" />
            <img src={withBase('/images/bjj/profesor-juan-diego.jpg')} alt="Juan Diego Zúñiga en el podio de una competencia de Brazilian Jiu Jitsu" width="700" height="900" loading="lazy" decoding="async" />
          </picture>
          <span className="professor-image-note">Juan Diego · a la derecha</span>
          <div className="professor-years"><strong>10+</strong><span>Años de experiencia del equipo</span></div>
        </figure>
        <div className="bjj-professor-copy" data-reveal>
          <p className="kicker"><span /> Profesor de BJJ</p>
          <p className="professor-index">Experiencia que se comparte</p>
          <h2>Juan Diego<br /><em>Zúñiga.</em></h2>
          <div className="brown-belt-label"><i /><span>Cinturón marrón</span></div>
          <p>Su enseñanza parte de la experiencia competitiva y de entender cómo adaptar la técnica a cada persona, desde sus primeras posiciones hasta un juego más avanzado.</p>
          <div className="professor-principle"><span>Su enfoque</span><p>Técnica, autocontrol y mejores decisiones dentro del tatami.</p></div>
          <Link className="button button-bjj" to="/sedes-contacto">Entrena con Juan Diego <Arrow /></Link>
        </div>
      </section>

      <section className="bjj-schedule page-pad">
        <div data-reveal><p className="kicker dark"><span /> Sede El Cedro</p><h2>Un horario.<br /><em>Tu constancia.</em></h2></div>
        <div className="bjj-class-card" data-reveal>
          <span>Lunes a viernes</span><h3>Todas las edades</h3><time>07:30 <small>p. m.</small></time><p>Calle 7 # 27-08 · Cali</p>
          <Link className="button button-dark" to="/sedes-contacto">Confirmar mi clase <Arrow /></Link>
        </div>
      </section>

      <section className="bjj-final-cta page-pad" data-reveal>
        <p className="kicker"><span /> Empieza donde estás</p>
        <h2>No necesitas fuerza.<br /><em>Necesitas empezar.</em></h2>
        <p>Conoce el tatami, habla con el profesor y vive tu primera clase de Brazilian Jiu Jitsu.</p>
        <Link className="button button-bjj" to="/sedes-contacto">Agenda una clase de prueba <Arrow /></Link>
      </section>
    </main>
  );
}

const kickBenefits = [
  { number: '01', title: 'Striking completo', text: 'Integra puños, patadas, guardia y desplazamientos en un sistema dinámico.' },
  { number: '02', title: 'Condición física', text: 'Trabaja resistencia, potencia, coordinación y agilidad en cada sesión.' },
  { number: '03', title: 'Confianza y enfoque', text: 'Aprende bajo presión controlada mientras desarrollas disciplina y seguridad.' },
  { number: '04', title: 'Libera el estrés', text: 'Canaliza energía con entrenamiento técnico, intenso y progresivo.' },
];

const comboSteps = [
  { name: 'Jab', number: '01', cue: 'Mide la distancia', detail: 'Rápido, directo y listo para volver a la guardia.', x: '34%', y: '36%' },
  { name: 'Cross', number: '02', cue: 'Transfiere potencia', detail: 'Gira cadera y hombro sin perder tu base.', x: '62%', y: '31%' },
  { name: 'Hook', number: '03', cue: 'Cambia el ángulo', detail: 'Compacto, preciso y conectado con el movimiento.', x: '73%', y: '48%' },
  { name: 'Low kick', number: '04', cue: 'Cierra la combinación', detail: 'Equilibrio, rotación y regreso inmediato a posición.', x: '58%', y: '69%' },
];

function ComboLab() {
  const [activeStep, setActiveStep] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = window.setInterval(() => setActiveStep((step) => (step + 1) % comboSteps.length), 1900);
    return () => window.clearInterval(timer);
  }, [paused]);

  const chooseStep = (index) => {
    setActiveStep(index);
    setPaused(true);
  };

  const step = comboSteps[activeStep];
  return (
    <section className="combo-lab page-pad" aria-labelledby="combo-title">
      <div className="combo-heading" data-reveal>
        <p className="kicker"><span /> Técnica en movimiento</p>
        <p>Una combinación no son golpes aislados: es ritmo, distancia y decisiones conectadas.</p>
      </div>
      <div className="combo-interface">
        <div className="combo-copy">
          <span className="combo-current">Paso {step.number} / 04</span>
          <h2 id="combo-title">Construye tu<br /><em>combinación.</em></h2>
          <div className="combo-instruction" aria-live="polite"><strong>{step.name}</strong><span>{step.cue}</span><p>{step.detail}</p></div>
          <button className="combo-play" onClick={() => setPaused(!paused)} aria-pressed={!paused}>{paused ? 'Reproducir secuencia' : 'Pausar secuencia'} <span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span></button>
        </div>
        <div className="combo-visual" aria-hidden="true">
          <picture>
            <source srcSet={withBase('/images/kickboxing/kick-training.webp')} type="image/webp" />
            <img src={withBase('/images/kickboxing/kick-training.jpg')} alt="" width="800" height="800" loading="lazy" decoding="async" />
          </picture>
          <div className="combo-target" style={{ '--target-x': step.x, '--target-y': step.y }}><i /><span>{step.number}</span></div>
          <div className="combo-scan" />
        </div>
        <div className="combo-controls" aria-label="Pasos de la combinación">
          {comboSteps.map((item, index) => (
            <button key={item.name} className={index === activeStep ? 'active' : ''} onClick={() => chooseStep(index)} aria-pressed={index === activeStep}>
              <span>{item.number}</span><strong>{item.name}</strong><i />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function KickSchedule() {
  const [period, setPeriod] = useState('morning');
  const periods = {
    morning: { label: 'Mañana', times: ['05:00', '08:00', '10:00'] },
    evening: { label: 'Tarde', times: ['05:00', '06:30'] },
  };
  return (
    <section className="kick-schedule page-pad">
      <div className="kick-schedule-heading" data-reveal>
        <p className="kicker dark"><span /> Sede Cámbulos</p>
        <h2>Entrena en<br /><em>tu horario.</em></h2>
        <p>Calle 9 # 42-156 · Cali<br />Clases de lunes a viernes.</p>
      </div>
      <div className="kick-schedule-card" data-reveal>
        <div className="kick-period-switch" role="group" aria-label="Seleccionar jornada">
          <button className={period === 'morning' ? 'active' : ''} onClick={() => setPeriod('morning')} aria-pressed={period === 'morning'}>Mañana</button>
          <button className={period === 'evening' ? 'active' : ''} onClick={() => setPeriod('evening')} aria-pressed={period === 'evening'}>Tarde</button>
        </div>
        <span className="kick-period-label">Jornada {periods[period].label}</span>
        <div className="kick-times" aria-live="polite">
          {periods[period].times.map((time) => <time key={time}>{time}<small>{period === 'morning' ? 'a. m.' : 'p. m.'}</small></time>)}
        </div>
        <Link className="button button-dark" to="/sedes-contacto">Reservar este horario <Arrow /></Link>
      </div>
    </section>
  );
}

function KickBoxingPage() {
  usePageMeta({
    title: 'Academia de Kick Boxing en Cali | Striking Fitness',
    description: 'Clases de Kick Boxing en Cali para todos los niveles. Mejora tu striking, condición física, coordinación y confianza con entrenamiento profesional.',
    canonical: 'https://striking-fitness.com/kick-boxing/',
  });

  return (
    <main className="kick-page" id="main-content">
      <section className="kick-hero page-pad">
        <div className="kick-hero-copy" data-reveal>
          <p className="kicker"><span /> Academia de Kick Boxing en Cali</p>
          <h1>Golpea.<br />Muévete.<br /><em>Supérate.</em></h1>
          <p>Aprende striking completo mientras desarrollas condición física, confianza y control. Entrenamiento adaptado a tu nivel, desde la primera clase.</p>
          <div className="kick-hero-stats"><span><strong>4</strong> armas principales</span><span><strong>5</strong> horarios diarios</span><span><strong>100%</strong> adaptable</span></div>
        </div>
        <figure className="kick-hero-photo" data-reveal>
          <picture>
            <source srcSet={withBase('/images/kickboxing/kick-hero.webp')} type="image/webp" />
            <img src={withBase('/images/kickboxing/kick-hero.jpg')} alt="Combate profesional de Kick Boxing con una patada al cuerpo" width="800" height="800" fetchPriority="high" decoding="async" />
          </picture>
          <div className="kick-impact"><span>Impacto</span><i /></div>
          <figcaption><span>Puños · patadas · movimiento</span><strong>Striking completo.</strong></figcaption>
        </figure>
      </section>

      <section className="kick-intro page-pad">
        <div className="kick-intro-heading" data-reveal><p className="kicker dark"><span /> Entrenamiento para todos</p><h2>Más que sudar.<br /><em>Aprende a golpear.</em></h2></div>
        <div className="kick-intro-copy" data-reveal><p>El Kick Boxing combina técnica de manos, patadas, defensa y desplazamiento. Cada sesión reta tu cuerpo sin perder de vista lo más importante: entrenar con seguridad y comprender lo que haces.</p><Link className="text-link" to="/sedes-contacto">Encuentra tu nivel <Arrow diagonal /></Link></div>
        <div className="kick-benefits" data-reveal>{kickBenefits.map((item) => <article key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
      </section>

      <ComboLab />

      <section className="kick-coach page-pad" id="coach-kickboxing">
        <div className="kick-coach-copy" data-reveal>
          <p className="kicker"><span /> Coach de Kick Boxing</p>
          <p className="coach-index">Técnica · potencia · precisión</p>
          <h2>Alex<br /><em>Estupiñán.</em></h2>
          <div className="black-belt-label"><i /><span>Cinturón negro</span></div>
          <p>Un buen entrenador no solo exige intensidad: observa, corrige y adapta. Alex guía cada sesión con atención al detalle para que avances con una base técnica segura.</p>
          <div className="coach-method"><span>01 · Fundamentos</span><span>02 · Combinaciones</span><span>03 · Aplicación</span></div>
          <Link className="button button-kick" to="/sedes-contacto">Entrena con Alex <Arrow /></Link>
        </div>
        <figure className="kick-coach-photo" data-reveal>
          <picture>
            <source srcSet={withBase('/images/kickboxing/coach-alex.webp')} type="image/webp" />
            <img src={withBase('/images/kickboxing/coach-alex.jpg')} alt="Alex Estupiñán, entrenador cinturón negro de Kick Boxing" width="700" height="900" loading="lazy" decoding="async" />
          </picture>
          <span className="kick-coach-tag">Coach · Striking Fitness</span>
        </figure>
      </section>

      <KickSchedule />

      <section className="kick-final-cta page-pad" data-reveal>
        <p className="kicker"><span /> Da el primer golpe</p>
        <h2>Tu energía tiene<br /><em>un lugar.</em></h2>
        <p>Conoce la sede, habla con el coach y vive una clase de Kick Boxing adaptada a tu nivel.</p>
        <Link className="button button-kick" to="/sedes-contacto">Quiero probar Kick Boxing <Arrow /></Link>
      </section>
    </main>
  );
}

const mmaBenefits = [
  { number: '01', title: 'Striking', text: 'Boxeo, patadas, distancia y defensa para desenvolverte de pie.' },
  { number: '02', title: 'Derribos', text: 'Conecta los rangos, rompe el equilibrio y decide dónde continúa el combate.' },
  { number: '03', title: 'Grappling', text: 'Controla posiciones, escapes y finalizaciones con técnica y paciencia.' },
  { number: '04', title: 'Preparación total', text: 'Mejora resistencia, potencia, movilidad, estrategia y autocontrol.' },
];

const mmaRanges = [
  { name: 'Distancia', discipline: 'Striking', number: '01', cue: 'Lee y conecta', detail: 'Controla el espacio con guardia, desplazamiento, puños y patadas.', x: '50%', y: '16%' },
  { name: 'Transición', discipline: 'Derribos', number: '02', cue: 'Cambia el combate', detail: 'Entra con intención, rompe el equilibrio y enlaza de pie al suelo.', x: '20%', y: '73%' },
  { name: 'Control', discipline: 'Grappling', number: '03', cue: 'Resuelve abajo', detail: 'Estabiliza posiciones, escapa y busca oportunidades con paciencia.', x: '80%', y: '73%' },
];

function MmaRangeSystem() {
  const [activeRange, setActiveRange] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = window.setInterval(() => setActiveRange((range) => (range + 1) % mmaRanges.length), 2300);
    return () => window.clearInterval(timer);
  }, [playing]);

  const selectRange = (index) => {
    setActiveRange(index);
    setPlaying(false);
  };

  const range = mmaRanges[activeRange];
  return (
    <section className="mma-system page-pad" aria-labelledby="mma-system-title">
      <div className="mma-system-heading" data-reveal>
        <p className="kicker"><span /> Un deporte · todos los rangos</p>
        <p>La diferencia está en conectar cada herramienta sin perder posición, equilibrio ni intención.</p>
      </div>
      <div className="mma-system-interface">
        <div className="mma-system-copy">
          <span className="mma-system-index">Rango {range.number} / 03</span>
          <h2 id="mma-system-title">Todo<br /><em>conecta.</em></h2>
          <div className="mma-range-copy" aria-live="polite"><strong>{range.discipline}</strong><span>{range.name} · {range.cue}</span><p>{range.detail}</p></div>
          <button className="mma-system-play" onClick={() => setPlaying(!playing)} aria-pressed={playing}>{playing ? 'Pausar recorrido' : 'Reproducir recorrido'} <span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span></button>
        </div>
        <div className="mma-octagon" aria-hidden="true">
          <div className="mma-octagon-image"><picture><source srcSet={withBase('/images/mma/mma-training.webp')} type="image/webp" /><img src={withBase('/images/mma/mma-training.jpg')} alt="" width="800" height="800" loading="lazy" decoding="async" /></picture></div>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M50 16 L20 73 L80 73 Z" /></svg>
          {mmaRanges.map((item, index) => <div className={`mma-range-node ${index === activeRange ? 'active' : ''}`} style={{ left: item.x, top: item.y }} key={item.name}><span>{item.number}</span><b>{item.discipline}</b></div>)}
          <div className="mma-range-cursor" style={{ '--range-x': range.x, '--range-y': range.y }}><i /></div>
          <div className="mma-cage-lines" />
        </div>
        <div className="mma-range-controls" aria-label="Seleccionar rango de combate">
          {mmaRanges.map((item, index) => <button key={item.name} className={index === activeRange ? 'active' : ''} onClick={() => selectRange(index)} aria-pressed={index === activeRange}><span>{item.number}</span><strong>{item.discipline}</strong><small>{item.name}</small><i /></button>)}
        </div>
      </div>
    </section>
  );
}

function MmaSchedule() {
  const schedules = [
    { id: 'mwf', days: 'Lun · Mié · Vie', label: 'Lunes, miércoles y viernes', times: ['06:00 a. m.', '04:00 p. m.'] },
    { id: 'tf', days: 'Mar · Vie', label: 'Martes y viernes', times: ['11:00 a. m.'] },
    { id: 'wed', days: 'Miércoles', label: 'Miércoles', times: ['12:00 m.'] },
  ];
  const [selected, setSelected] = useState('mwf');
  const current = schedules.find((schedule) => schedule.id === selected);
  return (
    <section className="mma-schedule page-pad">
      <div className="mma-schedule-heading" data-reveal><p className="kicker dark"><span /> Sede Cámbulos</p><h2>Elige tu<br /><em>momento.</em></h2><p>Calle 9 # 42-156 · Cali<br />Entrenamiento para todas las edades.</p></div>
      <div className="mma-schedule-card" data-reveal>
        <div className="mma-day-controls" role="group" aria-label="Seleccionar días de entrenamiento">{schedules.map((schedule) => <button key={schedule.id} className={selected === schedule.id ? 'active' : ''} onClick={() => setSelected(schedule.id)} aria-pressed={selected === schedule.id}>{schedule.days}</button>)}</div>
        <span className="mma-current-days">{current.label}</span>
        <div className="mma-schedule-times" aria-live="polite">{current.times.map((time) => <time key={time}>{time}</time>)}</div>
        <Link className="button button-dark" to="/sedes-contacto">Confirmar mi clase <Arrow /></Link>
      </div>
    </section>
  );
}

function MmaPage() {
  usePageMeta({
    title: 'Academia de MMA en Cali | Striking Fitness',
    description: 'Clases de MMA en Cali para todos los niveles. Aprende striking, derribos y grappling con entrenamiento integral y acompañamiento profesional.',
    canonical: 'https://striking-fitness.com/mma/',
  });
  return (
    <main className="mma-page" id="main-content">
      <section className="mma-hero page-pad">
        <div className="mma-hero-copy" data-reveal>
          <p className="kicker"><span /> Artes Marciales Mixtas en Cali</p>
          <h1>Todos los<br />rangos.<br /><em>Un peleador.</em></h1>
          <p>Integra striking, derribos y grappling en una formación completa. No necesitas experiencia previa: necesitas curiosidad, disciplina y ganas de aprender.</p>
          <div className="mma-hero-ranges"><span><i>01</i> Striking</span><span><i>02</i> Derribos</span><span><i>03</i> Grappling</span></div>
        </div>
        <figure className="mma-hero-photo" data-reveal>
          <picture><source srcSet={withBase('/images/mma/mma-hero.webp')} type="image/webp" /><img src={withBase('/images/mma/mma-hero.jpg')} alt="Atleta de Artes Marciales Mixtas dentro de una arena" width="800" height="800" fetchPriority="high" decoding="async" /></picture>
          <div className="mma-octagon-frame" aria-hidden="true" />
          <figcaption><span>Golpea · derriba · controla</span><strong>Formación integral.</strong></figcaption>
        </figure>
      </section>

      <section className="mma-intro page-pad">
        <div className="mma-intro-heading" data-reveal><p className="kicker dark"><span /> Una disciplina completa</p><h2>Adáptate.<br /><em>Resuelve.</em></h2></div>
        <div className="mma-intro-copy" data-reveal><p>Las Artes Marciales Mixtas combinan herramientas de boxeo, kick boxing, lucha y Jiu Jitsu Brasileño. El objetivo no es hacer todo al mismo tiempo, sino saber qué herramienta usar en cada momento.</p><Link className="text-link" to="/sedes-contacto">Empieza desde tu nivel <Arrow diagonal /></Link></div>
        <div className="mma-benefits" data-reveal>{mmaBenefits.map((item) => <article key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
      </section>

      <MmaRangeSystem />

      <section className="mma-coach page-pad" id="coach-mma">
        <figure className="mma-coach-photo" data-reveal><picture><source srcSet={withBase('/images/mma/coach-yefri.webp')} type="image/webp" /><img src={withBase('/images/mma/coach-yefri.jpg')} alt="Yefri, entrenador de MMA en Striking Fitness" width="700" height="900" loading="lazy" decoding="async" /></picture><span>Coach · Striking Fitness</span><div className="mma-coach-orbit" aria-hidden="true"><i>Striking</i><i>Grappling</i><i>Transición</i></div></figure>
        <div className="mma-coach-copy" data-reveal>
          <p className="kicker"><span /> Coach de MMA</p><p className="mma-coach-index">Un guía para cada rango</p><h2>Yefri.</h2>
          <p>El MMA exige ver el combate como un sistema. Yefri acompaña el proceso paso a paso, conectando fundamentos de golpeo, defensa, transición y control con atención al nivel de cada atleta.</p>
          <div className="mma-coach-method"><span><i>01</i> Comprender</span><span><i>02</i> Conectar</span><span><i>03</i> Aplicar</span></div>
          <Link className="button button-mma" to="/sedes-contacto">Entrena con Yefri <Arrow /></Link>
        </div>
      </section>

      <MmaSchedule />

      <section className="mma-final-cta page-pad" data-reveal><p className="kicker"><span /> Tu formación empieza aquí</p><h2>No elijas un rango.<br /><em>Aprende a conectarlos.</em></h2><p>Visita la sede, conoce al equipo y vive una primera clase de Artes Marciales Mixtas.</p><Link className="button button-mma" to="/sedes-contacto">Quiero probar MMA <Arrow /></Link></section>
    </main>
  );
}

const academyLocations = [
  {
    id: 'cedro',
    name: 'Sede Cedro',
    address: 'Calle 7 # 27-08',
    neighborhood: 'El Cedro · Cali',
    disciplines: 'Boxeo · Brazilian Jiu Jitsu',
    coordinates: [-76.5376379, 3.4330751],
    directions: 'https://www.google.com/maps/dir/?api=1&destination=3.4330751,-76.5376379',
  },
  {
    id: 'cambulos',
    name: 'Sede Cámbulos',
    address: 'Calle 9 # 42-156',
    neighborhood: 'Los Cámbulos · Cali',
    disciplines: 'Kick Boxing · MMA',
    coordinates: [-76.540168, 3.4174774],
    directions: 'https://www.google.com/maps/dir/?api=1&destination=3.4174774,-76.540168',
  },
];

function ContactForm({ selectedLocation }) {
  const [location, setLocation] = useState(selectedLocation);
  const [sent, setSent] = useState(false);
  useEffect(() => setLocation(selectedLocation), [selectedLocation]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const venue = academyLocations.find((item) => item.id === formData.get('sede'));
    const message = [
      'Hola Striking Fitness, quiero agendar una clase.',
      `Nombre: ${formData.get('nombre')}`,
      `Disciplina: ${formData.get('disciplina')}`,
      `Sede: ${venue?.name || 'Por definir'}`,
      `Celular: ${formData.get('celular')}`,
      formData.get('mensaje') ? `Objetivo: ${formData.get('mensaje')}` : '',
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/573188594270?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    setSent(true);
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-field"><label htmlFor="contact-name">Nombre</label><input id="contact-name" name="nombre" type="text" autoComplete="name" required placeholder="Tu nombre" /></div>
      <div className="form-field"><label htmlFor="contact-phone">Número celular</label><input id="contact-phone" name="celular" type="tel" inputMode="tel" autoComplete="tel" required placeholder="300 000 0000" /></div>
      <div className="form-field"><label htmlFor="contact-discipline">Disciplina</label><select id="contact-discipline" name="disciplina" defaultValue="Boxeo"><option>Boxeo</option><option>Brazilian Jiu Jitsu</option><option>Kick Boxing</option><option>MMA</option><option>Aún no lo sé</option></select></div>
      <div className="form-field"><label htmlFor="contact-location">Sede</label><select id="contact-location" name="sede" value={location} onChange={(event) => setLocation(event.target.value)}><option value="cedro">Sede Cedro</option><option value="cambulos">Sede Cámbulos</option></select></div>
      <div className="form-field form-field-wide"><label htmlFor="contact-message">¿Qué quieres lograr?</label><textarea id="contact-message" name="mensaje" rows="4" placeholder="Cuéntanos brevemente tu objetivo o nivel actual" /></div>
      <label className="form-consent form-field-wide"><input name="privacidad" type="checkbox" required /><span>Acepto el <Link to="/privacidad">aviso de privacidad</Link> y autorizo preparar mi solicitud para enviarla por WhatsApp.</span></label>
      <div className="form-submit form-field-wide"><button className="button button-acid" type="submit">Continuar por WhatsApp <Arrow /></button><p>{sent ? 'Abrimos WhatsApp con tu información lista para enviar.' : 'No enviaremos nada sin tu confirmación final en WhatsApp.'}</p></div>
    </form>
  );
}

function ContactPage() {
  const [selectedLocation, setSelectedLocation] = useState('cedro');
  usePageMeta({
    title: 'Sedes y contacto | Striking Fitness Cali',
    description: 'Encuentra las sedes Cedro y Cámbulos de Striking Fitness en Cali. Consulta el mapa, elige tu disciplina y agenda una clase por WhatsApp.',
    canonical: 'https://striking-fitness.com/sedes-contacto/',
  });

  return (
    <main className="contact-page" id="main-content">
      <section className="contact-hero page-pad">
        <div className="contact-hero-copy" data-reveal><p className="kicker"><span /> Dos sedes · una comunidad</p><h1>Encuentra tu sede.<br /><em>Empieza tu proceso.</em></h1><p>Explora el mapa, compara las disciplinas disponibles y elige el lugar más conveniente para tu primera clase.</p></div>
        <div className="contact-direct" data-reveal>
          <a href="https://wa.me/573188594270" target="_blank" rel="noreferrer"><span>WhatsApp</span><strong>318 859 4270</strong><Arrow diagonal /></a>
          <a href="mailto:sfcali@striking-fitness.com"><span>Correo electrónico</span><strong>sfcali@striking-fitness.com</strong><Arrow diagonal /></a>
          <p>Atención digital: lunes a viernes de 9:00 a. m. a 6:00 p. m. y sábados de 9:00 a. m. a 3:00 p. m.</p>
        </div>
      </section>

      <section className="locations-section page-pad" id="sedes">
        <div className="locations-heading" data-reveal><p className="kicker"><span /> Muévete por el mapa</p><h2>Dos puntos.<br /><em>La misma energía.</em></h2><p>Selecciona una sede para acercar el mapa, consultar su dirección o abrir la ruta desde tu ubicación.</p></div>
        <div className="location-cards" data-reveal>
          {academyLocations.map((location, index) => (
            <article className={`location-card ${selectedLocation === location.id ? 'active' : ''}`} key={location.id} id={`sede-${location.id}`}>
              <button className="location-select" onClick={() => setSelectedLocation(location.id)} aria-pressed={selectedLocation === location.id}>
                <span>{String(index + 1).padStart(2, '0')}</span><strong>{location.name}</strong><i>{selectedLocation === location.id ? 'Viendo ahora' : 'Ver en mapa'}</i>
              </button>
              <p>{location.address}<br /><small>{location.neighborhood}</small></p>
              <div><span>{location.disciplines}</span><a href={location.directions} target="_blank" rel="noreferrer">Cómo llegar <Arrow diagonal /></a></div>
            </article>
          ))}
        </div>
        <div className="map-shell" data-reveal>
          <div className="map-status"><span>Mapa interactivo</span><p>Arrastra · acerca · inclina</p></div>
          <Suspense fallback={<div className="map-loading"><span>SF</span><p>Cargando mapa…</p></div>}><LocationsMap locations={academyLocations} selectedId={selectedLocation} onSelect={setSelectedLocation} /></Suspense>
        </div>
      </section>

      <section className="contact-conversion page-pad" id="agendar">
        <div className="contact-conversion-copy" data-reveal><p className="kicker dark"><span /> Tu primera clase</p><h2>Cuéntanos<br /><em>qué buscas.</em></h2><p>Completa tus datos y prepararemos un mensaje de WhatsApp. Allí podrás confirmar disponibilidad, resolver dudas y finalizar la reserva directamente con el equipo.</p><div className="contact-assurances"><span>01 · Respuesta humana</span><span>02 · Sin pagos aquí</span><span>03 · Confirmación por WhatsApp</span></div></div>
        <div data-reveal><ContactForm selectedLocation={selectedLocation} /></div>
      </section>
    </main>
  );
}

function EventsPage() {
  usePageMeta({
    title: 'Eventos de deportes de combate en Cali | Striking Fitness',
    description: 'Consulta competencias, seminarios y actividades de Boxeo, BJJ, Kick Boxing y MMA organizadas por Striking Fitness en Cali.',
    canonical: 'https://striking-fitness.com/eventos/',
  });
  return (
    <main className="events-page" id="main-content">
      <section className="events-hero page-pad">
        <div data-reveal><p className="kicker"><span /> Competencia · formación · comunidad</p><h1>Próximos<br /><em>eventos.</em></h1><p>Este será el punto oficial para consultar competencias, seminarios, exhibiciones y encuentros de la academia.</p></div>
        <div className="events-status" data-reveal><span>Agenda oficial</span><strong>Sin fechas confirmadas</strong><p>Publicaremos únicamente eventos verificados por el equipo. Sigue nuestro Instagram para recibir anuncios inmediatos.</p><a className="underlink" href="https://www.instagram.com/strikingfitness/" target="_blank" rel="noreferrer">Seguir novedades <Arrow diagonal /></a></div>
      </section>
      <section className="events-types page-pad">
        {[['01','Competencias','Participación de nuestros atletas en torneos locales, nacionales e internacionales.'],['02','Seminarios','Sesiones especiales con entrenadores e invitados de distintas disciplinas.'],['03','Comunidad','Encuentros, exhibiciones y actividades para alumnos, familias y equipo.']].map(([number,title,text]) => <article key={number} data-reveal><span>{number}</span><h2>{title}</h2><p>{text}</p></article>)}
      </section>
      <section className="events-cta page-pad" data-reveal><p className="kicker dark"><span /> Mientras llega el próximo evento</p><h2>Empieza a<br /><em>entrenar hoy.</em></h2><p>Conoce nuestras sedes y encuentra la disciplina adecuada para tu nivel y objetivo.</p><Link className="button button-acid" to="/sedes-contacto">Ver sedes y contacto <Arrow /></Link></section>
    </main>
  );
}

const legalContent = {
  privacidad: {
    title: 'Aviso de privacidad',
    description: 'Información sobre el tratamiento de datos y los canales de contacto de Striking Fitness.',
    paragraphs: [
      'Este sitio utiliza los datos que escribes en el formulario únicamente para preparar una conversación con Striking Fitness por WhatsApp. El mensaje no se envía hasta que tú lo confirmas en esa plataforma.',
      'La versión actual del sitio no almacena el contenido del formulario en una base de datos propia. WhatsApp, Instagram, Google Maps y los servicios de mapas utilizados pueden aplicar sus propias políticas al abrir sus enlaces.',
      'Para consultar, actualizar o solicitar la eliminación de información compartida directamente con la academia, puedes escribir a sfcali@striking-fitness.com o comunicarte al 318 859 4270.',
    ],
  },
  terminos: {
    title: 'Términos de uso',
    description: 'Condiciones generales para utilizar el sitio web de Striking Fitness.',
    paragraphs: [
      'La información del sitio tiene carácter informativo. Los horarios, cupos, profesores y actividades pueden cambiar; confirma siempre la disponibilidad con el equipo antes de desplazarte.',
      'El envío de una solicitud por WhatsApp no constituye una reserva definitiva. La clase queda confirmada cuando el equipo de Striking Fitness valida sede, horario y disponibilidad.',
      'La práctica de deportes de combate debe realizarse con orientación profesional y de acuerdo con las condiciones físicas de cada persona. El equipo podrá recomendar una valoración previa cuando sea necesario.',
    ],
  },
};

function LegalPage({ type }) {
  const page = legalContent[type];
  usePageMeta({ title: `${page.title} | Striking Fitness`, description: page.description, canonical: `https://striking-fitness.com/${type}/` });
  return <main className="legal-page page-pad" id="main-content"><p className="kicker"><span /> Información del sitio</p><h1>{page.title}</h1><p className="legal-updated">Última actualización: agosto de 2026</p><div>{page.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><Link className="underlink" to="/sedes-contacto">Contactar a Striking Fitness <Arrow diagonal /></Link></main>;
}

function NotFoundPage() {
  usePageMeta({ title: 'Página no encontrada | Striking Fitness', description: 'La página solicitada no existe.', canonical: 'https://striking-fitness.com/404/', robots: 'noindex,follow' });
  return <main className="not-found page-pad" id="main-content"><span>404</span><p className="kicker"><i /> Fuera del ring</p><h1>Esta página<br />no existe.</h1><p>Regresa al inicio o encuentra la sede más cercana para continuar.</p><div><Link className="button button-acid" to="/">Volver al inicio <Arrow /></Link><Link className="underlink" to="/sedes-contacto">Ver sedes <Arrow diagonal /></Link></div></main>;
}

function Footer() {
  return (
    <footer className="footer page-pad">
      <div className="footer-brand"><Logo /><p>Academia de deportes de combate.<br />Orgullosamente de Cali.</p></div>
      <div><p className="footer-label">Sede Cedro</p><address>Calle 7 # 27-08<br />Cali, Colombia</address></div>
      <div><p className="footer-label">Sede Cámbulos</p><address>Calle 9 # 42-156<br />Cali, Colombia</address></div>
      <div className="footer-contact"><a href="tel:+573188594270">318 859 4270 <Arrow diagonal /></a><a href="https://www.instagram.com/strikingfitness/" target="_blank" rel="noreferrer">Instagram <Arrow diagonal /></a></div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Striking Fitness</span><span><Link to="/privacidad">Privacidad</Link> · <Link to="/terminos">Términos de uso</Link></span></div>
    </footer>
  );
}

function App() {
  const { pathname } = useLocation();
  const isBoxingPage = pathname === '/boxeo' || pathname === '/boxeo/' || pathname === '/academia-de-boxeo-cali' || pathname === '/academia-de-boxeo-cali/';
  const isBjjPage = pathname === '/brazilian-jiu-jitsu' || pathname === '/brazilian-jiu-jitsu/' || pathname === '/jiu-jitsu-brasileno-bjj-brazilian-jiu-jitsu-cali' || pathname === '/jiu-jitsu-brasileno-bjj-brazilian-jiu-jitsu-cali/';
  const isKickBoxingPage = pathname === '/kick-boxing' || pathname === '/kick-boxing/' || pathname === '/academia-kick-boxing-cali' || pathname === '/academia-kick-boxing-cali/';
  const isMmaPage = pathname === '/mma' || pathname === '/mma/' || pathname === '/escuela-de-mma-o-artes-marciales-mixtas-cali' || pathname === '/escuela-de-mma-o-artes-marciales-mixtas-cali/';
  const isContactPage = pathname === '/sedes-contacto' || pathname === '/sedes-contacto/' || pathname === '/sedes-y-contacto' || pathname === '/sedes-y-contacto/';
  return (
    <Layout>{pathname === '/' ? <HomePage /> : isBoxingPage ? <BoxingPage /> : isBjjPage ? <BjjPage /> : isKickBoxingPage ? <KickBoxingPage /> : isMmaPage ? <MmaPage /> : isContactPage ? <ContactPage /> : pathname === '/eventos' || pathname === '/eventos/' ? <EventsPage /> : pathname === '/privacidad' || pathname === '/privacidad/' ? <LegalPage type="privacidad" /> : pathname === '/terminos' || pathname === '/terminos/' ? <LegalPage type="terminos" /> : <NotFoundPage />}</Layout>
  );
}

createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter><App /></BrowserRouter></React.StrictMode>);
