export const metadata = { title: "Privacy policy" };

// Draft. /graduate fills this in, and you review it before production. It isn't legal advice.
export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl p-8 prose">
      <h1>Privacy policy</h1>
      <p>
        <strong>Draft: review before launch.</strong>
      </p>
      <h2>What we collect</h2>
      <p>The account details you give us, and how you use the product.</p>
      <h2>Who processes it</h2>
      <ul>
        <li>Supabase (database and authentication)</li>
        <li>Vercel (hosting)</li>
        <li>Sentry (error reports)</li>
        <li>PostHog (product analytics)</li>
        <li>Stripe (payments)</li>
        <li>Resend (email)</li>
      </ul>
      <h2>Your rights</h2>
      <p>You can export or delete your data and your account at any time from your account settings.</p>
    </main>
  );
}
