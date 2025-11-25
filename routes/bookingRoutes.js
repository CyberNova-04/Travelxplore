const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// Create Stripe checkout session
router.post('/create-checkout-session', verifyToken, async (req, res) => {
    try {
        const { packageId, guests, travelDate } = req.body;
        const userId = req.user.id;

        console.log('📦 Creating checkout for package:', packageId);

        // Get package details
        const [packages] = await db.execute(
            'SELECT * FROM packages WHERE id = ?',
            [packageId]
        );

        if (!packages.length) {
            return res.status(404).json({ success: false, message: 'Package not found' });
        }

        const pkg = packages[0];
        const totalAmount = parseFloat(pkg.price) * parseInt(guests);

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: pkg.title,
                        description: `${guests} guests • ${pkg.duration_days} days`,
                        images: [pkg.image ? `${process.env.BASE_URL || 'http://localhost:3000'}${pkg.image}` : undefined].filter(Boolean),
                    },
                    unit_amount: Math.round(pkg.price * 100), // Convert to cents
                },
                quantity: parseInt(guests),
            }],
            mode: 'payment',
            success_url: `${process.env.BASE_URL || 'http://localhost:3000'}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.BASE_URL || 'http://localhost:3000'}/package/${packageId}?booking=cancelled`,
            metadata: {
                packageId: packageId.toString(),
                userId: userId.toString(),
                guests: guests.toString(),
                travelDate: travelDate || 'Not specified'
            }
        });

        // Save booking to database with pending status
        await db.execute(
            `INSERT INTO bookings (user_id, package_id, guests, travel_date, total_amount, stripe_session_id, status) 
             VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
            [userId, packageId, guests, travelDate, totalAmount, session.id]
        );

        console.log('✅ Checkout session created:', session.id);

        res.json({ 
            success: true, 
            sessionId: session.id,
            url: session.url 
        });

    } catch (error) {
        console.error('❌ Checkout error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create checkout session',
            error: error.message 
        });
    }
});

// Verify payment and complete booking
router.get('/verify-payment/:sessionId', verifyToken, async (req, res) => {
    try {
        const { sessionId } = req.params;

        // Retrieve session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            // Update booking status
            await db.execute(
                `UPDATE bookings SET status = 'confirmed', payment_status = 'paid' 
                 WHERE stripe_session_id = ?`,
                [sessionId]
            );

            // Get booking details
            const [bookings] = await db.execute(
                `SELECT b.*, p.title as package_name, u.email 
                 FROM bookings b
                 JOIN packages p ON b.package_id = p.id
                 JOIN users u ON b.user_id = u.id
                 WHERE b.stripe_session_id = ?`,
                [sessionId]
            );

            res.json({ 
                success: true, 
                booking: bookings[0],
                message: 'Booking confirmed!' 
            });
        } else {
            res.json({ 
                success: false, 
                message: 'Payment not completed' 
            });
        }

    } catch (error) {
        console.error('❌ Verify payment error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to verify payment' 
        });
    }
});

// Get user bookings
router.get('/my-bookings', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const [bookings] = await db.execute(
            `SELECT b.*, p.title, p.image, p.duration_days, d.name as destination_name
             FROM bookings b
             JOIN packages p ON b.package_id = p.id
             JOIN destinations d ON p.destination_id = d.id
             WHERE b.user_id = ?
             ORDER BY b.created_at DESC`,
            [userId]
        );

        res.json({ success: true, bookings });

    } catch (error) {
        console.error('❌ Get bookings error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
    }
});

// Admin: Get all bookings
router.get('/all', verifyToken, async (req, res) => {
    try {
        const [bookings] = await db.execute(
            `SELECT b.*, p.title, u.name as customer_name, u.email as customer_email
             FROM bookings b
             JOIN packages p ON b.package_id = p.id
             JOIN users u ON b.user_id = u.id
             ORDER BY b.created_at DESC`
        );

        res.json({ success: true, bookings });

    } catch (error) {
        console.error('❌ Get all bookings error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
    }
});

// Stripe webhook (for production use - optional for testing)
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('❌ Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            
            // Update booking status
            await db.execute(
                `UPDATE bookings SET status = 'confirmed', payment_status = 'paid' 
                 WHERE stripe_session_id = ?`,
                [session.id]
            );
            
            console.log('✅ Payment successful for session:', session.id);
            break;
            
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
});

module.exports = router;