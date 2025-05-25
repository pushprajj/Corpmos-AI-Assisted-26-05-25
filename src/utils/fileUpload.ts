import fs from 'fs';
import path from 'path';

// Ensure the uploads directory exists
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Saves a file to the server's file system and returns the URL path
 * @param file The file to save
 * @returns The URL path to access the file
 */
export async function saveFileToServer(file: File): Promise<string> {
  // Generate a unique filename using timestamp and random number to prevent collisions
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const originalName = file.name;
  const fileExtension = path.extname(originalName);
  const fileName = `${timestamp}-${randomStr}${fileExtension}`;
  const filePath = path.join(uploadsDir, fileName);
  
  // Convert file to buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Write file to disk
  fs.writeFileSync(filePath, buffer);
  
  // Return the URL path
  return `/uploads/${fileName}`;
}
