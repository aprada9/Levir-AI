import express from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const upload = multer();

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create form data for the Edge Function
    const formData = new FormData();
    const blob = new Blob([file.buffer], { type: file.mimetype });
    formData.append('file', blob, file.originalname);

    const { data: functionData, error: functionError } = await supabase.functions.invoke(
      'process-ocr',
      {
        body: formData,
      }
    );

    if (functionError) {
      throw new Error(`Function error: ${functionError.message}`);
    }

    res.json(functionData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 