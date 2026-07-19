'use client';
import { useEffect, useRef } from 'react';

// Replace with your AdSense publisher ID from adsense.google.com
export const ADSENSE_PUBLISHER_ID = 'ca-pub-XXXXXXXXXXXXXXXX';

export default function AdUnit({ slot, format = 'auto', className = '' }) {
    const adRef = useRef(null);

    useEffect(() => {
        try {
            if (adRef.current && adRef.current.offsetWidth > 0) {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (e) {}
    }, []);

    if (ADSENSE_PUBLISHER_ID === 'ca-pub-XXXXXXXXXXXXXXXX') return null;

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
