"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import axios, { Axios } from 'axios';

export default function Stepper() {
    const [lastName, setLastName] = useState("");
    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [alternateContactNumber, setAlternateContactNumber] = useState("");
    const [alternateEmail, setAlternateEmail] = useState("");
    const [presentAddress, setPresentAddress] = useState("");
    const [permanentAddress, setPermanentAddress] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [gender, setGender] = useState("");
    const [SssNumber, setSssNumber] = useState("");
    const [tinNumber, setTinNumber] = useState("");
    const [philHealthNumber, setPhilHealthNumber] = useState("");
    const [pagIbigNumber, setPagIbigNumber] = useState("");
    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [course, setCourse] = useState([]);
    const [courseGraduate, setCourseGraduate] = useState([]);
    const [dateGraduate, setDateGraduate] = useState("");
    const [prcLicenseNumber, setPrcLicenseNumber] = useState("");

    const [positionHistory, setPositionHistory] = useState([]);
    const [company, setCompany] = useState("");
    const [dateOfStart, setDateOfStart] = useState("");
    const [dateOfEnd, setDateOfEnd] = useState("");

    const [positionApply, setPositionApply] = useState("");
    const [subscribeToEmailUpdates, setSubscribeToEmailUpdates] = useState('no');
    const [dataPrivacyConsents, setDataPrivacyConsents] = useState(false);

    const [currentStep, setCurrentStep] = useState(1);
    const [courses, setCourses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [courseData, setCourseData] = useState({
        course: "",
        graduateCourse: "",
        graduateSchool: "",
        dateOfGraduate: "",
        prcLicenseNo: "",
    });

    const [employmentHistoryPosition, setEmploymentHistoryPosition] = useState([]);
    const [showModalHistory, setShowModalHistory] = useState(false);
    const [editingHistoryIndex, setEditingHistoryIndex] = useState(null);
    const [employmentHistoryData, setEmploymentHistoryData] = useState({
        position: "",
        company: "",
        dateOfStart: "",
        dateOfEnd: "",
    });

    const [positionApplied, setPositionApplied] = useState([]);
    const [showModalPosition, setShowModalPosition] = useState(false);
    const [editingPositionIndex, setEditingPositionIndex] = useState(null);
    const [positionAppliedData, setPositionAppliedData] = useState({
        position: "",

    });


    const [isModalPinOpen, setIsModalPinOpen] = useState(false);
    const [pinCode, setPinCode] = useState('');

    const handlePinSubmit = () => {
        if (pinCode === '1234') { // Replace '1234' with the actual PIN code
            setIsModalPinOpen(false);
            setCurrentStep(currentStep + 1);
        } else {
            alert('Incorrect PIN code');
        }
    };



    const steps = [
        { id: 1, name: "Step 1" },
        { id: 2, name: "Step 2" },
        { id: 3, name: "Step 3" },
        { id: 4, name: "Step 4" },
    ];

    const nextStep = () => {
        setCurrentStep((prev) => (prev < steps.length ? prev + 1 : prev));
    };

    const handleNextStep = () => {
        if (currentStep === 1) {
            setIsModalPinOpen(true);
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => (prev > 1 ? prev - 1 : prev));
    };

    const handleSubmit = async () => {
        // Prepare data to send
        const formData = {
            personalInformation: {
                last_name: lastName,
                first_name: firstName,
                middle_name: middleName,
                contact_number: contactNumber,
                alternate_contact_number: alternateContactNumber,
                email: emailAddress,
                alternate_email: alternateEmail,
                present_address: presentAddress,
                permanent_address: permanentAddress,
                date_of_birth: dateOfBirth,
                sex: gender,
                sss_number: SssNumber,
                tin_number: tinNumber,
                philhealth_number: philHealthNumber,
                pagibig_number: pagIbigNumber,
                personal_password: password,
            },
            educationalBackground: courses,
            employmentHistory: employmentHistoryPosition,
            positionApplied: positionApplied,
            subscribe_to_email_updates: subscribeToEmailUpdates,
        };

        try {
            const response = await axios.post('http://localhost/delmonte/api/user.php', new URLSearchParams({
                json: JSON.stringify(formData),
                operation: 'signup',
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            console.log('Response:', response.data);

            if (response.data === '1') {
                alert('Signup successful!');
            } else {
                alert('An error occurred.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('An error occurred.');
        }
    };


    const handleAddCourse = () => {
        setShowModal(true);
    };

    const handleSaveCourse = () => {
        if (editingIndex !== null) {
            // Update existing course
            const updatedCourses = courses.map((course, index) =>
                index === editingIndex ? courseData : course
            );
            setCourses(updatedCourses);
        } else {
            // Add new course
            setCourses([...courses, courseData]);
        }
        setShowModal(false);
        setEditingIndex(null);
        setCourseData({
            course: "",
            graduateCourse: "",
            dateOfGraduate: "",
            prcLicenseNo: "",
        });
    };

    const handleEditCourse = (index) => {
        setEditingIndex(index);
        setCourseData(courses[index]);
        setShowModal(true);
    };

    const handleDeleteCourse = (index) => {
        setCourses(courses.filter((_, i) => i !== index));
    };


    const handleAddHistory = () => {
        setShowModalHistory(true);
    };

    const handleSaveHistory = () => {
        if (editingHistoryIndex !== null) {
            // Update existing history
            const updatedHistory = employmentHistoryPosition.map((history, index) =>
                index === editingHistoryIndex ? employmentHistoryData : history
            );
            setEmploymentHistoryPosition(updatedHistory);
        } else {
            // Add new history
            setEmploymentHistoryPosition([...employmentHistoryPosition, employmentHistoryData]);
        }
        setShowModalHistory(false);
        setEditingHistoryIndex(null);
        setEmploymentHistoryData({
            position: "",
            company: "",
            dateOfStart: "",
            dateOfEnd: "",
        });
    };

    const handleEditHistory = (index) => {
        setEditingHistoryIndex(index);
        setEmploymentHistoryData(employmentHistoryPosition[index]);
        setShowModalHistory(true);
    };

    const handleDeleteHistory = (index) => {
        setEmploymentHistoryPosition(employmentHistoryPosition.filter((_, i) => i !== index));
    };


    const handleAddPosition = () => {
        setShowModalPosition(true);
    };

    const handleSavePosition = () => {
        if (editingPositionIndex !== null) {
            // Update existing position
            const updatedPosition = positionApplied.map((position, index) =>
                index === editingPositionIndex ? positionAppliedData : position
            );
            setPositionApplied(updatedPosition);
        } else {
            // Add new position
            setPositionApplied([...positionApplied, positionAppliedData]);
        }
        setShowModalPosition(false);
        setEditingPositionIndex(null);
        setPositionAppliedData({
            position: "",

        });
    };

    const handleEditPosition = (index) => {
        setEditingPositionIndex(index);
        setPositionAppliedData(positionApplied[index]);
        setShowModalPosition(true);
    };

    const handleDeletePosition = (index) => {
        setPositionApplied(positionApplied.filter((_, i) => i !== index));
    };


    const [subscribeToEmail, setSubscribeToEmail] = useState(null);
    const [dataPrivacyConsent, setDataPrivacyConsent] = useState(false);

    const handleSubscribeChange = (e) => {
        setSubscribeToEmail(e.target.value);
    };

    const handleConsentChange = (e) => {
        setDataPrivacyConsent(e.target.checked);
    };






    return (
        <div className="w-full h-screen flex items-center justify-center bg-[#0E4028] overflow-y-auto scrollbar-custom">
            <div className="w-full max-w-2xl p-4">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <img src="/images/delmonte.png" alt="Logo" className="h-20 w-auto" />
                </div>

                {/* Stepper Navigation */}
                <div className="flex items-center justify-between mb-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.id}
                            className={`flex-1 text-center relative ${step.id <= currentStep ? "text-white" : "text-gray-500"}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                        >
                            <div className="flex flex-col items-center">
                                <motion.div
                                    className={`w-8 h-8 mb-2 rounded-full border-2 flex items-center justify-center ${step.id < currentStep ? "border-white bg-green-500 text-white" : step.id === currentStep ? "border-white bg-white text-black" : "border-gray-500 bg-[#0E5A35]"}`}
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {step.id < currentStep ? (
                                        <motion.svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586l-3.293-3.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                                        </motion.svg>
                                    ) : (
                                        <span>{step.id}</span>
                                    )}
                                </motion.div>
                                <span>{step.name}</span>
                            </div>
                            {index < steps.length - 1 && (
                                <motion.div
                                    className={`absolute top-4 w-full h-0.5 ${step.id < currentStep ? "bg-gray-400" : "bg-gray-600"}`}
                                    style={{ left: '10%', transform: 'translateX(50%)' }}
                                    initial={{ width: '0%' }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 0.5, delay: index * 0.3 }}
                                ></motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>


                {/* Form Section */}
                <div className="bg-[#0E5A35] text-white p-4 md:p-5 rounded-lg text-center max-h-screen">
                    {/* Render the form based on the current step */}

                    <motion.div
                        key={currentStep}
                        className="bg-[#0E5A35] text-white p-4 md:p-2 rounded-lg text-center max-h-screen"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.5 }}
                    >
                        {currentStep === 1 && (
                            <>
                                <p className='text-xl mb-4 mt-1'>Personal Information</p>
                                <div className="max-h-[280px] overflow-y-auto scrollbar-custom ">

                                    <div className="grid grid-cols-2 gap-4 text-left">
                                        <div>
                                            <label className="block mb-2 text-sm text-gray-400">Last Name</label>
                                            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Input Last Name :" className="w-full h-12 p-2 rounded-lg border border-green-600 bg-[#0E4028] text-xs" />
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm text-gray-400">First Name</label>
                                            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Input First Name :" className="w-full h-12 p-2 rounded-lg border border-green-600 bg-[#0E4028] text-xs" />
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm text-gray-400">Middle Name</label>
                                            <input type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="Input Middle Name :" className="w-full h-12 p-2 rounded-lg border border-green-600 bg-[#0E4028] text-xs" />
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm text-gray-400">Contact Number</label>
                                            <input type="text" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="Input Contact Number :" className="w-full h-12 p-2 rounded-lg border border-green-600 bg-[#0E4028] text-xs" />
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm text-gray-400">Alternate Contact</label>
                                            <input type="text" value={alternateContactNumber} onChange={(e) => setAlternateContactNumber(e.target.value)} placeholder="Input Alternate Contact :" className="w-full h-12 p-2 rounded-lg border border-green-600 bg-[#0E4028] text-xs" />
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm text-gray-400">Alternate Email</label>
                                            <input type="email" value={alternateEmail} onChange={(e) => setAlternateEmail(e.target.value)} placeholder="Input Alternate Email :" className="w-full h-12 p-2 rounded-lg border border-green-600 bg-[#0E4028] text-xs" />
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm text-gray-400">Present Address</label>
                                            <input type="text" value={presentAddress} onChange={(e) => setPresentAddress(e.target.value)} placeholder="Input Present Address :" className="w-full h-12 p-2 rounded-lg border border-green-600 bg-[#0E4028] text-xs" />
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm text-gray-400">Permanent Address</label>
                                            <input type="text" value={permanentAddress} onChange={(e) => setPermanentAddress(e.target.value)} placeholder="Input Permanent Address :" className="w-full h-12 p-2 rounded-lg border border-green-600 bg-[#0E4028] text-xs" />
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm text-gray-400">Date of Birth</label>
                                            <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="w-full h-12 p-2 rounded-lg border border-green-600 bg-[#0E4028] text-xs" />
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm text-gray-400">Gender</label>
                                            <select className="w-full h-12 p-2 rounded-lg border border-green-600 bg-[#0E4028] text-xs">
                                                <option value="">Select Gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                            </select>
                                        </div>
                                        {/* Horizontal Fields */}
                                        <div className="flex space-x-4 col-span-2">
                                            <div className="w-1/3">
                                                <label className="block mb-2 text-sm text-gray-400">SSS No.</label>
                                                <input type="text" value={SssNumber} onChange={(e) => setSssNumber(e.target.value)} placeholder="Input SSS No. :" className="w-full h-12 p-2 rounded-lg border border-green-600 bg-[#0E4028] text-xs" />
                                            </div>
                                            <div className="w-1/3">
                                                <label className="block mb-2 text-sm text-gray-400">TIN No.</label>
                                                <input type="text" value={tinNumber} onChange={(e) => setTinNumber(e.target.value)} placeholder="Input TIN No. :" className="w-full h-12 p-2 rounded-lg border border-green-600 bg-[#0E4028] text-xs" />
                                            </div>
                                            <div className="w-1/3">
                                                <label className="block mb-2 text-sm text-gray-400">PhilHealth No.</label>
                                                <input type="text" value={philHealthNumber} onChange={(e) => setPhilHealthNumber(e.target.value)} placeholder="Input PhilHealth No. :" className="w-full h-12 p-2 rounded-lg border border-green-600 bg-[#0E4028] text-xs" />
                                            </div>
                                            <div className="w-1/3">
                                                <label className="block mb-2 text-sm text-gray-400">Pag-ibig No.</label>
                                                <input type="text" value={pagIbigNumber} onChange={(e) => setPagIbigNumber(e.target.value)} placeholder="Input PhilHealth No. :" className="w-full h-12 p-2 rounded-lg border border-green-600 bg-[#0E4028] text-xs" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm text-gray-400">Email Address</label>
                                            <input type="email" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} placeholder="Input Email Address :" className="w-full h-12 p-2 rounded-lg border border-green-600 bg-[#0E4028] text-xs" />
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm text-gray-400">Password</label>
                                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Input Password :" className="w-full h-12 p-2 rounded-lg border border-green-600 bg-[#0E4028] text-xs" />
                                        </div>
                                    </div>
                                </div></>

                        )}
                        {currentStep === 2 && (
                            <>
                                <p className="text-xl mb-4">Educational Background</p>

                                <div className="mb-4">
                                    <button
                                        onClick={handleAddCourse}
                                        className="px-4 py-2 bg-white text-black rounded"
                                    >
                                        + Add Course
                                    </button>
                                </div>

                                <div className="max-h-[280px] overflow-y-auto scrollbar-custom">
                                    {courses.map((course, index) => (
                                        <div
                                            key={index}
                                            className="p-4 mb-4 bg-[#0E4028] rounded-lg cursor-pointer border border-green-600 relative"
                                        >
                                            <div onClick={() => handleEditCourse(index)} className="cursor-pointer">
                                                <p><strong>Course:</strong> {course.course}</p>
                                                <p><strong>Graduate Course:</strong> {course.graduateCourse}</p>
                                                <p><strong>School Graduate:</strong> {course.graduateSchool}</p>
                                                <p><strong>Date of Graduate:</strong> {course.dateOfGraduate}</p>
                                                <p><strong>PRC License No.:</strong> {course.prcLicenseNo}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteCourse(index)}
                                                className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded"
                                            >
                                                -
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}


                        {currentStep === 3 && (
                            <>
                                <p className="text-xl mb-4">Employment History</p>

                                <div className="mb-4">
                                    <button
                                        onClick={handleAddHistory}
                                        className="px-4 py-2 bg-white text-black rounded"
                                    >
                                        + Add Employment History
                                    </button>
                                </div>

                                <div className="max-h-[280px] overflow-y-auto scrollbar-custom">
                                    {employmentHistoryPosition.map((history, index) => (
                                        <div
                                            key={index}
                                            className="p-4 mb-4 bg-[#0E4028] rounded-lg cursor-pointer border border-green-600 relative" // Ensure 'relative' is added here
                                        >
                                            <div onClick={() => handleEditHistory(index)} className="cursor-pointer">
                                                <p><strong>Position:</strong> {history.position}</p>
                                                <p><strong>Company:</strong> {history.company}</p>
                                                <p><strong>Date of Start:</strong> {history.dateOfStart}</p>
                                                <p><strong>Date of End:</strong> {history.dateOfEnd}</p> {/* Corrected here */}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteHistory(index)}
                                                className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded"
                                            >
                                                -
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {currentStep === 4 && (
                            <>
                                <p className="text-xl mb-4">Position Applied</p>

                                <div className="mb-4">
                                    <button
                                        onClick={handleAddPosition}
                                        className="px-4 py-2 bg-white text-black rounded"
                                    >
                                        + Add Position Applied
                                    </button>
                                </div>

                                <div className="max-h-[280px] overflow-y-auto scrollbar-custom">
                                    {positionApplied.map((position, index) => (
                                        <div
                                            key={index}
                                            className="p-4 mb-4 bg-[#0E4028] rounded-lg cursor-pointer border border-green-600 relative"
                                        >
                                            <div onClick={() => handleEditPosition(index)} className="cursor-pointer">
                                                <p><strong>Position:</strong> {position.position}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeletePosition(index)}
                                                className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded"
                                            >
                                                -
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Subscribe to Email Updates */}
                                <div className="mb-4">
                                    <label className="block mb-2 text-sm text-gray-400 text-start">Subscribe to Email Updates?</label>
                                    <div className="flex items-center space-x-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="subscribeToEmail"
                                                value="yes"
                                                onChange={handleSubscribeChange} // Define this function to handle changes
                                                className="form-radio text-green-500 h-4 w-4"
                                            />
                                            <span className="ml-2 text-sm text-gray-400">Yes</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="subscribeToEmail"
                                                value="no"
                                                onChange={handleSubscribeChange} // Define this function to handle changes
                                                className="form-radio text-green-500 h-4 w-4"
                                            />
                                            <span className="ml-2 text-sm text-gray-400">No</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Data Privacy Consent */}
                                <div className="mb-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="dataPrivacyConsent"
                                            onChange={handleConsentChange} // Define this function to handle changes
                                            className="form-checkbox text-green-500 h-4 w-4"
                                        />
                                        <span className="ml-2 text-sm text-gray-400">I agree to the Data Privacy Consent</span>
                                    </label>
                                </div>
                            </>
                        )}
                    </motion.div>

                    {/* Add more forms for other steps here */}
                </div>

                {/* Navigation Buttons */}
                <div className="mt-4 flex justify-end space-x-2">
                    <button
                        onClick={() => setCurrentStep(currentStep - 1)}
                        className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
                        disabled={currentStep === 1}
                    >
                        Prev
                    </button>
                    {currentStep === steps.length ? (
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-green-500 text-white rounded"
                        >
                            Apply
                        </button>
                    ) : (
                        <button
                            onClick={handleNextStep}
                            className="px-4 py-2 bg-white text-black rounded"
                        >
                            Next
                        </button>
                    )}
                </div>

                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-[#0E5A35] text-white p-8 rounded-lg max-w-md w-full">
                            <h2 className="text-xl mb-4">{editingIndex !== null ? "Edit Course" : "Add Course"}</h2>

                            <div className="mb-4">
                                <label className="block mb-2 text-sm">Course</label>
                                <select
                                    value={courseData.course}
                                    onChange={(e) =>
                                        setCourseData({ ...courseData, course: e.target.value })
                                    }
                                    className="w-full h-12 p-2 rounded-lg border border-green-600 bg-[#0E4028] text-xs"
                                >
                                    <option value="">Select Course</option>
                                    <option value="Bachelor of Science in Computer Science">Bachelor of Science in Computer Science</option>
                                    <option value="Bachelor of Science in Information Technology">Bachelor of Science in Information Technology</option>
                                    <option value="Bachelor of Science in Business Administration">Bachelor of Science in Business Administration</option>
                                    {/* Add more course options as needed */}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block mb-2 text-sm">Graduate Course</label>
                                <select
                                    value={courseData.graduateCourse}
                                    onChange={(e) =>
                                        setCourseData({ ...courseData, graduateCourse: e.target.value })
                                    }
                                    className="w-full h-12 p-2 rounded-lg border border-green-600 bg-[#0E4028] text-xs"
                                >
                                    <option value="">Select Graduate Course</option>
                                    <option value="Secondary Education">Secondary Education</option>
                                    <option value="Tertiary Education">Tertiary Education</option>
                                    <option value="Graduate Education">Graduate Education</option>
                                    {/* Add more graduate course options as needed */}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block mb-2 text-sm">Date of Graduate</label>
                                <input
                                    type="date"
                                    value={courseData.dateOfGraduate}
                                    onChange={(e) =>
                                        setCourseData({ ...courseData, dateOfGraduate: e.target.value })
                                    }
                                    className="w-full h-12 p-2 rounded-lg border border-green-600 bg-[#0E4028] text-xs"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block mb-2 text-sm">School Graduate</label>
                                <select
                                    value={courseData.graduateSchool}
                                    onChange={(e) =>
                                        setCourseData({ ...courseData, graduateSchool: e.target.value })
                                    }
                                    className="w-full h-12 p-2 rounded-lg border border-green-600 bg-[#0E4028] text-xs"
                                >
                                    <option value="">Select School</option>
                                    <option value="PHINMA COC">PHINMA COC</option>
                                    <option value="Xavier University">Xavier University</option>
                                    <option value="Liceo">Liceo</option>
                                    {/* Add more graduate course options as needed */}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block mb-2 text-sm">PRC License No.</label>
                                <input
                                    type="text"
                                    value={courseData.prcLicenseNo}
                                    onChange={(e) =>
                                        setCourseData({ ...courseData, prcLicenseNo: e.target.value })
                                    }
                                    placeholder="Input PRC License No. :"
                                    className="w-full h-12 p-2 rounded-lg border border-green-600 bg-[#0E4028] text-xs"
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-500 text-white rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveCourse}
                                    className="px-4 py-2 bg-green-500 text-white rounded"
                                >
                                    {editingIndex !== null ? "Save Changes" : "Add Course"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {showModalHistory && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-[#0E5A35] text-white p-8 rounded-lg max-w-md w-full">
                            <h2 className="text-xl mb-4">{editingIndex !== null ? "Edit Employment History" : "Add Employment History"}</h2>

                            <div className="mb-4">
                                <label className="block mb-2 text-sm text-gray-400">Position</label>
                                <input type="text" placeholder="Input Position"
                                    value={employmentHistoryData.position}
                                    onChange={(e) => setEmploymentHistoryData({ ...employmentHistoryData, position: e.target.value })} className="w-full h-12 p-2 rounded-lg border border-green-600 bg-[#0E4028] text-xs" />
                            </div>

                            <div className="mb-4">
                                <label className="block mb-2 text-sm text-gray-400">Company</label>
                                <input type="text" placeholder="Input Position"
                                    value={employmentHistoryData.company}
                                    onChange={(e) => setEmploymentHistoryData({ ...employmentHistoryData, company: e.target.value })} className="w-full h-12 p-2 rounded-lg border border-green-600 bg-[#0E4028] text-xs" />
                            </div>

                            <div className="mb-4">
                                <label className="block mb-2 text-sm">Date of Date of Start</label>
                                <input
                                    type="date"
                                    value={employmentHistoryData.dateOfStart}
                                    onChange={(e) =>
                                        setEmploymentHistoryData({ ...employmentHistoryData, dateOfStart: e.target.value })
                                    }
                                    className="w-full h-12 p-2 rounded-lg border border-green-600 bg-[#0E4028] text-xs"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block mb-2 text-sm">Date of Date of End</label>
                                <input
                                    type="date"
                                    value={employmentHistoryData.dateOfEnd}
                                    onChange={(e) =>
                                        setEmploymentHistoryData({ ...employmentHistoryData, dateOfEnd: e.target.value })
                                    }
                                    className="w-full h-12 p-2 rounded-lg border border-green-600 bg-[#0E4028] text-xs"
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => setShowModalHistory(false)}
                                    className="px-4 py-2 bg-gray-500 text-white rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveHistory}
                                    className="px-4 py-2 bg-green-500 text-white rounded"
                                >
                                    {editingHistoryIndex !== null ? "Save Changes" : "Add Course"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showModalPosition && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-[#0E5A35] text-white p-8 rounded-lg max-w-md w-full">
                            <h2 className="text-xl mb-4">{editingIndex !== null ? "Edit Position" : "Add Position"}</h2>

                            <div className="mb-4">
                                <label className="block mb-2 text-sm text-gray-400">Position</label>
                                <input type="text" placeholder="Input Position"
                                    value={positionAppliedData.position}
                                    onChange={(e) => setPositionAppliedData({ ...positionAppliedData, position: e.target.value })} className="w-full h-12 p-2 rounded-lg border border-green-600 bg-[#0E4028] text-xs" />
                            </div>



                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => setShowModalPosition(false)}
                                    className="px-4 py-2 bg-gray-500 text-white rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSavePosition}
                                    className="px-4 py-2 bg-green-500 text-white rounded"
                                >
                                    {editingPositionIndex !== null ? "Save Changes" : "Add Course"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {isModalPinOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg">
                            <h2 className="text-lg mb-4">Enter PIN Code</h2>
                            <input
                                type="text"
                                value={pinCode}
                                onChange={(e) => setPinCode(e.target.value)}
                                className="w-full mb-4 p-2 border border-gray-300 rounded"
                                placeholder="Enter PIN"
                            />
                            <button
                                onClick={handlePinSubmit}
                                className="px-4 py-2 bg-green-500 text-white rounded"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
