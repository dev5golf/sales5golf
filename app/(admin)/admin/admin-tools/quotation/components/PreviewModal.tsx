'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Loader2, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

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
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // 줌 레벨 옵션
    const zoomLevels = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];
    const currentZoomIndex = zoomLevels.findIndex(level => level === zoom);

    // 줌 인/아웃 함수
    const zoomIn = () => {
        if (currentZoomIndex < zoomLevels.length - 1) {
            setZoom(zoomLevels[currentZoomIndex + 1]);
        }
    };

    const zoomOut = () => {
        if (currentZoomIndex > 0) {
            setZoom(zoomLevels[currentZoomIndex - 1]);
        }
    };

    const resetZoom = () => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    };

    // 마우스 휠로 줌
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            zoomIn();
        } else {
            zoomOut();
        }
    };

    // 드래그 시작
    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoom > 1) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    };

    // 드래그 중
    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && zoom > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    // 드래그 종료
    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // 전체화면 토글
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        if (!isFullscreen) {
            resetZoom();
        }
    };

    // 모달이 열릴 때 줌 리셋
    useEffect(() => {
        if (isOpen) {
            resetZoom();
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={`${isFullscreen ? 'max-w-none max-h-none w-screen h-screen' : 'max-w-6xl max-h-[90vh]'} overflow-hidden p-0`}>
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle className="flex items-center justify-between">
                        <span>견적서 미리보기</span>
                        <div className="flex gap-2">
                            {previewUrl && (
                                <>
                                    {/* 줌 컨트롤 */}
                                    <div className="flex items-center gap-1 border rounded-md p-1">
                                        <Button
                                            onClick={zoomOut}
                                            variant="ghost"
                                            size="sm"
                                            disabled={currentZoomIndex === 0}
                                            className="h-8 w-8 p-0"
                                        >
                                            <ZoomOut className="h-4 w-4" />
                                        </Button>
                                        <span className="text-sm font-medium min-w-[60px] text-center">
                                            {Math.round(zoom * 100)}%
                                        </span>
                                        <Button
                                            onClick={zoomIn}
                                            variant="ghost"
                                            size="sm"
                                            disabled={currentZoomIndex === zoomLevels.length - 1}
                                            className="h-8 w-8 p-0"
                                        >
                                            <ZoomIn className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            onClick={resetZoom}
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* 전체화면 토글 */}
                                    <Button
                                        onClick={toggleFullscreen}
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                    >
                                        <Maximize2 className="h-4 w-4" />
                                    </Button>

                                    {/* 다운로드 */}
                                    <Button
                                        onClick={onDownload}
                                        variant="default"
                                        size="sm"
                                        className="flex items-center gap-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        다운로드
                                    </Button>
                                </>
                            )}
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div
                    ref={containerRef}
                    className="flex-1 overflow-auto relative bg-gray-50"
                    onWheel={handleWheel}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    {isGenerating ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                            <p className="text-gray-600">이미지 생성 중...</p>
                        </div>
                    ) : previewUrl ? (
                        <div className="flex justify-center items-center min-h-full p-4">
                            <div
                                className="relative"
                                style={{
                                    transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                                    transformOrigin: 'center center',
                                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                                    cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                                }}
                                onMouseDown={handleMouseDown}
                            >
                                <img
                                    ref={imageRef}
                                    src={previewUrl}
                                    alt="견적서 미리보기"
                                    className="border rounded-lg shadow-lg bg-white"
                                    style={{
                                        maxWidth: isFullscreen ? 'none' : '100%',
                                        maxHeight: isFullscreen ? 'none' : '70vh',
                                        userSelect: 'none'
                                    }}
                                    draggable={false}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <p className="text-gray-500">미리보기를 생성할 수 없습니다.</p>
                        </div>
                    )}
                </div>

                {previewUrl && (
                    <div className="text-sm text-gray-500 text-center pt-2 border-t bg-white px-6 py-2">
                        파일명: {fileName} |
                        <span className="ml-2">
                            마우스 휠로 확대/축소, 드래그로 이동 가능
                        </span>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
