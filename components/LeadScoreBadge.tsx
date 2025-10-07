import { LeadScore } from '@/types';
import { getScoreBadgeClasses } from '@/lib/scoring';

interface LeadScoreBadgeProps {
  score: LeadScore;
}

export default function LeadScoreBadge({ score }: LeadScoreBadgeProps) {
  return (
    <span className={getScoreBadgeClasses(score)}>
      {score}
    </span>
  );
}
