'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// 手势类型定义
export type GestureType =
  | 'none'
  | 'palm'
  | 'fist'
  | 'pinch'
  | 'point'
  | 'thumbs_up'
  | 'thumbs_down'
  | 'thumbs_left'
  | 'thumbs_right'
  | 'two_fingers';

// 手部关键点
export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

// 手势识别结果
export interface GestureResult {
  gesture: GestureType;
  handedness: string;
  landmarks: HandLandmark[];
  confidence: number;
}

// Hands 检测结果类型
export interface HandsResults {
  multiHandLandmarks?: HandLandmark[][];
  multiHandedness?: Array<{ label: string; score: number }>;
}

// Hands 类（模拟）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Hands = any;

// 捏合距离阈值
const PINCH_THRESHOLD = 0.07;
// 手指伸展角度阈值
const EXTENSION_THRESHOLD = 0.5;

interface UseMediaPipeHandsOptions {
  onResults?: (results: HandsResults) => void;
  onGesture?: (result: GestureResult) => void;
  maxHands?: number;
  modelComplexity?: 0 | 1;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
}

// 计算两点间距离
function calcDistance(p1: HandLandmark, p2: HandLandmark): number {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) +
    Math.pow(p1.y - p2.y, 2) +
    Math.pow(p1.z - p2.z, 2)
  );
}

// 计算手指伸展程度
function calcFingerExtension(
  landmarks: HandLandmark[],
  tipIdx: number,
  pipIdx: number,
  mcpIdx: number
): number {
  const tip = landmarks[tipIdx];
  const pip = landmarks[pipIdx];
  const mcp = landmarks[mcpIdx];
  const spread = calcDistance(tip, mcp) / 0.3;
  return Math.min(1, Math.max(0, spread));
}

// 识别手势
function recognizeGesture(
  landmarks: HandLandmark[],
  handedness: string
): GestureResult {
  // 关键点索引
  const THUMB_TIP = 4;
  const INDEX_MCP = 5, INDEX_PIP = 6, INDEX_TIP = 8;
  const MIDDLE_MCP = 9, MIDDLE_PIP = 10, MIDDLE_TIP = 12;
  const RING_MCP = 13, RING_PIP = 14, RING_TIP = 16;
  const PINKY_MCP = 17, PINKY_PIP = 18, PINKY_TIP = 20;

  // 计算拇指与食指距离
  const thumbIndexDist = calcDistance(landmarks[THUMB_TIP], landmarks[INDEX_TIP]);
  const isPinching = thumbIndexDist < PINCH_THRESHOLD;

  // 手指伸展检测
  const indexExt = calcFingerExtension(landmarks, INDEX_TIP, INDEX_PIP, INDEX_MCP);
  const middleExt = calcFingerExtension(landmarks, MIDDLE_TIP, MIDDLE_PIP, MIDDLE_MCP);
  const ringExt = calcFingerExtension(landmarks, RING_TIP, RING_PIP, RING_MCP);
  const pinkyExt = calcFingerExtension(landmarks, PINKY_TIP, PINKY_PIP, PINKY_MCP);

  // 拇指方向
  const thumbTip = landmarks[THUMB_TIP];
  const thumbIp = landmarks[3];
  const thumbDir = thumbTip.x - thumbIp.x;
  const thumbDirY = thumbTip.y - thumbIp.y;

  // 握拳检测
  const isFist =
    !isPinching &&
    indexExt < EXTENSION_THRESHOLD &&
    middleExt < EXTENSION_THRESHOLD &&
    ringExt < EXTENSION_THRESHOLD &&
    pinkyExt < EXTENSION_THRESHOLD;

  if (isFist) {
    return { gesture: 'fist', handedness, landmarks, confidence: 0.9 };
  }

  // 捏合检测
  if (isPinching) {
    return { gesture: 'pinch', handedness, landmarks, confidence: 0.9 };
  }

  // 拇指方向检测
  const thumbExt = calcFingerExtension(landmarks, THUMB_TIP, 3, 2);
  if (thumbExt > 0.5 && indexExt < 0.3 && middleExt < 0.3 && ringExt < 0.3 && pinkyExt < 0.3) {
    if (thumbDirY < -0.05) {
      return { gesture: 'thumbs_up', handedness, landmarks, confidence: 0.85 };
    } else if (thumbDirY > 0.05) {
      return { gesture: 'thumbs_down', handedness, landmarks, confidence: 0.85 };
    } else if (thumbDir > 0.05) {
      return { gesture: 'thumbs_right', handedness, landmarks, confidence: 0.85 };
    } else if (thumbDir < -0.05) {
      return { gesture: 'thumbs_left', handedness, landmarks, confidence: 0.85 };
    }
  }

  // 食指指向检测
  if (indexExt > 0.7 && middleExt < 0.3 && ringExt < 0.3 && pinkyExt < 0.3) {
    return { gesture: 'point', handedness, landmarks, confidence: 0.9 };
  }

  // 两指张开检测
  if (indexExt > 0.5 && middleExt > 0.5 && ringExt < 0.3 && pinkyExt < 0.3) {
    return { gesture: 'two_fingers', handedness, landmarks, confidence: 0.8 };
  }

  // 张开手掌检测
  if (indexExt > 0.6 && middleExt > 0.6 && ringExt > 0.6 && pinkyExt > 0.6) {
    return { gesture: 'palm', handedness, landmarks, confidence: 0.8 };
  }

  return { gesture: 'none', handedness, landmarks, confidence: 0 };
}

export function useMediaPipeHands(options: UseMediaPipeHandsOptions = {}) {
  const {
    onResults,
    onGesture,
    maxHands = 1,
    modelComplexity = 1,
    minDetectionConfidence = 0.5,
    minTrackingConfidence = 0.5,
  } = options;

  const handsRef = useRef<Hands | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentGesture, setCurrentGesture] = useState<GestureResult | null>(null);

  // 初始化 Hands 模型
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initHands = async () => {
      try {
        // 动态导入 MediaPipe
        const [HandsModule, drawingUtils] = await Promise.all([
          import('@mediapipe/hands'),
          import('@mediapipe/drawing_utils'),
        ]);

        const Hands = HandsModule.Hands;

        const hands = new Hands({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          },
        });

        hands.setOptions({
          maxNumHands: maxHands,
          modelComplexity: modelComplexity,
          minDetectionConfidence: minDetectionConfidence,
          minTrackingConfidence: minTrackingConfidence,
        });

        hands.onResults((results: HandsResults) => {
          onResults?.(results);

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            for (let i = 0; i < results.multiHandLandmarks.length; i++) {
              const landmarks = results.multiHandLandmarks[i];
              const handedness = results.multiHandedness?.[i]?.label || 'Unknown';
              const gestureResult = recognizeGesture(
                landmarks as HandLandmark[],
                handedness
              );
              setCurrentGesture(gestureResult);
              onGesture?.(gestureResult);
            }
          } else {
            setCurrentGesture(null);
          }
        });

        handsRef.current = hands;
        setIsReady(true);
        setError(null);
      } catch (err) {
        console.error('Failed to initialize MediaPipe Hands:', err);
        setError(`初始化失败: ${err}`);
      }
    };

    initHands();

    return () => {
      if (handsRef.current) {
        handsRef.current.close();
        handsRef.current = null;
      }
    };
  }, [maxHands, modelComplexity, minDetectionConfidence, minTrackingConfidence, onResults, onGesture]);

  // 处理视频帧
  const processFrame = useCallback(async (video: HTMLVideoElement) => {
    if (handsRef.current && video.readyState >= 2) {
      await handsRef.current.send({ image: video });
    }
  }, []);

  // 启动摄像头
  const startCamera = useCallback(async (video: HTMLVideoElement) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      video.srcObject = stream;
      await video.play();

      // 设置定时器处理视频帧
      const processVideo = async () => {
        if (video.readyState >= 2) {
          await processFrame(video);
        }
        requestAnimationFrame(processVideo);
      };

      requestAnimationFrame(processVideo);
      setIsReady(true);
      setError(null);
    } catch (err) {
      console.error('Failed to start camera:', err);
      setError(`摄像头启动失败: ${err}`);
    }
  }, [processFrame]);

  // 停止摄像头
  const stopCamera = useCallback(() => {
    setIsReady(false);
  }, []);

  // 绘制手部关键点
  const drawHandLandmarks = useCallback(async (canvas: HTMLCanvasElement, results: HandsResults) => {
    const drawingUtils = await import('@mediapipe/drawing_utils');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.width;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks) {
      const HAND_CONNECTIONS = (await import('@mediapipe/hands')).HAND_CONNECTIONS;
      for (const landmarks of results.multiHandLandmarks) {
        drawingUtils.drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 2,
        });
        drawingUtils.drawLandmarks(ctx, landmarks, {
          color: '#FF0000',
          lineWidth: 1,
          radius: 3,
        });
      }
    }
  }, []);

  return {
    isReady,
    error,
    currentGesture,
    startCamera,
    stopCamera,
    drawHandLandmarks,
    handsRef,
  };
}

// 获取手指尖位置
export function getFingerPosition(
  landmarks: HandLandmark[],
  finger: 'thumb' | 'index' | 'middle' | 'ring' | 'pinky'
) {
  const indices = {
    thumb: 4,
    index: 8,
    middle: 12,
    ring: 16,
    pinky: 20,
  };
  return landmarks[indices[finger]];
}

// 获取手腕位置
export function getWristPosition(landmarks: HandLandmark[]): HandLandmark {
  return landmarks[0];
}

// 计算手指指向角度
export function getFingerAngle(
  landmarks: HandLandmark[],
  finger: 'index' | 'middle' | 'ring' | 'pinky'
): number {
  const tip = getFingerPosition(landmarks, finger);
  const wrist = getWristPosition(landmarks);
  return Math.atan2(tip.y - wrist.y, tip.x - wrist.x);
}
