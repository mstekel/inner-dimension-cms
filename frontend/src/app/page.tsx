type Teachings = {
  id: number;
  title: string;
  subtitle: string;
  video_url: string;
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
    console.error('Failed to fetch dynamic site title, using fallback', err);
  }
  return 'The Inner Dimension Torah Library';
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
  const currentLang = searchParams.lang || 'en';
  const isRtl = currentLang === 'he';

  const [items, siteTitle] = await Promise.all([
    getInnerTeachings(currentLang),
    getSiteTitle(currentLang)
  ]);

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} style={{ 
      padding: '3rem 2rem', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      color: '#1a1a1a',
      backgroundColor: '#fdfdfd',
      minHeight: '100vh',
    }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexDirection: isRtl ? 'row-reverse' : 'row',
        flexWrap: 'wrap',
        gap: '1.5rem',
        borderBottom: '2px solid #eaeaea',
        paddingBottom: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        <h1 style={{ 
          fontSize: '1.8rem', 
          fontWeight: 700, 
          margin: 0,
          color: '#2c3e50',
          textAlign: isRtl ? 'right' : 'left'
        }}>{siteTitle}</h1>
        
        {/* Modern Segmented Control Language Switcher */}
        <nav style={{ 
          display: 'inline-flex', 
          backgroundColor: '#eeeeee', 
          padding: '4px', 
          borderRadius: '30px',
          direction: 'ltr' /* Always layout switcher LTR for consistent pill order */
        }}>
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
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '20px',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.9rem',
                  textDecoration: 'none', 
                  color: isActive ? '#ffffff' : '#555555',
                  backgroundColor: isActive ? '#3498db' : 'transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                {lang.label}
              </a>
            );
          })}
        </nav>
      </header>

      {items.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem', 
          backgroundColor: '#ffffff', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
          border: '1px solid #f0f0f0',
          color: '#7f8c8d'
        }}>
          <p style={{ fontSize: '1.1rem', margin: 0 }}>
            {currentLang === 'he' ? 'אין עדיין מאמרים בשפה זו.' : 
             currentLang === 'ru' ? 'В этой категории пока нет статей.' : 
             'No articles found in this language yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {items.map((item) => (
            <article 
              key={item.id} 
              style={{ 
                backgroundColor: '#ffffff', 
                padding: '2rem', 
                borderRadius: '12px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                border: '1px solid #f0f0f0',
                textAlign: isRtl ? 'right' : 'left'
              }}
            >
              <h2 style={{ fontSize: '1.5rem', marginTop: 0, marginBottom: '0.5rem', color: '#2c3e50' }}>{item.title}</h2>
              {item.subtitle && (
                <p style={{ 
                  color: '#7f8c8d', 
                  fontStyle: 'italic', 
                  fontSize: '1rem',
                  marginTop: 0,
                  marginBottom: '1.5rem' 
                }}>{item.subtitle}</p>
              )}
              {item.video_url && (
                <div style={{ display: 'flex', justifyContent: isRtl ? 'flex-start' : 'flex-end' }}>
                  <a 
                    href={item.video_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#ffffff', 
                      backgroundColor: '#e74c3c',
                      padding: '8px 16px',
                      borderRadius: '25px',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      boxShadow: '0 2px 4px rgba(231,76,60,0.2)',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <span>▶</span>
                    <span>
                      {currentLang === 'he' ? 'צפה בשיעור' : 
                       currentLang === 'ru' ? 'Смотреть лекцию' : 
                       'Watch Associated Lecture'}
                    </span>
                  </a>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
