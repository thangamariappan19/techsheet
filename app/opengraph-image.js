import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'TechSheet - Modern Developer Hub';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '60px',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
                    <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '36px',
                        fontWeight: '900',
                        color: 'white',
                    }}>T</div>
                    <div style={{ fontSize: '64px', fontWeight: '900', color: 'white', letterSpacing: '-3px' }}>
                        TechSheet
                    </div>
                </div>
                <div style={{ fontSize: '26px', color: '#94a3b8', textAlign: 'center', maxWidth: '820px', lineHeight: '1.5' }}>
                    Daily deep-dives on frontend architecture, AI, and software engineering for senior developers
                </div>
                <div style={{ marginTop: '48px', display: 'flex', gap: '14px' }}>
                    {['React', 'Next.js', 'TypeScript', 'AI', 'Architecture'].map(tag => (
                        <div key={tag} style={{
                            padding: '10px 22px',
                            borderRadius: '100px',
                            background: 'rgba(99, 102, 241, 0.2)',
                            border: '1px solid rgba(99, 102, 241, 0.5)',
                            color: '#a5b4fc',
                            fontSize: '18px',
                            fontWeight: '700',
                        }}>{tag}</div>
                    ))}
                </div>
                <div style={{ marginTop: '52px', color: '#475569', fontSize: '18px', fontWeight: '600' }}>
                    techsheet.vercel.app
                </div>
            </div>
        ),
        { width: 1200, height: 630 }
    );
}
