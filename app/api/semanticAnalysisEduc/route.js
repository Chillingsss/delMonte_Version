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
const EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L12-v2";
const TIMEOUT_MS = 30000; // Increased from 10000 to 30000 (30s timeout)
const BONUS_WEIGHT = 0.05; // Configurable bonus per match
const MAX_BONUS = 0.25; // Max bonus cap

const NER_MODEL = "mistralai/Mistral-7B-Instruct-v0.2";

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
async function withTimeoutAndRetry(promise, retries = 3) {
	const timeout = new Promise((_, reject) =>
		setTimeout(() => reject(new Error("API timeout")), TIMEOUT_MS)
	);
	for (let i = 0; i <= retries; i++) {
		try {
			return await Promise.race([promise, timeout]);
		} catch (error) {
			if (i === retries) throw error;
			await new Promise((resolve) => setTimeout(resolve, 2000 * (i + 1))); // Exponential backoff with longer delays
		}
	}
}

/**
 * Processes text to identify educational entities using Mistral
 * @param {string} text - Original input text
 * @returns {Promise<{institutions: string[], courses: string[]}>} Categorized entities
 */
async function processNERResults(text) {
	if (!text || typeof text !== "string")
		return { institutions: [], courses: [] };

	try {
		const prompt = `You are a helpful AI assistant. Your task is to analyze the given text and extract educational institutions and courses/degrees.

Text to analyze: "${text}"

Please extract and return ONLY a JSON object with two arrays:
1. "institutions" - list of educational institutions
2. "courses" - list of courses or degrees

Example format:
{
    "institutions": ["University Name"],
    "courses": ["Course Name"]
}

Return ONLY the JSON object, no additional text.`;

		const response = await withTimeoutAndRetry(
			fetch(`https://api-inference.huggingface.co/models/${NER_MODEL}`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${HF_ACCESS_TOKEN}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					inputs: prompt,
					parameters: {
						max_new_tokens: 250,
						temperature: 0.1,
						return_full_text: false,
						top_p: 0.95,
						repetition_penalty: 1.1,
					},
				}),
			})
		);

		const result = await response.json();
		console.log("Raw Model Response:", result);

		// Parse the response content as JSON
		let parsed;
		try {
			// Handle both array and object response formats
			const responseText = Array.isArray(result)
				? result[0].generated_text
				: result.generated_text;
			const jsonMatch = responseText.match(/\{[\s\S]*\}/);
			parsed = jsonMatch
				? JSON.parse(jsonMatch[0])
				: { institutions: [], courses: [] };
		} catch (error) {
			console.error("Error parsing model response:", error);
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
