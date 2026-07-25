type Teachings = {
  id: number;
  title: string;
  subtitle?: string;
  body?: string;
  video_url?: string;
};

type PageDetail = {
  id: number;
  title: string;
  subtitle?: string;
  body?: string;
  meta?: {
    parent?: {
      id: number;
      title: string;
    };
  };
};

const HOME_PAGE_IDS: Record<string, number> = {
  en: 2,
  he: 5,
  ru: 7
};

const LOCALIZED_CONTENT = {
  en: {
    tag: '“Open my eyes, that I may behold wonders from Your Torah” (Psalms 119:18)',
    description: 'Synthesizing the inner dimensions of the Torah, Kabbalah, and Chassidic mysticism with modern science, mathematics, psychology, and the rectification of the human soul.',
    empty: 'No sub-topics or articles found in this section.',
    watch: 'Watch Lecture',
    explore: 'Explore Sub-Topics',
    home: 'Home',
    subtopics: 'Sub-Topics & Child Articles',
    brand: 'Gal Einai',
  },
  he: {
    tag: '״גַּל עֵינַי וְאַבִּיטָה נִפְלָאוֹת מִתּוֹרָתֶךָ״ (תהלים קיט, יח)',
    description: 'שילוב פנימיות התורה, חכמת הקבלה ועמקי החסידות עם עולם המדע, המתמטיקה, הפסיכולוגיה ותיקון הנפש והעולם.',
    empty: 'אין עדיין מאמרים או תתי-נושאים במדור זה.',
    watch: 'צפה בשיעור',
    explore: 'חקר תתי-נושאים',
    home: 'בית',
    subtopics: 'תתי-נושאים ומאמרי המשך',
    brand: 'גל עיני',
  },
  ru: {
    tag: '«Открой глаза мои, и увижу чудеса Торы Твоей» (Псалмы 119:18)',
    description: 'Синтез внутреннего измерения Торы, Каббалы и хасидского мистицизма с современными науками, математикой, психологией и исправлением души.',
    empty: 'В этом разделе пока нет подтем или статей.',
    watch: 'Смотреть лекцию',
    explore: 'Исследовать подтемы',
    home: 'Главная',
    subtopics: 'Подтемы и вложенные статьи',
    brand: 'Галь Эйнай',
  }
};

async function getSiteTitle(locale: string): Promise<string> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
  try {
    if (locale === 'en') {
      const res = await fetch(`${backendUrl}/api/v2/pages/2/?fields=_,title`, {
        next: { revalidate: 60 }
      });
      if (res.ok) {
        const data = await res.json();
        return data.title || 'The Inner Dimension Torah Library';
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
    console.error('Failed to fetch dynamic site title', err);
  }
  return 'The Inner Dimension Torah Library';
}

async function getPageDetail(pageId: number): Promise<PageDetail | null> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
  try {
    const res = await fetch(`${backendUrl}/api/v2/pages/${pageId}/?fields=_,id,title,subtitle,body`, {
      next: { revalidate: 60 }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error(`Failed to fetch detail for page ${pageId}`, err);
  }
  return null;
}

async function getChildArticles(parentId: number, locale: string): Promise<Teachings[]> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
  try {
    const res = await fetch(`${backendUrl}/api/v2/pages/?child_of=${parentId}&type=content.ArticlePage&fields=_,id,title,subtitle,body,video_url&locale=${locale}`, {
      next: { revalidate: 60 } 
    });
    
    if (res.ok) {
      const data = await res.json();
      return data.items || [];
    }
  } catch (err) {
    console.error(`Failed to fetch child pages for parent ${parentId}`, err);
  }
  return [];
}

export default async function HomePage(props: { searchParams: Promise<{ lang?: string; parent_id?: string }> }) {
  const searchParams = await props.searchParams;
  const currentLang = (searchParams.lang || 'en') as 'en' | 'he' | 'ru';
  const isRtl = currentLang === 'he';

  const defaultHomeId = HOME_PAGE_IDS[currentLang] || 2;
  const activeParentId = searchParams.parent_id ? parseInt(searchParams.parent_id, 10) : defaultHomeId;
  const isRootLevel = activeParentId === defaultHomeId;

  const [items, siteTitle, currentParentDetail] = await Promise.all([
    getChildArticles(activeParentId, currentLang),
    getSiteTitle(currentLang),
    !isRootLevel ? getPageDetail(activeParentId) : Promise.resolve(null)
  ]);

  const localization = LOCALIZED_CONTENT[currentLang] || LOCALIZED_CONTENT.en;

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
          <a href={`?lang=${currentLang}`} className="nav-logo">
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

        {/* Tree Breadcrumb Navigation Bar */}
        {!isRootLevel && (
          <div className="breadcrumb-bar">
            <a href={`?lang=${currentLang}`} className="breadcrumb-link">
              ✦ {localization.home}
            </a>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{currentParentDetail?.title || `Page #${activeParentId}`}</span>
          </div>
        )}

        {/* Active Parent Page Content Header */}
        {!isRootLevel && currentParentDetail && (
          <div className="parent-detail-card">
            <h2 className="parent-detail-title">{currentParentDetail.title}</h2>
            {currentParentDetail.subtitle && (
              <p className="parent-detail-subtitle">{currentParentDetail.subtitle}</p>
            )}
            {currentParentDetail.body && (
              <div 
                className="parent-detail-body"
                dangerouslySetInnerHTML={{ __html: currentParentDetail.body }}
              />
            )}
          </div>
        )}

        {!isRootLevel && (
          <h3 className="subtopics-heading">
            <span>📚</span> {localization.subtopics}
          </h3>
        )}

        {/* Article Cards Grid */}
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
                {item.body && (
                  <p className="article-body-summary">
                    {item.body.replace(/<[^>]+>/g, '')}
                  </p>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '1.5rem' }}>
                  <a 
                    href={`?parent_id=${item.id}&lang=${currentLang}`}
                    className="btn-subtopics"
                  >
                    <span>{localization.explore}</span>
                    <span>{isRtl ? '←' : '→'}</span>
                  </a>

                  {item.video_url && (
                    <a 
                      href={item.video_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn-video"
                    >
                      <span>▶</span>
                      <span>{localization.watch}</span>
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
