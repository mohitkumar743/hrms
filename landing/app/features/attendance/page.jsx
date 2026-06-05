import { FeaturePage } from '../../components/FeaturePage.jsx';
import { buildPageMetadata, featurePages } from '../../lib/site.js';

const page = featurePages.find((item) => item.slug === 'attendance');

export const metadata = buildPageMetadata(page);

export default function AttendancePage() {
  return <FeaturePage page={page} />;
}
