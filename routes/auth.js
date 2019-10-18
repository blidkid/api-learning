const router = require('express').Router();
const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');
const secret = config.get('TOKEN_SECRET.token');
const { registerValidation, mobileValidation, loginValidation, emailValidation, passwordValidation } = require('../validation');

const accountSid = config.get('TWILIO.accountSid');
const authToken = config.get('TWILIO.authToken');
const serviceSid = config.get('TWILIO.serviceSid');
const twilio = require('twilio')(accountSid, authToken);


router.post('/register', async (req, res) => {
    console.log(req.body);

    const { error } = await registerValidation(req.body);
    if (error) return res.status(400).send({error:error.details[0].message});

    let emailValid = await emailValidation(req.body.email );

    if( !emailValid)
        return res.status(400).send({error:"You must enter a valid email address"});

    let mobileValid = await mobileValidation(req.body.mobile );

    if( !mobileValid )
        return res.status(400).send({error:"You must enter a valid UK number"});

    let passwordValid = await passwordValidation(req.body.password );

    if( !passwordValid )
        return res.status(400).send({error:"You password must contain 8 letters with at least one number"});
    
    let emailExist = await User.findOne({ email: req.body.email });
    let userNameExist = await User.findOne({ userName: req.body.userName });
    let mobileExist = await User.findOne({ mobile: req.body.mobile });

    if (userNameExist) 
      return res.status(400).send({error:"Username already in use"});

    if (mobileExist) 
      return res.status(400).send({error:"Mobile number already in use"});

    if (emailExist)
      return res.status(400).send({error:"Email already exits with different account"});


    //Security hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    let user = new User({
        email: req.body.email,
        userName: req.body.userName,
        password: hashedPassword,
        mobile: req.body.mobile,
        isAuthenticated: false,
    });

    
    try {
    let savedUser = await user.save();
       //Logged in Create Token
    const token = jwt.sign({_id: user._id}, secret, { expiresIn: 30 * 60 });
    res.header('auth-token', token).send(
        {
            isSucess: true,
            user:{
                id: user._id,
                mobile: user.mobile, 
                authToken: token,
                isAuthenticated: user.isAuthenticated
            }
        });
    } catch (error) {
        res.status(400).send({error:error});
    }

    try {
        await twilio.verify.services(serviceSid)
        .verifications
        .create({to: '+447759737228', channel: 'sms'})
        .then(verification => console.log(verification.status));
    } catch (error) {
        res.status(400).send({error:"Verification system is unavailable"});
    }
});

router.post('/login', async (req, res) => {
    console.log(req.body);
    const { error } = await loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    console.log(req.body);

    let emailExist = await User.findOne({ email: req.body.email });
    let userNameExist = await User.findOne({ userName: req.body.email });
    let mobileExist = await User.findOne({ mobile: req.body.email });

    let user;

    //Checking in which Id user decided to use.
    if (!userNameExist) 
        if (!mobileExist)
            if (!emailExist)
                return res.status(401).send({error:"Incorrect email or password. Please try again"});
            else
                user = emailExist;
        else
            user = mobileExist;
    else
        user = userNameExist;


    //Password Validation   
    let validPass = await bcrypt.compare(req.body.password, user.password);
    
    if(!validPass)
        return res.status(401).send({error:"Incorrect email or password. Please try again"});

    //Logged in Create Token
    const token = jwt.sign({_id: user._id}, secret, { expiresIn: 30 * 60 });
    res.header('auth-token', token).send(
        {
            isSucess: true,
            user:{
                id: user._id, 
                firstName: user.firstName, 
                mobile: user.mobile, 
                authToken: token,
                isAuthenticated: user.isAuthenticated 
            }
        });

    //Done
    //res.status(200).send("Logged In");
  
});

router.post('/verify', async (req, res) => {
    console.log(req.body);

    let mobileExist = await User.findOne({ mobile: req.body.mobile });

    if (!mobileExist)
      return res.status(400).send({error:"The phone number you are using does not exist"});

    user = mobileExist;

    let verificationStatus;

    try {
        await twilio.verify.services(serviceSid)
        .verificationChecks
        .create({to: req.body.mobile, code: req.body.code})
        .then(verification_check => (verificationStatus = verification_check.status));

         console.log(verificationStatus);
        if( verificationStatus == 'pending') {
            res.status(401).send({error:"Invalid activation code"});
        }
        else if(verificationStatus == 'approved' ){
            try {
                await User.updateOne({_id: user._id}, {isAuthenticated: true})
                user = User.findOne({ mobile: req.body.mobile }); /// FIx this error
                res.status(200).send(
                    {
                        isSucess: true,
                        user:{
                            id: user._id, 
                            firstName: user.firstName, 
                            mobile: user.mobile, 
                            isAuthenticated: user.isAuthenticated 
                        }
                    });
            } catch (error) {
                res.status(400).send({error:"Unable to verify user"});
            }
        }
        else{
            res.status(400).send({error:"Verification system is unavailable"});
        }

    } catch (error) {
        console.log(error)
        res.status(400).send({error:"Verification system is unavailable"});
    }
});


module.exports = router;
