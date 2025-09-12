import { useState, useRef } from 'react';
import { generatePreviewImage, downloadImage, generateQuotationFilename } from '../lib/utils/imageUtils';

export const usePreview = () => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
    const quotationRef = useRef<HTMLDivElement>(null);

    const generatePreview = async () => {
        if (!quotationRef.current) return;

        setIsGeneratingPreview(true);
        setIsPreviewOpen(true);

        try {
            const dataUrl = await generatePreviewImage(quotationRef.current);
            setPreviewUrl(dataUrl);
        } catch (error) {
            console.error('미리보기 생성 실패:', error);
            alert('미리보기 생성에 실패했습니다.');
            setIsPreviewOpen(false);
        } finally {
            setIsGeneratingPreview(false);
        }
    };

    const downloadQuotationAsImage = async (customerName: string) => {
        if (!quotationRef.current) return;

        try {
            const dataUrl = await generatePreviewImage(quotationRef.current);
            const filename = generateQuotationFilename(customerName);
            downloadImage(dataUrl, filename);
        } catch (error) {
            console.error('이미지 다운로드 실패:', error);
            alert('이미지 다운로드에 실패했습니다.');
        }
    };

    const downloadFromPreview = (customerName: string) => {
        if (previewUrl) {
            const filename = generateQuotationFilename(customerName);
            downloadImage(previewUrl, filename);
        }
    };

    const closePreview = () => {
        setIsPreviewOpen(false);
        setPreviewUrl(null);
    };

    return {
        quotationRef,
        isPreviewOpen,
        previewUrl,
        isGeneratingPreview,
        generatePreview,
        downloadQuotationAsImage,
        downloadFromPreview,
        closePreview
    };
};
