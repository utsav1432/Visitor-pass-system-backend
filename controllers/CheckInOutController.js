const CheckInOut = require('../models/CheckInOut');
const Pass = require('../models/Pass');
const Visitor = require('../models/Visitor');
const Appointment = require('../models/Appointment');

const scanQRCode = async (req, res) => {
    const { passId, appointmentId } = req.body;

    const securityId = req.user._id;

    try{
        let pass = null;

        if(appointmentId) {
            pass = await Pass.findOne({ appointment: appointmentId }).populate('visitor appointment');;
        }else if(passId) {
            pass = await Pass.findById(passId).populate('visitor appointment');
        }

        if(!pass) {
            return res.status(404).json({
                message: "Invalid QR Code"
            });
        }

        const appointment = pass.appointment;
        const visitor = pass.visitor;

        if(appointment.status !== 'approved') {
            return res.status(400).json({
                message: `Pass not approved (status: ${appointment.status})`
            });
        }

        if(new Date() > pass.validTill) {
            return res.status(400).json({
                message: 'Pass has expired' 
            });
        }

        const alreadyCheckedOut = await CheckInOut.findOne({ pass: pass._id, status: 'checked-out' });
        if (alreadyCheckedOut) {
            return res.status(400).json({ 
                message: 'Visitor already checked out' 
            });
        }

        const checkInOut = await CheckInOut.findOne({
            pass: pass._id,
            status: 'checked-in'
        });

        if(!checkInOut) {
            const checkIn = await CheckInOut.create({
                pass: pass._id,
                visitor: visitor._id,
                appointment: appointment._id,
                visitorName: visitor.name,
                visitorEmail: visitor.email,
                visitorMobileNo: visitor.mobileNo,
                visitorPurpose: visitor.purpose,
                visitDate: appointment.date,
                visitTime: appointment.time,
                checkInTime: new Date(),
                status: 'checked-in',
                verifiedBy: securityId 
            });

            return res.status(200).json({
                message: 'Visitor checked in successfully',
                checkInOut
            });
        } else {
            checkInOut.checkOutTime = new Date();
            checkInOut.status = 'checked-out';
            await checkInOut.save();

            pass.validTill = new Date();
            await pass.save();

            return res.status(200).json({
                message: 'Visitor checked out successfully',
                checkInOut
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};

const getAllchecks = async(req, res) => {
    try {
        const checks = await CheckInOut.find().populate('visitor appointment').sort({ createdAt: -1 });

        return res.status(200).json(checks);
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};

module.exports = { scanQRCode, getAllchecks };