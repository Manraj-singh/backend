import { Request, Response } from 'express';
import { userModel as User } from '../models/user';
import { default as passport } from 'passport';
import { default as jwt } from 'jsonwebtoken';
import { sendOTP } from '../utils/sendOTP';

// signing up
export const signup = (req: Request, res: Response) => {
  const user = new User(req.body);
  user
    .save()
    .then(() => {
      res.status(200).json({
        status: true,
        data: 'SIGNUP_SUCCESSFUL',
        path: req.path,
        timestamp: Math.trunc(Date.now() / 1000),
      });
    })
    .catch((err: any) => {
      res.status(500).json({
        status: false,
        data: 'ERROR_OCCURRED',
        error: err,
        path: req.path,
        timestamp: Math.trunc(Date.now() / 1000),
      });
    });
};

// logging in
export const login = (req: Request, res: Response) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    // if any err found
    if (err) {
      return res.status(500).send({
        status: false,
        data: 'ERROR_OCCURRED',
        error: err,
        path: req.path,
        timestamp: Math.trunc(Date.now() / 1000),
      });
    }

    // if user not found
    if (!user) {
      return res.status(500).send({
        status: false,
        data: info.message,
        path: req.path,
        timestamp: Math.trunc(Date.now() / 1000),
      });
    }

    // if user found generate jwt
    const payload = {
      name: user.name,
      email: user.email,
      sub: user._id,
    };

    const options = {
      expiresIn: 900,
    };
    jwt.sign(payload, 'ooug2011', options, (err, token) => {
      res.status(200).send({
        status: true,
        token: token,
        User: {
          name: user.name,
          email: user.email,
        },
      });
    });
  })(req, res);
};

// send OTP
export const sendOtp = (req: Request, res: Response) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.send({
          status: false,
          message: 'EMAIL_NOT_REGISTERED',
          path: req.path,
          timestamp: Math.trunc(Date.now() / 1000),
        });
      }
      sendOTP(req.body.email)
        .then((otp) => {
          res.send({
            status: true,
            message: 'EMAIL_SENT',
            otp: otp,
            path: req.path,
            timestamp: Math.trunc(Date.now() / 1000),
          });
        })
        .catch((err) => {
          res.send({
            status: false,
            message: 'ERROR_OCCURRED',
            error: err,
            path: req.path,
            timestamp: Math.trunc(Date.now() / 1000),
          });
        });
    })
    .catch((err) => {
      res.send({
        status: false,
        message: 'ERROR_OCCURRED',
        error: err,
        path: req.path,
        timestamp: Math.trunc(Date.now() / 1000),
      });
    });
};
