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

const TIMEOUT_MS = 30000; // 10s timeout for API calls
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
	if (!text || typeof text !== "string") {
		return {
			personalInfo: {},
			education: [],
			experience: [],
			skills: [],
			training: [],
		};
	}

	try {
		const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

		const prompt = `Analyze and extract structured information from this resume text. Return ONLY a JSON object with the following format:

Text: "${text}"

{
    "personalInfo": {
        "fullName": "extracted full name",
        "email": "extracted email",
        "contactNumber": "extracted contact number"
    },
    "education": [
        {
            "institution": "school/university name",
            "degree": "complete degree name",
            "field": "field of study",
            "graduationYear": "year",
            "relevantCourses": ["course1", "course2"]
        }
    ],
    "experience": [
        {
            "company": "company name",
            "position": "job title",
            "duration": "duration in years/months",
            "responsibilities": ["responsibility1", "responsibility2"],
            "skills": ["skill1", "skill2"]
        }
    ],
    "skills": [
        {
            "category": "Technical/Soft/Domain",
            "items": ["skill1", "skill2"]
        }
    ],
    "training": [
        {
            "name": "training/certification name",
            "provider": "institution/provider",
            "date": "completion date",
            "relevantSkills": ["skill1", "skill2"]
        }
    ],
    "licenses": [
        {
            "name": "license name",
            "issuer": "issuing body",
            "validUntil": "expiry date"
        }
    ]
}

Extract and categorize ALL relevant information, ensuring:
1. Personal information is complete and properly formatted
2. Educational details include full degree names and fields
3. Work experience includes detailed responsibilities and skills gained
4. Skills are properly categorized (Technical, Soft Skills, Domain Knowledge)
5. Training and certifications include relevant skills gained
6. All dates and durations are standardized`;

		const result = await withTimeoutAndRetry(model.generateContent(prompt));
		const response = await result.response;
		console.log("Raw Gemini Response:", response.text());

		// Parse and validate the response
		let parsed;
		try {
			const jsonMatch = response.text().match(/\{[\s\S]*\}/);
			parsed = jsonMatch
				? JSON.parse(jsonMatch[0])
				: {
						personalInfo: {},
						education: [],
						experience: [],
						skills: [],
						training: [],
						licenses: [],
				  };
		} catch (error) {
			console.error("Error parsing Gemini response:", error);
			parsed = {
				personalInfo: {},
				education: [],
				experience: [],
				skills: [],
				training: [],
				licenses: [],
			};
		}

		return parsed;
	} catch (error) {
		console.error("Error in NER processing:", error);
		return {
			personalInfo: {},
			education: [],
			experience: [],
			skills: [],
			training: [],
			licenses: [],
		};
	}
}

/**
 * Calculates similarity score using TensorFlow's Universal Sentence Encoder
 * @param {string} candidateText - Candidate's resume text
 * @param {string} jobRequirements - Job requirements text
 * @returns {Promise<{educPoints: number, empPoints: number, skillPoints: number, trainingPoints: number, licensePoints: number, overallMatch: number, explanations: object, matches: object, recommendations: string[]}>} Similarity results
 */
async function calculateCosineSimilarity(candidateText, jobRequirements) {
	if (!candidateText || !jobRequirements) return 0;

	try {
		console.log("Starting similarity calculation...");

		// Load the Universal Sentence Encoder if not already loaded
		const encoder = await loadEncoder();
		console.log("Encoder loaded successfully");

		// Generate embeddings for both texts
		console.log("Generating embeddings...");
		const candidateEmbedding = await encoder.embed(candidateText);
		const jobEmbedding = await encoder.embed(jobRequirements);
		console.log("Embeddings generated");

		// Calculate cosine similarity
		console.log("Calculating cosine similarity...");
		const similarity = tf
			.matMul(candidateEmbedding, jobEmbedding, false, true)
			.dataSync()[0];
		console.log("Raw similarity score:", similarity);

		// Normalize the similarity score to 0-100 range
		const normalizedScore = Math.round((similarity + 1) * 50);
		console.log("Normalized score:", normalizedScore);

		// Calculate category-specific scores based on text analysis
		console.log("Calculating category scores...");
		const educationScore = calculateCategoryScore(
			candidateText,
			jobRequirements,
			["education", "degree", "school", "university"]
		);
		const experienceScore = calculateCategoryScore(
			candidateText,
			jobRequirements,
			["experience", "work", "job", "position"]
		);
		const skillsScore = calculateCategoryScore(candidateText, jobRequirements, [
			"skills",
			"abilities",
			"proficiency",
		]);
		const trainingScore = calculateCategoryScore(
			candidateText,
			jobRequirements,
			["training", "certification", "course"]
		);
		const licensesScore = calculateCategoryScore(
			candidateText,
			jobRequirements,
			["license", "certification", "qualification"]
		);

		console.log("Category scores calculated:", {
			education: educationScore,
			experience: experienceScore,
			skills: skillsScore,
			training: trainingScore,
			licenses: licensesScore,
		});

		const result = {
			educPoints: educationScore,
			empPoints: experienceScore,
			skillPoints: skillsScore,
			trainingPoints: trainingScore,
			licensePoints: licensesScore,
			overallMatch: normalizedScore,
			explanations: {
				education: `Education match score: ${educationScore}%`,
				experience: `Experience match score: ${experienceScore}%`,
				skills: `Skills match score: ${skillsScore}%`,
				training: `Training match score: ${trainingScore}%`,
				licenses: `Licenses match score: ${licensesScore}%`,
			},
			matches: {
				education: extractMatches(candidateText, jobRequirements, [
					"education",
					"degree",
					"school",
					"university",
				]),
				experience: extractMatches(candidateText, jobRequirements, [
					"experience",
					"work",
					"job",
					"position",
				]),
				skills: extractMatches(candidateText, jobRequirements, [
					"skills",
					"abilities",
					"proficiency",
				]),
				training: extractMatches(candidateText, jobRequirements, [
					"training",
					"certification",
					"course",
				]),
				licenses: extractMatches(candidateText, jobRequirements, [
					"license",
					"certification",
					"qualification",
				]),
			},
			recommendations: generateRecommendations(candidateText, jobRequirements),
		};

		console.log("Final result:", result);
		return result;
	} catch (error) {
		console.error("Error in similarity calculation:", error);
		return {
			educPoints: 0,
			empPoints: 0,
			skillPoints: 0,
			trainingPoints: 0,
			licensePoints: 0,
			overallMatch: 0,
			explanations: {},
			matches: {},
			recommendations: [],
		};
	}
}

/**
 * Helper function to calculate category-specific scores
 */
function calculateCategoryScore(text1, text2, keywords) {
	try {
		const text1Words = preprocessText(text1).split(" ");
		const text2Words = preprocessText(text2).split(" ");

		// Count keyword matches
		const keywordMatches = keywords.filter(
			(keyword) => text1Words.includes(keyword) && text2Words.includes(keyword)
		).length;

		// Calculate basic similarity score
		const commonWords = text1Words.filter((word) =>
			text2Words.includes(word)
		).length;
		const maxWords = Math.max(text1Words.length, text2Words.length);

		// Combine keyword matches with word similarity
		const score = Math.round(
			(keywordMatches * 0.3 + (commonWords / maxWords) * 0.7) * 100
		);
		console.log(`Category score calculation for ${keywords[0]}:`, {
			keywordMatches,
			commonWords,
			maxWords,
			score,
		});
		return score;
	} catch (error) {
		console.error("Error in calculateCategoryScore:", error);
		return 0;
	}
}

/**
 * Helper function to extract matching terms
 */
function extractMatches(text1, text2, keywords) {
	try {
		const text1Words = preprocessText(text1).split(" ");
		const text2Words = preprocessText(text2).split(" ");

		const matches = keywords.filter(
			(keyword) => text1Words.includes(keyword) && text2Words.includes(keyword)
		);
		console.log(`Matches found for ${keywords[0]}:`, matches);
		return matches;
	} catch (error) {
		console.error("Error in extractMatches:", error);
		return [];
	}
}

/**
 * Helper function to generate recommendations
 */
function generateRecommendations(candidateText, jobRequirements) {
	try {
		const recommendations = [];
		const candidateWords = preprocessText(candidateText).split(" ");
		const jobWords = preprocessText(jobRequirements).split(" ");

		// Find missing skills
		const missingSkills = jobWords.filter(
			(word) =>
				!candidateWords.includes(word) &&
				word.length > 3 && // Avoid short words
				!STOPWORDS.has(word)
		);

		if (missingSkills.length > 0) {
			recommendations.push(
				`Consider developing skills in: ${missingSkills.slice(0, 3).join(", ")}`
			);
		}

		console.log("Generated recommendations:", recommendations);
		return recommendations;
	} catch (error) {
		console.error("Error in generateRecommendations:", error);
		return [];
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
	if (!text1 || !text2) {
		return new Response(
			JSON.stringify({
				message: "Both text1 and text2 are required",
			}),
			{ status: 400, headers: { "Content-Type": "application/json" } }
		);
	}

	try {
		const candidateInfo = await processNERResults(text1);
		const similarityResults = await calculateCosineSimilarity(text1, text2);

		return new Response(
			JSON.stringify({
				candidateInfo,
				...similarityResults,
				matchQuality:
					similarityResults.overallMatch >= threshold
						? "Acceptable Match"
						: "Poor Match",
				threshold,
			}),
			{ headers: { "Content-Type": "application/json" } }
		);
	} catch (error) {
		console.error("Error during analysis:", error);
		return new Response(
			JSON.stringify({
				message: "An error occurred during analysis",
				error: error.message,
				points: {
					educPoints: 0,
					empPoints: 0,
					skillPoints: 0,
					trainingPoints: 0,
					licensePoints: 0,
				},
			}),
			{ status: 500, headers: { "Content-Type": "application/json" } }
		);
	}
}
