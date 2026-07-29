import { Button } from '@heroui/react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/shared/PageWrapper';
import SectionHeader from '../components/shared/SectionHeader';

export default function NotFound() {
  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <SectionHeader
          title="404 - Page Not Found"
          subtitle="The quantum state you are looking for has collapsed or does not exist."
          centered
        />
        <div className="mt-8">
          <Button
            as={Link}
            to="/"
            color="primary"
            variant="shadow"
            size="lg"
          >
            Return to Base
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
