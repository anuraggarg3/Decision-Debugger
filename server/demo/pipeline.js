/**
 * Competitor Selection Pipeline with X-Ray Tracing
 * 
 * This demonstrates how to use the X-Ray library to trace a multi-step
 * decision process. Each step records its inputs, outputs, and reasoning.
 */

import { xray } from '../xray-instance.js';
import { sampleProducts, keywordGenerationResponses, getCategoryKey } from './mockData.js';

/**
 * Run the complete competitor selection pipeline
 * @param {object} prospect - The seller's product to find competitors for
 * @returns {object} Result with trace ID and selected competitor
 */
export async function runCompetitorSelectionPipeline(prospect) {
  // Start X-Ray trace
  const trace = xray.startTrace('competitor-selection', {
    prospectAsin: prospect.asin,
    prospectTitle: prospect.title,
    category: prospect.category
  });

  try {
    // Step 1: Generate search keywords (simulated LLM)
    const keywords = await stepKeywordGeneration(trace, prospect);
    
    // Step 2: Search for candidates
    const candidates = await stepCandidateSearch(trace, keywords, prospect);
    
    // Step 3: Apply filters
    const filteredCandidates = await stepApplyFilters(trace, candidates, prospect);
    
    // Step 4: LLM relevance evaluation (remove false positives)
    const verifiedCandidates = await stepLLMEvaluation(trace, filteredCandidates, prospect);
    
    // Step 5: Rank and select best competitor
    const selectedCompetitor = await stepRankAndSelect(trace, verifiedCandidates, prospect);
    
    // Complete the trace
    trace.end({
      selectedCompetitor,
      totalCandidatesEvaluated: candidates.length
    });

    return {
      traceId: trace.id,
      selectedCompetitor,
      summary: {
        keywordsGenerated: keywords.length,
        candidatesFound: candidates.length,
        passedFilters: filteredCandidates.length,
        verifiedCompetitors: verifiedCandidates.length
      }
    };
  } catch (error) {
    trace.fail(error);
    throw error;
  }
}

/**
 * Step 1: Generate search keywords from prospect
 * Simulates an LLM call to extract relevant search terms
 */
async function stepKeywordGeneration(trace, prospect) {
  // Simulate LLM processing time
  await sleep(100);
  
  // Get mock LLM response
  const llmResponse = keywordGenerationResponses[prospect.asin] || {
    keywords: [prospect.title.toLowerCase()],
    reasoning: 'Used product title as fallback keyword'
  };

  // Record this step in X-Ray
  trace.step('keyword_generation', 'generation')
    .input({
      product_title: prospect.title,
      category: prospect.category,
      features: prospect.features
    })
    .output({
      keywords: llmResponse.keywords,
      keyword_count: llmResponse.keywords.length,
      model: 'gpt-4-simulated'
    })
    .meta('llm_latency_ms', 100)
    .reasoning(llmResponse.reasoning)
    .end();

  return llmResponse.keywords;
}

/**
 * Step 2: Search for candidate products
 * Simulates calling a product search API
 */
async function stepCandidateSearch(trace, keywords, prospect) {
  await sleep(150);
  
  // Get mock search results based on category
  const categoryKey = getCategoryKey(prospect);
  const allCandidates = sampleProducts.competitors[categoryKey] || [];
  
  // Simulate search returning results (in real world, would call API for each keyword)
  const candidates = allCandidates.map(c => ({
    ...c,
    searchRelevanceScore: Math.random() * 0.3 + 0.7 // Mock relevance 0.7-1.0
  }));

  // Sort by relevance score
  candidates.sort((a, b) => b.searchRelevanceScore - a.searchRelevanceScore);

  // Record this step
  trace.step('candidate_search', 'search')
    .input({
      keywords: keywords,
      search_limit: 50,
      category_filter: prospect.category
    })
    .output({
      total_results_found: 2847, // Simulated total
      candidates_fetched: candidates.length,
      candidates: candidates.map(c => ({
        asin: c.asin,
        title: c.title,
        price: c.price,
        rating: c.rating,
        reviews: c.reviews,
        relevanceScore: c.searchRelevanceScore.toFixed(3)
      }))
    })
    .meta({
      api_latency_ms: 150,
      search_provider: 'mock-search-api'
    })
    .reasoning(`Searched with ${keywords.length} keywords, fetched top ${candidates.length} results from 2,847 total matches sorted by relevance`)
    .end();

  return candidates;
}

/**
 * Step 3: Apply filters to narrow candidates
 * This is the most detailed step for debugging - shows why each candidate passed/failed
 */
async function stepApplyFilters(trace, candidates, prospect) {
  await sleep(50);

  // Define filter criteria
  const filters = {
    price_range: {
      min: prospect.price * 0.5,
      max: prospect.price * 2,
      rule: '0.5x - 2x of reference price'
    },
    min_rating: {
      value: 3.5,
      rule: 'Must have at least 3.5 stars'
    },
    min_reviews: {
      value: 100,
      rule: 'Must have at least 100 reviews'
    }
  };

  // Evaluate each candidate
  const evaluations = [];
  const passedCandidates = [];

  for (const candidate of candidates) {
    const priceInRange = candidate.price >= filters.price_range.min && 
                         candidate.price <= filters.price_range.max;
    const ratingOk = candidate.rating >= filters.min_rating.value;
    const reviewsOk = candidate.reviews >= filters.min_reviews.value;
    const qualified = priceInRange && ratingOk && reviewsOk;

    const evaluation = {
      asin: candidate.asin,
      title: candidate.title,
      metrics: {
        price: candidate.price,
        rating: candidate.rating,
        reviews: candidate.reviews
      },
      filterResults: {
        price_range: {
          passed: priceInRange,
          detail: priceInRange 
            ? `$${candidate.price} is within $${filters.price_range.min.toFixed(2)}-$${filters.price_range.max.toFixed(2)}`
            : candidate.price < filters.price_range.min
              ? `$${candidate.price} is below minimum $${filters.price_range.min.toFixed(2)}`
              : `$${candidate.price} exceeds maximum $${filters.price_range.max.toFixed(2)}`
        },
        min_rating: {
          passed: ratingOk,
          detail: ratingOk 
            ? `${candidate.rating}★ >= ${filters.min_rating.value}★ threshold`
            : `${candidate.rating}★ < ${filters.min_rating.value}★ threshold`
        },
        min_reviews: {
          passed: reviewsOk,
          detail: reviewsOk
            ? `${candidate.reviews.toLocaleString()} >= ${filters.min_reviews.value} minimum`
            : `${candidate.reviews} < ${filters.min_reviews.value} minimum`
        }
      },
      qualified
    };

    evaluations.push(evaluation);
    
    if (qualified) {
      passedCandidates.push(candidate);
    }
  }

  // Record this step with detailed evaluations
  const step = trace.step('apply_filters', 'filter')
    .input({
      candidates_count: candidates.length,
      reference_product: {
        asin: prospect.asin,
        title: prospect.title,
        price: prospect.price,
        rating: prospect.rating,
        reviews: prospect.reviews
      }
    })
    .filters(filters)
    .evaluations(evaluations)
    .output({
      total_evaluated: candidates.length,
      passed: passedCandidates.length,
      failed: candidates.length - passedCandidates.length,
      pass_rate: ((passedCandidates.length / candidates.length) * 100).toFixed(1) + '%'
    })
    .reasoning(`Applied price, rating, and review count filters. ${passedCandidates.length} of ${candidates.length} candidates qualified (${((passedCandidates.length / candidates.length) * 100).toFixed(1)}% pass rate)`)
    .end();

  return passedCandidates;
}

/**
 * Step 4: LLM Relevance Evaluation
 * Uses simulated LLM to identify false positives (accessories, replacement parts, etc.)
 */
async function stepLLMEvaluation(trace, candidates, prospect) {
  await sleep(200);

  // Evaluate each candidate for true competitor status
  const evaluations = [];
  const verifiedCompetitors = [];

  for (const candidate of candidates) {
    // Use the isCompetitor flag from mock data (simulates LLM decision)
    const isCompetitor = candidate.isCompetitor;
    const confidence = isCompetitor 
      ? 0.85 + Math.random() * 0.15  // 0.85-1.0 for true competitors
      : 0.90 + Math.random() * 0.10; // 0.90-1.0 confidence in rejection

    const evaluation = {
      asin: candidate.asin,
      title: candidate.title,
      isCompetitor,
      confidence: parseFloat(confidence.toFixed(2)),
      llmReasoning: isCompetitor
        ? `Product is a direct competitor - same product category (${prospect.category.split('>')[1]?.trim() || prospect.category})`
        : `Product is NOT a competitor - appears to be an accessory or replacement part`
    };

    evaluations.push(evaluation);

    if (isCompetitor) {
      verifiedCompetitors.push({
        ...candidate,
        llmConfidence: confidence
      });
    }
  }

  const falsePositivesRemoved = candidates.length - verifiedCompetitors.length;

  trace.step('llm_relevance_evaluation', 'evaluation')
    .input({
      candidates_count: candidates.length,
      reference_product: {
        asin: prospect.asin,
        title: prospect.title,
        category: prospect.category
      },
      model: 'gpt-4-simulated'
    })
    .output({
      total_evaluated: candidates.length,
      confirmed_competitors: verifiedCompetitors.length,
      false_positives_removed: falsePositivesRemoved
    })
    .meta({
      prompt_template: 'Given the reference product "{title}", determine if each candidate is a true competitor (same product type) or a false positive (accessory, replacement part, bundle, etc.)',
      llm_latency_ms: 200
    })
    .evaluations(evaluations)
    .reasoning(`LLM identified and removed ${falsePositivesRemoved} false positive(s) - accessories, replacement parts, and related items that aren't direct competitors`)
    .end();

  return verifiedCompetitors;
}

/**
 * Step 5: Rank and Select Best Competitor
 * Applies scoring algorithm to select the single best match
 */
async function stepRankAndSelect(trace, candidates, prospect) {
  await sleep(50);

  if (candidates.length === 0) {
    trace.step('rank_and_select', 'ranking')
      .input({ candidates_count: 0 })
      .output({ selection: null })
      .reasoning('No candidates available after filtering - unable to select a competitor')
      .end();
    return null;
  }

  // Scoring weights
  const weights = {
    review_count: 0.4,
    rating: 0.3,
    price_proximity: 0.3
  };

  // Calculate scores
  const maxReviews = Math.max(...candidates.map(c => c.reviews));
  const maxRating = 5.0;

  const rankedCandidates = candidates.map(candidate => {
    const reviewScore = candidate.reviews / maxReviews;
    const ratingScore = candidate.rating / maxRating;
    const priceDiff = Math.abs(candidate.price - prospect.price) / prospect.price;
    const priceProximityScore = Math.max(0, 1 - priceDiff);

    const totalScore = 
      (reviewScore * weights.review_count) +
      (ratingScore * weights.rating) +
      (priceProximityScore * weights.price_proximity);

    return {
      ...candidate,
      scores: {
        review_count_score: parseFloat(reviewScore.toFixed(3)),
        rating_score: parseFloat(ratingScore.toFixed(3)),
        price_proximity_score: parseFloat(priceProximityScore.toFixed(3))
      },
      totalScore: parseFloat(totalScore.toFixed(3))
    };
  });

  // Sort by total score
  rankedCandidates.sort((a, b) => b.totalScore - a.totalScore);

  // Add ranks
  rankedCandidates.forEach((c, i) => c.rank = i + 1);

  // Select the winner
  const winner = rankedCandidates[0];

  trace.step('rank_and_select', 'ranking')
    .input({
      candidates_count: candidates.length,
      reference_product: {
        asin: prospect.asin,
        title: prospect.title,
        price: prospect.price,
        rating: prospect.rating,
        reviews: prospect.reviews
      }
    })
    .output({
      ranking_criteria: {
        primary: 'review_count (40%)',
        secondary: 'rating (30%)',
        tertiary: 'price_proximity (30%)'
      },
      ranked_candidates: rankedCandidates.map(c => ({
        rank: c.rank,
        asin: c.asin,
        title: c.title,
        metrics: { price: c.price, rating: c.rating, reviews: c.reviews },
        score_breakdown: c.scores,
        total_score: c.totalScore
      })),
      selection: {
        asin: winner.asin,
        title: winner.title,
        price: winner.price,
        rating: winner.rating,
        reviews: winner.reviews,
        total_score: winner.totalScore
      }
    })
    .reasoning(`Selected "${winner.title}" as best competitor with score ${winner.totalScore} - ${winner.reviews.toLocaleString()} reviews (highest), ${winner.rating}★ rating, $${winner.price} price`)
    .end();

  return {
    asin: winner.asin,
    title: winner.title,
    price: winner.price,
    rating: winner.rating,
    reviews: winner.reviews,
    score: winner.totalScore
  };
}

/**
 * Helper to simulate async operations
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

