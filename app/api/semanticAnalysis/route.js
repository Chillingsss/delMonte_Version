import * as tf from "@tensorflow/tfjs";
import { HfInference } from "@huggingface/inference";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

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

const COURSE_KEYWORDS = [
	"bachelor",
	"bs",
	"bsc",
	"master",
	"phd",
	"certificate",
	"diploma",
	"science",
	"engineering",
	"technology",
	"information",
	"computer",
	"it",
	"business",
	"administration",
	"management",
];

const INSTITUTION_KEYWORDS = [
	"college",
	"university",
	"institute",
	"school",
	"academy",
	"polytechnic",
];

const HF_ACCESS_TOKEN = process.env.HUGGINGFACE_API_KEY || ""; // Fallback for safety
const NER_MODEL = "dbmdz/bert-large-cased-finetuned-conll03-english"; // More advanced NER model
const EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2";
const TIMEOUT_MS = 10000; // 10s timeout for API calls
const BONUS_WEIGHT = 0.05; // Configurable bonus per match
const MAX_BONUS = 0.25; // Max bonus cap

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
 * Processes text to identify educational entities with batching
 * @param {string} text - Original input text
 * @returns {Promise<{institutions: string[], courses: string[]}>} Categorized entities
 */
async function processNERResults(text) {
	if (!text || typeof text !== "string")
		return { institutions: [], courses: [] };

	const hf = new HfInference(HF_ACCESS_TOKEN);
	const entities = { institutions: new Set(), courses: new Set() };
	const sentences = text.split("\n").filter((s) => s.trim());

	const batchSize = 5;
	for (let i = 0; i < sentences.length; i += batchSize) {
		const batch = sentences.slice(i, i + batchSize);
		try {
			const nerResults = await withTimeoutAndRetry(
				hf.tokenClassification({
					model: NER_MODEL,
					inputs: batch.join(" "),
					wait_for_model: true,
				})
			);

			console.log("NER Result for batch:", batch.join(" "), nerResults);

			let currentTokens = [];
			let currentType = null;

			for (const item of nerResults) {
				if (!item.entity || item.entity === "O") continue;
				const type = item.entity.replace(/^[BI]-/, "");

				if (item.entity.startsWith("B-")) {
					if (currentTokens.length > 0 && currentType) {
						processEntity(currentTokens.join(" "), currentType, entities);
					}
					currentTokens = [item.word];
					currentType = type;
				} else if (item.entity.startsWith("I-") && type === currentType) {
					currentTokens.push(item.word);
				} else {
					if (currentTokens.length > 0 && currentType) {
						processEntity(currentTokens.join(" "), currentType, entities);
					}
					currentTokens = [item.word];
					currentType = type;
				}
			}
			if (currentTokens.length > 0 && currentType) {
				processEntity(currentTokens.join(" "), currentType, entities);
			}

			for (const sentence of batch) {
				const lowerSentence = sentence.toLowerCase();
				const words = lowerSentence.split(" ");
				if (INSTITUTION_KEYWORDS.some((kw) => words.includes(kw))) {
					entities.institutions.add(sentence.trim());
				}
				if (COURSE_KEYWORDS.some((kw) => lowerSentence.includes(kw))) {
					let course = sentence
						.trim()
						.replace(/^(bachelor|bs|bsc|master|phd) (of|in|on)/i, "")
						.replace(/^(certificate|diploma) (of|in|on)/i, "")
						.trim();
					entities.courses.add(course);
				}
			}
		} catch (error) {
			console.error(`Error processing batch starting at sentence ${i}:`, error);
		}
	}

	return {
		institutions: [...entities.institutions],
		courses: [...entities.courses],
	};
}

/**
 * Helper function to process entities from NER results
 * @param {string} entity - Entity text
 * @param {string} type - NER entity type
 * @param {{institutions: Set, courses: Set}} entities - Entity storage
 */
function processEntity(entity, type, entities) {
	if (!entity) return;
	const cleanEntity = entity.trim();
	if (!cleanEntity) return;

	const lowerEntity = cleanEntity.toLowerCase();
	if (
		type === "ORG" &&
		INSTITUTION_KEYWORDS.some((kw) => lowerEntity.includes(kw))
	) {
		entities.institutions.add(cleanEntity);
	} else if (
		type === "MISC" &&
		COURSE_KEYWORDS.some((kw) => lowerEntity.includes(kw))
	) {
		entities.courses.add(cleanEntity);
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
