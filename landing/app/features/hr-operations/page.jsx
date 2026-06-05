import { FeaturePage } from '../../components/FeaturePage.jsx';
import { buildPageMetadata, featurePages } from '../../lib/site.js';

const page = featurePages.find((item) => item.slug === 'hr-operations');

export const metadata = buildPageMetadata(page);

export default function HrOperationsPage() {
  return <FeaturePage page={page} />;
}
