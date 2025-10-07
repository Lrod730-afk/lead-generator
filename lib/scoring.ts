import { Business, LeadScore, LeadScoreMetrics } from '@/types';

/**
 * Calculate lead score based on business metrics
 * HOT (Red): High potential - needs significant digital help
 * WARM (Yellow): Medium potential - needs some improvements
 * COLD (Green): Low potential - already doing well
 */
export function calculateLeadScore(business: Partial<Business>): LeadScore {
  const metrics = extractMetrics(business);
  const score = computeScore(metrics);

  if (score >= 70) return 'HOT';
  if (score >= 40) return 'WARM';
  return 'COLD';
}

/**
 * Extract metrics from business data
 */
function extractMetrics(business: Partial<Business>): LeadScoreMetrics {
  return {
    hasWebsite: !!business.website,
    reviewCount: business.reviewCount || 0,
    rating: business.rating,
    hasSocialMedia: hasSocialMediaPresence(business.socialMedia),
    hasEmail: !!business.email,
  };
}

/**
 * Compute numerical score (0-100, higher = hotter lead)
 */
function computeScore(metrics: LeadScoreMetrics): number {
  let score = 0;

  // No website = +40 points (major opportunity)
  if (!metrics.hasWebsite) {
    score += 40;
  }

  // Low reviews = +30 points
  if (metrics.reviewCount < 10) {
    score += 30;
  } else if (metrics.reviewCount < 50) {
    score += 15;
  }

  // Low rating = +20 points (reputation management opportunity)
  if (metrics.rating && metrics.rating < 3.5) {
    score += 20;
  } else if (metrics.rating && metrics.rating < 4.0) {
    score += 10;
  }

  // No social media = +15 points
  if (!metrics.hasSocialMedia) {
    score += 15;
  }

  // No email = +10 points (needs better contact options)
  if (!metrics.hasEmail) {
    score += 10;
  }

  return Math.min(score, 100);
}

/**
 * Determine reasons why a business needs help
 */
export function determineNeedsHelp(business: Partial<Business>): string[] {
  const needs: string[] = [];

  if (!business.website) {
    needs.push('Missing website - needs online presence');
  }

  if (!business.email) {
    needs.push('No email found - limited contact options');
  }

  if (business.reviewCount !== undefined && business.reviewCount < 10) {
    needs.push('Low review count - needs review generation');
  }

  if (business.rating !== undefined && business.rating < 3.5) {
    needs.push('Low rating - needs reputation management');
  }

  if (!hasSocialMediaPresence(business.socialMedia)) {
    needs.push('No social media presence');
  }

  if (business.reviewCount !== undefined && business.reviewCount >= 10 &&
      business.rating !== undefined && business.rating >= 4.0 &&
      business.website) {
    needs.push('Doing well - potential for AI automation or advanced marketing');
  }

  return needs;
}

/**
 * Check if business has any social media presence
 */
function hasSocialMediaPresence(socialMedia?: {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
}): boolean {
  if (!socialMedia) return false;
  return !!(
    socialMedia.facebook ||
    socialMedia.instagram ||
    socialMedia.twitter ||
    socialMedia.linkedin
  );
}

/**
 * Get score color for UI display
 */
export function getScoreColor(score: LeadScore): string {
  switch (score) {
    case 'HOT':
      return 'red';
    case 'WARM':
      return 'yellow';
    case 'COLD':
      return 'green';
  }
}

/**
 * Get score badge classes for Tailwind
 */
export function getScoreBadgeClasses(score: LeadScore): string {
  const base = 'px-3 py-1 rounded-full text-xs font-semibold';
  switch (score) {
    case 'HOT':
      return `${base} bg-red-100 text-red-800 border border-red-200`;
    case 'WARM':
      return `${base} bg-yellow-100 text-yellow-800 border border-yellow-200`;
    case 'COLD':
      return `${base} bg-green-100 text-green-800 border border-green-200`;
  }
}

/**
 * Process and score a business
 */
export function processBusinessData(business: Partial<Business>): Business {
  const leadScore = calculateLeadScore(business);
  const needsHelp = determineNeedsHelp(business);

  return {
    ...business,
    leadScore,
    needsHelp,
    dateAdded: business.dateAdded || new Date(),
    contacted: business.contacted || false,
  } as Business;
}
