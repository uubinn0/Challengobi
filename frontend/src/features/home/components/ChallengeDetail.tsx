import React from 'react';
import { useParams } from 'react-router-dom';
import ChallengeDetailModal from '../../../components/modals/ChallengeDetailModal';
import type { Challenge } from '../types';

interface ChallengeDetailProps {
  challenges: Challenge[];
}

const ChallengeDetail: React.FC<ChallengeDetailProps> = ({ challenges }) => {
  const { id } = useParams();
  const challenge = challenges.find(c => c.id === Number(id));

  console.log('ChallengeDetail - challenges:', challenges);
  console.log('ChallengeDetail - found challenge:', challenge);

  if (!challenge) return null;

  return (
    <ChallengeDetailModal
      isOpen={true}
      onClose={() => {}}
      challenge={challenge}
    />
  );
};

export default ChallengeDetail;

