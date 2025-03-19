import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

export async function POST(req) {
  const { text1, text2, threshold } = await req.json();

  console.log('Image Text:', text1);
  console.log('Training Title:', text2);

  try {
    const model = await use.load();

    const embeddings = await model.embed([text1, text2]);
    console.log('Embeddings:', embeddings.arraySync());

    const similarityScore = calculateCosineSimilarity(embeddings.arraySync()[0], embeddings.arraySync()[1]);
    console.log('Similarity Score:', similarityScore);

    const similarityPercentage = parseFloat((similarityScore * 100).toFixed(2));
    console.log('Similarity Percentage:', similarityPercentage);

   console.log('Threshold:', threshold);

    const matchQuality = similarityPercentage >= threshold ? "Acceptable Match" : "Poor Match";
    console.log('Match Quality:', matchQuality);

    return new Response(JSON.stringify({
      score: similarityPercentage,
      matchQuality,
      threshold: threshold,
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("Error during semantic analysis:", error);
    return new Response(JSON.stringify({
      message: "An error occurred during semantic analysis.",
      error: error.message,
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

function calculateCosineSimilarity(vecA, vecB) {
  const dotProduct = tf.dot(tf.tensor(vecA), tf.tensor(vecB));
  const normA = tf.norm(tf.tensor(vecA));
  const normB = tf.norm(tf.tensor(vecB));
  const score = dotProduct.div(normA.mul(normB)).dataSync()[0];
  console.log('Dot Product:', dotProduct.dataSync()[0]);
  console.log('Norm A:', normA.dataSync()[0]);
  console.log('Norm B:', normB.dataSync()[0]);
  console.log('Score:', score);
  return score;
}