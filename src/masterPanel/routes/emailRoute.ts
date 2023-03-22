import express from 'express';
import { validate } from '../../globalHelpers/validate.js';
import emailController from '../controllers/emailController.js';



const router = express.Router();

export { router as emailRoute };

// define the home page route
router.get('/', (req, res) => {
    res.json({
        status: 'success',
        msg: 'Welcome to admin panel/email'
    });

});

router.post('/sendVerificationEmail', emailController.sendVerificationEmailValidationRules(), validate, emailController.sendVerificationEmail);
router.post('/checkVerificationLink', emailController.checkVerificationLinkValidationRules(), validate, emailController.checkVerificationLink);

router.post('/sendPasswordResetEmail', emailController.sendPasswordResetEmailValidationRules(), validate, emailController.sendPasswordResetEmail);
router.post('/checkPasswordResetLink', emailController.checkPasswordResetLinkValidationRules(), validate, emailController.checkPasswordResetLink); 
