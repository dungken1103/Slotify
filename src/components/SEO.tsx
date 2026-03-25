interface SEOProps {
  title?: string;
  description?: string;
}

export function SEO({ title, description }: SEOProps) {
  const defaultTitle = "Slotify";
  const defaultDesc =
    "Slotify - Hệ thống đặt vé xem phim trực tuyến hiện đại, nhanh chóng và mượt mà nhất. Trải nghiệm rạp chiếu phim trong tầm tay.";

  const finalTitle = title ? `${title} | ${defaultTitle}` : defaultTitle;
  const finalDesc = description || defaultDesc;

  return (
    <>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDesc} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDesc} />
    </>
  );
}
