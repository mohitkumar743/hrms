import { FeaturePage } from '../../components/FeaturePage.jsx';
import { buildPageMetadata, featurePages } from '../../lib/site.js';

const page = featurePages.find((item) => item.slug === 'payroll');

export const metadata = buildPageMetadata(page);

export default function PayrollPage() {
  return <FeaturePage page={page} />;
}
