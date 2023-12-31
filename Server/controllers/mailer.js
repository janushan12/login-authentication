import Mailgen from 'mailgen';
import nodemailer from 'nodemailer';

import ENV from '../config.js';

// https://ethereal.email/create
let nodeConfig = {
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: ENV.EMAIL, //generated ethereal user
    pass: ENV.PASSWORD, //generated ethereal password
  },
};

let transporter = nodemailer.createTransport(nodeConfig);

let MailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: 'Mailgen',
    link: 'https://mailgen.js',
  },
});

/**POST: http://localhost:8080/api/registerMail
 * @param: {
  "username":"Janushan",
  "userEmail":"jnau123@gmail.com",
  "text":"",
  "subject":""
  }
 */
export const registerMail = async (req, res) => {
  const { username, userEmail, text, subject } = req.body;

  //body of the email
  var email = {
    body: {
      name: username,
      intro: text || 'Hello Guys',
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };

  var emailBody = MailGenerator.generate(email);

  let message = {
    from: ENV.EMAIL,
    to: userEmail,
    subject: subject || `Welcome ${username}, you're almost there!`,
    html: emailBody.html,
  };

  //send mail
  transporter
    .sendMail(message)
    .then(() => {
      return res
        .status(200)
        .send({ msg: 'You should receive an email from us.' });
    })
    .catch((err) => {
      res.status(500).send({ err });
    });
};
