const Employee = require('../models/Employee');
const axios = require('axios');

// ML Service URL (face recognition microservice)
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

// Face matching threshold (cosine similarity)
const FACE_MATCH_THRESHOLD = parseFloat(process.env.FACE_MATCH_THRESHOLD) || 0.45;

/**
 * Register face embedding for authenticated user
 * @route POST /api/face/register
 * @access Protected
 */
const registerFace = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'Image is required'
      });
    }

    const employeeId = req.employee._id;

    // Call ML service to extract embedding
    console.log('Calling ML service to extract face embedding...');
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/embed`, {
      image: image
    }, {
      timeout: 10000 // 10 second timeout
    });

    const { embedding, confidence, bbox } = mlResponse.data;

    // Check confidence threshold
    if (confidence < 0.7) {
      return res.status(400).json({
        success: false,
        error: 'Face detection confidence too low. Please ensure good lighting and face the camera directly.'
      });
    }

    // Update employee with face embedding
    const employee = await Employee.findById(employeeId);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    employee.faceEmbedding = embedding;
    employee.faceRegisteredAt = new Date();
    await employee.save();

    console.log(`Face registered successfully for employee ${employeeId}`);

    res.status(200).json({
      success: true,
      message: 'Face registered successfully',
      data: {
        confidence: confidence,
        registeredAt: employee.faceRegisteredAt
      }
    });

  } catch (error) {
    console.error('Face registration error:', error.message);

    if (error.response?.status === 400) {
      return res.status(400).json({
        success: false,
        error: error.response.data.detail || 'No face detected. Please try again.'
      });
    }

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'Face recognition service unavailable. Please contact administrator.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to register face. Please try again.'
    });
  }
};

/**
 * Verify face against registered employees
 * @route POST /api/face/verify
 * @access Public (used before check-in)
 */
const verifyFace = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'Image is required'
      });
    }

    // Call ML service to extract embedding from submitted image
    console.log('Extracting face embedding from submitted image...');
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/embed`, {
      image: image
    }, {
      timeout: 10000
    });

    const { embedding, confidence } = mlResponse.data;

    // Check confidence threshold
    if (confidence < 0.7) {
      return res.status(400).json({
        success: false,
        error: 'Face detection confidence too low. Please ensure good lighting.'
      });
    }

    // Normalize the input embedding
    const normalizeVector = (vec) => {
      const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
      return vec.map(val => val / (norm || 1));
    };

    const normalizedInput = normalizeVector(embedding);

    // Get all employees with registered faces
    const employees = await Employee.find({
      faceEmbedding: { $exists: true, $ne: [] }
    }).select('_id name email department faceEmbedding');

    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No registered faces found in system'
      });
    }

    console.log(`Comparing against ${employees.length} registered faces...`);

    // Find best match using cosine similarity
    let bestMatch = null;
    let bestScore = -1;

    for (const employee of employees) {
      if (!employee.faceEmbedding || employee.faceEmbedding.length === 0) {
        continue;
      }

      // Normalize stored embedding
      const normalizedStored = normalizeVector(employee.faceEmbedding);

      // Compute cosine similarity (dot product of normalized vectors)
      const similarity = normalizedInput.reduce(
        (sum, val, idx) => sum + val * normalizedStored[idx],
        0
      );

      if (similarity > bestScore) {
        bestScore = similarity;
        bestMatch = employee;
      }
    }

    console.log(`Best match score: ${bestScore.toFixed(4)}, Threshold: ${FACE_MATCH_THRESHOLD}`);

    // Check if best match meets threshold
    if (bestMatch && bestScore >= FACE_MATCH_THRESHOLD) {
      console.log(`Face verified successfully: ${bestMatch.email} (score: ${bestScore.toFixed(4)})`);

      return res.status(200).json({
        success: true,
        message: 'Face verified successfully',
        data: {
          matched: true,
          employeeId: bestMatch._id,
          name: bestMatch.name,
          email: bestMatch.email,
          department: bestMatch.department,
          confidence: bestScore
        }
      });
    } else {
      console.log(`Face verification failed. Best score: ${bestScore.toFixed(4)}`);

      return res.status(401).json({
        success: false,
        error: 'Face not recognized. Please ensure you are registered or contact administrator.',
        data: {
          matched: false,
          bestScore: bestScore
        }
      });
    }

  } catch (error) {
    console.error('Face verification error:', error.message);

    if (error.response?.status === 400) {
      return res.status(400).json({
        success: false,
        error: error.response.data.detail || 'No face detected. Please try again.'
      });
    }

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'Face recognition service unavailable. Please contact administrator.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Face verification failed. Please try again.'
    });
  }
};

/**
 * Delete face registration for authenticated user
 * @route DELETE /api/face/register
 * @access Protected
 */
const deleteFaceRegistration = async (req, res) => {
  try {
    const employeeId = req.employee._id;

    const employee = await Employee.findById(employeeId);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    if (!employee.faceEmbedding || employee.faceEmbedding.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No face registration found'
      });
    }

    employee.faceEmbedding = [];
    employee.faceRegisteredAt = null;
    await employee.save();

    console.log(`Face registration deleted for employee ${employeeId}`);

    res.status(200).json({
      success: true,
      message: 'Face registration deleted successfully'
    });

  } catch (error) {
    console.error('Delete face registration error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete face registration'
    });
  }
};

/**
 * Check if user has registered face
 * @route GET /api/face/status
 * @access Protected
 */
const getFaceStatus = async (req, res) => {
  try {
    const employeeId = req.employee._id;

    const employee = await Employee.findById(employeeId).select('faceRegisteredAt');
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    const hasRegisteredFace = employee.faceRegisteredAt !== null;

    res.status(200).json({
      success: true,
      data: {
        hasRegisteredFace,
        registeredAt: employee.faceRegisteredAt
      }
    });

  } catch (error) {
    console.error('Get face status error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get face status'
    });
  }
};

module.exports = {
  registerFace,
  verifyFace,
  deleteFaceRegistration,
  getFaceStatus
};
