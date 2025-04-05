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

const HF_ACCESS_TOKEN = process.env.HUGGINGFACE_API_KEY || "";
const EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2";
const TIMEOUT_MS = 10000;

// Gemini configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Initialize LangChain embeddings
const embeddings = new HuggingFaceInferenceEmbeddings({
	apiKey: HF_ACCESS_TOKEN,
	model: EMBEDDING_MODEL,
});

/**
 * Processes text to identify training entities using Gemini
 * @param {string} text - Original input text
 * @returns {Promise<{trainings: string[]}>} Identified training entities
 */
async function processNERResults(text) {
	if (!text || typeof text !== "string") return { trainings: [] };

	try {
		const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

		const prompt = `Analyze this text and extract training experiences, certifications, and skills. Return only a JSON object with one array: "trainings" containing all identified training-related items.

Text: "${text}"

Format the response exactly like this example:
{
    "trainings": ["Training Name", "Certification", "Skill"]
}

Consider including:
- Training programs
- Workshops
- Certifications
- Technical skills
- Professional development courses
- Seminars attended`;

		const result = await withTimeoutAndRetry(model.generateContent(prompt));

		const response = await result.response;
		console.log("Raw Gemini Response:", response.text());

		// Parse the response content as JSON
		let parsed;
		try {
			const jsonMatch = response.text().match(/\{[\s\S]*\}/);
			parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { trainings: [] };
		} catch (error) {
			console.error("Error parsing Gemini response:", error);
			parsed = { trainings: [] };
		}

		return {
			trainings: Array.isArray(parsed.trainings) ? parsed.trainings : [],
		};
	} catch (error) {
		console.error("Error in NER processing:", error);
		return { trainings: [] };
	}
}

/**
 * Preprocesses text with improved handling of abbreviations
 * @param {string} text - Raw input text
 * @returns {string} Processed text
 */
function preprocessText(text) {
	if (!text || typeof text !== "string") return "";
	return text
		.toLowerCase()
		.replace(/[^\w\s.]/g, "")
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
			await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
		}
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
		console.log("Performing training analysis...");
		console.log("Input texts:", { text1, text2 });

		const [entities1, entities2] = await Promise.all([
			processNERResults(text1),
			processNERResults(text2),
		]);

		console.log("Processed entities:", entities1, entities2);

		const processedText1 =
			[preprocessText(text1), ...entities1.trainings].join(" ") || "empty";
		const processedText2 =
			[preprocessText(text2), ...entities2.trainings].join(" ") || "empty";

		console.log("Processed Text:", processedText1, processedText2);

		const sharedTrainings = entities1.trainings.filter((training) =>
			entities2.trainings.includes(training)
		);

		const sharedWords = [
			...new Set(
				processedText1
					.split(" ")
					.filter(
						(word) => processedText2.includes(word) && !STOPWORDS.has(word)
					)
			),
		];

		console.log(
			"Shared Trainings & Words:",
			{ trainings: sharedTrainings },
			sharedWords
		);

		console.log("Generating embeddings with LangChain...");
		const [embedding1, embedding2] = await Promise.all([
			withTimeoutAndRetry(embeddings.embedQuery(processedText1)),
			withTimeoutAndRetry(embeddings.embedQuery(processedText2)),
		]);

		console.log("Calculating similarity score...");
		const similarityScore = calculateCosineSimilarity(embedding1, embedding2);
		const finalScore = similarityScore * 100;

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
				exactMatches: {
					trainings: sharedTrainings,
					words: sharedWords,
				},
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
