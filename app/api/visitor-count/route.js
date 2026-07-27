export async function GET() {
  try {
    const { default: db } = await import('../../../Firebase/Firebase-admin');
    const ref = db.collection('meta').doc('siteStats');
    const doc = await ref.get();
    const count = doc.exists ? (doc.data()?.visitorCount ?? 0) : 0;
    return Response.json({ count });
  } catch {
    return Response.json({ count: 0 });
  }
}

export async function POST() {
  try {
    const { default: db } = await import('../../../Firebase/Firebase-admin');
    const { FieldValue } = await import('firebase-admin/firestore');
    const ref = db.collection('meta').doc('siteStats');
    await ref.set({ visitorCount: FieldValue.increment(1) }, { merge: true });
    const doc = await ref.get();
    return Response.json({ count: doc.data()?.visitorCount ?? 0 });
  } catch {
    return Response.json({ count: 0 });
  }
}
