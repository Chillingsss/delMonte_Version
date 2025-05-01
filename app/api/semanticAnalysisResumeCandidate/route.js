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
 * Wraps API calls with timeoucant and retry logic
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
		console.log("Candidate Text:", candidateText);
		console.log("Job Requirements:", jobRequirements);

		// Load the Universal Sentence Encoder
		const encoder = await loadEncoder();

		// Process candidate text through Gemini for structured data
		const candidateInfo = await processNERResults(candidateText);

		// Parse job requirements if it's a string
		const jobInfo =
			typeof jobRequirements === "string"
				? JSON.parse(jobRequirements)
				: jobRequirements;

		console.log("Structured Candidate Info:", candidateInfo);
		console.log("Structured Job Info:", jobInfo);

		// Ensure candidateInfo has all required fields
		const safeCandidateInfo = {
			education: Array.isArray(candidateInfo?.education)
				? candidateInfo.education
				: [],
			experience: Array.isArray(candidateInfo?.experience)
				? candidateInfo.experience
				: [],
			skills: Array.isArray(candidateInfo?.skills) ? candidateInfo.skills : [],
			training: Array.isArray(candidateInfo?.training)
				? candidateInfo.training
				: [],
			knowledge: Array.isArray(candidateInfo?.knowledge)
				? candidateInfo.knowledge
				: [],
		};

		// Ensure jobInfo has all required fields
		const safeJobInfo = {
			education: Array.isArray(jobInfo?.education) ? jobInfo.education : [],
			experience: Array.isArray(jobInfo?.experience) ? jobInfo.experience : [],
			skills: Array.isArray(jobInfo?.skills) ? jobInfo.skills : [],
			training: Array.isArray(jobInfo?.training) ? jobInfo.training : [],
			knowledge: Array.isArray(jobInfo?.knowledge) ? jobInfo.knowledge : [],
		};

		// Helper function to calculate semantic similarity using embeddings
		async function calculateSemanticSimilarity(text1, text2) {
			if (!text1 || !text2) return 0;

			try {
				const embeddings = await encoder.embed([text1, text2]);
				const similarity = tf
					.matMul(embeddings, embeddings.transpose())
					.dataSync();
				return similarity[1]; // Returns the similarity score between 0 and 1
			} catch (error) {
				console.error("Error calculating semantic similarity:", error);
				return 0;
			}
		}

		// Calculate individual scores for each qualification using semantic similarity
		const educationScores = await Promise.all(
			safeJobInfo.education.map(async (jobEdu) => {
				const candidateMatches = await Promise.all(
					safeCandidateInfo.education.map(
						async (candidateEdu) =>
							await calculateSemanticSimilarity(
								candidateEdu.degree,
								jobEdu.degree,
								jobEdu.id
							)
					)
				);
				const bestMatch = Math.max(...candidateMatches);
				const bestIndex = candidateMatches.findIndex((m) => m === bestMatch);
				const matchedCandidate = safeCandidateInfo.education[bestIndex] || {};
				const partialScore = Math.round(jobEdu.points * bestMatch);
				return {
					id: jobEdu.id,
					qualification: jobEdu.degree,
					candidate: matchedCandidate,
					points: jobEdu.points,
					score: partialScore,
					matched: bestMatch > 0.3,
					similarity: bestMatch,
					explanation:
						bestMatch > 0.3
							? `Matched with ${Math.round(bestMatch * 100)}% similarity`
							: "No significant match found",
				};
			})
		);

		const experienceScores = await Promise.all(
			safeJobInfo.experience.map(async (jobExp) => {
				const candidateMatches = await Promise.all(
					safeCandidateInfo.experience.map(
						async (candidateExp) =>
							await calculateSemanticSimilarity(
								candidateExp.responsibilities.join(" "),
								jobExp.responsibilities,
								jobExp.id
							)
					)
				);
				const bestMatch = Math.max(...candidateMatches);
				const bestIndex = candidateMatches.findIndex((m) => m === bestMatch);
				const matchedCandidate = safeCandidateInfo.experience[bestIndex] || {};
				const partialScore = Math.round(jobExp.points * bestMatch);
				return {
					id: jobExp.id,
					qualification: jobExp.responsibilities,
					candidate: matchedCandidate,
					points: jobExp.points,
					score: partialScore,
					matched: bestMatch > 0.3,
					similarity: bestMatch,
					explanation:
						bestMatch > 0.3
							? `Matched with ${Math.round(bestMatch * 100)}% similarity`
							: "No significant match found",
				};
			})
		);

		const skillsScores = await Promise.all(
			safeJobInfo.skills.map(async (jobSkill) => {
				const flattenedCandidateSkills = safeCandidateInfo.skills.flatMap(
					(skillCategory) => skillCategory.items || []
				);
				const candidateMatches = await Promise.all(
					flattenedCandidateSkills.map(
						async (candidateSkill) =>
							await calculateSemanticSimilarity(
								candidateSkill,
								jobSkill.name,
								jobSkill.id
							)
					)
				);
				const bestMatch = Math.max(...candidateMatches);
				const bestIndex = candidateMatches.findIndex((m) => m === bestMatch);
				const matchedCandidate = flattenedCandidateSkills[bestIndex] || "";
				const partialScore = Math.round(jobSkill.points * bestMatch);
				return {
					id: jobSkill.id,
					qualification: jobSkill.name,
					candidate: matchedCandidate,
					points: jobSkill.points,
					score: partialScore,
					matched: bestMatch > 0.3,
					similarity: bestMatch,
					explanation:
						bestMatch > 0.3
							? `Matched with ${Math.round(bestMatch * 100)}% similarity`
							: "No significant match found",
				};
			})
		);

		const trainingScores = await Promise.all(
			safeJobInfo.training.map(async (jobTrain) => {
				const candidateMatches = await Promise.all(
					safeCandidateInfo.training.map(
						async (candidateTrain) =>
							await calculateSemanticSimilarity(
								candidateTrain.name,
								jobTrain.name,
								jobTrain.id
							)
					)
				);
				const bestMatch = Math.max(...candidateMatches);
				const bestIndex = candidateMatches.findIndex((m) => m === bestMatch);
				const matchedCandidate = safeCandidateInfo.training[bestIndex] || {};
				const partialScore = Math.round(jobTrain.points * bestMatch);
				return {
					id: jobTrain.id,
					qualification: jobTrain.name,
					candidate: matchedCandidate,
					points: jobTrain.points,
					score: partialScore,
					matched: bestMatch > 0.3,
					similarity: bestMatch,
					explanation:
						bestMatch > 0.3
							? `Matched with ${Math.round(bestMatch * 100)}% similarity`
							: "No significant match found",
				};
			})
		);

		const knowledgeScores = await Promise.all(
			safeJobInfo.knowledge.map(async (jobKnow) => {
				const candidateMatches = await Promise.all(
					safeCandidateInfo.knowledge.map(
						async (candidateKnow) =>
							await calculateSemanticSimilarity(
								candidateKnow.name,
								jobKnow.name,
								jobKnow.id
							)
					)
				);
				const bestMatch = Math.max(...candidateMatches);
				const bestIndex = candidateMatches.findIndex((m) => m === bestMatch);
				const matchedCandidate = safeCandidateInfo.knowledge[bestIndex] || {};
				const partialScore = Math.round(jobKnow.points * bestMatch);
				return {
					id: jobKnow.id,
					qualification: jobKnow.name,
					candidate: matchedCandidate,
					points: jobKnow.points,
					score: partialScore,
					matched: bestMatch > 0.3,
					similarity: bestMatch,
					explanation:
						bestMatch > 0.3
							? `Matched with ${Math.round(bestMatch * 100)}% similarity`
							: "No significant match found",
				};
			})
		);

		// Calculate total scores for each category
		const educationScore = educationScores.reduce(
			(sum, item) => sum + item.score,
			0
		);
		const experienceScore = experienceScores.reduce(
			(sum, item) => sum + item.score,
			0
		);
		const skillsScore = skillsScores.reduce((sum, item) => sum + item.score, 0);
		const trainingScore = trainingScores.reduce(
			(sum, item) => sum + item.score,
			0
		);
		const knowledgeScore = knowledgeScores.reduce(
			(sum, item) => sum + item.score,
			0
		);

		// Calculate maximum possible points for each category
		const maxEducationPoints = educationScores.reduce(
			(sum, item) => sum + item.points,
			0
		);
		const maxExperiencePoints = experienceScores.reduce(
			(sum, item) => sum + item.points,
			0
		);
		const maxSkillsPoints = skillsScores.reduce(
			(sum, item) => sum + item.points,
			0
		);
		const maxTrainingPoints = trainingScores.reduce(
			(sum, item) => sum + item.points,
			0
		);
		const maxKnowledgePoints = knowledgeScores.reduce(
			(sum, item) => sum + item.points,
			0
		);

		// Calculate normalized scores (percentage)
		const normalizedEducationScore =
			maxEducationPoints > 0
				? Math.round((educationScore / maxEducationPoints) * 100)
				: 0;
		const normalizedExperienceScore =
			maxExperiencePoints > 0
				? Math.round((experienceScore / maxExperiencePoints) * 100)
				: 0;
		const normalizedSkillsScore =
			maxSkillsPoints > 0
				? Math.round((skillsScore / maxSkillsPoints) * 100)
				: 0;
		const normalizedTrainingScore =
			maxTrainingPoints > 0
				? Math.round((trainingScore / maxTrainingPoints) * 100)
				: 0;
		const normalizedKnowledgeScore =
			maxKnowledgePoints > 0
				? Math.round((knowledgeScore / maxKnowledgePoints) * 100)
				: 0;

		// Calculate overall match based on weighted average
		const overallMatch = Math.round(
			normalizedEducationScore * 0.25 +
				normalizedExperienceScore * 0.25 +
				normalizedSkillsScore * 0.2 +
				normalizedTrainingScore * 0.15 +
				normalizedKnowledgeScore * 0.15
		);

		const result = {
			educPoints: normalizedEducationScore,
			empPoints: normalizedExperienceScore,
			skillPoints: normalizedSkillsScore,
			trainingPoints: normalizedTrainingScore,
			knowledgePoints: normalizedKnowledgeScore,
			overallMatch: overallMatch,
			detailedScores: {
				education: educationScores,
				experience: experienceScores,
				skills: skillsScores,
				training: trainingScores,
				knowledge: knowledgeScores,
			},
			explanations: {
				education: `Education match score: ${normalizedEducationScore}% (${educationScore}/${maxEducationPoints} points)`,
				experience: `Experience match score: ${normalizedExperienceScore}% (${experienceScore}/${maxExperiencePoints} points)`,
				skills: `Skills match score: ${normalizedSkillsScore}% (${skillsScore}/${maxSkillsPoints} points)`,
				training: `Training match score: ${normalizedTrainingScore}% (${trainingScore}/${maxTrainingPoints} points)`,
				knowledge: `Knowledge match score: ${normalizedKnowledgeScore}% (${knowledgeScore}/${maxKnowledgePoints} points)`,
			},
			matches: {
				education: findMatches(
					safeCandidateInfo.education,
					safeJobInfo.education
				),
				experience: findMatches(
					safeCandidateInfo.experience,
					safeJobInfo.experience
				),
				skills: findMatches(safeCandidateInfo.skills, safeJobInfo.skills),
				training: findMatches(safeCandidateInfo.training, safeJobInfo.training),
				knowledge: findMatches(
					safeCandidateInfo.knowledge,
					safeJobInfo.knowledge
				),
			},
			recommendations: generateStructuredRecommendations(
				safeCandidateInfo,
				safeJobInfo
			),
		};

		console.log("Final result:", JSON.stringify(result, null, 2));
		return result;
	} catch (error) {
		console.error("Error in similarity calculation:", error);
		return {
			educPoints: 0,
			empPoints: 0,
			skillPoints: 0,
			trainingPoints: 0,
			knowledgePoints: 0,
			overallMatch: 0,
			detailedScores: {},
			explanations: {},
			matches: {},
			recommendations: [],
		};
	}
}

/**
 * Calculate similarity between two values
 */
function calculateStringSimilarity(value1, value2) {
	if (!value1 || !value2) return 0;

	// Convert both values to strings
	const str1 = String(value1).trim();
	const str2 = String(value2).trim();

	if (str1 === str2) return 1;

	const s1 = str1.toLowerCase();
	const s2 = str2.toLowerCase();

	// Split into words, handling various separators
	const words1 = s1.split(/[\s,;|]+/).filter((word) => word.length > 0);
	const words2 = s2.split(/[\s,;|]+/).filter((word) => word.length > 0);

	// Calculate word overlap
	const commonWords = words1.filter((word) => words2.includes(word));
	const totalWords = new Set([...words1, ...words2]).size;

	// Calculate character-based similarity for short strings
	if (totalWords === 0) {
		const chars1 = s1.split("");
		const chars2 = s2.split("");
		const commonChars = chars1.filter((char) => chars2.includes(char));
		return commonChars.length / Math.max(chars1.length, chars2.length);
	}

	return commonWords.length / totalWords;
}

/**
 * Calculate score based on structured data comparison
 */
function calculateStructuredScore(candidateData, jobData, fields, pointsField) {
	if (
		!Array.isArray(candidateData) ||
		!Array.isArray(jobData) ||
		candidateData.length === 0 ||
		jobData.length === 0
	) {
		return 0;
	}

	try {
		let totalScore = 0;
		let totalComparisons = 0;
		let maxPossibleScore = jobData.reduce(
			(sum, item) => sum + (item[pointsField] || 0),
			0
		);

		// Special handling for skills comparison
		if (fields[0] === "name" && pointsField === "points") {
			// Flatten candidate skills into a single array
			const flattenedCandidateSkills = candidateData.flatMap(
				(skillCategory) => skillCategory.items || []
			);

			// Compare each job skill with flattened candidate skills
			for (const jobSkill of jobData) {
				const jobSkillName = jobSkill.name?.trim().toLowerCase();
				if (!jobSkillName) continue;

				const hasMatch = flattenedCandidateSkills.some((candidateSkill) => {
					const candidateSkillName = String(candidateSkill)
						.trim()
						.toLowerCase();
					return (
						calculateStringSimilarity(candidateSkillName, jobSkillName) > 0.7
					);
				});

				if (hasMatch) {
					totalScore += jobSkill[pointsField] || 0;
				}
				totalComparisons++;
			}
		} else {
			// Original comparison logic for other categories
			for (const candidateItem of candidateData) {
				for (const jobItem of jobData) {
					let itemScore = 0;
					let fieldCount = 0;

					for (const field of fields) {
						const candidateValue = candidateItem[field];
						const jobValue = jobItem[field];

						if (candidateValue && jobValue) {
							if (Array.isArray(candidateValue) && Array.isArray(jobValue)) {
								const matches = candidateValue.filter((value) =>
									jobValue.some(
										(jobValue) =>
											calculateStringSimilarity(value, jobValue) > 0.7
									)
								);
								itemScore +=
									(matches.length /
										Math.max(candidateValue.length, jobValue.length)) *
									100;
							} else {
								itemScore +=
									calculateStringSimilarity(candidateValue, jobValue) * 100;
							}
							fieldCount++;
						}
					}

					if (fieldCount > 0) {
						const weightedScore =
							((itemScore / fieldCount) * (jobItem[pointsField] || 0)) / 100;
						totalScore += weightedScore;
						totalComparisons++;
					}
				}
			}
		}

		// Normalize the score based on maximum possible points
		const normalizedScore =
			maxPossibleScore > 0
				? Math.round((totalScore / maxPossibleScore) * 100)
				: 0;
		return normalizedScore;
	} catch (error) {
		console.error("Error in calculateStructuredScore:", error);
		return 0;
	}
}

/**
 * Find matching items between candidate and job data
 */
function findMatches(candidateData, jobData) {
	if (!Array.isArray(candidateData) || !Array.isArray(jobData)) {
		return [];
	}

	const matches = [];

	// Special handling for skills
	if (jobData.length > 0 && jobData[0].name && jobData[0].points) {
		// Flatten candidate skills
		const flattenedCandidateSkills = candidateData.flatMap(
			(skillCategory) => skillCategory.items || []
		);

		for (const jobSkill of jobData) {
			const jobSkillName = jobSkill.name?.trim().toLowerCase();
			if (!jobSkillName) continue;

			const matchingSkills = flattenedCandidateSkills.filter(
				(candidateSkill) => {
					const candidateSkillName = String(candidateSkill)
						.trim()
						.toLowerCase();
					return (
						calculateStringSimilarity(candidateSkillName, jobSkillName) > 0.7
					);
				}
			);

			matches.push(...matchingSkills);
		}
	} else {
		// Original matching logic for other categories
		for (const candidateItem of candidateData) {
			if (!candidateItem) continue;

			for (const jobItem of jobData) {
				if (!jobItem) continue;

				if (
					calculateStringSimilarity(
						JSON.stringify(candidateItem),
						JSON.stringify(jobItem)
					) > 0.7
				) {
					matches.push(candidateItem);
				}
			}
		}
	}

	return matches;
}

/**
 * Generate recommendations based on structured data comparison
 */
function generateStructuredRecommendations(candidateInfo, jobInfo) {
	const recommendations = [];

	// Education recommendations
	if (Array.isArray(jobInfo.education) && jobInfo.education.length > 0) {
		const missingEducation = jobInfo.education.filter(
			(jobEdu) =>
				!candidateInfo.education.some(
					(candidateEdu) =>
						calculateStringSimilarity(
							JSON.stringify(candidateEdu),
							JSON.stringify(jobEdu)
						) > 0.7
				)
		);
		if (missingEducation.length > 0) {
			recommendations.push(
				`Consider pursuing: ${missingEducation
					.map((edu) => edu.degree)
					.join(", ")}`
			);
		}
	}

	// Skills recommendations
	if (Array.isArray(jobInfo.skills) && jobInfo.skills.length > 0) {
		const missingSkills = jobInfo.skills.flatMap(
			(jobSkill) =>
				jobSkill.items?.filter(
					(skill) =>
						!candidateInfo.skills.some((candidateSkill) =>
							candidateSkill.items?.some(
								(item) => calculateStringSimilarity(item, skill) > 0.7
							)
						)
				) || []
		);
		if (missingSkills.length > 0) {
			recommendations.push(
				`Consider developing skills in: ${missingSkills.slice(0, 3).join(", ")}`
			);
		}
	}

	// Training recommendations
	if (Array.isArray(jobInfo.training) && jobInfo.training.length > 0) {
		const missingTraining = jobInfo.training.filter(
			(jobTrain) =>
				!candidateInfo.training.some(
					(candidateTrain) =>
						calculateStringSimilarity(
							JSON.stringify(candidateTrain),
							JSON.stringify(jobTrain)
						) > 0.7
				)
		);
		if (missingTraining.length > 0) {
			recommendations.push(
				`Consider obtaining training in: ${missingTraining
					.map((train) => train.name)
					.join(", ")}`
			);
		}
	}

	// Knowledge recommendations
	if (Array.isArray(jobInfo.knowledge) && jobInfo.knowledge.length > 0) {
		const missingKnowledge = jobInfo.knowledge.filter(
			(jobKnow) =>
				!candidateInfo.knowledge.some(
					(candidateKnow) =>
						calculateStringSimilarity(
							JSON.stringify(candidateKnow),
							JSON.stringify(jobKnow)
						) > 0.7
				)
		);
		if (missingKnowledge.length > 0) {
			recommendations.push(
				`Consider gaining knowledge in: ${missingKnowledge
					.map((know) => know.name)
					.join(", ")}`
			);
		}
	}

	return recommendations;
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

	const { text1, text2 } = body;
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
					knowledgePoints: 0,
				},
			}),
			{ status: 500, headers: { "Content-Type": "application/json" } }
		);
	}
}
