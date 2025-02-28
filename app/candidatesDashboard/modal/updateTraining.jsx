"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
  getDataFromCookie,
  getDataFromSession,
} from "@/app/utils/storageUtils";
import Select from "react-select";
import { Toaster, toast } from "react-hot-toast";
import Tesseract from "tesseract.js";
import stringSimilarity from "string-similarity";

const performSemanticAnalysis = (text1, text2) => {
  // Define threshold constants
  const THRESHOLDS = {
    HIGH: 80,    // High similarity (very good match)
    MEDIUM: 60,  // Medium similarity (acceptable match)
    LOW: 40      // Low similarity (poor match)
  };

  // Normalize and tokenize texts
  const normalize = (text) => text.toLowerCase().trim().split(/\s+/);
  const tokens1 = normalize(text1);
  const tokens2 = normalize(text2);

  // Calculate word-based similarity
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);
  const intersection = new Set(tokens1.filter(x => set2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);

  // Jaccard similarity (word overlap)
  const jaccardSimilarity = intersection.size / union.size;

  // Word-by-word similarity using string-similarity
  const cosineSimilarity = stringSimilarity.compareTwoStrings(text1, text2);

  // Calculate edit distance (simplified)
  const calculateEditDistance = (str1, str2) => {
    if (str1.length === 0) return str2.length;
    if (str2.length === 0) return str1.length;

    const matrix = Array(str1.length + 1).fill().map(() => 
      Array(str2.length + 1).fill(0)
    );

    for (let i = 0; i <= str1.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= str2.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= str1.length; i++) {
      for (let j = 1; j <= str2.length; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[str1.length][str2.length];
  };

  const editDistance = calculateEditDistance(text1, text2);
  const maxLength = Math.max(text1.length, text2.length);
  const editSimilarity = 1 - (editDistance / maxLength);

  // Calculate scores
  const scores = {
    cosine: parseFloat((cosineSimilarity * 100).toFixed(2)),
    jaccard: parseFloat((jaccardSimilarity * 100).toFixed(2)),
    edit: parseFloat((editSimilarity * 100).toFixed(2))
  };

  // Determine overall match quality
  const avgScore = (scores.cosine + scores.jaccard + scores.edit) / 3;
  let matchQuality;
  if (avgScore >= THRESHOLDS.HIGH) {
    matchQuality = "Excellent Match ";
  } else if (avgScore >= THRESHOLDS.MEDIUM) {
    matchQuality = "Acceptable Match ";
  } else {
    matchQuality = "Poor Match ";
  }

  return {
    scores,
    matchQuality,
    thresholds: THRESHOLDS,
    commonWords: Array.from(intersection),
    uniqueWords1: Array.from(set1).filter(x => !set2.has(x)),
    uniqueWords2: Array.from(set2).filter(x => !set1.has(x)),
    averageScore: avgScore.toFixed(2)
  };
};

const UpdateTraining = ({
  showModal,
  setShowModal,
  train,
  fetchProfile,
  trainings,
  selectedTraining,
  fetchTraining,
}) => {
  const { data: session } = useSession();
  const [data, setData] = useState({
    training_id: train?.training_id || "",
    perT_id: train?.training_perTId || "",
    perT_name: train?.perT_name || "",
    training_title: "",
    image: null,
    training_image: train?.training_image || "",
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("appearance");
    if (savedTheme === "dark") return true;
    if (savedTheme === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateTheme = () => {
      const savedTheme = localStorage.getItem("appearance");
      if (savedTheme === "dark") {
        setIsDarkMode(true);
      } else if (savedTheme === "light") {
        setIsDarkMode(false);
      } else {
        setIsDarkMode(mediaQuery.matches);
      }
    };

    // Set initial theme
    updateTheme();

    // Listen for changes in localStorage
    const handleStorageChange = (e) => {
      if (e.key === "appearance") {
        updateTheme();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Listen for changes in system preference
    const handleMediaQueryChange = (e) => {
      const savedTheme = localStorage.getItem("appearance");
      if (savedTheme === "system") {
        setIsDarkMode(e.matches);
      }
    };
    mediaQuery.addEventListener("change", handleMediaQueryChange);

    // Cleanup
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  const [isNewTraining, setIsNewTraining] = useState(true); // Track if adding a new training
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (showModal) {
      if (isNewTraining) {
        // Reset data when adding a new training
        setData({
          training_id: "",
          perT_id: "",
          perT_name: "",
          training_title: "",
          image: null,
          training_image: "",
        });
      } else {
        // Populate data for editing
        setData({
          training_id: train.training_id || "",
          perT_id: train.training_perTId || "",
          perT_name: train.perT_name || "",
          training_image: train.training_image || "",
          training_title: "",
        });
      }
    }
  }, [showModal, train, isNewTraining]);
  // console.log("Training:", data);

  useEffect(() => {
    if (selectedTraining) {
      setData({
        training_id: selectedTraining.training_id || "",
        perT_id: selectedTraining.training_perTId || "",
        perT_name: selectedTraining.perT_name || "",
        training_image: selectedTraining.training_image || "",
        training_title: "",
      });
      setIsNewTraining(false); // Set to false when editing
    }
  }, [selectedTraining]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Validate training title input
    if (name === "perT_name") {
      if (
        trainings.some(
          (existingTraining) =>
            existingTraining.perT_name.toLowerCase() === value.toLowerCase()
        )
      ) {
        setError("This training title already exists."); // Set error message
      } else {
        setError(""); // Clear error if no issue
      }
    }
  };

  const handleSelectChange = (selectedOption) => {
    if (selectedOption) {
      const isCustom = selectedOption.value === "custom";
      setData({
        ...data,
        perT_id: selectedOption.value,
        perT_name: isCustom ? "" : selectedOption.label,
      });
    } else {
      setData({ ...data, perT_id: "", perT_name: "" });
    }
    setError("");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData({ ...data, image: file });
    }
  };

  const processImage = async (file) => {
    try {
      const result = await Tesseract.recognize(file, "eng", {
        logger: (info) => console.log(info),
      });
      return result.data.text;
    } catch (error) {
      console.error("Error processing image:", error);
      throw new Error("Error processing image");
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
      const getUserIdFromCookie = () => {
        const tokenData = getDataFromCookie("auth_token");
        if (tokenData && tokenData.userId) {
          return tokenData.userId;
        }
        return null; // Return null if userId is not found or tokenData is invalid
      };
      const userId = session?.user?.id;

      console.log("User ID:", userId);

      if (
        data.customTraining &&
        trainings.some(
          (existingTraining) =>
            existingTraining.perT_name.toLowerCase() ===
            data.perT_name.toLowerCase()
        )
      ) {
        toast.error(
          "Please choose the existing training title from the dropdown."
        );
        return;
      }

      let textFromImage = "";
      if (data.image) {
        textFromImage = await processImage(data.image);
      } else if (train?.training_image) {
        textFromImage = await processImage(train?.training_image);
      }

      const normalizedTextFromImage = textFromImage.trim().toLowerCase();
      const normalizedTrainingTitle = data.training_title.trim().toLowerCase();
      const normalizedTrainingName = data.perT_name.trim().toLowerCase();

      // Perform semantic analysis for image vs title
      console.log('\n=== Detailed Semantic Analysis: Image vs Title ===');
      const imageVsTitleAnalysis = performSemanticAnalysis(normalizedTextFromImage, normalizedTrainingTitle);
      console.log('Match Quality:', imageVsTitleAnalysis.matchQuality);
      console.log('Average Similarity Score:', imageVsTitleAnalysis.averageScore + '%');
      console.log('Individual Scores:');
      console.log('- Cosine Similarity:', imageVsTitleAnalysis.scores.cosine + '%');
      console.log('- Jaccard Similarity:', imageVsTitleAnalysis.scores.jaccard + '%');
      console.log('- Edit Distance Similarity:', imageVsTitleAnalysis.scores.edit + '%');
      console.log('Common Words:', imageVsTitleAnalysis.commonWords);
      console.log('Words only in Image:', imageVsTitleAnalysis.uniqueWords1);
      console.log('Words only in Title:', imageVsTitleAnalysis.uniqueWords2);

      // Use the average score for validation
      if (
        data.image &&
        parseFloat(imageVsTitleAnalysis.averageScore) < imageVsTitleAnalysis.thresholds.MEDIUM
      ) {
        toast.error("The certificate image does not match the training title (Similarity: " + imageVsTitleAnalysis.averageScore + "%)");
        setLoading(false);
        return;
      }

      // Perform semantic analysis for title vs name
      console.log('\n=== Detailed Semantic Analysis: Title vs Name ===');
      const titleVsNameAnalysis = performSemanticAnalysis(normalizedTrainingTitle, normalizedTrainingName);
      console.log('Match Quality:', titleVsNameAnalysis.matchQuality);
      console.log('Average Similarity Score:', titleVsNameAnalysis.averageScore + '%');
      console.log('Individual Scores:');
      console.log('- Cosine Similarity:', titleVsNameAnalysis.scores.cosine + '%');
      console.log('- Jaccard Similarity:', titleVsNameAnalysis.scores.jaccard + '%');
      console.log('- Edit Distance Similarity:', titleVsNameAnalysis.scores.edit + '%');
      console.log('Common Words:', titleVsNameAnalysis.commonWords);
      console.log('Words only in Title:', titleVsNameAnalysis.uniqueWords1);
      console.log('Words only in Name:', titleVsNameAnalysis.uniqueWords2);

      // Use the average score for validation
      if (parseFloat(titleVsNameAnalysis.averageScore) < titleVsNameAnalysis.thresholds.MEDIUM) {
        toast.error("The training title does not match the selected training (Similarity: " + titleVsNameAnalysis.averageScore + "%)");
        setLoading(false);
        return;
      }

      const updatedData = {
        cand_id: userId,
        training: [
          {
            training_id: train?.training_id || null,
            perT_id:
              data.perT_id === "custom"
                ? "custom"
                : data.perT_id || train?.training_perTId,
            customTraining: data.perT_id === "custom" ? data.perT_name : null,
            image: data.image ? data.image.name : train?.training_image,
          },
        ],
      };

      console.log("Update Training:", updatedData);

      const formData = new FormData();
      formData.append("operation", "updateCandidateTraining");
      formData.append("json", JSON.stringify(updatedData));

      if (data.image) {
        formData.append("image", data.image);
      }

      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response:", response.data);

      if (response.data === 1) {
        console.log("Training updated successfully.");
        toast.success("Training updated successfully.");
        if (fetchProfile) {
          fetchProfile();
        }
        if (fetchTraining) {
          fetchTraining();
        }
        setShowModal(false);
      } else {
        console.error("Failed to update training:", response.data);
        toast.error("Failed to update training.");
      }
    } catch (error) {
      console.error("Error updating training:", error);
      toast.error("An error occurred while updating the training.");
    } finally {
      setLoading(false);
    }
  };

  const getSelectedOption = (options, value) =>
    options.find((option) => option.value === value) || null;

  const trainingOptions = useMemo(() => {
    return [
      { value: "custom", label: "Other (Specify)" },
      ...trainings.map((training) => ({
        value: training.perT_id,
        label: training.perT_name,
      })),
    ];
  }, [trainings]);

  const selectedValue = useMemo(() => {
    return getSelectedOption(
      trainings.map((training) => ({
        value: training.perT_id,
        label: training.perT_name,
      })),
      data.perT_id || train?.training_perTId
    );
  }, [data.perT_id, train?.training_perTId, trainings]);

  const imageUrl = data.image ? URL.createObjectURL(data.image) : null;

  return (
    <div className={`modal ${showModal ? "block" : "hidden"}`}>
      <div
        className={`modal-content ${
          isDarkMode ? "bg-gray-700" : "bg-gray-200"
        } p-6 rounded-lg shadow-lg`}
      >
        <h3
          className={`text-xl font-semibold ${
            isDarkMode ? "text-white" : "text-gray-800"
          } mb-4`}
        >
          Update Training
        </h3>

        <div className="mb-4">
          <label
            className={`block ${
              isDarkMode ? "text-white" : "text-gray-600"
            } text-sm font-normal`}
          >
            Select Training:
          </label>
          <div className="flex items-center">
            <Select
              name="perT_id"
              value={selectedValue}
              onChange={handleSelectChange}
              options={trainingOptions}
              placeholder="Select Training"
              isSearchable
              className="w-full text-black"
              menuPlacement="auto"
              menuPosition="fixed"
              blurInputOnSelect
              isOptionDisabled={(option) => option.isDisabled}
            />
            {data.perT_id && (
              <button
                className="ml-2 text-red-500"
                onClick={() => handleSelectChange(null, "perT_id")}
              >
                Clear
              </button>
            )}
          </div>
          {data.perT_id === "custom" && (
            <input
              type="text"
              name="perT_name"
              value={data.perT_name}
              onChange={handleChange}
              className={`w-full mt-2 border-b-2 pb-2 bg-transparent ${
                error ? "border-red-500" : "border-black"
              }`}
              placeholder="Enter custom training name"
            />
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <div className="mb-4">
          <label
            className={`block ${
              isDarkMode ? "text-white" : "text-gray-600"
            } text-sm font-normal`}
          >
            Training Title:
          </label>
          <input
            type="text"
            name="training_title"
            value={data.training_title}
            onChange={handleChange}
            className={`w-full p-2 border ${
              isDarkMode
                ? "border-gray-500 text-white"
                : "border-gray-300 text-black"
            } bg-transparent rounded`}
            placeholder="Enter Training Title"
          />
        </div>

        <div className="mb-4">
          <label
            className={`block ${
              isDarkMode ? "text-white" : "text-gray-600"
            } text-sm font-normal`}
          >
            Current Image:
          </label>

          {data.training_image && (
            <div className="mb-2">
              <img
                src={`http://localhost/php-delmonte/api/uploads/${data.training_image}`}
                alt="Current Training"
                className="w-32 h-32 object-cover rounded-lg shadow-md"
              />
              <p
                className={`text-sm ${
                  isDarkMode ? "text-white" : "text-gray-500"
                } mt-2`}
              >
                Current image: {data.training_image}
              </p>
            </div>
          )}

          <p
            className={`text-sm ${
              isDarkMode ? "text-white" : "text-gray-500"
            } mb-2`}
          >
            Choose a new image:
          </p>

          <div className="relative w-full">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className={`flex items-center justify-center w-full p-3 border-2 border-dashed ${
                isDarkMode ? "border-gray-500" : "border-gray-300"
              } rounded-lg hover:bg-gray-100 transition-all cursor-pointer`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 16.5V7a2 2 0 012-2h2.586a2 2 0 011.414.586l1.828 1.828a2 2 0 001.414.586H19a2 2 0 012 2v7.5m-8 0v6m-4-6v6m8-6v6"
                />
              </svg>
              <span
                className={`ml-2 ${
                  isDarkMode ? "text-white" : "text-gray-600"
                }`}
              >
                {data.image
                  ? data.image.name
                  : train?.training_image
                  ? train.training_image
                  : "Select File"}
              </span>
            </div>
          </div>
        </div>

        {imageUrl && (
          <div className="mt-4">
            <img
              src={imageUrl}
              alt="Selected Training"
              className="w-32 h-32 object-cover rounded-lg shadow-md"
            />
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            className={`px-4 py-2 mr-2 ${
              isDarkMode ? "text-gray-800" : "text-gray-800"
            } bg-gray-300 rounded hover:bg-gray-400 transition`}
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`px-4 py-2 ${
              isDarkMode ? "text-white" : "text-white"
            } bg-blue-600 rounded hover:bg-blue-700 transition`}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center mt-4">
            <div className="w-8 h-8 border-4 border-t-transparent border-green-500 rounded-full animate-spin"></div>
            <p className="ml-2 text-green-500">Processing image...</p>
          </div>
        )}
      </div>
      <Toaster position="bottom-left" /> {/* Add Toaster component */}
    </div>
  );
};

export default UpdateTraining;
