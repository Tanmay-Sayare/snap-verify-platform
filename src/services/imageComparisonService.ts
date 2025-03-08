
/**
 * An improved image comparison service for face recognition.
 * This implementation uses a basic pixel-based approach for demonstration.
 * For a production app, you would want to use a specialized face recognition API or library.
 */

/**
 * Converts an image to grayscale pixel data for comparison
 */
const getImageData = async (imageUrl: string): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Set canvas to image dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image to canvas
      ctx.drawImage(img, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      resolve(imageData);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
};

/**
 * Calculate the average color of sections in the image
 * This divides the image into a grid and compares the color averages
 */
const calculateImageSignature = (imageData: ImageData, gridSize = 8): number[] => {
  const { width, height, data } = imageData;
  const signature: number[] = [];
  
  const cellWidth = Math.floor(width / gridSize);
  const cellHeight = Math.floor(height / gridSize);
  
  // Process each grid cell
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      let totalR = 0, totalG = 0, totalB = 0;
      let pixelCount = 0;
      
      // Get the average color in this cell
      for (let cy = 0; cy < cellHeight; cy++) {
        for (let cx = 0; cx < cellWidth; cx++) {
          const pixelX = x * cellWidth + cx;
          const pixelY = y * cellHeight + cy;
          
          if (pixelX < width && pixelY < height) {
            const i = (pixelY * width + pixelX) * 4;
            totalR += data[i];
            totalG += data[i + 1];
            totalB += data[i + 2];
            pixelCount++;
          }
        }
      }
      
      // Store average RGB values for this cell
      if (pixelCount > 0) {
        signature.push(Math.floor(totalR / pixelCount));
        signature.push(Math.floor(totalG / pixelCount));
        signature.push(Math.floor(totalB / pixelCount));
      }
    }
  }
  
  return signature;
};

/**
 * Calculate similarity between two image signatures
 */
const calculateSimilarity = (signature1: number[], signature2: number[]): number => {
  // Ensure signatures are the same length
  const length = Math.min(signature1.length, signature2.length);
  
  // Calculate Manhattan distance (sum of absolute differences)
  let totalDifference = 0;
  const maxPossibleDiff = 255 * length; // Maximum possible difference (if all pixels were black vs white)
  
  for (let i = 0; i < length; i++) {
    totalDifference += Math.abs(signature1[i] - signature2[i]);
  }
  
  // Convert to similarity percentage (100% means identical, 0% means completely different)
  const similarity = 100 - (totalDifference / maxPossibleDiff * 100);
  return Math.max(0, Math.min(100, similarity)); // Ensure between 0-100
};

/**
 * Focus on face region by finding the center portion of the image
 * This is a simple approximation - real face detection would be better
 */
const extractFaceRegion = (imageData: ImageData): ImageData => {
  const { width, height, data } = imageData;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Estimate face region (center of image)
  const faceWidth = Math.floor(width * 0.5); // 50% of width
  const faceHeight = Math.floor(height * 0.5); // 50% of height
  const startX = Math.floor((width - faceWidth) / 2);
  const startY = Math.floor((height - faceHeight) / 3); // Slightly above center
  
  // Create new canvas for face region
  canvas.width = faceWidth;
  canvas.height = faceHeight;
  
  // Draw the face region to the new canvas
  ctx.putImageData(
    imageData, 
    -startX, -startY, 
    startX, startY, 
    faceWidth, faceHeight
  );
  
  // Return the face region image data
  return ctx.getImageData(0, 0, faceWidth, faceHeight);
};

/**
 * Compare two images and return a similarity score (0-100)
 */
export const compareImages = async (
  image1: string,
  image2: string
): Promise<number> => {
  try {
    console.log('Comparing images...');
    
    // Get image data from URLs
    const imageData1 = await getImageData(image1);
    const imageData2 = await getImageData(image2);
    
    console.log(`Image 1 size: ${imageData1.width}x${imageData1.height}`);
    console.log(`Image 2 size: ${imageData2.width}x${imageData2.height}`);
    
    // Extract face regions
    const faceData1 = extractFaceRegion(imageData1);
    const faceData2 = extractFaceRegion(imageData2);
    
    // Calculate image signatures
    const signature1 = calculateImageSignature(faceData1, 12); // Use a finer grid
    const signature2 = calculateImageSignature(faceData2, 12);
    
    // Calculate similarity
    const similarity = calculateSimilarity(signature1, signature2);
    
    console.log(`Similarity score: ${similarity.toFixed(2)}%`);
    
    // Return the similarity score
    return similarity;
  } catch (error) {
    console.error('Error comparing images:', error);
    throw new Error('Failed to compare images');
  }
};

/**
 * Determines if the comparison score is a match
 * Using a higher threshold (80) for better accuracy
 */
export const isMatch = (score: number, threshold = 80): boolean => {
  return score >= threshold;
};
