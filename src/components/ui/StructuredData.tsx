import { Helmet } from "react-helmet-async";

interface StructuredDataProps {
  type: "website" | "article" | "quiz" | "organization";
  data: any;
}

const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const getStructuredData = () => {
    switch (type) {
      case "website":
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "AIだけどなにか相談ある？",
          alternateName: "AI相談メーカー",
          description:
            "AIに簡単に相談できるプラットフォーム。あなたの相談に診断テスト形式で回答します。",
          url: "https://ai-consultation.netlify.app",
          potentialAction: {
            "@type": "SearchAction",
            target:
              "https://ai-consultation.netlify.app/explore?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
          publisher: {
            "@type": "Organization",
            name: "AIだけどなにか相談ある？",
            url: "https://ai-consultation.netlify.app",
          },
        };

      case "organization":
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "AIだけどなにか相談ある？",
          alternateName: "AI相談メーカー",
          description: "AIを活用した相談・診断サービス",
          url: "https://ai-consultation.netlify.app",
          logo: "https://ai-consultation.netlify.app/favicon.svg",
          sameAs: ["https://ai-consultation.netlify.app"],
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            availableLanguage: ["Japanese", "English"],
          },
        };

      case "quiz":
        return {
          "@context": "https://schema.org",
          "@type": "Quiz",
          name: data.title || "AI診断クイズ",
          description: data.description || "AIによる診断クイズ",
          url: data.url || "https://ai-consultation.netlify.app",
          author: {
            "@type": "Organization",
            name: "AIだけどなにか相談ある？",
            url: "https://ai-consultation.netlify.app",
          },
          publisher: {
            "@type": "Organization",
            name: "AIだけどなにか相談ある？",
            url: "https://ai-consultation.netlify.app",
          },
          inLanguage: "ja",
        };

      case "article":
        return {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: data.title || "AI相談サービス",
          description: data.description || "AIを活用した相談・診断サービス",
          url: data.url || "https://ai-consultation.netlify.app",
          author: {
            "@type": "Organization",
            name: "AIだけどなにか相談ある？",
            url: "https://ai-consultation.netlify.app",
          },
          publisher: {
            "@type": "Organization",
            name: "AIだけどなにか相談ある？",
            logo: {
              "@type": "ImageObject",
              url: "https://ai-consultation.netlify.app/favicon.svg",
            },
          },
          inLanguage: "ja",
          datePublished: data.datePublished || new Date().toISOString(),
        };

      default:
        return null;
    }
  };

  const structuredData = getStructuredData();

  if (!structuredData) {
    return null;
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default StructuredData;
