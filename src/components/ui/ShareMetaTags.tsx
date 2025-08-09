import { Helmet } from "react-helmet-async";
import { ShareMetadata } from "../../types";

interface ShareMetaTagsProps {
  metadata?: ShareMetadata | null;
  title?: string;
  description?: string;
  url?: string;
  imageUrl?: string;
}

const ShareMetaTags: React.FC<ShareMetaTagsProps> = ({
  metadata,
  title,
  description,
  url,
  imageUrl,
}) => {
  // metadataが渡された場合はそれを使用、そうでなければ個別のpropsを使用
  const finalTitle = metadata?.title || title || "AIだけどなにか相談ある？";
  const finalDescription =
    metadata?.description ||
    description ||
    "AIに簡単に相談できるプラットフォーム";
  const finalUrl =
    metadata?.url || url || "https://ai-consultation.netlify.app";
  const finalImageUrl = metadata?.imageUrl || imageUrl;

  return (
    <Helmet>
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      {finalImageUrl && <meta property="og:image" content={finalImageUrl} />}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="AIだけどなにか相談ある？" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={finalUrl} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      {finalImageUrl && <meta name="twitter:image" content={finalImageUrl} />}

      {/* Additional meta tags */}
      <meta name="description" content={finalDescription} />
      <meta
        name="keywords"
        content="AI相談, 相談AI, AIアドバイス, 診断クイズ, AI診断"
      />
    </Helmet>
  );
};

export default ShareMetaTags;
