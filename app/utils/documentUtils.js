import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";

export const getFileType = (filename) => {
    const extension = filename.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
        return "image";
    } else if (extension === "pdf") {
        return "pdf";
    } else if (extension === "docx") {
        return "docx";
    } else if (extension === "doc") {
        return "document";
    }
    return "unknown";
};

export const extractTextFromPdf = async (fileUrl) => {
    try {
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdf = await loadingTask.promise;
        let extractedText = "";

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item) => item.str).join(" ");
            extractedText += pageText + "\n\n";
        }

        return extractedText;
    } catch (error) {
        console.error("Error extracting text from PDF:", error);
        throw error;
    }
};

export const convertDocxToText = async (fileUrl) => {
    try {
        const response = await fetch(fileUrl, {
            credentials: "include",
            headers: {
                Accept:
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });

        if (!result.value) {
            throw new Error("No text content extracted");
        }

        return result.value;
    } catch (error) {
        console.error("Error converting DOCX to text:", error);
        throw error;
    }
};