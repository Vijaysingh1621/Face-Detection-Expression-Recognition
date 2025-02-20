"use client";
import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { loadModels } from "@/utils/faceApi";

const FaceDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [expressions, setExpressions] = useState({});

  useEffect(() => {
    const startVideo = async () => {
      try {
        await loadModels();
        navigator.mediaDevices
          .getUserMedia({ video: {} })
          .then((stream) => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          });
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    startVideo();
  }, []);

  useEffect(() => {
    const detectFaces = async () => {
      if (!videoRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const displaySize = { width: video.videoWidth, height: video.videoHeight };

      faceapi.matchDimensions(canvas, displaySize);

      setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

        if (detections.length > 0) {
          setExpressions(detections[0].expressions);
        }
      }, 500);
    };

    videoRef.current?.addEventListener("loadedmetadata", detectFaces);
  }, []);

  return (
    <div className="flex flex-col items-center">
      <video ref={videoRef} autoPlay playsInline className="w-[500px] h-auto" />
      <canvas ref={canvasRef} className="absolute top-0 left-0" />
      <div className="mt-4 text-lg font-semibold">
        {expressions &&
          Object.entries(expressions).map(([expression, value]) => (
            <p key={expression}>
              {expression}: {(value * 100).toFixed(2)}%
            </p>
          ))}
      </div>
    </div>
  );
};

export default FaceDetection;