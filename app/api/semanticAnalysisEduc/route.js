import { GoogleGenerativeAI } from "@google/generative-ai";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import * as tf from "@tensorflow/tfjs";

// Configuration
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

const HF_ACCESS_TOKEN = process.env.HUGGINGFACE_API_KEY || ""; // Fallback for safety
const EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2";
const TIMEOUT_MS = 10000; // 10s timeout for API calls
const BONUS_WEIGHT = 0.05; // Configurable bonus per match
const MAX_BONUS = 0.25; // Max bonus cap

// Replace HF configuration with Gemini configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

console.log("Gemini api key: ", GEMINI_API_KEY);

// Initialize LangChain embeddings
const embeddings = new HuggingFaceInferenceEmbeddings({
	apiKey: HF_ACCESS_TOKEN,
	model: EMBEDDING_MODEL,
});

/**
 * Preprocesses text with improved handling of abbreviations
 * @param {string} text - Raw input text
 * @returns {string} Processed text
 */
function preprocessText(text) {
	if (!text || typeof text !== "string") return "";
	return text
		.toLowerCase()
		.replace(/[^\w\s.]/g, "") // Preserve periods for abbreviations
		.split(" ")
		.filter((word) => word.length > 1 && !STOPWORDS.has(word))
		.join(" ");
}

/**
 * Wraps API calls with timeout and retry logic
 * @param {Promise} promise - API call promise
 * @returns {Promise} Resolved or rejected promise
 */
async function withTimeoutAndRetry(promise, retries = 2) {
	const timeout = new Promise((_, reject) =>
		setTimeout(() => reject(new Error("API timeout")), TIMEOUT_MS)
	);
	for (let i = 0; i <= retries; i++) {
		try {
			return await Promise.race([promise, timeout]);
		} catch (error) {
			if (i === retries) throw error;
			await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
		}
	}
}

/**
 * Processes text to identify educational entities using Gemini
 * @param {string} text - Original input text
 * @returns {Promise<{institutions: string[], courses: string[]}>} Categorized entities
 */
async function processNERResults(text) {
	if (!text || typeof text !== "string")
		return { institutions: [], courses: [] };

	try {
		const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

		const prompt = `Analyze this text and extract educational institutions and courses/degrees. Return only a JSON object with two arrays: "institutions" for educational institutions and "courses" for courses/degrees.

Text: "${text}"

Format the response exactly like this example:
{
    "institutions": ["University Name"],
    "courses": ["Course Name"]
}`;

		const result = await withTimeoutAndRetry(model.generateContent(prompt));

		const response = await result.response;
		console.log("Raw Gemini Response:", response.text());

		// Parse the response content as JSON
		let parsed;
		try {
			const jsonMatch = response.text().match(/\{[\s\S]*\}/);
			parsed = jsonMatch
				? JSON.parse(jsonMatch[0])
				: { institutions: [], courses: [] };
		} catch (error) {
			console.error("Error parsing Gemini response:", error);
			parsed = { institutions: [], courses: [] };
		}

		// Ensure arrays are returned even if parsing fails
		return {
			institutions: Array.isArray(parsed.institutions)
				? parsed.institutions
				: [],
			courses: Array.isArray(parsed.courses) ? parsed.courses : [],
		};
	} catch (error) {
		console.error("Error in NER processing:", error);
		return { institutions: [], courses: [] };
	}
}

/**
 * Calculates cosine similarity between two vectors
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 * @returns {number} Cosine similarity score
 */
function calculateCosineSimilarity(vecA, vecB) {
	if (!vecA?.length || !vecB?.length) return 0;
	return tf.tidy(() => {
		const tensorA = tf.tensor1d(vecA);
		const tensorB = tf.tensor1d(vecB);
		const dotProduct = tf.dot(tensorA, tensorB);
		const normA = tf.norm(tensorA);
		const normB = tf.norm(tensorB);
		const similarity = tf.div(dotProduct, tf.mul(normA, normB)).dataSync()[0];
		return isNaN(similarity) ? 0 : similarity;
	});
}

/**
 * Main API endpoint with debugging logs
 * @param {Request} req - Incoming request
 * @returns {Response} JSON response
 */
export async function POST(req) {
	let body;
	try {
		body = await req.json();
	} catch (error) {
		return new Response(
			JSON.stringify({ message: "Invalid JSON in request body" }),
			{ status: 400, headers: { "Content-Type": "application/json" } }
		);
	}

	const { text1, text2, threshold = 80 } = body;
	if (
		!text1 ||
		!text2 ||
		typeof threshold !== "number" ||
		threshold < 0 ||
		threshold > 100
	) {
		return new Response(
			JSON.stringify({
				message:
					"Invalid input: text1, text2, and valid threshold (0-100) required",
			}),
			{ status: 400, headers: { "Content-Type": "application/json" } }
		);
	}

	try {
		console.log("Performing educational entity analysis...");
		console.log("Input texts:", { text1, text2 });

		const [entities1, entities2] = await Promise.all([
			processNERResults(text1),
			processNERResults(text2),
		]);

		console.log("Processed entities:", entities1, entities2);

		const processedText1 =
			[
				preprocessText(text1),
				...entities1.institutions,
				...entities1.courses,
			].join(" ") || "empty";
		const processedText2 =
			[
				preprocessText(text2),
				...entities2.institutions,
				...entities2.courses,
			].join(" ") || "empty";

		console.log("Processed Text:", processedText1, processedText2);

		const sharedEntities = {
			institutions: entities1.institutions.filter((inst) =>
				entities2.institutions.includes(inst)
			),
			courses: entities1.courses.filter((course) =>
				entities2.courses.includes(course)
			),
		};
		const sharedWords = [
			...new Set(
				processedText1
					.split(" ")
					.filter(
						(word) => processedText2.includes(word) && !STOPWORDS.has(word)
					)
			),
		];
		console.log("Shared Entities & Words:", sharedEntities, sharedWords);

		console.log("Generating embeddings with LangChain...");
		const [embedding1, embedding2] = await Promise.all([
			withTimeoutAndRetry(embeddings.embedQuery(processedText1)),
			withTimeoutAndRetry(embeddings.embedQuery(processedText2)),
		]);

		console.log("Calculating similarity score...");
		const similarityScore = calculateCosineSimilarity(embedding1, embedding2);
		const totalMatches =
			sharedEntities.institutions.length +
			sharedEntities.courses.length +
			sharedWords.length;
		const exactMatchBonus = Math.min(BONUS_WEIGHT * totalMatches, MAX_BONUS);
		const finalScore = Math.min(1, similarityScore + exactMatchBonus) * 100;

		console.log("Final Similarity Percentage:", finalScore);

		return new Response(
			JSON.stringify({
				score: finalScore,
				matchQuality:
					finalScore >= threshold ? "Acceptable Match" : "Poor Match",
				threshold,
				entities1,
				entities2,
				processedText1,
				processedText2,
				exactMatches: { entities: sharedEntities, words: sharedWords },
			}),
			{ headers: { "Content-Type": "application/json" } }
		);
	} catch (error) {
		console.error("Error during analysis:", error);
		const message = error.message.includes("timeout")
			? "Service timeout, please try again later"
			: "An error occurred during analysis";
		return new Response(JSON.stringify({ message, error: error.message }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
