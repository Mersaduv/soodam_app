import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="fa" dir="rtl">
      <Head>
      <link rel="preload" href="/fonts/estedad/Estedad-Light.woff2" as="font" crossOrigin="anonymous"></link>

      <link rel="preload" href="/fonts/estedad/Estedad-Regular.woff2" as="font" crossOrigin="anonymous"></link>

      <link rel="preload" href="/fonts/estedad/Estedad-Medium.woff2" as="font" crossOrigin="anonymous"></link>

      <link rel="preload" href="/fonts/estedad/Estedad-SemiBold.woff2" as="font" crossOrigin="anonymous"></link>

      <link rel="preload" href="/fonts/estedad/Estedad-Bold.woff2" as="font" crossOrigin="anonymous"></link>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
