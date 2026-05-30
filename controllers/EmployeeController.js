const Appointment = require('../models/Appointment');
const Visitor = require('../models/Visitor');
const Pass = require('../models/Pass');
const QRCode = require("qrcode");
const { sendEmail } = require('../modules/SendEmail');

const generatePassNumber = () => {
  return "PASS-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
};

const approveAppointment = async (req, res) => {
    const { appointmentId } = req.params;

    console.log('Received appointmentId:', req.params.appointmentId);
    try {
        const appointment = await Appointment.findById(appointmentId).populate('visitor');

        if(!appointment){
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        if (appointment.status !== 'pending'){
            return res.status(400).json({
                message: `Appointment already ${appointment.status}`
            })
        }

        appointment.status = "approved";
        await appointment.save();

        const qrData = JSON.stringify({
            appointmentId: appointment._id.toString(),
            visitorId: appointment.visitor._id.toString()
        });

        const qrCodeImage = await QRCode.toDataURL(qrData);

        appointment.qrCode = qrCodeImage;
        await appointment.save();

        const valid = new Date();
        valid.setDate(valid.getDate() + 1);

        const pass = await Pass.create({
            appointment: appointment._id,
            visitor: appointment.visitor._id,
            passNumber: generatePassNumber(),
            validTill: valid,
            qrCode: qrCodeImage
        });

        if (appointment.visitor.email) {
            await sendEmail(
                appointment.visitor.email,
                'Your visit is approved',
                `Your appointment for ${appointment.date.toDateString()} at ${appointment.time} has been approved. Your pass number is ${pass.passNumber}. Please Download your QR Pass from website.`,
            );
        }

        res.status(200).json({
            message: "Appointment approved, QR code and pass generated",
            appointment,
            pass
        })
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
};

const rejectAppointment = async (req, res) => {
    const { appointmentId } = req.params;

    console.log('Received appointmentId:', req.params.appointmentId);

    try {
        const appointment = await Appointment.findById(appointmentId);

        if(!appointment){
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        appointment.status = "rejected";
        await appointment.save();

        res.status(200).json({
            message: 'Appointment rejected',
            appointment
        });
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
};

const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find().populate('visitor').sort({ createdAt: -1 });
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
};

module.exports = { approveAppointment, rejectAppointment, getAllAppointments };