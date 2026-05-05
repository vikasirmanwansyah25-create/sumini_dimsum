import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function deleteImageFromCloudinary(imageUrl: string): Promise<boolean> {
  try {
    if (!imageUrl) return true;

    const publicId = extractPublicId(imageUrl);
    if (!publicId) {
      console.warn('Could not extract public ID from URL:', imageUrl);
      return false;
    }

    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return false;
  }
}

function extractPublicId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const matches = pathname.match(/\/v\d+\/(.+)\.\w+$/);
    if (matches && matches[1]) {
      return matches[1];
    }
    return null;
  } catch {
    return null;
  }
}

export default cloudinary;
