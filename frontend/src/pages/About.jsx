import PageWrapper from '../components/shared/PageWrapper';
import SectionHeader from '../components/shared/SectionHeader';

export default function About() { 
  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <SectionHeader title="About Qinert" subtitle="Information about our quantum authentication platform." centered />
      </div>
    </PageWrapper>
  );
}
