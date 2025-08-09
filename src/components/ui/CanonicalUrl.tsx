import { Helmet } from "react-helmet-async";

interface CanonicalUrlProps {
  url: string;
}

const CanonicalUrl: React.FC<CanonicalUrlProps> = ({ url }) => {
  return (
    <Helmet>
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default CanonicalUrl;
