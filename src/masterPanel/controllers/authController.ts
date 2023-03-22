import myPrisma from '../../globalHelpers/myPrisma.js';
import { signMasterAccessToken, signMasterRefreshToken } from '../helpers/jwtHelper.js';

import bcrypt from 'bcrypt';

import { body } from 'express-validator';


class authController {




    static masterLoginValidationRules = () => {
        return [

            body('email')
                .isEmail()
                .normalizeEmail(),
            body('password')
                .isLength({ min: 8, max: 20 })
                .trim()


        ];
    };
    static masterLogin = async (req, res) => {
        const { email, password } = req.body;

        const masterExists = await myPrisma.all_masters.findFirst({
            where: {
                email: email
            }
        });

        // console.log(masterExists);


        if (!masterExists) {
            return res.json({
                status: 'error',
                msg: 'This Pc is not registered'
            });
        }
        const dbPassword = masterExists.password;
        const passwordMatch = bcrypt.compareSync(password, dbPassword);
        if (!passwordMatch) {
            return res.json({
                status: 'error',
                msg: 'Invalid Machine details'
            });
        }

        const masterId = masterExists.masterId;



        const accessToken = await signMasterAccessToken(masterId);
        const refreshToken = await signMasterRefreshToken(masterId);
        // success response
        return res.json({
            status: 'success',
            msg: 'Login success',

            accessToken: accessToken,
            refreshToken: refreshToken
        });


    };

    static refreshToken = async (req, res) => {

        let { masterId } = req.payload;
        masterId = +masterId;
        //    console.log(masterId);

        const accessToken = await signMasterAccessToken(masterId);
        return res.json({
            status: 'success',
            msg: 'token successfully refreshed',
            accessToken: accessToken
        });
    };
}

export default authController;