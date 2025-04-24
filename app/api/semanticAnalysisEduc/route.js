import { GoogleGenerativeAI } from "@google/generative-ai";
import * as tf from "@tensorflow/tfjs";
import * as useModel from "@tensorflow-models/universal-sentence-encoder";

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

const TIMEOUT_MS = 10000; // 10s timeout for API calls
const INSTITUTION_BONUS_WEIGHT = 0.9; // Very high weight for institution matches
const COURSE_BONUS_WEIGHT = 0.05; // Regular weight for course matches
const MAX_BONUS = 0.95; // Higher max bonus for stricter matching
const INSTITUTION_MISMATCH_PENALTY = 0.9; // Heavy penalty when institutions don't match

// Gemini configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

console.log("Gemini api key: ", GEMINI_API_KEY);

// Initialize Universal Sentence Encoder
let useEncoder = null;

async function loadEncoder() {
	if (!useEncoder) {
		await tf.ready();
		useEncoder = await useModel.load();
	}
	return useEncoder;
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
		const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

		const prompt = `Analyze this text and extract educational institutions and courses/degrees. Focus on precise identification of educational institutions. Return only a JSON object with two arrays.

Text: "${text}"

Format the response exactly like this example:
{
    "institutions": ["University Name"],
    "courses": ["Course Name"]
}

For institutions, include:
- Full official names of universities/colleges
- Technical/vocational schools
- Educational institutes
- Academic institutions

Ensure institution names are complete and standardized.`;

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
 * Calculates similarity score using Gemini AI
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @param {number[]} embedding1 - USE embedding for first text (for fallback)
 * @param {number[]} embedding2 - USE embedding for second text (for fallback)
 * @returns {Promise<number>} Similarity score (0 to 1)
 */
async function calculateCosineSimilarity(text1, text2, embedding1, embedding2) {
	if (!text1 || !text2) return 0;

	try {
		const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

		const prompt = `Analyze the semantic similarity between the following two texts, focusing on their educational content (institutions, courses, and academic context). Return a similarity score as a number between 0 and 1, where 1 indicates identical meaning and 0 indicates no similarity. Provide the score in a JSON object like this: {"similarity": 0.85}

Assign a very low similarity score (close to 0, e.g., 0.1 or lower) if the courses or degrees differ significantly in their field or specialization, even if they share a similar degree structure. For example:
- "Bachelor of Science in Information Technology" and "Bachelor of Science in Civil Engineering" should have a very low score (e.g., 0.1) because the fields are unrelated.
- "Master of Business Administration" and "Bachelor of Arts in Psychology" should have a very low score due to different degree types and fields.
Only assign high scores (e.g., 0.8 or above) if the courses are identical or very closely related (e.g., "Bachelor of Science in Computer Science" and "BSc in Computer Science").

Text 1: "${text1}"
Text 2: "${text2}"`;

		const result = await withTimeoutAndRetry(model.generateContent(prompt));
		const response = await result.response;
		console.log("Gemini Similarity Response:", response.text());

		// Parse the response content as JSON
		let parsed;
		try {
			const jsonMatch = response.text().match(/\{[\s\S]*\}/);
			parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { similarity: 0 };
		} catch (error) {
			console.error("Error parsing Gemini similarity response:", error);
			parsed = { similarity: 0 };
		}

		let similarity = parsed.similarity;
		if (typeof similarity !== "number" || similarity < 0 || similarity > 1) {
			console.warn("Invalid Gemini similarity score, falling back to USE");
			// Fallback to original USE-based cosine similarity
			return tf.tidy(() => {
				const tensorA = tf.tensor1d(embedding1);
				const tensorB = tf.tensor1d(embedding2);
				const dotProduct = tf.dot(tensorA, tensorB);
				const normA = tf.norm(tensorA);
				const normB = tf.norm(tensorB);
				const sim = tf.div(dotProduct, tf.mul(normA, normB)).dataSync()[0];
				return isNaN(sim) ? 0 : sim;
			});
		}

		return similarity;
	} catch (error) {
		console.error("Error in Gemini similarity calculation:", error);
		// Fallback to original USE-based cosine similarity
		return tf.tidy(() => {
			const tensorA = tf.tensor1d(embedding1);
			const tensorB = tf.tensor1d(embedding2);
			const dotProduct = tf.dot(tensorA, tensorB);
			const normA = tf.norm(tensorA);
			const normB = tf.norm(tensorB);
			const sim = tf.div(dotProduct, tf.mul(normA, normB)).dataSync()[0];
			return isNaN(sim) ? 0 : sim;
		});
	}
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

		console.log("Generating embeddings with Universal Sentence Encoder...");
		const encoder = await loadEncoder();
		const embeddings = await encoder.embed([processedText1, processedText2]);
		const [embedding1, embedding2] = await Promise.all([
			embeddings.array().then((arr) => arr[0]),
			embeddings.array().then((arr) => arr[1]),
		]);

		console.log("Calculating similarity score with Gemini...");
		// Apply institution matching first
		let baseScore = 0;
		if (sharedEntities.institutions.length > 0) {
			baseScore = INSTITUTION_BONUS_WEIGHT;
		} else {
			const similarity = await calculateCosineSimilarity(
				processedText1,
				processedText2,
				embedding1,
				embedding2
			);
			baseScore = similarity * INSTITUTION_MISMATCH_PENALTY;
		}

		// Add course and word matching bonus
		const courseBonus = Math.min(
			COURSE_BONUS_WEIGHT *
				(sharedEntities.courses.length + sharedWords.length),
			MAX_BONUS - baseScore
		);

		const finalScore = Math.min(100, (baseScore + courseBonus) * 100);

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
