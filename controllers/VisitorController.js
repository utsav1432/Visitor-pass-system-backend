const User = require("../models/User");
const Visitor = require('../models/Visitor');
const Appointment = require('../models/Appointment');
const Pass = require('../models/Pass');
const PDFDocument = require('pdfkit');

const registerVisitor = async(req, res) => {
    const { name, gender, age, email, mobileNo, purpose, visitDate, time } = req.body;

    if (!name, !gender, !age, !email, !mobileNo, !purpose, !visitDate, !time ) {
        return res.status(400).json({
            message: "Missing required fields"
        });
    }

    try {
        const existingMobile = await Visitor.findOne({ mobileNo });
        if (existingMobile){
            return res.status(400).json({
                message: "Mobile number already registered"
            });
        }

        const visitor = await Visitor.create({
            name,
            gender,
            age,
            email,
            mobileNo,
            purpose
        });

        const appointment = await Appointment.create({
            visitor: visitor._id,
            date: new Date(visitDate),
            time,
            status: "pending"
        });

        res.status(201).json({
            message: "Visitor registered. Appointment request has been sent.",
            visitor,
            appointment
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const getAllVisitors = async (req, res) => {
    try {
        const visitor = await Visitor.find().sort({ createdAt: -1 });
        res.status(200).json(visitor);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const getVisitorById = async (req, res) => {
    const { id } = req.params;

    try {
        const visitor = await Visitor.findById(id);
        if (!visitor){
            return res.status(404).json({
                message: "Visitor not found"
            });
        }

        res.status(200).json(visitor);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const downloadPassPDF = async(req, res) => {
    const { email } = req.body;

    try {
        const visitor = await Visitor.findOne({ email });
        if (!visitor){
            return res.status(404).json({ 
                message: 'No visitor found with this email' 
            });
        }

        const appointment = await Appointment.findOne({ visitor: visitor._id, status: 'approved' }).sort({ createdAt: -1 });
        if (!appointment){
            return res.status(404). json({
                message: 'No approved appointment found for this email'
            });
        }


        const pass = await Pass.findOne({ appointment: appointment._id }).populate('appointment visitor');
        if(!pass){
            return res.status(404).json({
                message: 'Pass not found for this appointment'
            });
        }

        if (pass.appointment.status !== 'approved'){
            return res.status(403).json({
                message: 'Appointment not approved yet'
            });
        }

        const visitDate = pass.appointment.date.toLocaleDateString();

        const passValidTill = pass.validTill.toLocaleDateString();

        res.contentType('application/pdf');
        res.attachment(`${pass.passNumber}.pdf`);

        const document = new PDFDocument({ size: 'A4', layout: 'portrait' });

        document.pipe(res);

        document.fontSize(32).text("Visitor Pass", { align: "center" });

        document.moveDown();

        document.fontSize(14).text(`Pass Number: ${pass.passNumber}`, { align: "center" });
        document.fontSize(14).text(`Appointment Id: ${pass.appointment._id}`, { align: "center" });
        document.fontSize(16).text(`Visitor Name: ${pass.visitor.name}`, { align: "center" });
        document.fontSize(16).text(`Visit Purpose: ${pass.visitor.purpose}`, { align: "center" });
        document.fontSize(16).text(`Visit Date: ${visitDate}`, { align: "center" });
        document.fontSize(16).text(`Visit Time: ${pass.appointment.time}`, { align: "center" });
        document.fontSize(16).text(`Valid Till: ${passValidTill}`, { align: "center" });

        if(pass.qrCode){
            const qrImage = Buffer.from(
                pass.qrCode.split(',')[1],
                "base64"
            );

            document.image(qrImage, { fit: [450, 450], align: 'center', valign: 'center' });
        }

        document.end();
    } catch (error) { 
        res.status(500).json({
            error: error.message,
        });
    }
};

module.exports = { registerVisitor, getAllVisitors, getVisitorById, downloadPassPDF };