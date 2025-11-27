const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const upload = require('./utils/upload');
const { protect, admin } = require('./auth');

// Create uploads directory if not exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// @route   POST /api/upload
// @desc    Upload single image
// @access  Private/Admin
router.post('/', protect, admin, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }
        
        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                filename: req.file.filename,
                path: `/uploads/${req.file.filename}`,
                size: req.file.size
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading image',
            error: error.message
        });
    }
});

// @route   POST /api/upload/multiple
// @desc    Upload multiple images
// @access  Private/Admin
router.post('/multiple', protect, admin, upload.array('images', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }
        
        const files = req.files.map(file => ({
            filename: file.filename,
            path: `/uploads/${file.filename}`,
            size: file.size
        }));
        
        res.json({
            success: true,
            message: 'Images uploaded successfully',
            data: files
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading images',
            error: error.message
        });
    }
});

// @route   DELETE /api/upload/:filename
// @desc    Delete image
// @access  Private/Admin
router.delete('/:filename', protect, admin, (req, res) => {
    try {
        const filePath = path.join(uploadDir, req.params.filename);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({
                success: true,
                message: 'Image deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting image',
            error: error.message
        });
    }
});

module.exports = router;
