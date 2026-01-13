const nodegmailer = (() => {
	try { return require('nodegmailer'); } catch (e) { return null; }
})();

async function sendGmail({ to, subject, text, html }) {
	// Validate input
	if (!to) throw new Error('Missing "to" address for sendGmail');
	if (nodegmailer) {
		const transporter = nodegmailer.createTransport({
			// Default transport: uses environment variables when available.
			host: process.env.SMTP_HOST || 'localhost',
			port: Number(process.env.SMTP_PORT) || 587,
			secure: process.env.SMTP_SECURE === 'true' || false,
			auth: process.env.SMTP_USER ? {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS
			} : undefined
		});
		const info = await transporter.sendMail({
			from: process.env.GMAIL_FROM || 'noreply@example.com',
			to,
			subject,
			text,
			html
		});
		return info;
	}
	// Fallback: log the gmail for development/testing
	console.log('sendGmail fallback:', { to, subject, text, html });
	return { accepted: [to], fallback: true };
}

module.exports = { sendGmail };