type Teachings = {
  id: number;
  title: string;
  subtitle: string;
  video_url: string;
};

const LOCALIZED_CONTENT = {
  en: {
    title: 'Torah Library: The Inner Dimension',
    tag: '“Open my eyes, that I may behold wonders from Your Torah” (Psalms 119:18)',
    description: 'Synthesizing the inner dimensions of the Torah, Kabbalah, and Chassidic mysticism with modern science, mathematics, psychology, and the rectification of the human soul.',
    empty: 'No articles found in this language yet.',
    watch: 'Watch Lecture',
    brand: 'Gal Einai',
  },
  he: {
    title: 'ספריית תורת הפנימיות',
    tag: '״גַּל עֵינַי וְאַבִּיטָה נִפְלָאוֹת מִתּוֹרָתֶךָ״ (תהלים קיט, יח)',
    description: 'שילוב פנימיות התורה, חכמת הקבלה ועמקי החסידות עם עולם המדע, המתמטיקה, הפסיכולוגיה ותיקון הנפש והעולם.',
    empty: 'אין עדיין מאמרים בשפה זו.',
    watch: 'צפה בשיעור',
    brand: 'גל עיני',
  },
  ru: {
    title: 'Библиотека Торы: Внутреннее Измерение',
    tag: '«Открой глаза мои, и увижу чудеса Торы Твоей» (Псалмы 119:18)',
    description: 'Синтез внутреннего измерения Торы, Каббалы и хасидского мистицизма с современными науками, математикой, психологией и исправлением души.',
    empty: 'В этой категории пока нет статей.',
    watch: 'Смотреть лекцию',
    brand: 'Галь Эйнай',
  }
};

async function getSiteTitle(locale: string, fallbackTitle: string): Promise<string> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
  try {
    if (locale === 'en') {
      const res = await fetch(`${backendUrl}/api/v2/pages/2/?fields=_,title`, {
        next: { revalidate: 60 }
      });
      if (res.ok) {
        const data = await res.json();
        return data.title || fallbackTitle;
      }
    } else {
      const res = await fetch(`${backendUrl}/api/v2/pages/?translation_of=2&locale=${locale}&fields=_,title`, {
        next: { revalidate: 60 }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          return data.items[0].title;
        }
      }
    }
  } catch (err) {
    console.error('Failed to fetch dynamic site title, using fallback', err);
  }
  return fallbackTitle;
}

async function getInnerTeachings(locale: string): Promise<Teachings[]> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
  
  const res = await fetch(`${backendUrl}/api/v2/pages/?type=content.ArticlePage&fields=_,id,title,subtitle,video_url&locale=${locale}`, {
    next: { revalidate: 60 } 
  });
  
  if (!res.ok) throw new Error('Failed to fetch inner dimension materials');
  const data = await res.json();
  return data.items;
}

export default async function HomePage(props: { searchParams: Promise<{ lang?: string }> }) {
  const searchParams = await props.searchParams;
  const currentLang = (searchParams.lang || 'en') as 'en' | 'he' | 'ru';
  const isRtl = currentLang === 'he';

  const localization = LOCALIZED_CONTENT[currentLang] || LOCALIZED_CONTENT.en;

  const [items, siteTitle] = await Promise.all([
    getInnerTeachings(currentLang),
    getSiteTitle(currentLang, localization.title)
  ]);

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Dynamic Spiritual Hero Banner */}
      <section className="hero-container">
        <span className="hero-tag">{localization.tag}</span>
        <h1 className="hero-title">{siteTitle}</h1>
        <p className="hero-desc">{localization.description}</p>
      </section>

      <div className="content-wrapper">
        {/* Navigation & Segmented Language Control */}
        <header className="nav-bar">
          <a href="#" className="nav-logo">
            <span className="nav-logo-gold">✦</span> {localization.brand}
          </a>
          <nav className="lang-switcher-track">
            {[
              { code: 'en', label: 'English' },
              { code: 'he', label: 'עברית' },
              { code: 'ru', label: 'Русский' }
            ].map((lang) => {
              const isActive = currentLang === lang.code;
              return (
                <a 
                  key={lang.code}
                  href={`?lang=${lang.code}`} 
                  className={`lang-button ${isActive ? 'active' : ''}`}
                >
                  {lang.label}
                </a>
              );
            })}
          </nav>
        </header>

        {/* Article Cards */}
        {items.length === 0 ? (
          <div className="empty-card">
            <div className="empty-icon">📜</div>
            <p className="empty-text">{localization.empty}</p>
          </div>
        ) : (
          <div className="articles-grid">
            {items.map((item) => (
              <article key={item.id} className="article-card">
                <h2 className="article-title">{item.title}</h2>
                {item.subtitle && <p className="article-subtitle">{item.subtitle}</p>}
                {item.video_url && (
                  <div style={{ display: 'flex', justifyContent: isRtl ? 'flex-start' : 'flex-end', marginTop: '1.5rem' }}>
                    <a 
                      href={item.video_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn-video"
                    >
                      <span>▶</span>
                      <span>{localization.watch}</span>
                    </a>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
