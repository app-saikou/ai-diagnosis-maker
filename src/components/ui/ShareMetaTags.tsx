import { Helmet } from "react-helmet-async";
import { ShareMetadata } from "../../types";

interface ShareMetaTagsProps {
  metadata: ShareMetadata | null;
}

const ShareMetaTags: React.FC<ShareMetaTagsProps> = ({ metadata }) => {
  if (!metadata) {
    return null;
  }

  return (
    <Helmet>
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={metadata.url} />
      <meta property="og:title" content={metadata.title} />
      <meta property="og:description" content={metadata.description} />
      {metadata.imageUrl && (
        <meta property="og:image" content={metadata.imageUrl} />
      )}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="AIだけど相談ある？" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={metadata.url} />
      <meta name="twitter:title" content={metadata.title} />
      <meta name="twitter:description" content={metadata.description} />
      {metadata.imageUrl && (
        <meta name="twitter:image" content={metadata.imageUrl} />
      )}

      {/* Additional meta tags */}
      <meta name="description" content={metadata.description} />
      <meta name="keywords" content="AI相談, 診断テスト, パーソナリティ診断" />
    </Helmet>
  );
};

export default ShareMetaTags;
