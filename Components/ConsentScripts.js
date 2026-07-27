'use client';
import { useEffect, useState } from 'react';
import Script from 'next/script';

const GA_ID = 'G-RG39JLNYG7';
const ADSENSE_ID = 'ca-pub-6762060430561818';
const CONSENT_KEY = 'techsheet-cookie-consent';

function applyGtagConsent(consent) {
  if (typeof gtag !== 'function') return;
  gtag('consent', 'update', {
    analytics_storage: consent.analytics ? 'granted' : 'denied',
    ad_storage: consent.advertising ? 'granted' : 'denied',
    ad_user_data: consent.advertising ? 'granted' : 'denied',
    ad_personalization: consent.advertising ? 'granted' : 'denied',
  });
}

export default function ConsentScripts() {
  const [showAdsense, setShowAdsense] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONSENT_KEY);
      if (saved) {
        const c = JSON.parse(saved);
        applyGtagConsent(c);
        setShowAdsense(!!c.advertising);
      }
    } catch {}

    function onConsentUpdate(e) {
      applyGtagConsent(e.detail);
      setShowAdsense(!!e.detail.advertising);
    }
    window.addEventListener('cookie-consent-update', onConsentUpdate);
    return () => window.removeEventListener('cookie-consent-update', onConsentUpdate);
  }, []);

  return (
    <>
      {/* GA4 — loads always but respects Consent Mode v2 defaults (denied until user accepts) */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { page_path: window.location.pathname });
        `}
      </Script>

      {/* AdSense — only loads after advertising consent is granted */}
      {showAdsense && (
        <Script
          id="adsense-js"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
