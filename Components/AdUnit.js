'use client';
import { useEffect, useRef } from 'react';

export const ADSENSE_PUBLISHER_ID = 'ca-pub-6762060430561818';

// slot="auto" uses Auto Ads placement (no manual slot needed)
// For manual slots: go to AdSense → Ads → By ad unit → Create → copy the 10-digit slot ID
export default function AdUnit({ slot = 'auto', format = 'auto', className = '' }) {
    const adRef = useRef(null);
    const pushed = useRef(false);

    useEffect(() => {
        if (pushed.current) return;
        try {
            if (adRef.current && adRef.current.offsetWidth > 0) {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                pushed.current = true;
            }
        } catch (e) {}
    }, []);

    // Don't render manual <ins> for auto slot — Auto Ads handles placement
    if (slot === 'auto') return null;

    return (
        <div ref={adRef} className={`overflow-hidden ${className}`}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={ADSENSE_PUBLISHER_ID}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive="true"
            />
        </div>
    );
}
