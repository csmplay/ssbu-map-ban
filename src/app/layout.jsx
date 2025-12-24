export const metadata = {
  title: 'CSM SSBU MAP BAN',
  description: 'Ban the maps :>',
}

export default function RootLayout({ children }) {
 return (
    <html lang="en">
      <body>
        <RuntimeEnvLoader />
        {children}
      </body>
    </html>
  )
}

function RuntimeEnvLoader() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (async () => {
            try {
              const res = await fetch('/api/runtime-env');
              const env = await res.json();
              window.__RUNTIME_ENV__ = env;
            } catch (e) {
              console.error('Failed to load runtime env:', e);
              window.__RUNTIME_ENV__ = {
                NEXT_PUBLIC_CDN_BASE: "https://cdn.example.com",
              };
            }
          })();
        `,
      }}
    />
  );
}
