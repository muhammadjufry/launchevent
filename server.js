const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
app.use(bodyParser.json());

  
const fs = require('fs');
// Read the JSON file
const teamMembersData = fs.readFileSync('./teamMembers.json');
const teamMembers = JSON.parse(teamMembersData);

// Iterate over the email addresses and set initial approval status to false
for (let email of Object.keys(teamMembers)) {
  teamMembers[email] = false;
}

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'amanda58@ethereal.email',
    pass: 'VwGv7ey6WJhGTQCpgh'
  }
});

app.get('/launch', (req, res) => {
  let allClicked = Object.values(teamMembers).every(clicked => clicked);
  if (allClicked) {
    // Trigger launch event
    console.log('Launch event triggered!');
    sendEmailToAll('Site is live now!', true);
    sendEmailToAdmin('All team members have approved!');
    res.sendFile(__dirname + '/public/launch.html');
  } else {
    res.send('Not all team members have clicked the link yet.');
  }
});

app.get('/click/:email', (req, res) => {
  let email = req.params.email;
  if (email in teamMembers) {
    teamMembers[email] = true;
    res.sendFile(__dirname + '/public/thankyou.html');
  } else {
    res.send('Invalid email address.');
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

function sendEmailToAll(message, includeButton = false) {
  for (let email in teamMembers) {
    let mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Site Launch',
      html: `
        <h1>Site Launch</h1>
        <p>${message}</p>
        ${includeButton ? '<a href="#" class="button">Visit Site</a>' : ''}
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent to ' + email + ': ' + info.response);
      }
    });
  }
}



function sendEmailToAdmin(message) {
  let mailOptions = {
    from: 'your-email@gmail.com',
    to: 'admin@example.com',
    subject: 'Site Launch',
    html: `
      <h1>Site Launch</h1>
      <p>${message}</p>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent to admin: ' + info.response);
    }
  });
}
