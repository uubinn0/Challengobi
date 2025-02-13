import { createChallenge } from '../api/challenge';

const ChallengeForm = () => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await createChallenge({
        challenge_category: 1,
        creator_id: 1,
        challenge_title: "새로운 챌린지",
        challenge_info: "챌린지 설명",
        period: 30,
        start_date: new Date(),
        budget: 100000,
        max_participants: 10
      });
      console.log('챌린지 생성 성공:', response);
    } catch (error) {
      console.error('챌린지 생성 실패:', error);
    }
  };

  return (
    // 폼 구현
  );
}; 