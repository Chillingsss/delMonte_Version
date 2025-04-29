const calculateCompletionPercentage = (profile) => {
  let totalFields = 20;
  let completedFields = 0;

  if (profile.educationalBackground.length > 0) completedFields++;
  if (profile.employmentHistory.length > 0) completedFields++;
  if (profile.skills.length > 0) completedFields++;
  if (profile.training.length > 0) completedFields++;
  if (profile.knowledge.length > 0) completedFields++;
  if (profile.license.length > 0) completedFields++;
  if (profile.resume.length > 0) completedFields++;

  if (profile.candidateInformation.cand_firstname) completedFields++;
  if (profile.candidateInformation.cand_lastname) completedFields++;
  if (profile.candidateInformation.cand_contactNo) completedFields++;
  if (profile.candidateInformation.cand_alternatecontactNo) completedFields++;
  if (profile.candidateInformation.cand_presentAddress) completedFields++;
  if (profile.candidateInformation.cand_permanentAddress) completedFields++;
  if (profile.candidateInformation.cand_dateofBirth) completedFields++;
  if (profile.candidateInformation.cand_alternateEmail) completedFields++;
  if (profile.candidateInformation.cand_sssNo) completedFields++;
  if (profile.candidateInformation.cand_tinNo) completedFields++;
  if (profile.candidateInformation.cand_philhealthNo) completedFields++;
  if (profile.candidateInformation.cand_pagibigNo) completedFields++;
  if (profile.candidateInformation.cand_profPic) completedFields++;

  return (completedFields / totalFields) * 100;
};

export default calculateCompletionPercentage;