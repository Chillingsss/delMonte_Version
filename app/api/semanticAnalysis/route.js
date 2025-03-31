import * as tf from "@tensorflow/tfjs";
import { HfInference } from "@huggingface/inference";

const STOPWORDS = new Set([
	"of",
	"in",
	"and",
	"the",
	"a",
	"an",
	"for",
	"on",
	"with",
	"at",
	"by",
]);

// Preprocess text (lowercase, remove punctuation, trim, and filter stopwords)
function preprocessText(text) {
	return text
		.toLowerCase()
		.replace(/[^\w\s]/g, "")
		.split(" ")
		.filter((word) => word.length > 2 && !STOPWORDS.has(word))
		.join(" ");
}

// Extract educational information and NER results into meaningful phrases
function extractEducationalInfo(text, nerEntities) {
	const words = new Set(preprocessText(text).split(" "));
	if (nerEntities) {
		for (const entity of [
			...nerEntities.organizations,
			...nerEntities.locations,
		]) {
			words.add(preprocessText(entity));
		}
	}
	return [...words].join(" ");
}

// Process NER results efficiently using Sets
function processNERResults(nerResult) {
	const entities = {
		people: new Set(),
		organizations: new Set(),
		locations: new Set(),
	};
	nerResult.forEach(({ entity_group, word }) => {
		const cleanedWord = preprocessText(word);
		if (entity_group === "PER") entities.people.add(cleanedWord);
		else if (entity_group === "ORG") entities.organizations.add(cleanedWord);
		else if (entity_group === "LOC") entities.locations.add(cleanedWord);
	});
	return {
		people: [...entities.people],
		organizations: [...entities.organizations],
		locations: [...entities.locations],
	};
}

export async function POST(req) {
	const { text1, text2, threshold } = await req.json();
	const HF_ACCESS_TOKEN = process.env.HUGGINGFACE_API_KEY;
	const hf = new HfInference(HF_ACCESS_TOKEN);

	try {
		console.log("Performing NER analysis...");
		const [nerResult1, nerResult2] = await Promise.all([
			hf.tokenClassification({
				model: "dbmdz/bert-large-cased-finetuned-conll03-english",
				inputs: text1,
			}),
			hf.tokenClassification({
				model: "dbmdz/bert-large-cased-finetuned-conll03-english",
				inputs: text2,
			}),
		]);

		const nerEntities1 = processNERResults(nerResult1);
		const nerEntities2 = processNERResults(nerResult2);

		console.log("Processed NER:", nerEntities1, nerEntities2);

		const processedText1 = extractEducationalInfo(text1, nerEntities1);
		const processedText2 = extractEducationalInfo(text2, nerEntities2);

		console.log("Processed Text:", processedText1, processedText2);

		const sharedEntities = {
			organizations: nerEntities1.organizations.filter((org) =>
				nerEntities2.organizations.includes(org)
			),
			locations: nerEntities1.locations.filter((loc) =>
				nerEntities2.locations.includes(loc)
			),
			people: nerEntities1.people.filter((person) =>
				nerEntities2.people.includes(person)
			),
		};

		const sharedWords = [
			...new Set(
				processedText1
					.split(" ")
					.filter((word) => processedText2.includes(word))
			),
		];

		console.log("Shared Entities & Words:", sharedEntities, sharedWords);

		console.log("Generating embeddings...");
		const [embedding1, embedding2] = await Promise.all([
			hf.featureExtraction({
				model: "sentence-transformers/all-MiniLM-L6-v2",
				inputs: processedText1,
			}),
			hf.featureExtraction({
				model: "sentence-transformers/all-MiniLM-L6-v2",
				inputs: processedText2,
			}),
		]);

		console.log("Calculating similarity score...");
		const similarityScore = calculateCosineSimilarity(embedding1, embedding2);

		const totalMatches =
			sharedEntities.organizations.length +
			sharedEntities.locations.length +
			sharedEntities.people.length +
			sharedWords.length;
		const exactMatchBonus = Math.min(0.1 * totalMatches, 0.3);
		const finalScore = Math.min(1, similarityScore + exactMatchBonus) * 100;

		console.log("Final Similarity Percentage:", finalScore);

		return new Response(
			JSON.stringify({
				score: finalScore,
				matchQuality:
					finalScore >= threshold ? "Acceptable Match" : "Poor Match",
				threshold,
				nerText1: nerEntities1,
				nerText2: nerEntities2,
				processedText1,
				processedText2,
				exactMatches: { ner: sharedEntities, words: sharedWords },
			}),
			{ headers: { "Content-Type": "application/json" } }
		);
	} catch (error) {
		console.error("Error during analysis:", error);
		return new Response(
			JSON.stringify({ message: "An error occurred.", error: error.message }),
			{ status: 500, headers: { "Content-Type": "application/json" } }
		);
	}
}

function calculateCosineSimilarity(vecA, vecB) {
	return tf.tidy(() => {
		const tensorA = tf.tensor1d(vecA);
		const tensorB = tf.tensor1d(vecB);
		const dotProduct = tf.dot(tensorA, tensorB);
		const normA = tf.norm(tensorA);
		const normB = tf.norm(tensorB);
		return tf.div(dotProduct, tf.mul(normA, normB)).dataSync()[0];
	});
}
