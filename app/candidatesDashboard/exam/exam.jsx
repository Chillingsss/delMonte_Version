import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
  getDataFromCookie,
  getDataFromSession,
  removeSessionData,
} from "@/app/utils/storageUtils";
import { Toaster, toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const ExamModal = ({
  startTimer,
  jobMId,
  jobTitle,
  onClose,
  jobPercentage,
  jobPassingPoints,
  fetchAppliedJobs,
  fetchNotification,
  fetchJobs,
  fetchExamResult,
}) => {
  const { data: session } = useSession();
  const [timeLeft, setTimeLeft] = useState(null);
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [examId, setExamId] = useState(null);
  const [examDuration, setExamDuration] = useState(null);
  const [timesUp, setTimesUp] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [questionPoints, setQuestionPoints] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const questionsPerPage = 3;

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

  const fetchExamData = useCallback(async () => {
    const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
    const jsonData = { jobM_id: jobMId || null };

    const formData = new FormData();
    formData.append("operation", "getJobExam");
    formData.append("json", JSON.stringify(jsonData));

    try {
      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data && response.data.examQuestions) {
        const shuffledQuestions = response.data.examQuestions
          .map((value) => ({ value, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ value }) => value)
          .map((question) => ({
            ...question,
            choices: question.choices
              .map((value) => ({ value, sort: Math.random() }))
              .sort((a, b) => a.sort - b.sort)
              .map(({ value }) => value),
          }));

        if (!shuffledQuestions.length) {
          throw new Error("No exam questions available");
        }

        setExamData(shuffledQuestions);
        setExamId(shuffledQuestions[0]?.exam_id);

        let duration = null;

        const hasJobSpecificQuestions = shuffledQuestions.some(
          (question) => question.exam_jobMId
        );

        if (hasJobSpecificQuestions) {
          const jobSpecificQuestion = shuffledQuestions.find(
            (question) => question.exam_jobMId && question.exam_duration
          );

          if (jobSpecificQuestion) {
            duration = jobSpecificQuestion.exam_duration;
            console.log("Using job-specific exam duration:", duration);
          } else {
            throw new Error(
              "No exam duration specified in job-specific questions"
            );
          }
        } else {
          const generalQuestion = shuffledQuestions.find(
            (question) => question.exam_duration
          );

          if (generalQuestion) {
            duration = generalQuestion.exam_duration;
            console.log("Using general exam duration:", duration);
          } else {
            throw new Error("No exam duration specified in any question");
          }
        }

        // Convert duration from minutes to seconds
        setExamDuration(duration * 60);

        const pointsArray = shuffledQuestions.map((q) => q.examQ_points);
        setQuestionPoints(pointsArray);
        setLoading(false);
      } else {
        throw new Error("No exam questions found");
      }
    } catch (error) {
      console.error("Error fetching exam data:", error);
      setError(error.message || "Failed to load exam data.");
      setLoading(false);
    }
  }, [jobMId]);

  useEffect(() => {
    fetchExamData();
  }, [fetchExamData]);

  useEffect(() => {
    if (startTimer && examDuration) {
      setTimeLeft(examDuration);
    }
  }, [startTimer, examDuration]);

  const handleAnswerChange = (questionId, choiceId) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
  };

  useEffect(() => {
    let timer;
    if (startTimer && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimesUp(true);
    }
    return () => clearInterval(timer);
  }, [startTimer, timeLeft]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.round(seconds % 60);
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    try {
      const getUserIdFromCookie = () => {
        const tokenData = getDataFromCookie("auth_token");
        if (tokenData && tokenData.userId) {
          return tokenData.userId;
        }
        return null; // Return null if userId is not found or tokenData is invalid
      };
      const userId = session?.user?.id || getUserIdFromCookie();

      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";

      let totalScore = 0;
      const totalPoints = questionPoints.reduce(
        (acc, points) => acc + points,
        0
      );
      const passingScore = (totalPoints * jobPercentage) / 100;

      const answers = Object.keys(selectedAnswers).map((questionId) => {
        const question = examData.find(
          (q) => q.examQ_id.toString() === questionId
        );
        const selectedChoiceId = selectedAnswers[questionId];

        if (!question) {
          console.error(
            `Question with ID ${questionId} not found in examData.`
          );
          return {
            question_id: questionId,
            multiple_choice_answer: selectedChoiceId || null,
            essay_answer: null,
            points_earned: 0,
          };
        }

        const selectedChoice = question.choices.find(
          (choice) => choice.examC_id === selectedChoiceId
        );
        let pointsEarned = 0;

        if (selectedChoice && selectedChoice.examC_isCorrect === 1) {
          const questionIndex = examData.findIndex(
            (q) => q.examQ_id.toString() === questionId
          );
          totalScore += questionPoints[questionIndex];
          pointsEarned = questionPoints[questionIndex];
        }

        return {
          question_id: questionId,
          multiple_choice_answer: selectedChoiceId || null,
          essay_answer: null,
          points_earned: pointsEarned,
        };
      });

      const resultData = {
        examR_candId: userId,
        examR_examId: examId,
        examR_jobMId: jobMId,
        examR_score: totalScore,
        examR_status: totalScore > passingScore ? 1 : 0,
        examR_totalscore: totalPoints,
        app_id: getDataFromSession("app_id"),
      };

      const resultFormData = new FormData();
      resultFormData.append("operation", "insertExamResult");
      resultFormData.append("json", JSON.stringify(resultData));

      const resultResponse = await axios.post(url, resultFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { success, examR_id } = resultResponse.data;
      if (!success || !examR_id) {
        throw new Error("Failed to insert exam result.");
      }

      const answerData = {
        examR_id: examR_id,
        answers: answers,
      };

      const answerFormData = new FormData();
      answerFormData.append("operation", "insertCandidateAnswers");
      answerFormData.append("json", JSON.stringify(answerData));

      const answerResponse = await axios.post(url, answerFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (answerResponse.data.success) {
        toast.success("Exam submitted successfully!");
        removeSessionData("app_id");

        if (fetchAppliedJobs) {
          fetchAppliedJobs();
        }
        if (fetchNotification) {
          fetchNotification();
        }
        if (fetchJobs) {
          fetchJobs();
        }
        if (fetchExamResult) {
          fetchExamResult();
        }
        setIsRedirecting(true);
        setTimeout(() => {
          setIsRedirecting(false);
          onClose();
        }, 6000);
      } else {
        toast.error("Failed to submit exam: " + answerResponse.data.message);
      }
    } catch (error) {
      console.error("Error during exam submission:", error);
      toast.error("Error submitting exam: " + error.message);
    } finally {
    }
  };

  const calculateProgress = () => {
    if (!examData) return 0;
    const answered = Object.keys(selectedAnswers).length;
    return (answered / examData.length) * 100;
  };

  const scrollToTop = () => {
    const examContainer = document.querySelector(".questions-container");
    if (examContainer) {
      examContainer.scrollTop = 0;
    } else {
      console.error("Exam container not found.");
    }
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(examData.length / questionsPerPage) - 1) {
      setCurrentPage((prev) => prev + 1);
      scrollToTop();
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
      scrollToTop();
    }
  };

  const isAllAnswered = () => {
    return examData?.every((question) => selectedAnswers[question.examQ_id]);
  };

  const handleClearAnswers = () => {
    setSelectedAnswers({});
  };

  useEffect(() => {
    const preventCopy = (e) => {
      e.preventDefault();
      return false;
    };

    const preventContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener("copy", preventCopy);
    document.addEventListener("cut", preventCopy);
    document.addEventListener("contextmenu", preventContextMenu);

    return () => {
      document.removeEventListener("copy", preventCopy);
      document.removeEventListener("cut", preventCopy);
      document.removeEventListener("contextmenu", preventContextMenu);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 ${
        isDarkMode ? "bg-gray-900/95" : "bg-gray-100/95"
      } backdrop-blur-sm flex justify-center items-center z-50`}
    >
      <div
        className={`${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white"
        } shadow-2xl w-full h-full flex flex-col overflow-hidden`}
      >
        {/* Header Section */}
        <div
          className={`flex justify-between items-center p-3 border-b border-gray-100 ${
            isDarkMode ? "bg-gray-700" : "bg-white"
          } shadow-sm`}
        >
          <div className="space-y-1">
            <h2
              className={`text-3xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              Online Assessment
            </h2>
            <p
              className={`text-lg ${
                isDarkMode ? "text-gray-300" : "text-gray-500"
              }`}
            >
              {jobTitle}
            </p>
          </div>

          <div className="flex items-center space-x-8">
            {/* Timer Display */}
            <div
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                isDarkMode ? "bg-gray-800" : "bg-gray-300"
              }`}
            >
              <svg
                className={`w-5 h-5 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span
                className={`text-xl font-semibold ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {formatTime(timeLeft)}
              </span>
            </div>

            <button
              onClick={onClose}
              className={`${
                isDarkMode
                  ? "text-gray-300 hover:text-gray-100 hover:bg-gray-700"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              } transition-colors p-2 rounded-full`}
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          className={`w-full ${isDarkMode ? "bg-gray-700" : "bg-gray-100"} h-1`}
        >
          <div
            className={`${
              isDarkMode ? "bg-green-400" : "bg-green-500"
            } h-1 transition-all duration-300 ease-in-out`}
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>

        {/* Main Content */}
        <div
          className={`questions-container flex-1 overflow-y-auto scrollbar-custom ${
            isDarkMode ? "bg-gray-800" : "bg-gray-50"
          } p-6`}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3">
                <div
                  className={`w-16 h-16 border-4 ${
                    isDarkMode
                      ? "border-gray-700 border-t-green-400"
                      : "border-gray-200 border-t-green-500"
                  } rounded-full animate-spin mx-auto`}
                />
                <p
                  className={`${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  } font-medium`}
                >
                  Loading exam data...
                </p>
              </div>
            </div>
          ) : error ? (
            <div
              className={`text-center ${
                isDarkMode
                  ? "text-red-400 bg-red-900"
                  : "text-red-600 bg-red-50"
              } p-4 rounded-lg`}
            >
              {error}
            </div>
          ) : examData && examData.length > 0 ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {examData
                .slice(
                  currentPage * questionsPerPage,
                  (currentPage + 1) * questionsPerPage
                )
                .map((question, idx) => (
                  <div
                    key={question.examQ_id}
                    className={`${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600"
                        : "bg-white border-gray-100"
                    } p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start space-x-4">
                      <span
                        className={`flex-shrink-0 w-8 h-8 ${
                          isDarkMode
                            ? "bg-green-900 text-green-300"
                            : "bg-green-50 text-green-600"
                        } rounded-full flex items-center justify-center font-semibold`}
                      >
                        {currentPage * questionsPerPage + idx + 1}
                      </span>
                      <div className="flex-1">
                        <p
                          className={`text-lg font-medium ${
                            isDarkMode ? "text-gray-300" : "text-gray-800"
                          } mb-6`}
                        >
                          {question.examQ_text}
                        </p>
                        <div className="space-y-4">
                          {question.choices.map((choice) => (
                            <label
                              key={choice.examC_id}
                              className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200
                                ${
                                  selectedAnswers[question.examQ_id] ===
                                  choice.examC_id
                                    ? isDarkMode
                                      ? "bg-green-900 border-2 border-green-600"
                                      : "bg-green-50 border-2 border-green-500"
                                    : isDarkMode
                                    ? "border-2 border-gray-700 hover:border-gray-600"
                                    : "border-2 border-gray-100 hover:border-gray-200"
                                }`}
                            >
                              <input
                                type="radio"
                                name={`question-${question.examQ_id}`}
                                value={choice.examC_id}
                                checked={
                                  selectedAnswers[question.examQ_id] ===
                                  choice.examC_id
                                }
                                onChange={() =>
                                  handleAnswerChange(
                                    question.examQ_id,
                                    choice.examC_id
                                  )
                                }
                                className="hidden"
                              />
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4
                                ${
                                  selectedAnswers[question.examQ_id] ===
                                  choice.examC_id
                                    ? isDarkMode
                                      ? "border-green-600 bg-green-600"
                                      : "border-green-500 bg-green-500"
                                    : isDarkMode
                                    ? "border-gray-600"
                                    : "border-gray-300"
                                }`}
                              >
                                {selectedAnswers[question.examQ_id] ===
                                  choice.examC_id && (
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      isDarkMode ? "bg-gray-800" : "bg-white"
                                    }`}
                                  />
                                )}
                              </div>
                              <span
                                className={`text-gray-700 text-lg ${
                                  isDarkMode ? "text-white" : "text-gray-800"
                                }`}
                              >
                                {choice.examC_text}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div
              className={`text-center ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              No exam data found.
            </div>
          )}
        </div>

        {/* Footer with Navigation and Actions */}
        <div
          className={`border-t ${
            isDarkMode
              ? "border-gray-700 bg-gray-800"
              : "border-gray-100 bg-white"
          } p-4 sm:p-6`}
        >
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex space-x-4 w-full sm:w-auto">
              {currentPage > 0 && (
                <button
                  onClick={handlePreviousPage}
                  className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-3 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  } border rounded-lg transition-colors font-medium`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span>Previous</span>
                </button>
              )}
              {currentPage <
                Math.ceil(examData?.length / questionsPerPage) - 1 && (
                <button
                  onClick={handleNextPage}
                  className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-3 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  } border rounded-lg transition-colors font-medium`}
                >
                  <span>Next</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              )}
            </div>

            {isAllAnswered() && (
              <div className="flex space-x-4 w-full sm:w-auto">
                <button
                  onClick={handleClearAnswers}
                  className={`flex-1 sm:flex-none px-6 py-3 border rounded-lg transition-colors font-medium ${
                    isDarkMode
                      ? "border-red-700 text-red-400 hover:bg-red-900"
                      : "border-red-200 text-red-600 hover:bg-red-50"
                  }`}
                >
                  Clear All
                </button>
                <button
                  onClick={handleSubmit}
                  className={`flex-1 sm:flex-none px-8 py-3 ${
                    isDarkMode
                      ? "bg-green-700 hover:bg-green-600"
                      : "bg-green-600 hover:bg-green-700"
                  } text-white rounded-lg transition-colors font-medium`}
                >
                  Submit Exam
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Times Up Modal */}
        {timesUp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 ease-in-out">
              <div className="text-center">
                <div className="mb-6 relative">
                  <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-red-500 dark:text-red-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="absolute top-0 right-0 -mr-2 -mt-2 bg-red-500 rounded-full p-2 animate-bounce">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                </div>

                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  Time's Up!
                </h3>

                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Your exam session has ended. Your answers will be
                  automatically submitted.
                </p>

                <button
                  onClick={handleSubmit}
                  className="w-full bg-red-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-red-700 transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  Submit Exam
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isRedirecting && (
        <div className="fixed inset-0 bg-[#01472B] bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center">
            <l-hourglass
              size="40"
              bg-opacity="0.1"
              speed="1.75"
              color="white"
            ></l-hourglass>
            <p className="text-white text-xl font-semibold mt-4">
              Exam Submitted
            </p>
            <p className="text-green-300 mt-2">
              Thank you for completing the exam. We are currently reviewing your
              answers and will contact you soon with the results.
            </p>
            <p className="text-green-300 mt-2">
              We appreciate your effort and interest in this position.
            </p>
          </div>
        </div>
      )}

      <Toaster position="bottom-left" />
    </div>
  );
};

export default ExamModal;
