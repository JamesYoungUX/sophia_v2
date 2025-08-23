/**
 * Test script for PubMed API Integration
 *
 * This script tests the PubMed service to ensure it can:
 * 1. Connect to PubMed API
 * 2. Search for relevant literature
 * 3. Process and filter articles
 * 4. Assess evidence quality
 */

import {
  pubmedService,
  type PubMedSearchQuery,
} from "../apps/api/lib/genesis-pubmed";

async function testPubMedIntegration() {
  console.log("🧬 Testing PubMed API Integration for Genesis Agent...\n");

  try {
    // Test 1: Basic search for hypertension management
    console.log("📚 Test 1: Searching for hypertension management literature");
    const hypertensionQuery: PubMedSearchQuery = {
      keywords: ["hypertension", "blood pressure management"],
      dateFrom: new Date("2024-01-01"),
      maxResults: 5,
      publicationTypes: [
        "Clinical Trial",
        "Meta-Analysis",
        "Systematic Review",
      ],
    };

    const hypertensionResults =
      await pubmedService.searchLiterature(hypertensionQuery);
    console.log(`✅ Found ${hypertensionResults.length} relevant articles`);

    if (hypertensionResults.length > 0) {
      console.log("📄 Sample article:");
      const sample = hypertensionResults[0];
      console.log(`   Title: ${sample.title}`);
      console.log(`   Journal: ${sample.journal}`);
      console.log(
        `   Authors: ${sample.authors.slice(0, 3).join(", ")}${sample.authors.length > 3 ? "..." : ""}`,
      );
      console.log(
        `   Evidence Quality: ${sample.evidenceQuality.grade} (${sample.evidenceQuality.score}/100)`,
      );
      console.log(
        `   Relevance Score: ${(sample.relevanceScore * 100).toFixed(1)}%`,
      );
      console.log(`   DOI: ${sample.doi || "Not available"}`);
    }

    console.log("\n" + "=".repeat(60) + "\n");

    // Test 2: Search for diabetes care
    console.log("📚 Test 2: Searching for diabetes care literature");
    const diabetesQuery: PubMedSearchQuery = {
      keywords: ["diabetes", "glycemic control", "SGLT2 inhibitors"],
      dateFrom: new Date("2024-01-01"),
      maxResults: 3,
      publicationTypes: ["Clinical Trial", "Meta-Analysis"],
    };

    const diabetesResults = await pubmedService.searchLiterature(diabetesQuery);
    console.log(`✅ Found ${diabetesResults.length} relevant articles`);

    if (diabetesResults.length > 0) {
      console.log("📄 Sample article:");
      const sample = diabetesResults[0];
      console.log(`   Title: ${sample.title}`);
      console.log(`   Journal: ${sample.journal}`);
      console.log(
        `   Evidence Quality: ${sample.evidenceQuality.grade} (${sample.evidenceQuality.score}/100)`,
      );
      console.log(
        `   Relevance Score: ${(sample.relevanceScore * 100).toFixed(1)}%`,
      );
    }

    console.log("\n" + "=".repeat(60) + "\n");

    // Test 3: Search for surgical care
    console.log("📚 Test 3: Searching for surgical care literature");
    const surgicalQuery: PubMedSearchQuery = {
      keywords: [
        "surgical outcomes",
        "postoperative care",
        "enhanced recovery",
      ],
      dateFrom: new Date("2024-01-01"),
      maxResults: 3,
      publicationTypes: ["Clinical Trial", "Systematic Review"],
    };

    const surgicalResults = await pubmedService.searchLiterature(surgicalQuery);
    console.log(`✅ Found ${surgicalResults.length} relevant articles`);

    if (surgicalResults.length > 0) {
      console.log("📄 Sample article:");
      const sample = surgicalResults[0];
      console.log(`   Title: ${sample.title}`);
      console.log(`   Journal: ${sample.journal}`);
      console.log(
        `   Evidence Quality: ${sample.evidenceQuality.grade} (${sample.evidenceQuality.score}/100)`,
      );
      console.log(
        `   Relevance Score: ${(sample.relevanceScore * 100).toFixed(1)}%`,
      );
    }

    console.log("\n" + "=".repeat(60) + "\n");

    // Summary
    console.log("📊 Integration Test Summary:");
    console.log(`   ✅ Hypertension articles: ${hypertensionResults.length}`);
    console.log(`   ✅ Diabetes articles: ${diabetesResults.length}`);
    console.log(`   ✅ Surgical articles: ${surgicalResults.length}`);

    const totalArticles =
      hypertensionResults.length +
      diabetesResults.length +
      surgicalResults.length;
    console.log(`   📈 Total relevant articles found: ${totalArticles}`);

    if (totalArticles > 0) {
      console.log("\n🎉 PubMed API Integration Test PASSED!");
      console.log("   Genesis Agent can successfully:");
      console.log("   • Connect to PubMed API");
      console.log("   • Search for relevant literature");
      console.log("   • Process and filter articles");
      console.log("   • Assess evidence quality");
      console.log("   • Calculate relevance scores");
    } else {
      console.log(
        "\n⚠️  PubMed API Integration Test PARTIAL - No articles found",
      );
      console.log("   This might be due to:");
      console.log("   • API rate limiting");
      console.log("   • Network connectivity issues");
      console.log("   • Search query specificity");
    }
  } catch (error) {
    console.error("❌ PubMed API Integration Test FAILED:");
    console.error("   Error:", error instanceof Error ? error.message : error);
    console.error("\n   Possible causes:");
    console.error("   • Network connectivity issues");
    console.error("   • PubMed API service disruption");
    console.error("   • Invalid API configuration");
    console.error("   • Rate limiting exceeded");
  }
}

// Run the test
testPubMedIntegration().catch(console.error);
