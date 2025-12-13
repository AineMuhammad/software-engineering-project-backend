const User = require('../models/User');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');

// Initialize Firebase Admin if available
let firebaseAdminInitialized = false;
if (!admin.apps.length) {
  try {
    let serviceAccount;
    
    // Try to use environment variable first (for production/Render)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // FIREBASE_SERVICE_ACCOUNT should be a JSON string of the entire service account
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      console.log('Using Firebase Admin from FIREBASE_SERVICE_ACCOUNT environment variable');
    } else {
      // Fallback to serviceAccountKey.json file (for local development)
      try {
        serviceAccount = require('../serviceAccountKey.json');
        console.log('Using Firebase Admin from serviceAccountKey.json file');
      } catch (fileError) {
        throw new Error('Firebase service account not found. Please provide FIREBASE_SERVICE_ACCOUNT env var or serviceAccountKey.json file.');
      }
    }
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseAdminInitialized = true;
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    // Firebase Admin not available - Google sign-in won't work with backend
    console.warn('Firebase Admin not initialized:', error.message);
    console.warn('Google sign-in will not work until Firebase Admin is properly configured.');
  }
}

// Generate JWT Token
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const signin = async (req, res) => {
  try {
    const { email, password, firebaseToken } = req.body;

    // Handle Firebase/Google authentication
    if (firebaseToken) {
      if (!firebaseAdminInitialized) {
        console.error('Firebase Admin not initialized - check FIREBASE_SERVICE_ACCOUNT env var');
        return res.status(500).json({
          success: false,
          message: 'Firebase Admin not initialized. Google sign-in is not available.',
        });
      }

      try {
        // Verify Firebase token
        console.log('Verifying Firebase token...');
        const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
        const { uid, email: firebaseEmail, name } = decodedToken;
        console.log('Firebase token verified for:', firebaseEmail);

        // Note: Mongoose will handle connection retries automatically
        // We don't need to check readyState as Mongoose buffers operations when disconnected
        // and will execute them when reconnected

        // Find or create user with timeout
        console.log('Searching for user with firebaseUid:', uid);
        const startTime = Date.now();
        let user = await User.findOne({ firebaseUid: uid });
        console.log(`User lookup by firebaseUid took ${Date.now() - startTime}ms`);
        
        if (!user) {
          // Check if user exists with this email
          console.log('User not found by firebaseUid, checking email:', firebaseEmail);
          const emailStartTime = Date.now();
          user = await User.findOne({ email: firebaseEmail });
          console.log(`User lookup by email took ${Date.now() - emailStartTime}ms`);
          
          if (user) {
            // Link Firebase UID to existing user
            user.firebaseUid = uid;
            await user.save();
          } else {
            // Create new user (password not required for Firebase users)
            user = new User({
              name: name || firebaseEmail?.split('@')[0] || 'User',
              email: firebaseEmail,
              firebaseUid: uid,
              password: 'firebase-auth-' + uid, // Dummy password for schema validation
            });
            await user.save();
          }
        }

        // Generate JWT token
        const token = generateToken(user._id);

        return res.status(200).json({
          success: true,
          message: 'Sign in successful',
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
          },
        });
      } catch (firebaseError) {
        console.error('Firebase token verification error:', firebaseError);
        return res.status(401).json({
          success: false,
          message: 'Invalid Firebase token',
        });
      }
    }

    // Handle email/password authentication
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if password matches
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Return success response with token
    res.status(200).json({
      success: true,
      message: 'Sign in successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    
    // Handle JWT errors
    if (error.message && error.message.includes('JWT_SECRET')) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error. Please contact administrator.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during sign in',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = { signin };

