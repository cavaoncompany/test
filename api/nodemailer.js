'use strict'

const express = require('express')
const nodemailer = require('nodemailer')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true, parameterLimit: 10000 }))

app.use(express.json())

const emailProviderDetails = {
  service: process.env.emailhost,
  username: process.env.emailusername,
  password: process.env.emailpassword
}

app.post('/', function (req, res) {
  const emailInfo = req.body.emailInfo
  const emailProvider = req.body.emailProvider
  const attachment = req.body.emailInfo.file
  sendGetEstimateMail(emailInfo, emailProvider, attachment)
  res.status(200).json({ 'message': 'Your mail was sent successfully' })
})

app.post('/contactUs', function (req, res) {
  const emailInfo = req.body.emailInfo
  const emailProvider = emailProviderDetails
  sendContactUsMail(emailInfo, emailProvider)
  res.status(200).json({ 'message': 'Your mail was sent successfully' })
})

app.post('/getEstimate', function (req, res) {
  const emailInfo = req.body.emailInfo
  const emailProvider = emailProviderDetails
  sendGetEstimateMail(emailInfo, emailProvider)
  res.status(200).json({ 'message': 'Your mail was sent successfully' })
})

module.exports = {
  path: '/api/nodemailer',
  handler: app
}

const sendContactUsMail = (emailInfo, emailProvider) => {
  const transporter = nodemailer.createTransport({
    host: emailProvider.service,
    port: 465,
    auth: {
      user: emailProvider.username,
      pass: emailProvider.password
    },
    tls: {
      rejectUnauthorized: false
    }
  })
  setTimeout(() => {
    transporter.sendMail({
      from: emailInfo.email,
      // to: ''
      to: `${emailProvider.username}`,
      subject: `${emailInfo.subject}`,
      html: `<h2>The following message has been received through the Contact us form on CSTF</h2>
          <p style="color:blue; margin-bottom: 10px;">Enquiry from: ${emailInfo.name}</p>
          <p style="margin-bottom: 10px;"><b>Email:</b> ${emailInfo.email}</p>
          <p style="margin-bottom: 10px;"><b>Phone:</b> ${emailInfo.phone}</p>
          <p style="margin-bottom: 10px;"><b>Message:</b> ${emailInfo.message}</p>`
    })
  }, 100)
}

const sendGetEstimateMail = (emailInfo, emailProvider) => {
  const transporter = nodemailer.createTransport({
    host: emailProvider.service,
    port: 465,
    auth: {
      user: emailProvider.username,
      pass: emailProvider.password
    },
    tls: {
      rejectUnauthorized: false
    }
  })
  setTimeout(() => {
    const attachments = []
    if (emailInfo.architecturalFile !== '') {
      const file1 = emailInfo.architecturalFile
      if (emailInfo.engineeringFile !== '') {
        const file2 = emailInfo.engineeringFile
        const buffer = Buffer.from(file1.split('base64,')[1], 'base64')
        attachments.push({ content: buffer, filename: emailInfo.architecturalPlan })
        const secondbuffer = Buffer.from(file2.split('base64')[1], 'base64')
        attachments.push({ content: secondbuffer, filename: emailInfo.engineeringPlan })
      } else {
        const buffer = Buffer.from(file1.split('base64,')[1], 'base64')
        attachments.push({ content: buffer, filename: emailInfo.architecturalPlan })
      }
    }

    transporter.sendMail({
      from: emailInfo.email,
      // to: ''
      to: `${emailProvider.username}`,
      subject: 'New quote request form',
      html: `<h2>The following message has been received through the Contact us form on www.cstf.com</h2>
        <p style="color:blue; margin-bottom: 10px;">Enquiry from: ${emailInfo.name}</p>
        <p style="margin-bottom: 10px;"><b>Email:</b> ${emailInfo.email}</p>
        <p style="margin-bottom: 10px;"><b>Company:</b> ${emailInfo.company}</p>
        <p style="margin-bottom: 10px;"><b>Project Type:</b> ${emailInfo.projectType}</p>
        <p style="margin-bottom: 10px;"><b>Profession:</b> ${emailInfo.profession}</p>
        <p style="margin-bottom: 10px;"><b>Type:</b> ${emailInfo.type}</p>
        <p style="margin-bottom: 10px;"><b>Detail:</b> ${emailInfo.detail}</p>
        <p style="margin-bottom: 10px;"><b>Detail Other:</b> ${emailInfo.detailOther}</p>
        <p style="margin-bottom: 10px;"><b>DA Approval:</b> ${emailInfo.DAApproval}</p>
        <p style="margin-bottom: 10px;"><b>Reason if no DA approval:</b> ${emailInfo.noDAApproval}</p>
        <p style="margin-bottom: 10px;"><b>Architectural plans:</b> ${emailInfo.architecturalPlans}</p>
        <p style="margin-bottom: 10px;"><b>Engineering plans:</b> ${emailInfo.engineeringPlans}</p>
        <p style="margin-bottom: 10px;"><b>Structural plans designed specifically for light gauge steel application:</b> ${emailInfo.structuralPlans}</p>
        <p style="margin-bottom: 10px;"><b>Quote for:</b> ${emailInfo.quoteFor}</p>
        <p style="margin-bottom: 10px;"><b>Start of project:</b> ${emailInfo.startProject}</p>
        `,
      attachments: attachments
    })
  }, 100)
}
