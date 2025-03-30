import * as tf from "@tensorflow/tfjs";
import { pipeline } from "@huggingface/inference";
import { HfInference } from "@huggingface/inference";
// Importing compromise for lightweight NER
import nlp from "compromise";

// Function to preprocess text
function preprocessText(text) {
	return text
		.toLowerCase()
		.replace(/[^\w\s]/g, "") // Remove special characters
		.replace(/\s+/g, " ") // Normalize whitespace
		.trim();
}

// Function to extract educational information
function extractEducationalInfo(text) {
	const normalized = preprocessText(text);
	
	// Split into words and remove common words
	const words = normalized.split(" ").filter(word => 
		!["of", "in", "and", "the", "a", "an"].includes(word)
	);

	// Group consecutive words that might form a name or title
	let phrases = [];
	let currentPhrase = [];
	
	for (let i = 0; i < words.length; i++) {
		currentPhrase.push(words[i]);
		
		// Check if we should end the current phrase
		if (i === words.length - 1 || 
			currentPhrase.length >= 4 || // Maximum 4 words per phrase
			["college", "university", "institute"].includes(words[i])) {
			phrases.push(currentPhrase.join(" "));
			currentPhrase = [];
		}
	}

	return phrases.join(" ");
}

export async function POST(req) {
	const { text1, text2, threshold } = await req.json();
	const HF_ACCESS_TOKEN = process.env.HUGGINGFACE_API_KEY;

	console.log("Original Text 1:", text1);
	console.log("Original Text 2:", text2);

	// Preprocess and extract educational information
	const processedText1 = extractEducationalInfo(text1);
	const processedText2 = extractEducationalInfo(text2);

	console.log("Processed Text 1:", processedText1);
	console.log("Processed Text 2:", processedText2);

	try {
		// Initialize Hugging Face client
		const hf = new HfInference(HF_ACCESS_TOKEN);

		// Use Sentence Transformers for semantic similarity
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

		// Calculate similarity score
		const similarityScore = calculateCosineSimilarity(embedding1, embedding2);
		console.log("Raw Similarity Score:", similarityScore);

		// Adjust similarity score based on phrase matching
		const phrases1 = new Set(processedText1.split(" "));
		const phrases2 = new Set(processedText2.split(" "));
		const commonPhrases = [...phrases1].filter(phrase => phrases2.has(phrase));
		
		// Boost score if there are exact matches
		const boostFactor = commonPhrases.length * 0.1;
		const adjustedScore = Math.min(1, similarityScore + boostFactor);
		
		const similarityPercentage = parseFloat((adjustedScore * 100).toFixed(2));
		console.log("Adjusted Similarity Percentage:", similarityPercentage);
		console.log("Common Phrases:", commonPhrases);
		console.log("Threshold:", threshold);

		const matchQuality =
			similarityPercentage >= threshold ? "Acceptable Match" : "Poor Match";
		console.log("Match Quality:", matchQuality);

		// Perform NER using Hugging Face pipeline
		const nerResults = await Promise.all([
			hf.tokenClassification({
				model: "dbmdz/bert-large-cased-finetuned-conll03-english",
				inputs: text1,
			}),
			hf.tokenClassification({
				model: "dbmdz/bert-large-cased-finetuned-conll03-english",
				inputs: text2,
			}),
		]);

		// Process NER results
		const nerResult1 = processNERResults(nerResults[0]);
		const nerResult2 = processNERResults(nerResults[1]);

		return new Response(
			JSON.stringify({
				score: similarityPercentage,
				matchQuality,
				threshold: threshold,
				nerText1: nerResult1,
				nerText2: nerResult2,
				processedText1,
				processedText2,
			}),
			{
				headers: {
					"Content-Type": "application/json",
				},
			}
		);
	} catch (error) {
		console.error("Error during analysis:", error);
		return new Response(
			JSON.stringify({
				message: "An error occurred during analysis.",
				error: error.message,
			}),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
				},
			}
		);
	}
}

// Process NER results from Hugging Face
function processNERResults(nerResult) {
	const entities = {
		people: [],
		organizations: [],
		locations: [],
	};

	nerResult.forEach((entity) => {
		switch (entity.entity_group) {
			case "PER":
				if (!entities.people.includes(entity.word))
					entities.people.push(entity.word);
				break;
			case "ORG":
				if (!entities.organizations.includes(entity.word))
					entities.organizations.push(entity.word);
				break;
			case "LOC":
				if (!entities.locations.includes(entity.word))
					entities.locations.push(entity.word);
				break;
		}
	});

	return entities;
}

// Cosine similarity calculation
function calculateCosineSimilarity(vecA, vecB) {
	const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
	const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
	const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
	return dotProduct / (normA * normB);
}
