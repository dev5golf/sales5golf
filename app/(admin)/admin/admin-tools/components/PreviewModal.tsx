'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../../components/ui/dialog';
import { Button } from '../../../../../components/ui/button';
import { Download, Loader2 } from 'lucide-react';

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDownload: () => void;
    previewUrl: string | null;
    isGenerating: boolean;
    fileName: string;
}

export default function PreviewModal({
    isOpen,
    onClose,
    onDownload,
    previewUrl,
    isGenerating,
    fileName
}: PreviewModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-8">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>견적서 미리보기</span>
                        <div className="flex gap-2">
                            {previewUrl && (
                                <Button
                                    onClick={onDownload}
                                    variant="default"
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    다운로드
                                </Button>
                            )}
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-auto">
                    {isGenerating ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                            <p className="text-gray-600">이미지 생성 중...</p>
                        </div>
                    ) : previewUrl ? (
                        <div className="flex justify-center">
                            <img
                                src={previewUrl}
                                alt="견적서 미리보기"
                                className="max-w-full h-auto border rounded-lg shadow-sm"
                                style={{ maxHeight: '70vh' }}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <p className="text-gray-500">미리보기를 생성할 수 없습니다.</p>
                        </div>
                    )}
                </div>

                {previewUrl && (
                    <div className="text-sm text-gray-500 text-center pt-2 border-t">
                        파일명: {fileName}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
