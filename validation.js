const Joi = require('@hapi/joi');


const registerValidation = async data => {

    let schema = Joi.object({
        email: Joi.string().min(3).max(255).required(),
        userName: Joi.string().min(4).max(12).required(),
        password: Joi.string().min(6).required(),
        mobile: Joi.string().min(11).required()
    });


    return await schema.validate(data);
};

const mobileValidation = async number => {
    let regex = /((07)|((\+|00)447)){1}[0-9]{9}\b/;
    result = regex.test(number);

    return result;
};

const emailValidation = async email => {
    var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    result =  regex.test(email);

    return result;
  }

const passwordValidation = async password => {
    var regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
    result =  regex.test(password);

    return result;
}

const loginValidation = async data => {

    let schema = Joi.object({
        userName: Joi.string().min(4).max(12),
        email: Joi.string().min(3).max(255),
        mobile: Joi.string().min(3).max(255),
        password: Joi.string().min(5).required(),
    });

    return await schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.mobileValidation = mobileValidation;
module.exports.emailValidation = emailValidation;
module.exports.passwordValidation = passwordValidation;