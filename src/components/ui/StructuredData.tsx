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
          description: "AIを活用した相談・診断サービス",
          url: "https://ai-consultation.netlify.app",
          potentialAction: {
            "@type": "SearchAction",
            target:
              "https://ai-consultation.netlify.app/explore?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        };

      case "organization":
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "AIだけどなにか相談ある？",
          url: "https://ai-consultation.netlify.app",
          logo: "https://ai-consultation.netlify.app/favicon.svg",
          sameAs: ["https://ai-consultation.netlify.app"],
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
          },
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
          },
          publisher: {
            "@type": "Organization",
            name: "AIだけどなにか相談ある？",
            logo: {
              "@type": "ImageObject",
              url: "https://ai-consultation.netlify.app/favicon.svg",
            },
          },
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
