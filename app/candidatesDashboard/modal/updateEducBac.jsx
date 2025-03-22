import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { getDataFromCookie } from "@/app/utils/storageUtils";
import Select, { components } from "react-select";
import { Toaster, toast } from "react-hot-toast";
import DatePicker from "react-datepicker";
import Tesseract from "tesseract.js";

const ITEMS_PER_PAGE = 10;

// Custom Option Component
const CustomOption = (props) => {
  return (
    <components.Option
      {...props}
      className={`custom-option ${props.isSelected ? "is-selected" : ""}`}
      style={{ cursor: "pointer" }}
    >
      {props.children}
    </components.Option>
  );
};

// Add this function at the top level, after the imports
const performSemanticAnalysis = async (text1, text2, threshold) => {
  try {
    const response = await axios.post('/api/semanticAnalysis', {
      text1,
      text2,
      threshold,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error response:", error.response?.data || error.message);
    throw new Error(`Failed to perform semantic analysis: ${error.response?.data || error.message}`);
  }
};

const UpdateEducBac = ({
  showModalUpdateEduc,
  setShowModalUpdateEduc,
  selectedEducation,
  courses,
  institutions,
  courseTypes,
  courseCategory,
  fetchProfile,
  fetchCourses,
  fetchInstitutions,
  fetchCourseTypes,
  fetchCourseCategorys,
}) => {
  const { data: session } = useSession();
  const [pageNumber, setPageNumber] = useState({
    courses: 0,
    institutions: 0,
    courseTypes: 0,
    courseCategory: 0,
  });

  const [data, setData] = useState({
    educ_back_id: "",
    courses_id: "",
    institution_id: "",
    educ_dategraduate: "",
    customCourse: "",
    customInstitution: "",
    customCourseCategory: "",
    customCourseType: "",
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

  console.log("selectedEducation:", selectedEducation);

  const [errors, setErrors] = useState({
    customCourse: "",
    customCourseCategory: "",
    customCourseType: "",
    customInstitution: "",
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Add new state for search inputs
  const [searchInputs, setSearchInputs] = useState({
    courses: "",
    institutions: "",
    courseTypes: "",
    courseCategory: "",
  });

  // Add these new state variables
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [diploma, setDiploma] = useState(null);
  const [matchThreshold] = useState(60); // Default threshold for matching

  useEffect(() => {
    if (showModalUpdateEduc) {
      if (selectedEducation && Object.keys(selectedEducation).length > 0) {
        // If editing an existing education
        setData({
          educ_back_id: selectedEducation.educ_back_id || "",
          courses_id: selectedEducation.courses_id || "",
          institution_id: selectedEducation.institution_id || "",
          educ_dategraduate: selectedEducation.educ_dategraduate || "",
          customCourse: "",
          customInstitution: "",
          customCourseCategory: "",
          customCourseType: "",
        });
      } else {
        // If adding a new education
        setData({
          educ_back_id: "",
          courses_id: "",
          institution_id: "",
          educ_dategraduate: "",
          customCourse: "",
          customInstitution: "",
          customCourseCategory: "",
          customCourseType: "",
        });
      }
    }
  }, [showModalUpdateEduc, selectedEducation]); // Add showModalUpdateEduc to dependencies

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
    validateCustomInput(name, value); // Validate custom input
  };

  const handleSelectChange = (selectedOption, fieldName) => {
    setData((prevData) => ({
      ...prevData,
      [fieldName]: selectedOption ? selectedOption.value : "",
      ...(fieldName === "courses_id" ? { customCourse: "" } : {}),
      ...(fieldName === "institution_id" ? { customInstitution: "" } : {}),
      ...(fieldName === "course_category_id"
        ? { customCourseCategory: "" }
        : {}),
      ...(fieldName === "course_type_id" ? { customCourseType: "" } : {}),
    }));
  };

  const validateCustomInput = (fieldName, value) => {
    let errorMessage = "";
    const options = {
      customCourse: courses.map((course) => course.courses_name),
      customCourseCategory: courseCategory.map(
        (category) => category.course_categoryName
      ),
      customCourseType: courseTypes.map((type) => type.crs_type_name),
      customInstitution: institutions.map(
        (institution) => institution.institution_name
      ),
    };

    // Check if the fieldName exists in options
    if (options[fieldName] && value && options[fieldName].includes(value)) {
      errorMessage = "It exists in the dropdown";
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [fieldName]: errorMessage,
    }));
  };

  // Add this function to handle diploma upload
  const handleDiplomaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDiploma(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setProgress(0);
    try {
      setProgress(10);
      
      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
      const getUserIdFromCookie = () => {
        const tokenData = getDataFromCookie("auth_token");
        if (tokenData && tokenData.userId) {
          return tokenData.userId;
        }
        return null; // Return null if userId is not found or tokenData is invalid
      };
      const userId = session?.user?.id || getUserIdFromCookie();

      console.log("User ID:", userId);

      if (
        data.customCourse &&
        courses.some(
          (course) =>
            course.courses_name.toLowerCase() ===
            data.customCourse.toLowerCase()
        )
      ) {
        toast.error("Please choose the existing course from the dropdown.");
        setLoading(false);
        return;
      }

      if (
        data.customInstitution &&
        institutions.some(
          (institution) =>
            institution.institution_name.toLowerCase() ===
            data.customInstitution.toLowerCase()
        )
      ) {
        toast.error(
          "Please choose the existing institution from the dropdown."
        );
        setLoading(false);
        return;
      }

      if (
        data.customCourseCategory &&
        courseCategory.some(
          (category) =>
            category.course_categoryName.toLowerCase() ===
            data.customCourseCategory.toLowerCase()
        )
      ) {
        toast.error(
          "Please choose the existing course category from the dropdown."
        );
        setLoading(false);
        return;
      }

      if (
        data.customCourseType &&
        courseTypes.some(
          (type) =>
            type.crs_type_name.toLowerCase() ===
            data.customCourseType.toLowerCase()
        )
      ) {
        toast.error(
          "Please choose the existing course type from the dropdown."
        );
        setLoading(false);
        return;
      }

      // If there's a diploma to process
      if (diploma) {
        setProgress(20);
        // Process the diploma image with OCR
        const textFromDiploma = await processImage(diploma);
        setProgress(40);

        // Get the selected course name
        const selectedCourseName = data.customCourse || 
          courses.find(c => c.courses_id === data.courses_id)?.courses_name || '';

        if (!selectedCourseName) {
          toast.error("Please select or enter a course first");
          setLoading(false);
          return;
        }

        // Perform semantic analysis
        console.log('\n=== Detailed Semantic Analysis: Diploma vs Course ===');
        const diplomaAnalysis = await performSemanticAnalysis(
          textFromDiploma.trim().toLowerCase(),
          selectedCourseName.trim().toLowerCase(),
          matchThreshold
        );
        setProgress(60);

        console.log('Match Quality:', diplomaAnalysis.matchQuality);
        console.log('Cosine Score:', diplomaAnalysis.score + '%');
        console.log('Required Percentage:', matchThreshold + '%');

        // Check if the match meets the threshold
        if (parseFloat(diplomaAnalysis.score) < matchThreshold) {
          toast.error(`The diploma does not match the selected course (Similarity: ${diplomaAnalysis.score}%, Required: ${matchThreshold}%)`);
          setLoading(false);
          return;
        }
      }

      setProgress(80);

      // Prepare the form data as before
      const updatedData = {
        candidateId: userId,
        educationalBackground: [
          {
            educId: data.educ_back_id || null,
            courseId:
              data.courses_id ||
              (data.customCourse ? "custom" : selectedEducation.courses_id),
            institutionId:
              data.institution_id ||
              (data.customInstitution
                ? "custom"
                : selectedEducation.institution_id),
            courseDateGraduated:
              data.educ_dategraduate || selectedEducation.educ_dategraduate,
            courseCategoryId:
              data.course_category_id ||
              (data.customCourseCategory
                ? "custom"
                : selectedEducation.course_category_id),
            courseTypeId:
              data.course_type_id ||
              (data.customCourseType
                ? "custom"
                : selectedEducation.course_type_id),
            customCourse: data.customCourse,
            customCourseCategory: data.customCourseCategory,
            customCourseType: data.customCourseType,
            customInstitution: data.customInstitution,
            diploma: diploma ? diploma.name : null,
          },
        ],
      };

      const formData = new FormData();
      formData.append("operation", "updateEducationalBackground");
      formData.append("json", JSON.stringify(updatedData));

      // Append diploma if exists
      if (diploma) {
        formData.append("diploma", diploma);
      }

      // Make the API call
      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setProgress(100);

      if (response.data === 1) {
        toast.success("Educational background updated successfully");
        if (fetchProfile) {
          fetchProfile();
        }
        if (fetchCourses) {
          fetchCourses();
        }
        if (fetchInstitutions) {
          fetchInstitutions();
        }
        if (fetchCourseTypes) {
          fetchCourseTypes();
        }
        if (fetchCourseCategorys) {
          fetchCourseCategorys();
        }
      } else if (response.data === -1) {
        toast.error("Educational background already exists.");
      } else {
        console.error(
          "Failed to update educational background:",
          response.data
        );
        toast.error("Failed to update educational background.");
      }
    } catch (error) {
      console.error("Error updating educational background:", error);
      toast.error("Error updating educational background: " + error.message);
    } finally {
      setLoading(false);
      setProgress(0);
      setShowModalUpdateEduc(false);
    }
  };

  const getSelectedOption = (options, value) =>
    options.find((option) => option.value === value) || null;

  const handleDropdownOpen = () => {
    setIsDropdownOpen(true);
  };

  const handleDropdownClose = () => {
    setIsDropdownOpen(false);
  };

  const selectStyles = useMemo(
    () => ({
      menu: (provided) => ({
        ...provided,
        zIndex: 9999,
      }),
      option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? "#cce5ff" : "white",
        color: "black",
        cursor: "pointer",
      }),
    }),
    []
  );

  const coursesOptions = useMemo(() => {
    let filteredCourses = courses;

    if (searchInputs.courses) {
      filteredCourses = courses.filter((course) =>
        course.courses_name
          .toLowerCase()
          .includes(searchInputs.courses.toLowerCase())
      );
    } else {
      filteredCourses = courses.slice(
        0,
        (pageNumber.courses + 1) * ITEMS_PER_PAGE
      );
    }

    return [
      { value: "custom", label: "Other (Specify)" },
      ...filteredCourses.map((course) => ({
        value: course.courses_id,
        label: course.courses_name,
      })),
    ];
  }, [courses, pageNumber.courses, searchInputs.courses]);

  const selectedCourse = useMemo(() => {
    return getSelectedOption(
      courses.map((course) => ({
        value: course.courses_id,
        label: course.courses_name,
      })),
      data.courses_id
    );
  }, [courses, data.courses_id]);

  const courseCategoryOptions = useMemo(() => {
    let filteredCategories = courseCategory;

    if (searchInputs.courseCategory) {
      filteredCategories = courseCategory.filter((category) =>
        category.course_categoryName
          .toLowerCase()
          .includes(searchInputs.courseCategory.toLowerCase())
      );
    } else {
      filteredCategories = courseCategory.slice(
        0,
        (pageNumber.courseCategory + 1) * ITEMS_PER_PAGE
      );
    }

    return [
      { value: "custom", label: "Other (Specify)" },
      ...filteredCategories.map((category) => ({
        value: category.course_categoryId,
        label: category.course_categoryName,
      })),
    ];
  }, [courseCategory, pageNumber.courseCategory, searchInputs.courseCategory]);

  const selectedCourseCategory = useMemo(() => {
    return getSelectedOption(
      courseCategory.map((category) => ({
        value: category.course_categoryId,
        label: category.course_categoryName,
      })),
      data.course_category_id
    );
  }, [courseCategory, data.course_category_id]);

  const courseTypeOptions = useMemo(() => {
    let filteredTypes = courseTypes;

    if (searchInputs.courseTypes) {
      filteredTypes = courseTypes.filter((type) =>
        type.crs_type_name
          .toLowerCase()
          .includes(searchInputs.courseTypes.toLowerCase())
      );
    } else {
      filteredTypes = courseTypes.slice(
        0,
        (pageNumber.courseTypes + 1) * ITEMS_PER_PAGE
      );
    }

    return [
      { value: "custom", label: "Other (Specify)" },
      ...filteredTypes.map((type) => ({
        value: type.crs_type_id,
        label: type.crs_type_name,
      })),
    ];
  }, [courseTypes, pageNumber.courseTypes, searchInputs.courseTypes]);

  const selectedCourseType = useMemo(() => {
    return getSelectedOption(
      courseTypes.map((type) => ({
        value: type.crs_type_id,
        label: type.crs_type_name,
      })),
      data.course_type_id
    );
  }, [courseTypes, data.course_type_id]);

  const institutionOptions = useMemo(() => {
    let filteredInstitutions = institutions;

    // If there's a search term, filter all results
    if (searchInputs.institutions) {
      filteredInstitutions = institutions.filter((institution) =>
        institution.institution_name
          .toLowerCase()
          .includes(searchInputs.institutions.toLowerCase())
      );
    } else {
      // If no search, apply pagination
      filteredInstitutions = institutions.slice(
        0,
        (pageNumber.institutions + 1) * ITEMS_PER_PAGE
      );
    }

    return [
      { value: "custom", label: "Other (Specify)" },
      ...filteredInstitutions.map((institution) => ({
        value: institution.institution_id,
        label: institution.institution_name,
      })),
    ];
  }, [institutions, pageNumber.institutions, searchInputs.institutions]);

  const selectedInstitution = useMemo(() => {
    return getSelectedOption(
      institutions.map((institution) => ({
        value: institution.institution_id,
        label: institution.institution_name,
      })),
      data.institution_id
    );
  }, [institutions, data.institution_id]);

  const handleDateChange = (date, field) => {
    if (!date) {
      setData((prev) => ({
        ...prev,
        [field]: "",
      }));
      return;
    }

    // Adjust for timezone
    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split("T")[0];

    setData((prev) => ({
      ...prev,
      [field]: localDate,
    }));
  };

  const handleMenuScrollToBottom = (field) => {
    setPageNumber((prev) => ({
      ...prev,
      [field]: prev[field] + 1,
    }));
  };

  // Add handler for search input changes
  const handleSearchInputChange = (inputValue, fieldName) => {
    setSearchInputs((prev) => ({
      ...prev,
      [fieldName]: inputValue,
    }));
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 50
      ) {
        setPageNumber((prev) => ({
          ...prev,
          courses: prev.courses + 1,
          institutions: prev.institutions + 1,
          courseTypes: prev.courseTypes + 1,
          courseCategory: prev.courseCategory + 1,
        }));
      }
    };

    const handleTouchMove = (e) => {
      handleScroll();
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <div className={`modal ${showModalUpdateEduc ? "block" : "hidden"}`}>
      <div
        className={`modal-content bg-gray-200 p-6 rounded-lg shadow-lg ${
          isDarkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"
        }`}
      >
        <h3
          className={`text-xl font-semibold ${
            isDarkMode ? "text-white" : "text-gray-800"
          } mb-4`}
        >
          Update Educational Background
        </h3>

        <div className={`mb-4 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
          <label
            className={`block text-gray-600 text-sm font-normal ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Course:
          </label>
          <div className="flex items-center">
            <Select
              name="courses_id"
              value={selectedCourse}
              onChange={(option) => handleSelectChange(option, "courses_id")}
              options={coursesOptions}
              placeholder={selectedEducation?.courses_name || "Select Course"}
              isSearchable
              className="w-full text-black"
              menuPlacement="auto"
              menuPosition="fixed"
              blurInputOnSelect
              isOptionDisabled={(option) => option.isDisabled}
              menuShouldScrollIntoView={false}
              menuIsOpen={isDropdownOpen}
              onMenuOpen={handleDropdownOpen}
              onMenuClose={handleDropdownClose}
              components={{ Option: CustomOption }}
              onInputChange={(value) =>
                handleSearchInputChange(value, "courses")
              }
              filterOption={null}
              onMenuScrollToBottom={() => handleMenuScrollToBottom("courses")}
            />
            {data.courses_id && ( // Show Clear button only if there is a value
              <button
                className="ml-2 text-red-500"
                onClick={() => handleSelectChange(null, "courses_id")} // Clear selection
              >
                Clear
              </button>
            )}
          </div>
          {data.courses_id === "custom" && (
            <div>
              <input
                type="text"
                name="customCourse"
                value={data.customCourse}
                onChange={handleInputChange}
                placeholder="Enter custom course"
                className={`w-full mt-2 border-b-2 pb-2 ${
                  errors.customCourse ? "border-red-500" : "border-black"
                } bg-transparent text-black`}
              />
              {errors.customCourse && (
                <p className="text-red-500">{errors.customCourse}</p>
              )}
            </div>
          )}
        </div>

        <div className={`mb-4 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
          <label
            className={`block text-gray-600 text-sm font-normal ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Course Category:
          </label>
          <div className="flex items-center">
            <Select
              name="course_category_id"
              value={selectedCourseCategory}
              onChange={(option) =>
                handleSelectChange(option, "course_category_id")
              }
              options={courseCategoryOptions}
              placeholder="Select Course Category"
              isSearchable
              className="w-full text-black"
              menuPlacement="auto"
              menuPosition="fixed"
              blurInputOnSelect
              isOptionDisabled={(option) => option.isDisabled}
              onMenuScrollToBottom={() =>
                handleMenuScrollToBottom("courseCategory")
              }
              onInputChange={(value) =>
                handleSearchInputChange(value, "courseCategory")
              }
              components={{ Option: CustomOption }}
              styles={selectStyles}
              filterOption={null}
            />
            {data.course_category_id && ( // Show Clear button only if there is a value
              <button
                className="ml-2 text-red-500"
                onClick={() => handleSelectChange(null, "course_category_id")} // Clear selection
              >
                Clear
              </button>
            )}
          </div>
          {data.course_category_id === "custom" && (
            <input
              type="text"
              name="customCourseCategory"
              value={data.customCourseCategory}
              onChange={handleInputChange}
              placeholder="Enter custom course category"
              className={`w-full mt-2 border-b-2 pb-2 text-black ${
                errors.customCourseCategory ? "border-red-500" : "border-black"
              } bg-transparent`}
            />
          )}
          {errors.customCourseCategory && (
            <p className="text-red-500">{errors.customCourseCategory}</p>
          )}
        </div>

        <div className={`mb-4 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
          <label
            className={`block text-gray-600 text-sm font-normal ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Course Type:
          </label>
          <div className="flex items-center">
            <Select
              name="course_type_id"
              value={selectedCourseType}
              onChange={(option) =>
                handleSelectChange(option, "course_type_id")
              }
              options={courseTypeOptions}
              placeholder="Select Course Type"
              isSearchable
              className="w-full text-black"
              menuPlacement="auto"
              menuPosition="fixed"
              blurInputOnSelect
              isOptionDisabled={(option) => option.isDisabled}
              onMenuScrollToBottom={() =>
                handleMenuScrollToBottom("courseTypes")
              }
              onInputChange={(value) =>
                handleSearchInputChange(value, "courseTypes")
              }
              components={{ Option: CustomOption }}
              styles={selectStyles}
              filterOption={null}
            />
            {data.course_type_id && ( // Show Clear button only if there is a value
              <button
                className="ml-2 text-red-500"
                onClick={() => handleSelectChange(null, "course_type_id")} // Clear selection
              >
                Clear
              </button>
            )}
          </div>
          {data.course_type_id === "custom" && (
            <input
              type="text"
              name="customCourseType"
              value={data.customCourseType}
              onChange={handleInputChange}
              placeholder="Enter custom course type"
              className={`w-full mt-2 border-b-2 pb-2 text-black ${
                errors.customCourseType ? "border-red-500" : "border-black"
              } bg-transparent`}
            />
          )}
          {errors.customCourseType && (
            <p className="text-sm text-red-500">{errors.customCourseType}</p>
          )}
        </div>

        <div className={`mb-4 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
          <label
            className={`block text-gray-600 text-sm font-normal ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Institution:
          </label>
          <div className="flex items-center">
            <Select
              name="institution_id"
              value={selectedInstitution}
              onChange={(option) =>
                handleSelectChange(option, "institution_id")
              }
              options={institutionOptions}
              placeholder="Select Institution"
              isSearchable
              className="w-full text-black"
              menuPlacement="auto"
              menuPosition="fixed"
              blurInputOnSelect
              isOptionDisabled={(option) => option.isDisabled}
              onMenuScrollToBottom={() =>
                handleMenuScrollToBottom("institutions")
              }
              onInputChange={(value) =>
                handleSearchInputChange(value, "institutions")
              }
              components={{ Option: CustomOption }}
              styles={selectStyles}
              filterOption={null}
            />
            {data.institution_id && ( // Show Clear button only if there is a value
              <button
                className="ml-2 text-red-500"
                onClick={() => handleSelectChange(null, "institution_id")} // Clear selection
              >
                Clear
              </button>
            )}
          </div>
          {data.institution_id === "custom" && (
            <input
              type="text"
              name="customInstitution"
              value={data.customInstitution}
              onChange={handleInputChange}
              placeholder="Enter custom institution"
              className={`w-full mt-2 border-b-2 pb-2 text-black ${
                errors.customInstitution ? "border-red-500" : "border-black"
              } bg-transparent`}
            />
          )}
          {errors.customInstitution && (
            <p className="text-sm text-red-500">{errors.customInstitution}</p>
          )}
        </div>

        <div className={`mb-4 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
          <label
            className={`block text-gray-600 text-sm font-normal ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Date Graduated:
          </label>
          <DatePicker
            selected={
              data.educ_dategraduate ? new Date(data.educ_dategraduate) : null
            }
            onChange={(date) => handleDateChange(date, "educ_dategraduate")}
            dateFormat="yyyy-MM-dd"
            className={`w-full mt-2 border-b-2 pb-2 bg-transparent px-2 py-2 ${
              isDarkMode ? "border-gray-400 text-white" : "border-black"
            } text-black`}
            placeholderText="Select graduation date"
            maxDate={new Date()}
            showYearDropdown
            showMonthDropdown
            scrollableYearDropdown
            scrollableMonthYearDropdown
            yearDropdownItemNumber={100}
          />
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-normal ${isDarkMode ? "text-white" : "text-gray-800"}`}>
            Upload Diploma:
          </label>
          <div className="relative w-full">
            <input
              type="file"
              accept="image/*"
              onChange={handleDiplomaUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className={`flex items-center justify-center w-full p-3 border-2 border-dashed ${
              isDarkMode ? "border-gray-500" : "border-gray-300"
            } rounded-lg hover:bg-gray-100 transition-all cursor-pointer`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
              <span className="ml-2">{diploma ? diploma.name : "Upload Diploma"}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            className="mr-2 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            onClick={() => setShowModalUpdateEduc(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
      <Toaster position="bottom-left" />

      {/* Add loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-xl w-96 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
            <div className="space-y-6">
              {/* Progress Steps */}
              <div className="flex justify-between mb-4">
                {['Upload', 'Process', 'Analyze', 'Save'].map((step, index) => {
                  const stepProgress = Math.floor(progress / 25);
                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500
                        ${index <= stepProgress 
                          ? 'border-blue-500 bg-blue-500 text-white' 
                          : isDarkMode 
                            ? 'border-gray-600 text-gray-400' 
                            : 'border-gray-300 text-gray-400'}`}>
                        {index < stepProgress ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      <span className={`text-xs mt-1 ${
                        index <= stepProgress 
                          ? 'text-blue-500' 
                          : isDarkMode 
                            ? 'text-gray-400' 
                            : 'text-gray-500'
                      }`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Progress Bar */}
              <div className="relative pt-1">
                <div className={`overflow-hidden h-2 text-xs flex rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    style={{ width: `${progress}%` }}
                    className="transition-all duration-500 ease-out shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-blue-600"
                  />
                </div>
                <div className={`flex justify-between text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span>{progress}% Complete</span>
                  <span>{100 - progress}% Remaining</span>
                </div>
              </div>

              {/* Loading Animation */}
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>

              {/* Status Message */}
              <div className={`text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {progress < 25 && "Preparing upload..."}
                {progress >= 25 && progress < 50 && "Processing image..."}
                {progress >= 50 && progress < 75 && "Analyzing content..."}
                {progress >= 75 && "Saving changes..."}
              </div>

              {/* Detailed Progress Info */}
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className="grid grid-cols-2 gap-2">
                  <div>Data Validation:</div>
                  <div className="text-right">{progress >= 10 ? '✓ Complete' : 'Pending'}</div>
                  
                  <div>Image Processing:</div>
                  <div className="text-right">
                    {progress >= 40 ? '✓ Complete' : progress >= 20 ? 'Processing...' : 'Pending'}
                  </div>
                  
                  <div>Content Analysis:</div>
                  <div className="text-right">
                    {progress >= 60 ? '✓ Complete' : progress >= 40 ? 'Analyzing...' : 'Pending'}
                  </div>
                  
                  <div>Database Update:</div>
                  <div className="text-right">
                    {progress >= 80 ? '✓ Complete' : progress >= 60 ? 'Updating...' : 'Pending'}
                  </div>
                  
                  <div>Finalizing:</div>
                  <div className="text-right">
                    {progress === 100 ? '✓ Complete' : progress >= 80 ? 'Finalizing...' : 'Pending'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateEducBac;
